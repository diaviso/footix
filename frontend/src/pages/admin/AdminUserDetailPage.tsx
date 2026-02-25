import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Star,
  Crown,
  Shield,
  MapPin,
  Globe,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  CreditCard,
  Bot,
  AlertTriangle,
  Loader2,
  User,
  Bell,
  BellOff,
  Trophy,
  Target,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string | null;
  city: string | null;
  avatar: string | null;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  googleId: string | null;
  stars: number;
  showInLeaderboard: boolean;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  autoRenew: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  createdAt: string;
  updatedAt: string;
  activity: {
    quizAttempts: {
      id: string;
      score: number;
      starsEarned: number;
      completedAt: string;
      quiz: {
        id: string;
        title: string;
        difficulty: string;
        theme: { title: string };
      };
    }[];
    quizAttemptCount: number;
    avgScore: number;
    bestScore: number;
    forumTopics: {
      id: string;
      title: string;
      status: string;
      createdAt: string;
    }[];
    forumTopicCount: number;
    forumCommentCount: number;
    blogCommentCount: number;
    payments: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      description: string | null;
      createdAt: string;
    }[];
    chatConversationCount: number;
    feedbacks: {
      id: string;
      type: string;
      subject: string;
      status: string;
      createdAt: string;
    }[];
    feedbackCount: number;
  };
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getAvatarUrl(avatar: string | null) {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  return `https://res.cloudinary.com/dafmu8csh/${avatar}`;
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();
  const [userData, setUserData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/${id}/detail`);
        setUserData(response.data);
      } catch {
        toast({ title: 'Erreur', description: 'Impossible de charger les détails de l\'utilisateur', variant: 'destructive' });
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, toast, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#1B5E3D]" />
      </div>
    );
  }

  if (!userData) return null;

  const u = userData;
  const a = u.activity;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Détail utilisateur
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Profil complet et activité
          </p>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={item}>
        <Card className="border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1B5E3D] to-[#2D7A50] h-24" />
          <CardContent className="relative pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
              <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-900 shadow-lg">
                <AvatarImage src={getAvatarUrl(u.avatar)} />
                <AvatarFallback className="bg-[#1B5E3D] text-white text-xl font-bold">
                  {u.firstName[0]}{u.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold">{u.firstName} {u.lastName}</h2>
                  {u.role === 'ADMIN' && (
                    <Badge className="bg-red-500 text-white"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
                  )}
                  {u.isPremium && (
                    <Badge className="bg-amber-500 text-white"><Crown className="h-3 w-3 mr-1" />Premium</Badge>
                  )}
                  {u.isEmailVerified ? (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600"><CheckCircle className="h-3 w-3 mr-1" />Vérifié</Badge>
                  ) : (
                    <Badge variant="outline" className="border-red-500 text-red-600"><XCircle className="h-3 w-3 mr-1" />Non vérifié</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{u.email}</span>
                  {u.country && <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{u.country}</span>}
                  {u.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{u.city}</span>}
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Inscrit le {formatDate(u.createdAt)}</p>
                <p className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />MAJ {formatDate(u.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <Star className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-[#1B5E3D]">{u.stars}</p>
            <p className="text-xs text-muted-foreground">Étoiles</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <Target className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-[#1B5E3D]">{a.quizAttemptCount}</p>
            <p className="text-xs text-muted-foreground">Quiz tentés</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-[#1B5E3D]">{a.avgScore}%</p>
            <p className="text-xs text-muted-foreground">Score moyen</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-[#1B5E3D]">{a.bestScore}%</p>
            <p className="text-xs text-muted-foreground">Meilleur score</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <MessageSquare className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-[#1B5E3D]">{a.forumTopicCount}</p>
            <p className="text-xs text-muted-foreground">Sujets forum</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <Bot className="h-5 w-5 text-teal-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-[#1B5E3D]">{a.chatConversationCount}</p>
            <p className="text-xs text-muted-foreground">Conversations IA</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Details */}
        <motion.div variants={item}>
          <Card className="border-2 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-[#1B5E3D]" />
                Informations détaillées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">ID</div>
                  <div className="font-mono text-xs break-all">{u.id}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Connexion Google</div>
                  <div>{u.googleId ? <Badge variant="outline" className="text-xs">Oui</Badge> : <span className="text-muted-foreground">Non</span>}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Premium expire le</div>
                  <div>{u.premiumExpiresAt ? formatDate(u.premiumExpiresAt) : <span className="text-muted-foreground">—</span>}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Renouvellement auto</div>
                  <div>{u.autoRenew ? '✅ Oui' : '❌ Non'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Stripe Customer ID</div>
                  <div className="font-mono text-xs break-all">{u.stripeCustomerId || '—'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Classement visible</div>
                  <div>{u.showInLeaderboard ? '✅ Oui' : '❌ Non'}</div>
                </div>

                <div className="border-t pt-3 mt-3">
                  <p className="font-medium mb-2 flex items-center gap-1.5"><Bell className="h-4 w-4" /> Notifications</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={u.emailNotifications ? 'default' : 'outline'} className={cn('text-xs', u.emailNotifications && 'bg-[#1B5E3D]')}>
                      {u.emailNotifications ? <Bell className="h-3 w-3 mr-1" /> : <BellOff className="h-3 w-3 mr-1" />}
                      Email {u.emailNotifications ? 'activé' : 'désactivé'}
                    </Badge>
                    <Badge variant={u.pushNotifications ? 'default' : 'outline'} className={cn('text-xs', u.pushNotifications && 'bg-[#1B5E3D]')}>
                      Push {u.pushNotifications ? 'activé' : 'désactivé'}
                    </Badge>
                    <Badge variant={u.marketingEmails ? 'default' : 'outline'} className={cn('text-xs', u.marketingEmails && 'bg-[#1B5E3D]')}>
                      Marketing {u.marketingEmails ? 'activé' : 'désactivé'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Quiz Attempts */}
        <motion.div variants={item}>
          <Card className="border-2 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#1B5E3D]" />
                  Quiz récents
                </span>
                <Badge variant="secondary">{a.quizAttemptCount} total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea>
                <div className="max-h-[350px] space-y-2">
                  {a.quizAttempts.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">Aucun quiz tenté</p>
                  ) : (
                    a.quizAttempts.map((attempt) => (
                      <div key={attempt.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold',
                          attempt.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : attempt.score >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}>
                          {attempt.score}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{attempt.quiz.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {attempt.quiz.theme.title} · {attempt.quiz.difficulty} · ⭐ {attempt.starsEarned}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(attempt.completedAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Forum Activity */}
        <motion.div variants={item}>
          <Card className="border-2 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#1B5E3D]" />
                  Activité Forum
                </span>
                <div className="flex gap-2">
                  <Badge variant="secondary">{a.forumTopicCount} sujets</Badge>
                  <Badge variant="outline">{a.forumCommentCount} commentaires</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea>
                <div className="max-h-[250px] space-y-2">
                  {a.forumTopics.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">Aucun sujet créé</p>
                  ) : (
                    a.forumTopics.map((topic) => (
                      <div key={topic.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{topic.title}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(topic.createdAt)}</p>
                        </div>
                        <Badge variant="outline" className={cn('text-xs',
                          topic.status === 'RESOLU' ? 'border-emerald-500 text-emerald-600'
                            : topic.status === 'FERME' ? 'border-red-500 text-red-600'
                            : 'border-blue-500 text-blue-600'
                        )}>
                          {topic.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payments */}
        <motion.div variants={item}>
          <Card className="border-2 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-[#1B5E3D]" />
                Paiements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea>
                <div className="max-h-[250px] space-y-2">
                  {a.payments.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">Aucun paiement</p>
                  ) : (
                    a.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          payment.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-900/30'
                            : payment.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        )}>
                          <CreditCard className={cn('h-5 w-5',
                            payment.status === 'COMPLETED' ? 'text-emerald-600'
                              : payment.status === 'PENDING' ? 'text-amber-600'
                              : 'text-red-600'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.description || 'Paiement'} · {formatDateTime(payment.createdAt)}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn('text-xs',
                          payment.status === 'COMPLETED' ? 'border-emerald-500 text-emerald-600'
                            : payment.status === 'PENDING' ? 'border-amber-500 text-amber-600'
                            : 'border-red-500 text-red-600'
                        )}>
                          {payment.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feedbacks */}
        <motion.div variants={item}>
          <Card className="border-2 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-[#1B5E3D]" />
                  Retours
                </span>
                <Badge variant="secondary">{a.feedbackCount} total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea>
                <div className="max-h-[250px] space-y-2">
                  {a.feedbacks.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">Aucun retour</p>
                  ) : (
                    a.feedbacks.map((fb) => (
                      <div key={fb.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{fb.subject}</p>
                          <p className="text-xs text-muted-foreground">{fb.type} · {formatDateTime(fb.createdAt)}</p>
                        </div>
                        <Badge variant="outline" className={cn('text-xs',
                          fb.status === 'REPONDU' ? 'border-emerald-500 text-emerald-600'
                            : fb.status === 'LU' ? 'border-blue-500 text-blue-600'
                            : 'border-amber-500 text-amber-600'
                        )}>
                          {fb.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Summary */}
        <motion.div variants={item}>
          <Card className="border-2 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-[#1B5E3D]" />
                Résumé d'activité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-blue-500" /> Quiz tentés</span>
                  <span className="font-bold">{a.quizAttemptCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4 text-purple-500" /> Sujets forum</span>
                  <span className="font-bold">{a.forumTopicCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4 text-indigo-500" /> Commentaires forum</span>
                  <span className="font-bold">{a.forumCommentCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-orange-500" /> Commentaires blog</span>
                  <span className="font-bold">{a.blogCommentCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm flex items-center gap-2"><Bot className="h-4 w-4 text-teal-500" /> Conversations IA</span>
                  <span className="font-bold">{a.chatConversationCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4 text-green-500" /> Paiements</span>
                  <span className="font-bold">{a.payments.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Retours envoyés</span>
                  <span className="font-bold">{a.feedbackCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
