import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  FileText,
  MessageSquare,
  Star,
  Award,
  Clock,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { dashboardService } from '@/services/dashboard.service';
import type { DashboardStats, Activity, UserProgress } from '@/services/dashboard.service';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activitiesData, progressData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getUserActivity(),
          dashboardService.getUserProgress(),
        ]);
        setStats(statsData);
        setActivities(activitiesData);
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = stats ? [
    {
      title: 'Thèmes',
      value: stats.themes.toString(),
      change: 'Déontologie comptable',
      icon: BookOpen,
      color: 'bg-[#D4AF37]',
    },
    {
      title: 'Quiz complétés',
      value: stats.userQuizAttempts.toString(),
      change: `${stats.quizzes} quiz disponibles`,
      icon: HelpCircle,
      color: 'bg-[#B8960F]',
    },
    {
      title: 'Articles publiés',
      value: stats.blogs.toString(),
      change: 'Ressources disponibles',
      icon: FileText,
      color: 'bg-[#F5A623]',
    },
    {
      title: 'Discussions',
      value: stats.discussions.toString(),
      change: 'Forum actif',
      icon: MessageSquare,
      color: 'bg-[#C0C0C0]',
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] dark:border-[#C0C0C0] mx-auto"></div>
          <p className="mt-4 text-[#5A7265] dark:text-[#8BA898]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#D4AF37] via-[#A89030] to-[#0D3321] p-8 text-white"
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {user?.firstName} ! 👋
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Bienvenue sur Footix. Testez vos connaissances football et grimpez dans le classement.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
              <Star className="h-5 w-5 text-[#F5A623] fill-[#F5A623]" />
              <span>{(user as any)?.stars || 0} étoiles</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
              <Award className="h-5 w-5 text-[#F5A623]" />
              <span>{stats?.userQuizAttempts || 0} quiz complétés</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
              <Clock className="h-5 w-5 text-[#F5A623]" />
              <span>{progress?.quizSuccessRate || 0}% de réussite</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#F5A623]/20 blur-2xl" />
        <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-[#F5A623]/10 blur-3xl" />
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={item}>
              <Card className="relative overflow-hidden border border-[#D1DDD6] dark:border-[#2D3F35] shadow-lg hover:shadow-xl transition-all duration-300 group bg-white dark:bg-[#141F1A]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#5A7265] dark:text-[#8BA898]">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold mt-1 text-[#1A2E23] dark:text-[#E8F0EC]">{stat.value}</p>
                      <p className="text-xs text-[#D4AF37] dark:text-[#C0C0C0] mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${stat.color}`}
                />
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border border-[#D1DDD6] dark:border-[#2D3F35] shadow-lg h-full bg-white dark:bg-[#141F1A]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1A2E23] dark:text-[#E8F0EC]">
                <Clock className="h-5 w-5 text-[#D4AF37] dark:text-[#C0C0C0]" />
                Activité récente
              </CardTitle>
              <CardDescription className="text-[#5A7265] dark:text-[#8BA898]">Vos dernières actions sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-[#E8F0EC]/50 dark:bg-[#1E2D26]/50 hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26] transition-colors"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          activity.type === 'quiz'
                            ? 'bg-[#D4AF37]/10 dark:bg-[#C0C0C0]/20 text-[#D4AF37] dark:text-[#C0C0C0]'
                            : activity.type === 'article'
                            ? 'bg-[#F5A623]/10 dark:bg-[#F5A623]/20 text-[#F5A623]'
                            : 'bg-[#B8960F]/10 dark:bg-[#B8960F]/20 text-[#B8960F] dark:text-[#C0C0C0]'
                        }`}
                      >
                        {activity.type === 'quiz' ? (
                          <HelpCircle className="h-5 w-5" />
                        ) : activity.type === 'article' ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <MessageSquare className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-[#1A2E23] dark:text-[#E8F0EC]">{activity.title}</p>
                        <p className="text-sm text-[#5A7265] dark:text-[#8BA898]">{activity.time}</p>
                      </div>
                      {activity.score && (
                        <span className="text-sm font-semibold text-[#D4AF37] dark:text-[#C0C0C0]">
                          {activity.score}
                        </span>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-[#5A7265] dark:text-[#8BA898] py-4">
                    Aucune activité récente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border border-[#D1DDD6] dark:border-[#2D3F35] shadow-lg h-full bg-white dark:bg-[#141F1A]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1A2E23] dark:text-[#E8F0EC]">
                <BarChart3 className="h-5 w-5 text-[#D4AF37] dark:text-[#C0C0C0]" />
                Statistiques
              </CardTitle>
              <CardDescription className="text-[#5A7265] dark:text-[#8BA898]">Votre progression globale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-[#1A2E23] dark:text-[#E8F0EC]">Quiz réussis</span>
                    <span className="text-sm text-[#5A7265] dark:text-[#8BA898]">{progress?.quizSuccessRate || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#E8F0EC] dark:bg-[#1E2D26] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress?.quizSuccessRate || 0}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="h-full rounded-full bg-[#D4AF37]"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-[#1A2E23] dark:text-[#E8F0EC]">Quiz complétés</span>
                    <span className="text-sm text-[#5A7265] dark:text-[#8BA898]">{progress?.quizCompletionRate || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#E8F0EC] dark:bg-[#1E2D26] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress?.quizCompletionRate || 0}%` }}
                      transition={{ delay: 0.6, duration: 1 }}
                      className="h-full rounded-full bg-[#B8960F]"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-[#1A2E23] dark:text-[#E8F0EC]">Articles lus</span>
                    <span className="text-sm text-[#5A7265] dark:text-[#8BA898]">{progress?.blogReadRate || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#E8F0EC] dark:bg-[#1E2D26] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress?.blogReadRate || 0}%` }}
                      transition={{ delay: 0.7, duration: 1 }}
                      className="h-full rounded-full bg-[#F5A623]"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-[#1A2E23] dark:text-[#E8F0EC]">Participation forum</span>
                    <span className="text-sm text-[#5A7265] dark:text-[#8BA898]">{progress?.forumParticipationRate || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#E8F0EC] dark:bg-[#1E2D26] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress?.forumParticipationRate || 0}%` }}
                      transition={{ delay: 0.8, duration: 1 }}
                      className="h-full rounded-full bg-[#C0C0C0]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
