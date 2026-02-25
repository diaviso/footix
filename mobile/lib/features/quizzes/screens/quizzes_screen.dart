import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_design.dart';
import '../../../data/models/quiz_model.dart';
import '../../../data/models/theme_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/service_providers.dart';
import '../../../shared/widgets/shimmer_loading.dart';
import '../../../shared/widgets/staggered_fade_in.dart';

// ─── Data holder ───
class _QuizzesData {
  final List<QuizModel> quizzes;
  final List<ThemeModel> themes;
  const _QuizzesData({required this.quizzes, required this.themes});
}

final _quizzesDataProvider = FutureProvider.autoDispose<_QuizzesData>((ref) async {
  final isAuth = ref.watch(isAuthenticatedProvider);
  if (!isAuth) return const _QuizzesData(quizzes: [], themes: []);
  final quizzesService = ref.watch(quizzesServiceProvider);
  final themesService = ref.watch(themesServiceProvider);
  final results = await Future.wait([
    quizzesService.getQuizzesWithStatus(),
    themesService.getThemes(),
  ]);
  return _QuizzesData(
    quizzes: results[0] as List<QuizModel>,
    themes: results[1] as List<ThemeModel>,
  );
});

class QuizzesScreen extends ConsumerStatefulWidget {
  const QuizzesScreen({super.key});
  @override
  ConsumerState<QuizzesScreen> createState() => _QuizzesScreenState();
}

class _QuizzesScreenState extends ConsumerState<QuizzesScreen> {
  String _search = '';
  String _difficultyFilter = '';
  String _themeFilter = '';

