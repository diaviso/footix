import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Play,
  Clock,
  Target,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MiniEditor } from '@/components/editor/MiniEditor';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import type { Theme, Quiz } from '@/types';

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

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'FACILE':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'MOYEN':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'DIFFICILE':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export function ThemesPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: 0,
    isActive: true,
  });

  const fetchThemes = async () => {
    try {
      const response = await api.get(isAdmin ? '/themes' : '/themes?active=true');
      setThemes(response.data);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les thèmes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleOpenDialog = (theme?: Theme) => {
    if (theme) {
      setEditingTheme(theme);
      setFormData({
        title: theme.title,
        description: theme.description,
        position: theme.position,
        isActive: theme.isActive ?? true,
      });
    } else {
      setEditingTheme(null);
      setFormData({
        title: '',
        description: '',
        position: themes.length + 1,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTheme) {
        await api.patch(`/themes/${editingTheme.id}`, formData);
        toast({ title: 'Thème modifié avec succès' });
      } else {
        await api.post('/themes', formData);
        toast({ title: 'Thème créé avec succès' });
      }
      setIsDialogOpen(false);
      fetchThemes();
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce thème ?')) return;

    try {
      await api.delete(`/themes/${id}`);
      toast({ title: 'Thème supprimé avec succès' });
      fetchThemes();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le thème',
        variant: 'destructive',
      });
    }
  };

  const toggleThemeActive = async (theme: Theme) => {
    try {
      await api.patch(`/themes/${theme.id}`, { isActive: !theme.isActive });
      toast({
        title: theme.isActive ? 'Thème désactivé' : 'Thème activé',
        description: `Le thème "${theme.title}" a été ${theme.isActive ? 'désactivé' : 'activé'}`,
      });
      fetchThemes();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut du thème',
        variant: 'destructive',
      });
    }
  };

  const moveQuiz = async (themeId: string, quizIndex: number, direction: 'up' | 'down') => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme?.quizzes) return;
    const quizzes = [...theme.quizzes];
    const newIndex = direction === 'up' ? quizIndex - 1 : quizIndex + 1;
    if (newIndex < 0 || newIndex >= quizzes.length) return;
    // Swap
    [quizzes[quizIndex], quizzes[newIndex]] = [quizzes[newIndex], quizzes[quizIndex]];
    const quizIds = quizzes.map(q => q.id);
    try {
      await api.patch(`/themes/${themeId}/reorder-quizzes`, { quizIds });
      toast({ title: 'Ordre des quiz mis à jour' });
      fetchThemes();
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de réordonner les quiz', variant: 'destructive' });
    }
  };

  const toggleQuizActive = async (quiz: Quiz) => {
    try {
      await api.patch(`/quizzes/${quiz.id}`, { isActive: !quiz.isActive });
      toast({
        title: quiz.isActive ? 'Quiz désactivé' : 'Quiz activé',
        description: `Le quiz "${quiz.title}" a été ${quiz.isActive ? 'désactivé' : 'activé'}`,
      });
      fetchThemes();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut du quiz',
        variant: 'destructive',
      });
    }
  };

  const toggleExpanded = (themeId: string) => {
    setExpandedThemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(themeId)) {
        newSet.delete(themeId);
      } else {
        newSet.add(themeId);
      }
      return newSet;
    });
  };

  const filteredThemes = themes.filter(
    (theme) =>
      theme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2E23] dark:text-[#E8F0EC]">Thèmes</h1>
          <p className="text-[#5A7265] dark:text-[#8BA898] mt-1">
            Gérez les thèmes d'apprentissage
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenDialog()} variant="gradient">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau thème
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un thème..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Themes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredThemes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucun thème trouvé</p>
            <p className="text-muted-foreground">
              {searchQuery ? 'Essayez une autre recherche' : 'Commencez par créer un thème'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {filteredThemes.map((theme) => (
            <motion.div key={theme.id} variants={item}>
              <Card className={`group relative overflow-hidden border border-[#D1DDD6] dark:border-[#2D3F35] shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-[#141F1A] ${!theme.isActive ? 'opacity-60' : ''}`}>
                <div className={`absolute top-0 left-0 right-0 h-1 ${theme.isActive ? 'bg-gradient-to-r from-[#1B5E3D] via-[#2D7A50] to-[#3D9A6A]' : 'bg-gray-400'}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${theme.isActive ? 'bg-[#1B5E3D]' : 'bg-gray-400'} text-white font-bold text-lg`}>
                        {theme.position}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{theme.title}</CardTitle>
                          {!theme.isActive && (
                            <Badge variant="secondary" className="text-xs">Désactivé</Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm mt-1">
                          {theme.quizzes?.length || 0} quiz disponible{(theme.quizzes?.length || 0) > 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <>
                          <div className="flex items-center gap-2 mr-2">
                            <span className="text-xs text-muted-foreground">
                              {theme.isActive ? 'Actif' : 'Inactif'}
                            </span>
                            <Switch
                              checked={theme.isActive ?? true}
                              onCheckedChange={() => toggleThemeActive(theme)}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(theme)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(theme.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleExpanded(theme.id)}
                      >
                        {expandedThemes.has(theme.id) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div
                    className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none [&>*]:m-0"
                    dangerouslySetInnerHTML={{ __html: theme.description }}
                  />
                </CardContent>

                {/* Quizzes Section */}
                <AnimatePresence>
                  {expandedThemes.has(theme.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t bg-muted/30 p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Quiz du thème
                        </h4>
                        {theme.quizzes && theme.quizzes.length > 0 ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            {theme.quizzes.map((quiz, quizIndex) => (
                              <div
                                key={quiz.id}
                                className={`relative p-4 rounded-lg border bg-background hover:shadow-md transition-all ${!quiz.isActive ? 'opacity-60' : ''}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {isAdmin && (
                                      <div className="flex flex-col gap-0.5 shrink-0">
                                        <button
                                          onClick={() => moveQuiz(theme.id, quizIndex, 'up')}
                                          disabled={quizIndex === 0}
                                          className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                          title="Monter"
                                        >
                                          <ArrowUp className="h-3.5 w-3.5" />
                                        </button>
                                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground mx-auto" />
                                        <button
                                          onClick={() => moveQuiz(theme.id, quizIndex, 'down')}
                                          disabled={quizIndex === (theme.quizzes?.length ?? 0) - 1}
                                          className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                          title="Descendre"
                                        >
                                          <ArrowDown className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        {isAdmin && (
                                          <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                                            #{quizIndex + 1}
                                          </span>
                                        )}
                                        <h5 className="font-medium truncate">{quiz.title}</h5>
                                        {!quiz.isActive && (
                                          <Badge variant="secondary" className="text-xs shrink-0">Désactivé</Badge>
                                        )}
                                      </div>
                                      <div
                                        className="text-sm text-muted-foreground line-clamp-2 mb-2 prose prose-sm dark:prose-invert max-w-none [&>*]:m-0"
                                        dangerouslySetInnerHTML={{ __html: quiz.description }}
                                      />
                                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <Badge className={getDifficultyColor(quiz.difficulty)}>
                                          {quiz.difficulty}
                                        </Badge>
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {quiz.timeLimit} min
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Target className="h-3 w-3" />
                                          {quiz.passingScore}%
                                        </span>
                                        {quiz.isFree && (
                                          <Badge variant="outline" className="text-green-600 border-green-600">
                                            Gratuit
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 ml-2">
                                    {isAdmin && (
                                      <Switch
                                        checked={quiz.isActive ?? true}
                                        onCheckedChange={() => toggleQuizActive(quiz)}
                                      />
                                    )}
                                    <Button
                                      size="sm"
                                      variant="gradient"
                                      onClick={() => navigate(`/quizzes/${quiz.id}`)}
                                      disabled={!quiz.isActive && !isAdmin}
                                    >
                                      <Play className="h-3 w-3 mr-1" />
                                      Voir
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Aucun quiz dans ce thème
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTheme ? 'Modifier le thème' : 'Nouveau thème'}
            </DialogTitle>
            <DialogDescription>
              {editingTheme
                ? 'Modifiez les informations du thème'
                : 'Créez un nouveau thème d\'apprentissage'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: JavaScript Fondamentaux"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <MiniEditor
                  content={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  placeholder="Description du thème..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  min="1"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Activer le thème</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
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
                    {editingTheme ? 'Modification...' : 'Création...'}
                  </>
                ) : editingTheme ? (
                  'Modifier'
                ) : (
                  'Créer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
