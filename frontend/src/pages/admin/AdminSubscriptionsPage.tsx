import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Download,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Loader2,
  Mail,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface SubscriptionAnalytics {
  summary: {
    totalSubscribers: number;
    activeSubscribers: number;
    expiredSubscribers: number;
    expiringThisWeek: number;
    totalRevenue: number;
    monthlyRevenue: number;
    weeklyRevenue: number;
    averageRevenuePerUser: number;
    churnRate: number;
    conversionRate: number;
  };
  payments: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    successRate: number;
  };
  monthlyTrend: {
    month: string;
    revenue: number;
    count: number;
  }[];
  subscribers: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isPremium: boolean;
    premiumExpiresAt: string | null;
    daysUntilExpiry: number | null;
    totalPayments: number;
    totalSpent: number;
    firstPaymentDate: string | null;
    lastPaymentDate: string | null;
    memberSince: string;
    status: string;
  }[];
  recentTransactions: {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    amount: number;
    status: string;
    description: string;
    createdAt: string;
  }[];
  expiringSubscribers: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    daysUntilExpiry: number | null;
    totalSpent: number;
  }[];
}

export function AdminSubscriptionsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<SubscriptionAnalytics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/stripe/admin/subscriptions');
      setData(response.data);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubscribers = data?.subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Complété</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Échoué</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B5E3D]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-lg text-muted-foreground">Impossible de charger les données</p>
        <Button onClick={fetchData}>Réessayer</Button>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.monthlyTrend.map((m) => m.revenue), 1);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2E23] dark:text-[#E8F0EC] flex items-center gap-3">
            <Crown className="h-8 w-8 text-amber-500" />
            Gestion des Abonnements
          </h1>
          <p className="text-[#5A7265] dark:text-[#8BA898] mt-1">
            Tableau de bord complet des abonnements premium
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Subscribers */}
        <Card className="border-[#D1DDD6] dark:border-[#2D3F35] bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Abonnés Actifs</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{data.summary.activeSubscribers}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  +{data.summary.expiringThisWeek} expirent cette semaine
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Crown className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="border-[#D1DDD6] dark:border-[#2D3F35] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Revenu Total</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{formatCurrency(data.summary.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {formatCurrency(data.summary.monthlyRevenue)} ce mois
                  </p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="border-[#D1DDD6] dark:border-[#2D3F35] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Taux de Conversion</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{data.summary.conversionRate}%</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  ARPU: {formatCurrency(data.summary.averageRevenuePerUser)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Churn Rate */}
        <Card className="border-[#D1DDD6] dark:border-[#2D3F35] bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Taux de Désabonnement</p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100">{data.summary.churnRate}%</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {data.summary.expiredSubscribers} anciens abonnés
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#E8F0EC] dark:bg-[#1A2E23]">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="gap-2">
              <Users className="h-4 w-4" />
              Abonnés
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertes
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue Chart */}
              <Card className="border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#141F1A]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[#1B5E3D]" />
                    Évolution des Revenus
                  </CardTitle>
                  <CardDescription>Revenus mensuels sur les 6 derniers mois</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.monthlyTrend.map((month, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{month.month}</span>
                          <span className="font-medium">{formatCurrency(month.revenue)} ({month.count} paiements)</span>
                        </div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-[#1B5E3D] to-[#3D9A6A] rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Stats */}
              <Card className="border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#141F1A]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-[#1B5E3D]" />
                    Statistiques des Paiements
                  </CardTitle>
                  <CardDescription>Répartition des statuts de paiement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{data.payments.completed}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">Réussis</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">{data.payments.failed}</p>
                      <p className="text-sm text-red-600 dark:text-red-400">Échoués</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{data.payments.pending}</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">En attente</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{data.payments.successRate}%</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Taux de succès</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#D1DDD6] dark:border-[#2D3F35]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Total des paiements</span>
                      <span className="font-bold text-lg">{data.payments.total}</span>
                    </div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-green-500 h-full" 
                        style={{ width: `${(data.payments.completed / data.payments.total) * 100}%` }}
                      />
                      <div 
                        className="bg-red-500 h-full" 
                        style={{ width: `${(data.payments.failed / data.payments.total) * 100}%` }}
                      />
                      <div 
                        className="bg-yellow-500 h-full" 
                        style={{ width: `${(data.payments.pending / data.payments.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#141F1A]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-[#1B5E3D]/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-[#1B5E3D]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenu cette semaine</p>
                      <p className="text-2xl font-bold text-[#1A2E23] dark:text-[#E8F0EC]">
                        {formatCurrency(data.summary.weeklyRevenue)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#141F1A]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-[#1B5E3D]/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#1B5E3D]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valeur vie client moyenne</p>
                      <p className="text-2xl font-bold text-[#1A2E23] dark:text-[#E8F0EC]">
                        {formatCurrency(data.summary.averageRevenuePerUser)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#141F1A]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expirent bientôt</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {data.summary.expiringThisWeek} abonnés
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un abonné..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exporter
              </Button>
            </div>

            <Card className="border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#141F1A]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Abonné</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Expire dans</TableHead>
                    <TableHead>Paiements</TableHead>
                    <TableHead>Total dépensé</TableHead>
                    <TableHead>Dernier paiement</TableHead>
                    <TableHead>Membre depuis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun abonné trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                              {subscriber.firstName[0]}{subscriber.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium">{subscriber.firstName} {subscriber.lastName}</p>
                              <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {subscriber.status === 'expiring_soon' ? (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              Expire bientôt
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Actif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {subscriber.daysUntilExpiry !== null ? (
                            <span className={cn(
                              "font-medium",
                              subscriber.daysUntilExpiry <= 7 ? "text-amber-600" : "text-green-600"
                            )}>
                              {subscriber.daysUntilExpiry} jours
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{subscriber.totalPayments}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">{formatCurrency(subscriber.totalSpent)}</span>
                        </TableCell>
                        <TableCell>{formatDate(subscriber.lastPaymentDate)}</TableCell>
                        <TableCell>{formatDate(subscriber.memberSince)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card className="border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#141F1A]">
              <CardHeader>
                <CardTitle>Transactions Récentes</CardTitle>
                <CardDescription>Les 20 dernières transactions</CardDescription>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.userName}</p>
                          <p className="text-sm text-muted-foreground">{transaction.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#141F1A]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  Abonnements Expirant Bientôt
                </CardTitle>
                <CardDescription>
                  Ces abonnés doivent renouveler leur abonnement dans les 7 prochains jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.expiringSubscribers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-green-700 dark:text-green-300">Tout va bien !</p>
                    <p className="text-muted-foreground">Aucun abonnement n'expire dans les 7 prochains jours</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.expiringSubscribers.map((subscriber) => (
                      <div
                        key={subscriber.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                            {subscriber.firstName[0]}{subscriber.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium">{subscriber.firstName} {subscriber.lastName}</p>
                            <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-600">
                            {subscriber.daysUntilExpiry} jour{subscriber.daysUntilExpiry !== 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total: {formatCurrency(subscriber.totalSpent)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Mail className="h-4 w-4" />
                          Contacter
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Failed Payments Alert */}
            {data.payments.failed > 0 && (
              <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    Paiements Échoués
                  </CardTitle>
                  <CardDescription>
                    {data.payments.failed} paiement(s) ont échoué et nécessitent une attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.recentTransactions
                      .filter((t) => t.status === 'FAILED')
                      .slice(0, 5)
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#141F1A]"
                        >
                          <div>
                            <p className="font-medium">{transaction.userName}</p>
                            <p className="text-sm text-muted-foreground">{transaction.userEmail}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-red-600">{formatCurrency(transaction.amount)}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