  @override
  Widget build(BuildContext context) {
    final dataAsync = ref.watch(_quizzesDataProvider);
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      body: dataAsync.when(
        loading: () => _buildShimmer(),
        error: (e, _) => _buildError(),
        data: (data) => _buildContent(context, data, user),
      ),
    );
  }

  Widget _buildShimmer() {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          ShimmerLoading(height: 160, borderRadius: 28),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: ShimmerLoading(height: 36, borderRadius: 20)),
            const SizedBox(width: 8),
            Expanded(child: ShimmerLoading(height: 36, borderRadius: 20)),
            const SizedBox(width: 8),
            Expanded(child: ShimmerLoading(height: 36, borderRadius: 20)),
          ]),
          const SizedBox(height: 16),
          ...List.generate(4, (i) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: ShimmerLoading(height: 100, borderRadius: 18),
          )),
        ]),
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.cloud_off_rounded, size: 56, color: AppColors.textMutedLight),
          const SizedBox(height: 16),
          const Text('Impossible de charger les quiz'),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => ref.invalidate(_quizzesDataProvider),
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Réessayer'),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context, _QuizzesData data, dynamic user) {
    final userStars = user?.stars ?? 0;

    // Filter quizzes
    var filtered = data.quizzes.where((q) {
      if (_search.isNotEmpty) {
        final s = _search.toLowerCase();
        if (!q.title.toLowerCase().contains(s) && !(q.theme?.title.toLowerCase().contains(s) ?? false)) {
          return false;
        }
      }
      if (_difficultyFilter.isNotEmpty && q.difficulty != _difficultyFilter) return false;
      if (_themeFilter.isNotEmpty && q.themeId != _themeFilter) return false;
      return true;
    }).toList();

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () async => ref.invalidate(_quizzesDataProvider),
      child: CustomScrollView(
        slivers: [
          // ── Header ──
          SliverToBoxAdapter(child: _buildHeader(context)),
          // ── Filters ──
          SliverToBoxAdapter(child: _buildFilters(context, data.themes)),
          // ── Count ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Text(
                '${filtered.length} quiz disponible${filtered.length > 1 ? 's' : ''}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textMutedLight),
              ),
            ),
          ),
          // ── Quiz list ──
          if (filtered.isEmpty)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.quiz_rounded, size: 56, color: AppColors.textMutedLight),
                    const SizedBox(height: 12),
                    Text('Aucun quiz trouvé',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.textSecondaryLight)),
                  ],
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              sliver: SliverList.separated(
                itemCount: filtered.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, i) => StaggeredFadeIn(
                  index: i,
                  child: _QuizCard(quiz: filtered[i], userStars: userStars),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppDesign.heroGradient,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
      ),
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 16, left: 20, right: 20, bottom: 24),
      child: Stack(
        children: [
          Positioned.fill(
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
              child: FloatingParticles(count: 6, color: AppColors.accent, maxSize: 5),
            ),
          ),
          Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            IconButton(icon: const Icon(Icons.menu_rounded, color: Colors.white), onPressed: () => Scaffold.of(context).openDrawer()),
            const SizedBox(width: 8),
            const Expanded(child: Text('Quiz', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold))),
          ]),
          const SizedBox(height: 4),
          Padding(
            padding: const EdgeInsets.only(left: 8),
            child: Text('Testez vos connaissances en déontologie comptable',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14)),
          ),
          const SizedBox(height: 16),
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFF14472A),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
            ),
            child: Theme(
              data: ThemeData.dark().copyWith(
                textSelectionTheme: const TextSelectionThemeData(
                  cursorColor: Colors.white,
                  selectionColor: Colors.white24,
                  selectionHandleColor: Colors.white70,
                ),
              ),
              child: TextField(
                onChanged: (v) => setState(() => _search = v),
                style: const TextStyle(color: Colors.white, fontSize: 15),
                cursorColor: Colors.white,
                decoration: InputDecoration(
                  hintText: 'Rechercher un quiz...',
                  hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.5)),
                  prefixIcon: Icon(Icons.search_rounded, color: Colors.white.withValues(alpha: 0.7)),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
              ),
            ),
          ),
        ],
      ),
        ],
      ),
    );
  }

  Widget _buildFilters(BuildContext context, List<ThemeModel> themes) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Column(
        children: [
          // Difficulty chips
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _FilterChip(label: 'Tous', isSelected: _difficultyFilter.isEmpty, onTap: () => setState(() => _difficultyFilter = '')),
                const SizedBox(width: 8),
                _FilterChip(label: 'Facile', isSelected: _difficultyFilter == 'FACILE', color: AppColors.easy,
                    onTap: () => setState(() => _difficultyFilter = _difficultyFilter == 'FACILE' ? '' : 'FACILE')),
                const SizedBox(width: 8),
                _FilterChip(label: 'Moyen', isSelected: _difficultyFilter == 'MOYEN', color: AppColors.medium,
                    onTap: () => setState(() => _difficultyFilter = _difficultyFilter == 'MOYEN' ? '' : 'MOYEN')),
                const SizedBox(width: 8),
                _FilterChip(label: 'Difficile', isSelected: _difficultyFilter == 'DIFFICILE', color: AppColors.hard,
                    onTap: () => setState(() => _difficultyFilter = _difficultyFilter == 'DIFFICILE' ? '' : 'DIFFICILE')),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Theme dropdown
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _FilterChip(label: 'Tous les thèmes', isSelected: _themeFilter.isEmpty, onTap: () => setState(() => _themeFilter = '')),
                ...themes.map((t) => Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: _FilterChip(
                    label: t.title,
                    isSelected: _themeFilter == t.id,
                    onTap: () => setState(() => _themeFilter = _themeFilter == t.id ? '' : t.id),
                  ),
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// FILTER CHIP
// ═══════════════════════════════════════════════════════════════
class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final Color? color;
  const _FilterChip({required this.label, required this.isSelected, required this.onTap, this.color});

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.primary;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          gradient: isSelected ? LinearGradient(colors: [c, c.withValues(alpha: 0.8)]) : null,
          color: isSelected ? null : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? c : AppColors.borderLight),
          boxShadow: isSelected
              ? [BoxShadow(color: c.withValues(alpha: 0.25), blurRadius: 8, offset: const Offset(0, 2))]
              : [],
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            color: isSelected ? Colors.white : AppColors.textSecondaryLight,
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// QUIZ CARD
// ═══════════════════════════════════════════════════════════════
class _QuizCard extends StatelessWidget {
  final QuizModel quiz;
  final int userStars;
  const _QuizCard({required this.quiz, required this.userStars});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final status = quiz.userStatus;
    final isStarLocked = !quiz.isFree && quiz.requiredStars > userStars;
    final isLocked = isStarLocked;
    final hasPassed = status?.hasPassed ?? false;
    final hasAttempts = (status?.remainingAttempts ?? 3) > 0;
    final questionCount = quiz.count?.questions ?? 0;

    final diffColor = _getDiffColor(quiz.difficulty);
    return BounceTap(
      onTap: isLocked
          ? null
          : () => context.push('/quizzes/${quiz.id}/play'),
      child: Opacity(
        opacity: isLocked ? 0.55 : 1.0,
        child: Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            color: isDark ? AppColors.cardDark : AppColors.cardLight,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: hasPassed
                  ? AppColors.success.withValues(alpha: 0.4)
                  : (isDark ? AppColors.borderDark : diffColor.withValues(alpha: 0.15)),
            ),
            boxShadow: [
              BoxShadow(
                color: (hasPassed ? AppColors.success : diffColor).withValues(alpha: 0.08),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
              BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 6, offset: const Offset(0, 2)),
            ],
          ),
          child: Column(
            children: [
              // Accent bar with gradient
              Container(
                height: 3,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [diffColor, diffColor.withValues(alpha: 0.3)],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top row: title + status
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(quiz.title,
                                  style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                                  maxLines: 2, overflow: TextOverflow.ellipsis),
                              if (quiz.theme != null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 3),
                                  child: Text(quiz.theme!.title,
                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textMutedLight)),
                                ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        _buildStatusBadge(context, isLocked, hasPassed, hasAttempts, status),
                      ],
                    ),
                    const SizedBox(height: 10),
                    // Info row
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: [
                        _DiffBadge(difficulty: quiz.difficulty),
                        _InfoTag(icon: Icons.timer_outlined, label: '${quiz.timeLimit} min'),
                        _InfoTag(icon: Icons.flag_outlined, label: '${quiz.passingScore}%'),
                        if (questionCount > 0) _InfoTag(icon: Icons.help_outline_rounded, label: '$questionCount Q'),
                        if (quiz.isFree)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                            ),
                            child: const Text('Gratuit', style: TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w600)),
                          ),
                        if (!quiz.isFree)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.accent.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.accent.withValues(alpha: 0.3)),
                            ),
                            child: const Text('Premium', style: TextStyle(color: AppColors.accent, fontSize: 11, fontWeight: FontWeight.w600)),
                          ),
                      ],
                    ),
                    // Attempts / best score
                    if (status != null && status.totalAttempts > 0) ...[
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          if (status.bestScore != null)
                            Text('Meilleur score: ${status.bestScore}%',
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight, fontWeight: FontWeight.w500)),
                          const Spacer(),
                          Text('${status.totalAttempts} tentative${status.totalAttempts > 1 ? 's' : ''}',
                              style: const TextStyle(fontSize: 12, color: AppColors.textMutedLight)),
                          if (status.remainingAttempts > 0) ...[
                            const Text(' · ', style: TextStyle(color: AppColors.textMutedLight)),
                            Text('${status.remainingAttempts} restante${status.remainingAttempts > 1 ? 's' : ''}',
                                style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600)),
                          ],
                        ],
                      ),
                    ],
                    // Star locked message
                    if (isStarLocked) ...[
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          const Icon(Icons.lock_rounded, size: 14, color: AppColors.accent),
                          const SizedBox(width: 4),
                          Text('Requiert ${quiz.requiredStars} étoiles',
                              style: const TextStyle(fontSize: 12, color: AppColors.accent, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(BuildContext context, bool isLocked, bool hasPassed, bool hasAttempts, QuizUserStatus? status) {
    if (isLocked) {
      return Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(color: AppColors.accent.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
        child: const Icon(Icons.lock_rounded, size: 18, color: AppColors.accent),
      );
    }
    if (hasPassed) {
      return Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
        child: const Icon(Icons.check_circle_rounded, size: 18, color: AppColors.success),
      );
    }
    if (status != null && status.totalAttempts > 0 && !hasAttempts) {
      return Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(color: AppColors.error.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
        child: const Icon(Icons.block_rounded, size: 18, color: AppColors.error),
      );
    }
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
      child: const Icon(Icons.play_arrow_rounded, size: 18, color: AppColors.primary),
    );
  }

  Color _getDiffColor(String d) {
    switch (d) {
      case 'FACILE': return AppColors.easy;
      case 'DIFFICILE': return AppColors.hard;
      default: return AppColors.medium;
    }
  }
}

class _DiffBadge extends StatelessWidget {
  final String difficulty;
  const _DiffBadge({required this.difficulty});

  @override
  Widget build(BuildContext context) {
    Color bg, text;
    switch (difficulty) {
      case 'FACILE':
        bg = AppColors.easyBg; text = const Color(0xFF065F46); break;
      case 'DIFFICILE':
        bg = AppColors.hardBg; text = const Color(0xFF991B1B); break;
      default:
        bg = AppColors.mediumBg; text = const Color(0xFF92400E);
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
      child: Text(difficulty, style: TextStyle(color: text, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }
}

class _InfoTag extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoTag({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: AppColors.textMutedLight),
        const SizedBox(width: 3),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMutedLight)),
      ],
    );
  }
}
