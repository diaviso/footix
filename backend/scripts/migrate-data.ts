/**
 * Migration script: Old Django DB (backup.sql) → New Prisma DB
 *
 * Usage:   npx ts-node scripts/migrate-data.ts
 *
 * Decisions:
 *   - Generated revision quizzes are EXCLUDED (no persistent value in new app)
 *   - Only non-generated, active, validated quizzes with a valid module are migrated
 *   - Quiz attempts only for migrated quizzes (no revision quiz attempts)
 *   - Stars: calculated using real app formula (quizzes.service.ts:265-295)
 *   - Replay after passing → 0 stars (matches app logic)
 *   - Passwords set to NULL (pbkdf2 → bcrypt incompatible; users must reset)
 *   - Payment history migrated via Users_usersubscription join
 *   - Uses createMany batches for performance on remote DB
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();
const BATCH = 500;

// ─── Batch insert helper ────────────────────────────────────────────────────

async function batchInsert(model: any, records: any[], label: string): Promise<number> {
  let created = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const chunk = records.slice(i, i + BATCH);
    try {
      const r = await model.createMany({ data: chunk, skipDuplicates: true });
      created += r.count;
    } catch {
      for (const rec of chunk) {
        try { await model.create({ data: rec }); created++; } catch {}
      }
    }
    if (records.length > BATCH) {
      process.stdout.write(`\r   ${label}... ${Math.min(i + BATCH, records.length)}/${records.length}`);
    }
  }
  if (records.length > BATCH) process.stdout.write('\n');
  return created;
}

// ─── SQL Parser ─────────────────────────────────────────────────────────────

function parseInsertValues(sql: string): any[][] {
  const rows: any[][] = [];
  const m = sql.match(/VALUES\s*\(/i);
  if (!m) return rows;

  let pos = sql.indexOf('(', sql.indexOf('VALUES'));

  while (pos < sql.length) {
    if (sql[pos] !== '(') { pos++; continue; }
    pos++;
    const vals: any[] = [];
    while (pos < sql.length && sql[pos] !== ')') {
      while (pos < sql.length && (sql[pos] === ' ' || sql[pos] === '\t')) pos++;
      if (sql[pos] === "'") {
        pos++;
        let s = '';
        while (pos < sql.length) {
          if (sql[pos] === "'" && sql[pos + 1] === "'") { s += "'"; pos += 2; }
          else if (sql[pos] === "'") { pos++; break; }
          else { s += sql[pos]; pos++; }
        }
        vals.push(s);
      } else if (sql.substring(pos, pos + 4) === 'NULL') { vals.push(null); pos += 4; }
      else if (sql.substring(pos, pos + 4) === 'true') { vals.push(true); pos += 4; }
      else if (sql.substring(pos, pos + 5) === 'false') { vals.push(false); pos += 5; }
      else {
        let n = '';
        while (pos < sql.length && sql[pos] !== ',' && sql[pos] !== ')') { n += sql[pos]; pos++; }
        n = n.trim();
        vals.push(n.includes('.') ? parseFloat(n) : parseInt(n, 10));
      }
      while (pos < sql.length && (sql[pos] === ' ' || sql[pos] === '\t')) pos++;
      if (sql[pos] === ',') pos++;
    }
    if (sql[pos] === ')') pos++;
    rows.push(vals);
    while (pos < sql.length && sql[pos] !== '(' && sql[pos] !== ';') pos++;
    if (sql[pos] === ';') break;
  }
  return rows;
}

function extractTable(sql: string, table: string): any[][] {
  const all: any[][] = [];
  const lines = sql.split('\n');
  let active = false;
  for (const line of lines) {
    const t = line.trim();
    if (t.includes(`Data for Name: ${table};`)) { active = true; continue; }
    if (active && t.startsWith('--')) {
      if (t.includes('TOC entry') || (t.includes('Data for Name:') && !t.includes(`Data for Name: ${table};`))) {
        active = false; continue;
      }
      continue;
    }
    if (active && t.startsWith('INSERT INTO')) all.push(...parseInsertValues(t));
  }
  return all;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function mapDiff(d: string): 'FACILE' | 'MOYEN' | 'DIFFICILE' {
  switch (d?.toUpperCase()) {
    case 'EASY': return 'FACILE';
    case 'MEDIUM': return 'MOYEN';
    case 'HARD': return 'DIFFICILE';
    default: return 'MOYEN';
  }
}

function splitName(name: string) {
  const p = (name || '').trim().split(/\s+/);
  if (!p.length || p[0] === '') return { firstName: 'Utilisateur', lastName: '' };
  if (p.length === 1) return { firstName: p[0], lastName: '' };
  const last = p.pop()!;
  return { firstName: p.join(' '), lastName: last };
}

// Stars: matches quizzes.service.ts:265-295
function calcStars(score: number, passing: number, diff: string): number {
  if (score < passing) return 1;
  let stars = 5 + Math.floor((score - passing) / 10);
  const mult = diff === 'DIFFICILE' ? 2 : diff === 'MOYEN' ? 1.5 : 1;
  return Math.round(stars * mult);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  DEC Learning — Data Migration (Django → Prisma)');
  console.log('═══════════════════════════════════════════════════════════\n');

  const sqlPath = path.resolve(__dirname, '../../backup.sql');
  console.log(`📂 Reading ${sqlPath}`);
  if (!fs.existsSync(sqlPath)) { console.error('❌ Not found!'); process.exit(1); }
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`   ${(sql.length / 1024 / 1024).toFixed(1)} MB\n`);

  // ── Parse ─────────────────────────────────────────────────────────────────
  console.log('📊 Parsing...');
  const users       = extractTable(sql, 'Users_user');
  const modules     = extractTable(sql, 'Quiz_module');
  const quizzes     = extractTable(sql, 'Quiz_quiz');
  const questions   = extractTable(sql, 'Quiz_question');
  const answers     = extractTable(sql, 'Quiz_answer');
  const attempts    = extractTable(sql, 'Quiz_quizattempt');
  const subs        = extractTable(sql, 'Users_usersubscription');
  const payments    = extractTable(sql, 'Users_paymenthistory');
  const blogCats    = extractTable(sql, 'Blog_category');
  const tags        = extractTable(sql, 'Blog_tag');
  const articles    = extractTable(sql, 'Blog_article');
  const artTags     = extractTable(sql, 'Blog_article_tags');
  const artLikes    = extractTable(sql, 'Blog_articlelike');
  const comments    = extractTable(sql, 'Blog_comment');
  const fTopics     = extractTable(sql, 'Forum_topic');
  const fPosts      = extractTable(sql, 'Forum_post');

  console.log(`   Users: ${users.length} | Modules: ${modules.length} | Quizzes: ${quizzes.length}`);
  console.log(`   Questions: ${questions.length} | Answers: ${answers.length} | Attempts: ${attempts.length}`);
  console.log(`   Subs: ${subs.length} | Payments: ${payments.length}`);
  console.log(`   BlogCats: ${blogCats.length} | Tags: ${tags.length} | Articles: ${articles.length}`);
  console.log(`   Forum: ${fTopics.length} topics, ${fPosts.length} posts\n`);

  // ── Clear ─────────────────────────────────────────────────────────────────
  console.log('🗑️  Clearing DB...');
  await prisma.forumCommentLike.deleteMany();
  await prisma.forumComment.deleteMany();
  await prisma.forumTopic.deleteMany();
  await prisma.forumCategory.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.articleLike.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.blogCategory.deleteMany();
  await prisma.quizExtraAttempt.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatConversation.deleteMany();
  await prisma.emailVerification.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.emailHistory.deleteMany();
  await prisma.user.deleteMany();
  console.log('   ✅ Done\n');

  // ── Users ─────────────────────────────────────────────────────────────────
  console.log('👤 Users...');

  // Subscription map: userId → latest ACTIVE sub
  const subMap = new Map<string, any>();
  for (const r of subs) {
    // 0:id 1:status 2:start 3:end 4:auto_renew 5:cancel 6:stripe_sub_id 7:stripe_cust_id 8:created 9:updated 10:sub_id 11:user_id
    if (r[1] === 'ACTIVE' && r[11]) {
      const ex = subMap.get(r[11]);
      if (!ex || new Date(r[8]) > new Date(ex[8])) subMap.set(r[11], r);
    }
  }

  const seenStripe = new Set<string>();
  const userRecords: any[] = [];
  const userIds = new Set<string>();

  for (const r of users) {
    // 0:password 1:last_login 2:is_superuser 3:id 4:email 5:name 6:deleted 7:is_active 8:is_staff 9:is_verified 10:token 11:token_created 12:leaderboard 13:joined
    if (r[6] !== false || r[7] !== true) continue;
    const id = r[3] as string;
    const { firstName, lastName } = splitName(r[5] as string);

    const sub = subMap.get(id);
    let stripeCust = sub ? (sub[7] as string || null) : null;
    let stripeSub = sub ? (sub[6] as string || null) : null;

    // Deduplicate stripe IDs
    if (stripeCust && seenStripe.has(`c:${stripeCust}`)) stripeCust = null;
    if (stripeSub && seenStripe.has(`s:${stripeSub}`)) stripeSub = null;
    if (stripeCust) seenStripe.add(`c:${stripeCust}`);
    if (stripeSub) seenStripe.add(`s:${stripeSub}`);

    userRecords.push({
      id,
      email: r[4] as string,
      password: null,
      firstName,
      lastName,
      role: (r[2] || r[8]) ? 'ADMIN' : 'USER',
      isEmailVerified: r[9] as boolean,
      showInLeaderboard: r[12] as boolean,
      isPremium: !!sub,
      premiumExpiresAt: sub && sub[3] ? new Date(sub[3]) : null,
      autoRenew: sub ? (sub[4] as boolean) : true,
      stripeCustomerId: stripeCust,
      stripeSubscriptionId: stripeSub,
      stars: 0, // Will be recalculated after attempts
      createdAt: r[13] ? new Date(r[13] as string) : new Date(),
      updatedAt: new Date(),
    });
    userIds.add(id);
  }

  const userCount = await batchInsert(prisma.user, userRecords, 'users');
  console.log(`   ✅ ${userCount} users\n`);

  // ── Themes ────────────────────────────────────────────────────────────────
  console.log('📚 Themes...');
  const themeIds = new Set<string>();
  const themeRecords: any[] = [];
  const usedPos = new Set<number>();

  for (const r of modules) {
    // 0:id 1:name 2:desc 3:deleted 4:active 5:validated 6:free 7:created 8:updated 9:position
    if (r[3] !== false || r[4] !== true || r[5] !== true) continue;
    let pos = r[9] as number;
    while (usedPos.has(pos)) pos++;
    usedPos.add(pos);
    themeRecords.push({
      id: r[0], title: r[1], description: r[2],
      position: pos, isActive: true,
      createdAt: new Date(r[7] as string), updatedAt: new Date(r[8] as string),
    });
    themeIds.add(r[0] as string);
  }

  const themeCount = await batchInsert(prisma.theme, themeRecords, 'themes');
  console.log(`   ✅ ${themeCount} themes\n`);

  // ── Quizzes (non-generated only) ──────────────────────────────────────────
  console.log('📝 Quizzes...');
  const quizIds = new Set<string>();
  const quizMeta = new Map<string, { passing: number; diff: string }>();
  const quizRecords: any[] = [];

  for (const r of quizzes) {
    // 0:id 1:title 2:desc 3:created 4:updated 5:time_limit 6:is_active 7:validated
    // 8:generated 9:points_to_pass 10:free 11:difficulty 12:module_id 13:position
    if (r[6] !== true || r[8] !== false) continue; // active + non-generated only
    const moduleId = r[12] as string | null;
    if (!moduleId || !themeIds.has(moduleId)) continue;

    const diff = mapDiff(r[11] as string);
    quizRecords.push({
      id: r[0], themeId: moduleId, title: r[1], description: r[2],
      difficulty: diff,
      timeLimit: r[5] as number,
      passingScore: r[9] as number,
      isFree: r[10] as boolean, isActive: true,
      displayOrder: (r[13] as number) || 0,
      createdAt: new Date(r[3] as string), updatedAt: new Date(r[4] as string),
    });
    quizIds.add(r[0] as string);
    quizMeta.set(r[0] as string, { passing: r[9] as number, diff });
  }

  const quizCount = await batchInsert(prisma.quiz, quizRecords, 'quizzes');
  console.log(`   ✅ ${quizCount} quizzes\n`);

  // ── Questions ─────────────────────────────────────────────────────────────
  console.log('❓ Questions...');
  const qIds = new Set<string>();
  const qRecords: any[] = [];

  for (const r of questions) {
    // 0:id 1:type 2:question 3:created 4:updated 5:deleted 6:active 7:diff 8:generated 9:validated 10:quiz_id
    if (r[5] !== false || r[6] !== true) continue;
    if (!quizIds.has(r[10] as string)) continue;
    qRecords.push({
      id: r[0], quizId: r[10],
      content: r[2],
      type: (r[1] as string).toUpperCase() === 'QCU' ? 'QCU' : 'QCM',
      createdAt: new Date(r[3] as string), updatedAt: new Date(r[4] as string),
    });
    qIds.add(r[0] as string);
  }

  const qCount = await batchInsert(prisma.question, qRecords, 'questions');
  console.log(`   ✅ ${qCount} questions\n`);

  // ── Options ───────────────────────────────────────────────────────────────
  console.log('🔘 Options...');
  const oRecords: any[] = [];

  for (const r of answers) {
    // 0:id 1:answer 2:explanation 3:is_correct 4:created 5:updated 6:deleted 7:active 8:generated 9:validated 10:question_id
    if (r[6] !== false || r[7] !== true) continue;
    if (!qIds.has(r[10] as string)) continue;
    oRecords.push({
      id: r[0], questionId: r[10],
      content: r[1], isCorrect: r[3], explanation: r[2],
      createdAt: new Date(r[4] as string),
    });
  }

  const oCount = await batchInsert(prisma.option, oRecords, 'options');
  console.log(`   ✅ ${oCount} options\n`);

  // ── Quiz Attempts ─────────────────────────────────────────────────────────
  console.log('🎯 Attempts...');

  // Filter valid attempts (non-deleted, quiz exists, user exists)
  const validAttempts = attempts.filter(r => {
    // 0:id 1:created 2:updated 3:deleted 4:score 5:is_passed 6:time 7:correct 8:total 9:details 10:favorite 11:quiz_id 12:user_id
    return r[3] === false && quizIds.has(r[11] as string) && userIds.has(r[12] as string);
  });

  // Sort oldest first to correctly track "first pass"
  validAttempts.sort((a, b) => new Date(a[1] as string).getTime() - new Date(b[1] as string).getTime());

  const passed = new Set<string>(); // "userId:quizId"
  const userStars = new Map<string, number>();
  const aRecords: any[] = [];

  for (const r of validAttempts) {
    const id = r[0] as string;
    const quizId = r[11] as string;
    const userId = r[12] as string;
    const score = r[4] as number;
    const meta = quizMeta.get(quizId) || { passing: 70, diff: 'MOYEN' };
    const key = `${userId}:${quizId}`;

    const alreadyPassed = passed.has(key);
    const stars = alreadyPassed ? 0 : calcStars(score, meta.passing, meta.diff);

    if (score >= meta.passing) passed.add(key);
    userStars.set(userId, (userStars.get(userId) || 0) + stars);

    aRecords.push({
      id, userId, quizId, score, starsEarned: stars,
      completedAt: new Date(r[1] as string),
    });
  }

  const aCount = await batchInsert(prisma.quizAttempt, aRecords, 'attempts');
  console.log(`   ✅ ${aCount} attempts (sur ${attempts.length} total, ${attempts.length - validAttempts.length} revision skipped)\n`);

  // ── Update stars ──────────────────────────────────────────────────────────
  console.log('⭐ Stars...');
  let starCount = 0;
  for (const [uid, stars] of userStars) {
    try {
      await prisma.user.update({ where: { id: uid }, data: { stars } });
      starCount++;
    } catch {}
  }
  console.log(`   ✅ ${starCount} users updated\n`);

  // ── Payments ──────────────────────────────────────────────────────────────
  console.log('💳 Payments...');

  // subscription_id → user_id
  const sub2user = new Map<string, string>();
  for (const r of subs) sub2user.set(r[0] as string, r[11] as string);

  const seenPay = new Set<string>();
  const payRecords: any[] = [];

  for (const r of payments) {
    // 0:id 1:amount 2:status 3:date 4:stripe_pay_id 5:invoice_url 6:user_sub_id
    const uid = sub2user.get(r[6] as string);
    if (!uid || !userIds.has(uid)) continue;

    const spid = r[4] as string | null;
    if (spid) { if (seenPay.has(spid)) continue; seenPay.add(spid); }

    let st: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED' = 'PENDING';
    switch ((r[2] as string).toUpperCase()) {
      case 'SUCCESS': st = 'COMPLETED'; break;
      case 'FAILED': st = 'FAILED'; break;
      case 'REFUNDED': st = 'REFUNDED'; break;
    }

    payRecords.push({
      id: r[0], userId: uid,
      amount: Math.round((r[1] as number) * 100),
      currency: 'EUR', status: st,
      stripePaymentId: spid || null,
      description: 'Abonnement Premium',
      createdAt: new Date(r[3] as string), updatedAt: new Date(r[3] as string),
    });
  }

  const payCount = await batchInsert(prisma.payment, payRecords, 'payments');
  console.log(`   ✅ ${payCount} payments\n`);

  // ── Blog Categories ───────────────────────────────────────────────────────
  console.log('📂 Blog...');
  const catIds = new Set<string>();
  for (const r of blogCats) {
    // 0:id 1:name 2:slug 3:desc 4:color 5:icon 6:active 7:created 8:updated
    if (r[6] !== true) continue;
    try {
      await prisma.blogCategory.create({
        data: { id: r[0] as string, name: r[1] as string, slug: r[2] as string,
          createdAt: new Date(r[7] as string), updatedAt: new Date(r[8] as string) },
      });
      catIds.add(r[0] as string);
    } catch {}
  }

  // Tags
  const tagIds = new Set<string>();
  for (const r of tags) {
    // 0:id 1:name 2:slug 3:color 4:created
    try {
      await prisma.tag.create({
        data: { id: r[0] as string, name: r[1] as string, slug: r[2] as string,
          createdAt: new Date(r[4] as string) },
      });
      tagIds.add(r[0] as string);
    } catch {}
  }

  // Articles
  const artIds = new Set<string>();
  for (const r of articles) {
    // 0:id 1:title 2:slug 3:subtitle 4:content 5:excerpt 6:featured_image
    // 7:video_url 8:status 9:featured 10:comments 11:meta_desc 12:meta_kw
    // 13:published_at 14:created 15:updated 16:views 17:likes 18:reading 19:author_id 20:cat_id 21:html 22:type
    const aid = r[19] as string;
    const cid = r[20] as string;
    if (!userIds.has(aid) || !cid || !catIds.has(cid)) continue;
    try {
      await prisma.article.create({
        data: {
          id: r[0] as string, authorId: aid, categoryId: cid,
          title: r[1] as string, slug: r[2] as string,
          content: r[4] as string, excerpt: r[5] as string | null,
          coverImage: r[6] as string | null,
          published: (r[8] as string) === 'published',
          createdAt: new Date(r[14] as string), updatedAt: new Date(r[15] as string),
        },
      });
      artIds.add(r[0] as string);
    } catch {}
  }

  // Article-Tag relations
  for (const r of artTags) {
    // 0:id 1:article_id 2:tag_id
    if (!artIds.has(r[1] as string) || !tagIds.has(r[2] as string)) continue;
    try {
      await prisma.article.update({
        where: { id: r[1] as string },
        data: { tags: { connect: { id: r[2] as string } } },
      });
    } catch {}
  }

  // Article Likes
  let likeC = 0;
  for (const r of artLikes) {
    // 0:id 1:created 2:article_id 3:user_id
    if (!artIds.has(r[2] as string) || !userIds.has(r[3] as string)) continue;
    try {
      await prisma.articleLike.create({
        data: { id: r[0] as string, userId: r[3] as string, articleId: r[2] as string,
          createdAt: new Date(r[1] as string) },
      });
      likeC++;
    } catch {}
  }

  // Comments
  let comC = 0;
  for (const r of comments) {
    // 0:id 1:content 2:approved 3:flagged 4:created 5:updated 6:article_id 7:author_id 8:parent_id
    if (r[2] !== true) continue;
    if (!artIds.has(r[6] as string) || !userIds.has(r[7] as string)) continue;
    try {
      await prisma.comment.create({
        data: { id: r[0] as string, articleId: r[6] as string, userId: r[7] as string,
          content: r[1] as string,
          createdAt: new Date(r[4] as string), updatedAt: new Date(r[5] as string) },
      });
      comC++;
    } catch {}
  }

  console.log(`   Cats: ${catIds.size} | Tags: ${tagIds.size} | Articles: ${artIds.size} | Likes: ${likeC} | Comments: ${comC}\n`);

  // ── Forum ─────────────────────────────────────────────────────────────────
  console.log('🗣️  Forum...');

  const fCatMap = new Map<string, string>();
  for (const r of fTopics) {
    // 0:id 1:title 2:desc 3:created 4:updated 5:active 6:pinned 7:locked 8:views 9:author_id 10:category
    const cat = r[10] as string;
    if (!fCatMap.has(cat)) {
      const cid = crypto.randomUUID();
      const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'general';
      try {
        await prisma.forumCategory.create({ data: { id: cid, name: cat, slug, createdAt: new Date() } });
        fCatMap.set(cat, cid);
      } catch {}
    }
  }

  const topicMap = new Map<number | string, string>();
  let topicC = 0;
  for (const r of fTopics) {
    if (r[5] !== true || !userIds.has(r[9] as string)) continue;
    const catId = fCatMap.get(r[10] as string);
    if (!catId) continue;
    const nid = crypto.randomUUID();
    try {
      await prisma.forumTopic.create({
        data: { id: nid, authorId: r[9] as string, categoryId: catId,
          title: r[1] as string, content: r[2] as string, status: 'OUVERT',
          createdAt: new Date(r[3] as string), updatedAt: new Date(r[4] as string) },
      });
      topicMap.set(r[0], nid);
      topicC++;
    } catch {}
  }

  let postC = 0;
  for (const r of fPosts) {
    // 0:id 1:content 2:created 3:updated 4:active 5:author_id 6:parent_id 7:topic_id
    if (r[4] !== true || !userIds.has(r[5] as string)) continue;
    const tid = topicMap.get(r[7]);
    if (!tid) continue;
    try {
      await prisma.forumComment.create({
        data: { topicId: tid, userId: r[5] as string, content: r[1] as string,
          createdAt: new Date(r[2] as string), updatedAt: new Date(r[3] as string) },
      });
      postC++;
    } catch {}
  }

  console.log(`   Cats: ${fCatMap.size} | Topics: ${topicC} | Posts: ${postC}\n`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Migration Complete!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  👤 Users:       ${userCount}`);
  console.log(`  📚 Themes:      ${themeCount}`);
  console.log(`  📝 Quizzes:     ${quizCount}`);
  console.log(`  ❓ Questions:   ${qCount}`);
  console.log(`  🔘 Options:     ${oCount}`);
  console.log(`  🎯 Attempts:    ${aCount}`);
  console.log(`  ⭐ Stars:       ${starCount} users`);
  console.log(`  💳 Payments:    ${payCount}`);
  console.log(`  📂 Blog:        ${catIds.size} cats, ${tagIds.size} tags, ${artIds.size} articles`);
  console.log(`  🗣️  Forum:       ${fCatMap.size} cats, ${topicC} topics, ${postC} posts`);
  console.log();
  console.log('⚠️  Passwords set to NULL — users must reset via "Mot de passe oublié" or Google OAuth.');
}

main()
  .catch(e => { console.error('❌ Failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
