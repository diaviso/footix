import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Users,
  HelpCircle,
  TrendingUp,
  Star,
  Trophy,
  BarChart3,
  Activity,
  UserPlus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalQuizzes: number;
  totalAttempts: number;
  totalTopics: number;
  globalSuccessRate: number;
  recentUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    stars: number;
  }>;
  topUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    stars: number;
  }>;
  attemptsByDay: Array<{
    date: string;
    count: number;
  }>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/admin-stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] dark:border-[#C0C0C0] mx-auto"></div>
          <p className="mt-4 text-[#5A7265] dark:text-[#8BA898]">Chargement...</p>
        </div>
      </div>
    );
  }

  const statsCards = stats
    ? [
        {
          title: 'Utilisateurs',
          value: stats.totalUsers.toString(),
          description: 'Utilisateurs inscrits',
          icon: Users,
          color: 'bg-[#D4AF37]',
        },
        {
          title: 'Quiz',
          value: stats.totalQuizzes.toString(),
          description: `${stats.totalAttempts} tentatives`,
          icon: HelpCircle,
          color: 'bg-[#B8960F]',
        },
      ]
    : [];

  // Calculate max value for the chart
  const maxAttempts = stats?.attemptsByDay.length
    ? Math.max(...stats.attemptsByDay.map((d) => d.count), 1)
    : 1;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0D3321] via-[#A89030] to-[#D4AF37] p-8 text-white"
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#F5A623] text-sm font-medium mb-2">
            <Trophy className="h-4 w-4" />
            Panneau d'administration
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {user?.firstName} !
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Vue d'ensemble de la plateforme Footix
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
              <TrendingUp className="h-5 w-5 text-[#F5A623]" />
              <span>{stats?.globalSuccessRate || 0}% taux de réussite global</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
              <Activity className="h-5 w-5 text-[#F5A623]" />
              <span>{stats?.totalAttempts || 0} tentatives de quiz</span>
            </div>
          </div>
        </div>

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
                      <p className="text-xs text-[#5A7265] dark:text-[#8BA898] mt-1">
                        {stat.description}
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

      {/* Charts and Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border border-[#D1DDD6] dark:border-[#2D3F35] shadow-lg h-full bg-white dark:bg-[#141F1A]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1A2E23] dark:text-[#E8F0EC]">
                <BarChart3 className="h-5 w-5 text-[#D4AF37] dark:text-[#C0C0C0]" />
                Activité des quiz (30 derniers jours)
              </CardTitle>
              <CardDescription className="text-[#5A7265] dark:text-[#8BA898]">Nombre de tentatives par jour</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.attemptsByDay && stats.attemptsByDay.length > 0 ? (
                <div className="h-64 flex items-end gap-1">
                  {stats.attemptsByDay.slice(0, 30).reverse().map((day, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-[#D4AF37] to-[#C0C0C0] rounded-t transition-all hover:opacity-80"
                      style={{
                        height: `${(day.count / maxAttempts) * 100}%`,
                        minHeight: day.count > 0 ? '4px' : '0',
                      }}
                      title={`${new Date(day.date).toLocaleDateString('fr-FR')}: ${day.count} tentatives`}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-[#5A7265] dark:text-[#8BA898]">
                  <p>Aucune donnée disponible</p>
                </div>
              )}
              <div className="flex justify-between text-xs text-[#5A7265] dark:text-[#8BA898] mt-2">
                <span>Il y a 30 jours</span>
                <span>Aujourd'hui</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Users */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border border-[#D1DDD6] dark:border-[#2D3F35] shadow-lg h-full bg-white dark:bg-[#141F1A]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1A2E23] dark:text-[#E8F0EC]">
                <Trophy className="h-5 w-5 text-[#F5A623]" />
                Top utilisateurs
              </CardTitle>
              <CardDescription className="text-[#5A7265] dark:text-[#8BA898]">Classement par étoiles</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.topUsers && stats.topUsers.length > 0 ? (
                <div className="space-y-3">
                  {stats.topUsers.map((topUser, index) => (
                    <motion.div
                      key={topUser.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-[#E8F0EC]/50 dark:bg-[#1E2D26]/50 hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26] transition-colors"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white ${
                          index === 0
                            ? 'bg-[#F5A623]'
                            : index === 1
                            ? 'bg-[#9CA3AF]'
                            : index === 2
                            ? 'bg-[#CD7F32]'
                            : 'bg-[#D4AF37]/20 text-[#D4AF37] dark:bg-[#C0C0C0]/20 dark:text-[#C0C0C0]'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-[#1A2E23] dark:text-[#E8F0EC]">
                          {topUser.firstName} {topUser.lastName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[#F5A623]">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-bold">{topUser.stars}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#5A7265] dark:text-[#8BA898]">
                  <Trophy className="h-12 w-12 mx-auto opacity-50 mb-4" />
                  <p>Aucun utilisateur</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border border-[#D1DDD6] dark:border-[#2D3F35] shadow-lg bg-white dark:bg-[#141F1A]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1A2E23] dark:text-[#E8F0EC]">
              <UserPlus className="h-5 w-5 text-[#D4AF37] dark:text-[#C0C0C0]" />
              Nouveaux utilisateurs
            </CardTitle>
            <CardDescription className="text-[#5A7265] dark:text-[#8BA898]">Dernières inscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#D1DDD6] dark:border-[#2D3F35]">
                      <th className="text-left py-3 px-4 font-medium text-[#5A7265] dark:text-[#8BA898]">Nom</th>
                      <th className="text-left py-3 px-4 font-medium text-[#5A7265] dark:text-[#8BA898]">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-[#5A7265] dark:text-[#8BA898]">Étoiles</th>
                      <th className="text-left py-3 px-4 font-medium text-[#5A7265] dark:text-[#8BA898]">Inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((recentUser) => (
                      <tr key={recentUser.id} className="border-b border-[#D1DDD6]/50 dark:border-[#2D3F35]/50 hover:bg-[#E8F0EC]/50 dark:hover:bg-[#1E2D26]/50">
                        <td className="py-3 px-4 font-medium text-[#1A2E23] dark:text-[#E8F0EC]">
                          {recentUser.firstName} {recentUser.lastName}
                        </td>
                        <td className="py-3 px-4 text-[#5A7265] dark:text-[#8BA898]">{recentUser.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-[#F5A623]">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{recentUser.stars}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#5A7265] dark:text-[#8BA898]">
                          {getRelativeTime(recentUser.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-[#5A7265] dark:text-[#8BA898]">
                <Users className="h-12 w-12 mx-auto opacity-50 mb-4" />
                <p>Aucun nouvel utilisateur</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
