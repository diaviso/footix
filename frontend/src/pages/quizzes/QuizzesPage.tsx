import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  HelpCircle,
  Clock,
  Target,
  Star,
  Play,
  Edit,
  Trash2,
  Loader2,
  Filter,
  Sparkles,
  Wand2,
  Lock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { MiniEditor } from '@/components/editor/MiniEditor';
import type { Theme } from '@/types';

interface UserStatus {
  isUnlocked: boolean;
  requiredStars: number;
  hasPassed: boolean;
  isCompleted: boolean;
  remainingAttempts: number;
  totalAttempts: number;
  bestScore: number | null;
  canPurchaseAttempt: boolean;
  extraAttemptCost: number;
}

interface QuizWithCount {
  id: string;
  themeId: string;
  title: string;
  description: string;
  difficulty: 'FACILE' | 'MOYEN' | 'DIFFICILE';
  timeLimit: number;
  passingScore: number;
  requiredStars: number;
  isFree: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  theme?: { id: string; title: string };
  _count?: { questions: number };
  userStatus?: UserStatus;
}

const difficultyColors = {
  FACILE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  MOYEN: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  DIFFICILE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

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

export function QuizzesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [quizzes, setQuizzes] = useState<QuizWithCount[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [filterTheme, setFilterTheme] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizWithCount | null>(null);
  const [aiFormData, setAiFormData] = useState({
    themeId: '',
    difficulty: 'MOYEN' as 'FACILE' | 'MOYEN' | 'DIFFICILE',
    numberOfQuestions: 5,
    instructions: '',
  });
  const [formData, setFormData] = useState({
    themeId: '',
    title: '',
    description: '',
    difficulty: 'FACILE' as 'FACILE' | 'MOYEN' | 'DIFFICILE',
    timeLimit: 30,
    passingScore: 70,
    isFree: true,
  });

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      // Fetch quizzes with user status if logged in, otherwise fetch regular quizzes
      const quizzesPromise = user
        ? api.get('/quizzes/with-status')
        : api.get('/quizzes');

      const [quizzesRes, themesRes] = await Promise.all([
        quizzesPromise,
        api.get(isAdmin ? '/themes' : '/themes?active=true'),
      ]);
      // Handle both paginated response { data: [...] } and direct array response
      const quizzesData = Array.isArray(quizzesRes.data) ? quizzesRes.data : quizzesRes.data.data;
      setQuizzes(quizzesData);
      setThemes(themesRes.data);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenDialog = (quiz?: QuizWithCount) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        themeId: quiz.themeId,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        isFree: quiz.isFree,
      });
    } else {
      setEditingQuiz(null);
      setFormData({
        themeId: themes[0]?.id || '',
        title: '',
        description: '',
        difficulty: 'FACILE',
        timeLimit: 30,
        passingScore: 70,
        isFree: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingQuiz) {
        await api.patch(`/quizzes/${editingQuiz.id}`, formData);
        toast({ title: 'Quiz modifié avec succès' });
      } else {
        await api.post('/quizzes', formData);
        toast({ title: 'Quiz créé avec succès' });
      }
      setIsDialogOpen(false);
      fetchData(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) return;

    try {
      await api.delete(`/quizzes/${id}`);
      toast({ title: 'Quiz supprimé avec succès' });
      fetchData(false);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le quiz',
        variant: 'destructive',
      });
    }
  };

  const handleOpenAIDialog = () => {
    setAiFormData({
      themeId: themes[0]?.id || '',
      difficulty: 'MOYEN',
      numberOfQuestions: 5,
      instructions: '',
    });
    setIsAIDialogOpen(true);
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiFormData.themeId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un thème',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await api.post('/quizzes/generate', aiFormData);
      toast({
        title: 'Quiz généré avec succès !',
        description: `Le quiz "${response.data.title}" a été créé avec ${response.data.questions?.length || 0} questions.`,
      });
      setIsAIDialogOpen(false);
      fetchData(false);
      // Navigate to the new quiz
      navigate(`/quizzes/${response.data.id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur de génération',
        description: err.response?.data?.message || 'Impossible de générer le quiz. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      quiz.title.toLowerCase().includes(searchLower) ||
      (quiz.description || '').toLowerCase().includes(searchLower);
    const matchesDifficulty =
      !filterDifficulty ||
      quiz.difficulty === filterDifficulty;
    const matchesTheme =
      !filterTheme ||
      quiz.themeId === filterTheme;
    return matchesSearch && matchesDifficulty && matchesTheme;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2E23] dark:text-[#E8F0EC]">Quiz</h1>
          <p className="text-[#5A7265] dark:text-[#8BA898] mt-1">
            Testez vos connaissances avec nos quiz interactifs
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={handleOpenAIDialog} variant="outline" className="gap-2">
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">Générer par IA</span>
              <Sparkles className="h-3 w-3 text-purple-500" />
            </Button>
            <Button onClick={() => handleOpenDialog()} variant="gradient">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau quiz
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un quiz..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-xl border-2 border-input bg-background px-3 text-sm min-w-[180px]"
            value={filterTheme}
            onChange={(e) => setFilterTheme(e.target.value)}
          >
            <option value="">Tous les thèmes</option>
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterDifficulty === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterDifficulty('')}
          >
            <Filter className="mr-2 h-4 w-4" />
            Tous
          </Button>
          {['FACILE', 'MOYEN', 'DIFFICILE'].map((diff) => (
            <Button
              key={diff}
              variant={filterDifficulty === diff ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterDifficulty(diff)}
            >
              {diff}
            </Button>
          ))}
        </div>
      </div>

      {/* Quizzes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B5E3D] dark:text-[#3D9A6A]" />
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucun quiz trouvé</p>
            <p className="text-muted-foreground">
              {searchQuery ? 'Essayez une autre recherche' : 'Commencez par créer un quiz'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredQuizzes.map((quiz) => {
            const status = quiz.userStatus;
            const isLocked = status && !status.isUnlocked;
            const hasPassed = status?.hasPassed;
            const isCompleted = status?.isCompleted;
            const canPurchase = status?.canPurchaseAttempt;
            
            // Check if user needs premium access for this quiz
            const isPremiumValid = user?.isPremium && 
              (!user?.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date());
            const needsPremium = !quiz.isFree && !isPremiumValid && !isAdmin;

            return (
              <motion.div key={quiz.id} variants={item}>
                <Card className={cn(
                  "group relative overflow-hidden border border-[#D1DDD6] dark:border-[#2D3F35] shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white dark:bg-[#141F1A]",
                  isLocked && "opacity-75",
                  needsPremium && "border-[#F5A623]/50 dark:border-[#F5A623]/30",
                  hasPassed && "ring-2 ring-[#3D9A6A]/50"
                )}>
                  {/* Premium badge indicator (top right corner) */}
                  {needsPremium && !isLocked && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-[#F5A623] to-[#D4890A] text-white text-xs font-medium shadow-lg">
                        <Crown className="h-3 w-3" />
                        Premium
                      </div>
                    </div>
                  )}
                  
                  {/* Star locked overlay */}
                  {isLocked && !needsPremium && (
                    <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
                      <Lock className="h-10 w-10 text-amber-400 mb-2" />
                      <p className="text-white font-medium">Quiz verrouillé</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="text-amber-400 font-bold">{status?.requiredStars} étoiles requises</span>
                      </div>
                      <p className="text-white/70 text-sm mt-2">
                        Vous avez {user?.stars || 0} étoiles
                      </p>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-medium',
                              difficultyColors[quiz.difficulty]
                            )}
                          >
                            {quiz.difficulty}
                          </span>
                          {quiz.isFree ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#1B5E3D]/10 text-[#1B5E3D] dark:text-[#3D9A6A]">
                              Gratuit
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F5A623]/10 text-[#F5A623]">
                              Premium
                            </span>
                          )}
                          {quiz.requiredStars > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {quiz.requiredStars}
                            </span>
                          )}
                          {hasPassed && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Réussi
                            </span>
                          )}
                          {isCompleted && !hasPassed && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Échoué
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {quiz.theme?.title}
                        </CardDescription>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(quiz)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(quiz.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div
                      className="text-sm text-muted-foreground line-clamp-2 mb-4 prose prose-sm dark:prose-invert max-w-none [&>*]:m-0"
                      dangerouslySetInnerHTML={{ __html: quiz.description }}
                    />
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{quiz.timeLimit} min</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Target className="h-4 w-4" />
                          <span>{quiz.passingScore}% requis</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Star className="h-4 w-4" />
                          <span>{quiz._count?.questions || 0} Q</span>
                        </div>
                      </div>

                      {/* User status info */}
                      {status && !isLocked && (
                        <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-muted/50">
                          {hasPassed ? (
                            <>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                Meilleur score: {status.bestScore}%
                              </span>
                              <span className="text-muted-foreground">Quiz terminé</span>
                            </>
                          ) : isCompleted ? (
                            <>
                              <span className="text-rose-600 dark:text-rose-400 font-medium">
                                Meilleur score: {status.bestScore}%
                              </span>
                              <span className="text-muted-foreground">0 tentative restante</span>
                            </>
                          ) : (
                            <>
                              {status.bestScore !== null && (
                                <span className="text-muted-foreground">
                                  Meilleur: {status.bestScore}%
                                </span>
                              )}
                              <span className="text-primary font-medium">
                                {status.remainingAttempts} tentative{status.remainingAttempts > 1 ? 's' : ''} restante{status.remainingAttempts > 1 ? 's' : ''}
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Action button */}
                      {needsPremium ? (
                        <Button
                          className="w-full bg-gradient-to-r from-[#F5A623] to-[#D4890A] hover:from-[#D4890A] hover:to-[#F5A623] text-white"
                          onClick={() => navigate('/premium')}
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          Devenir Premium
                        </Button>
                      ) : canPurchase ? (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => navigate(`/quizzes/${quiz.id}`)}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Acheter une tentative ({status?.extraAttemptCost} <Star className="h-3 w-3 inline" />)
                        </Button>
                      ) : hasPassed ? (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => navigate(`/quizzes/${quiz.id}`)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                          Voir le quiz
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant="gradient"
                          onClick={() => navigate(`/quizzes/${quiz.id}`)}
                          disabled={isLocked}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {status?.totalAttempts ? 'Continuer' : 'Commencer'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingQuiz ? 'Modifier le quiz' : 'Nouveau quiz'}
            </DialogTitle>
            <DialogDescription>
              {editingQuiz
                ? 'Modifiez les informations du quiz'
                : 'Créez un nouveau quiz interactif'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="themeId">Thème</Label>
                <select
                  id="themeId"
                  className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm"
                  value={formData.themeId}
                  onChange={(e) => setFormData({ ...formData, themeId: e.target.value })}
                  required
                >
                  <option value="">Sélectionner un thème</option>
                  {themes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Quiz JavaScript Avancé"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <MiniEditor
                  content={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  placeholder="Description du quiz..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulté</Label>
                  <select
                    id="difficulty"
                    className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: e.target.value as 'FACILE' | 'MOYEN' | 'DIFFICILE',
                      })
                    }
                  >
                    <option value="FACILE">Facile</option>
                    <option value="MOYEN">Moyen</option>
                    <option value="DIFFICILE">Difficile</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Temps (min)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    value={formData.timeLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, timeLimit: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passingScore">Score requis (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData({ ...formData, passingScore: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant={formData.isFree ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, isFree: true })}
                    >
                      Gratuit
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.isFree ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, isFree: false })}
                    >
                      Premium
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="gradient" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingQuiz ? 'Modification...' : 'Création...'}
                  </>
                ) : editingQuiz ? (
                  'Modifier'
                ) : (
                  'Créer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Generation Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              Générer un quiz par IA
            </DialogTitle>
            <DialogDescription>
              L'intelligence artificielle va créer un quiz complet avec des questions pertinentes sur le thème choisi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerateQuiz}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ai-themeId">Thème *</Label>
                <select
                  id="ai-themeId"
                  className="flex h-11 w-full rounded-xl border-2 border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#0D1512] text-[#1A2E23] dark:text-[#E8F0EC] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30"
                  value={aiFormData.themeId}
                  onChange={(e) => setAiFormData({ ...aiFormData, themeId: e.target.value })}
                  required
                  disabled={isGenerating}
                >
                  <option value="">Sélectionner un thème</option>
                  {themes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-difficulty">Difficulté</Label>
                  <select
                    id="ai-difficulty"
                    className="flex h-11 w-full rounded-xl border-2 border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#0D1512] text-[#1A2E23] dark:text-[#E8F0EC] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30"
                    value={aiFormData.difficulty}
                    onChange={(e) =>
                      setAiFormData({
                        ...aiFormData,
                        difficulty: e.target.value as 'FACILE' | 'MOYEN' | 'DIFFICILE',
                      })
                    }
                    disabled={isGenerating}
                  >
                    <option value="FACILE">Facile</option>
                    <option value="MOYEN">Moyen</option>
                    <option value="DIFFICILE">Difficile</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-questions">Nb. questions</Label>
                  <Input
                    id="ai-questions"
                    type="number"
                    min="3"
                    max="20"
                    value={aiFormData.numberOfQuestions}
                    onChange={(e) =>
                      setAiFormData({ ...aiFormData, numberOfQuestions: parseInt(e.target.value) || 5 })
                    }
                    disabled={isGenerating}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-instructions">Instructions supplémentaires <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
                <textarea
                  id="ai-instructions"
                  className="flex min-h-[80px] w-full rounded-xl border-2 border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#0D1512] text-[#1A2E23] dark:text-[#E8F0EC] px-4 py-3 text-sm placeholder:text-[#5A7265] dark:placeholder:text-[#8BA898] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500/30 resize-none"
                  value={aiFormData.instructions}
                  onChange={(e) => setAiFormData({ ...aiFormData, instructions: e.target.value })}
                  placeholder="Ex: Inclure des questions sur les cas pratiques, se concentrer sur le code de déontologie..."
                  disabled={isGenerating}
                />
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    <span className="font-medium text-purple-600 dark:text-purple-400">Info :</span>{' '}
                    La génération peut prendre quelques secondes. Les questions varieront entre QCU, QCM, Vrai/Faux et Oui/Non avec 2 à 4 réponses possibles.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAIDialogOpen(false)}
                disabled={isGenerating}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isGenerating || !aiFormData.themeId}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Générer le quiz
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
