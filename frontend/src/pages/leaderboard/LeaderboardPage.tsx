import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Medal,
  Crown,
  Loader2,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn, getAvatarUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/api';
import type { LeaderboardEntry, UserPosition } from '@/types';

export function LeaderboardPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardRes, positionRes] = await Promise.all([
          api.get('/leaderboard'),
          api.get('/leaderboard/me'),
        ]);
        setLeaderboard(leaderboardRes.data);
        setUserPosition(positionRes.data);
      } catch {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le classement',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-300 dark:border-yellow-700';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 border-gray-300 dark:border-gray-700';
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-300 dark:border-amber-700';
      default:
        return 'bg-card hover:bg-muted/50';
    }
  };

  const isUserInTop100 = userPosition && userPosition.rank <= 100;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F5A623] to-[#C0C0C0] blur-xl opacity-30 animate-pulse" />
          <Loader2 className="h-16 w-16 animate-spin text-[#D4AF37] dark:text-[#C0C0C0] relative" />
        </div>
        <p className="mt-4 text-[#5A7265] dark:text-[#8BA898]">Chargement du classement...</p>
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
          <Trophy className="h-8 w-8 text-[#F5A623]" />
          Classement
        </h1>
        <p className="text-[#5A7265] dark:text-[#8BA898] mt-1">
          Les 100 meilleurs utilisateurs par nombre d'étoiles
        </p>
      </motion.div>

      {/* User Position Card (if not in top 100) */}
      {userPosition && !isUserInTop100 && (
        <motion.div variants={itemVariants}>
          <Card className="border-[#D4AF37]/20 bg-[#D4AF37]/5 dark:border-[#C0C0C0]/20 dark:bg-[#C0C0C0]/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-[#D4AF37] dark:text-[#C0C0C0]" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">Votre position</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#D4AF37] dark:text-[#C0C0C0]">
                    {userPosition.rank}
                    <span className="text-base font-normal text-muted-foreground">
                      {userPosition.rank === 1 ? 'er' : 'ème'}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    {userPosition.stars} étoiles
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* 2nd Place */}
          <div className="mt-4 sm:mt-8">
            <Card className={cn('border-2', getRankStyle(2))}>
              <CardContent className="pt-4 sm:pt-6 text-center px-2 sm:px-6">
                <div className="relative mx-auto mb-2 sm:mb-3">
                  <Avatar className="w-10 h-10 sm:w-16 sm:h-16 ring-4 ring-gray-300 dark:ring-gray-600 mx-auto">
                    <AvatarImage src={getAvatarUrl(leaderboard[1].avatar, leaderboard[1].userId)} alt={leaderboard[1].firstName} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-200 to-slate-300 dark:from-gray-700 dark:to-slate-600 text-gray-600 dark:text-gray-300 text-sm sm:text-xl font-bold">
                      {leaderboard[1].firstName?.[0]}{leaderboard[1].lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gray-400 flex items-center justify-center shadow-md">
                    <Medal className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-gray-500">2</p>
                <p className="font-semibold truncate text-xs sm:text-base">
                  {leaderboard[1].firstName} {leaderboard[1].lastName.charAt(0)}.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500" />
                  {leaderboard[1].stars}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 1st Place */}
          <div>
            <Card className={cn('border-2 shadow-lg', getRankStyle(1))}>
              <CardContent className="pt-4 sm:pt-6 text-center px-2 sm:px-6">
                <div className="relative mx-auto mb-2 sm:mb-3">
                  <Avatar className="w-12 h-12 sm:w-20 sm:h-20 ring-4 ring-yellow-400 dark:ring-yellow-500 mx-auto shadow-lg">
                    <AvatarImage src={getAvatarUrl(leaderboard[0].avatar, leaderboard[0].userId)} alt={leaderboard[0].firstName} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-300 to-amber-400 dark:from-yellow-600 dark:to-amber-700 text-yellow-800 dark:text-yellow-100 text-base sm:text-2xl font-bold">
                      {leaderboard[0].firstName?.[0]}{leaderboard[0].lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-500 flex items-center justify-center shadow-md">
                    <Crown className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">1</p>
                <p className="font-semibold truncate text-sm sm:text-lg">
                  {leaderboard[0].firstName} {leaderboard[0].lastName.charAt(0)}.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500" />
                  {leaderboard[0].stars}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 3rd Place */}
          <div className="mt-6 sm:mt-12">
            <Card className={cn('border-2', getRankStyle(3))}>
              <CardContent className="pt-4 sm:pt-6 text-center px-2 sm:px-6">
                <div className="relative mx-auto mb-2 sm:mb-3">
                  <Avatar className="w-9 h-9 sm:w-14 sm:h-14 ring-4 ring-amber-400 dark:ring-amber-600 mx-auto">
                    <AvatarImage src={getAvatarUrl(leaderboard[2].avatar, leaderboard[2].userId)} alt={leaderboard[2].firstName} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-700 dark:to-orange-700 text-amber-800 dark:text-amber-200 text-xs sm:text-lg font-bold">
                      {leaderboard[2].firstName?.[0]}{leaderboard[2].lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
                    <Medal className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                </div>
                <p className="text-base sm:text-xl font-bold text-amber-600 dark:text-amber-400">3</p>
                <p className="font-semibold truncate text-xs sm:text-base">
                  {leaderboard[2].firstName} {leaderboard[2].lastName.charAt(0)}.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500" />
                  {leaderboard[2].stars}
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Leaderboard Table */}
      <motion.div variants={itemVariants}>
        <Card className="border border-[#D1DDD6] dark:border-[#2D3F35] shadow-lg bg-white dark:bg-[#141F1A]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1A2E23] dark:text-[#E8F0EC]">
              <Trophy className="h-5 w-5 text-[#F5A623]" />
              Top 100
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun utilisateur dans le classement</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => {
                  const isCurrentUser = entry.userId === user?.id;
                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                        isCurrentUser
                          ? 'border-[#D4AF37] dark:border-[#C0C0C0] bg-[#D4AF37]/5 dark:bg-[#C0C0C0]/5'
                          : getRankStyle(entry.rank)
                      )}
                    >
                      {/* Rank */}
                      <div className={cn(
                        'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
                        entry.rank <= 3
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md'
                          : 'bg-muted'
                      )}>
                        {getRankIcon(entry.rank) || entry.rank}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-10 w-10 ring-2 ring-[#D1DDD6] dark:ring-[#2D3F35]">
                        <AvatarImage src={getAvatarUrl(entry.avatar, entry.userId)} alt={entry.firstName} />
                        <AvatarFallback className="bg-[#D4AF37] text-white font-medium text-sm">
                          {entry.firstName?.[0]}{entry.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-semibold truncate',
                          isCurrentUser && 'text-primary'
                        )}>
                          {entry.firstName} {entry.lastName}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Vous
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Rang #{entry.rank}
                        </p>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-full">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-yellow-700 dark:text-yellow-400">
                          {entry.stars}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
