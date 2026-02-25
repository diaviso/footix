import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  TrendingUp,
  Calendar,
  Loader2,
  BarChart3,
  Users,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface TopicData {
  topic: string;
  conversationCount: number;
  totalMessages: number;
  lastUsed: string;
}

interface TopicsAnalytics {
  topics: TopicData[];
  totalConversations: number;
  uniqueTopics: number;
}

interface ConversationsStats {
  totalConversations: number;
  totalMessages: number;
  conversationsToday: number;
  conversationsThisWeek: number;
  averageMessagesPerConversation: number;
}

export function ChatbotTopicsPage() {
  const { toast } = useToast();
  const [topicsData, setTopicsData] = useState<TopicsAnalytics | null>(null);
  const [stats, setStats] = useState<ConversationsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [topicsRes, statsRes] = await Promise.all([
        api.get('/chatbot/admin/topics'),
        api.get('/chatbot/admin/stats'),
      ]);
      setTopicsData(topicsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du chatbot',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-[#1B5E3D] dark:text-[#3D9A6A]" />
        <p className="mt-4 text-muted-foreground">Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-[#1A2E23] dark:text-[#E8F0EC] flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-[#1B5E3D] dark:text-[#3D9A6A]" />
          Thématiques Chatbot
        </h1>
        <p className="text-[#5A7265] dark:text-[#8BA898] mt-1">
          Analysez les sujets les plus abordés par les utilisateurs
        </p>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-[#D1DDD6] dark:border-[#2D3F35]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#1B5E3D]/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-[#1B5E3D] dark:text-[#3D9A6A]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalConversations}</p>
                  <p className="text-sm text-muted-foreground">Conversations totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#D1DDD6] dark:border-[#2D3F35]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-[#F5A623]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                  <p className="text-sm text-muted-foreground">Messages totaux</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#D1DDD6] dark:border-[#2D3F35]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.conversationsToday}</p>
                  <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#D1DDD6] dark:border-[#2D3F35]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.averageMessagesPerConversation}</p>
                  <p className="text-sm text-muted-foreground">Moy. messages/conv.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Topics List */}
      <motion.div variants={itemVariants}>
        <Card className="border border-[#D1DDD6] dark:border-[#2D3F35]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#1B5E3D] dark:text-[#3D9A6A]" />
              Sujets les plus populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!topicsData || topicsData.topics.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune thématique enregistrée</p>
                <p className="text-sm mt-1">Les sujets apparaîtront ici lorsque les utilisateurs utiliseront le chatbot</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topicsData.topics.map((topic, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[#D1DDD6] dark:border-[#2D3F35] hover:bg-muted/50 transition-colors"
                  >
                    {/* Rank */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                      index < 3 
                        ? 'bg-gradient-to-br from-[#F5A623] to-[#D4890A] text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Topic Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{topic.topic}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {topic.conversationCount} conversations
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {topic.totalMessages} messages
                        </span>
                      </div>
                    </div>

                    {/* Last Used */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(topic.lastUsed).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-shrink-0 w-24">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#1B5E3D] to-[#3D9A6A] rounded-full"
                          style={{ 
                            width: `${Math.min(100, (topic.conversationCount / (topicsData.topics[0]?.conversationCount || 1)) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary */}
      {topicsData && topicsData.uniqueTopics > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border border-[#1B5E3D]/20 bg-[#1B5E3D]/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#1B5E3D]/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-[#1B5E3D] dark:text-[#3D9A6A]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A2E23] dark:text-[#E8F0EC]">
                    {topicsData.uniqueTopics} thématiques uniques identifiées
                  </p>
                  <p className="text-sm text-[#5A7265] dark:text-[#8BA898]">
                    sur {topicsData.totalConversations} conversations analysées
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
