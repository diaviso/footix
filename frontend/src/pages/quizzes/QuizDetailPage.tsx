import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Clock,
  Target,
  Star,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  Play,
  Search,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Circle,
  CheckCircle2,
  PartyPopper,
  Lock,
  RotateCcw,
  XCircle,
  Lightbulb,
  Wand2,
  Eye,
  FileWarning,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { fireThemeCompletion, fireTrophyCelebration } from '@/components/ui/confetti';

interface Option {
  id?: string;
  content: string;
  isCorrect: boolean;
  explanation?: string;
}

interface Question {
  id: string;
  content: string;
  type: 'QCM' | 'QCU';
  options: Option[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: 'FACILE' | 'MOYEN' | 'DIFFICILE';
  timeLimit: number;
  passingScore: number;
  requiredStars: number;
  isFree: boolean;
  theme?: { title: string };
  questions: Question[];
}

const difficultyColors = {
  FACILE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200',
  MOYEN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
  DIFFICILE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200',
};

const difficultyGradients = {
  FACILE: 'from-emerald-500 to-teal-500',
  MOYEN: 'from-amber-500 to-orange-500',
  DIFFICILE: 'from-rose-500 to-pink-500',
};

export function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [questionForm, setQuestionForm] = useState({
    content: '',
    type: 'QCU' as 'QCM' | 'QCU',
    options: [
      { content: '', isCorrect: false, explanation: '' },
      { content: '', isCorrect: false, explanation: '' },
      { content: '', isCorrect: false, explanation: '' },
      { content: '', isCorrect: false, explanation: '' },
    ] as Option[],
  });

  // Quiz taking state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownTime, setCountdownTime] = useState(15);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passed: boolean;
    starsEarned: number;
    totalStars: number;
    remainingAttempts: number;
    canViewCorrection: boolean;
    themeCompleted: boolean;
    themeName: string;
  } | null>(null);

  // Attempt tracking state
  const [attemptInfo, setAttemptInfo] = useState<{
    remainingAttempts: number;
    canViewCorrection: boolean;
    hasPassed: boolean;
    isCompleted: boolean;
    failedAttempts: number;
    canPurchaseAttempt: boolean;
    extraAttemptCost: number;
    extraAttemptsPurchased: number;
  } | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    spelling: {
      original: string;
      corrected: string;
      hasCorrections: boolean;
      correctedOptions?: string[];
      corrections: {
        field: 'content' | 'option';
        optionIndex?: number;
        original: string;
        corrected: string;
        explanation?: string;
      }[];
    };
    redundancy: {
      hasSimilarQuestions: boolean;
      similarQuestions: {
        id: string;
        content: string;
        similarityScore: number;
        type?: string;
        options?: { content: string; isCorrect: boolean }[];
      }[];
    };
  } | null>(null);
  const [showSimilarQuestions, setShowSimilarQuestions] = useState(false);

  // AI Question Generation state
  const [isGenerateQuestionsModalOpen, setIsGenerateQuestionsModalOpen] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generateQuestionsForm, setGenerateQuestionsForm] = useState({
    numberOfQuestions: 3,
    type: 'MIXTE' as 'QCU' | 'QCM' | 'MIXTE',
  });

  const fetchQuiz = async () => {
    try {
      // Admin users get the full quiz with explanations
      const endpoint = isAdmin ? `/quizzes/${id}/admin` : `/quizzes/${id}`;
      const response = await api.get(endpoint);
      setQuiz(response.data);
      setTimeLeft(response.data.timeLimit * 60);

      // Check if quiz is locked due to star requirement
      if (response.data.requiredStars > 0 && user) {
        setIsLocked((user.stars || 0) < response.data.requiredStars);
      }

      // Fetch attempt info for non-admin users
      if (!isAdmin && user) {
        try {
          const attemptRes = await api.get(`/quizzes/${id}/attempts`);
          setAttemptInfo({
            remainingAttempts: attemptRes.data.remainingAttempts,
            canViewCorrection: attemptRes.data.canViewCorrection,
            hasPassed: attemptRes.data.hasPassed,
            isCompleted: attemptRes.data.isCompleted,
            failedAttempts: attemptRes.data.failedAttempts,
            canPurchaseAttempt: attemptRes.data.canPurchaseAttempt,
            extraAttemptCost: attemptRes.data.extraAttemptCost,
            extraAttemptsPurchased: attemptRes.data.extraAttemptsPurchased,
          });
        } catch {
          // If no attempts yet, set default values
          setAttemptInfo({
            remainingAttempts: 3,
            canViewCorrection: false,
            hasPassed: false,
            isCompleted: false,
            failedAttempts: 0,
            canPurchaseAttempt: false,
            extraAttemptCost: 10,
            extraAttemptsPurchased: 0,
          });
        }
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le quiz',
        variant: 'destructive',
      });
      navigate('/quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAdmin]);

  // Timer for quiz
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, timeLeft]);

  // Countdown timer before quiz starts
  useEffect(() => {
    if (!isCountdown || countdownTime <= 0) return;

    const timer = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          setIsCountdown(false);
          setIsPlaying(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCountdown, countdownTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!quiz) return 'text-foreground';
    const totalSeconds = quiz.timeLimit * 60;
    const percentage = (timeLeft / totalSeconds) * 100;
    if (percentage <= 10) return 'text-red-500';
    if (percentage <= 25) return 'text-amber-500';
    return 'text-foreground';
  };

  const handleOpenQuestionDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        content: question.content,
        type: question.type,
        options: question.options.map((o) => ({ content: o.content, isCorrect: o.isCorrect, explanation: o.explanation || '' })),
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        content: '',
        type: 'QCU',
        options: [
          { content: '', isCorrect: false, explanation: '' },
          { content: '', isCorrect: false, explanation: '' },
          { content: '', isCorrect: false, explanation: '' },
          { content: '', isCorrect: false, explanation: '' },
        ],
      });
    }
    setIsQuestionDialogOpen(true);
  };

  const validateQuestionForm = () => {
    const filteredOptions = questionForm.options.filter((o) => o.content.trim());
    const correctCount = filteredOptions.filter((o) => o.isCorrect).length;

    if (questionForm.type === 'QCU' && correctCount !== 1) {
      toast({
        title: 'Erreur',
        description: 'Une question QCU doit avoir exactement une bonne réponse',
        variant: 'destructive',
      });
      return false;
    }

    if (questionForm.type === 'QCM' && correctCount < 1) {
      toast({
        title: 'Erreur',
        description: 'Une question QCM doit avoir au moins une bonne réponse',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleAnalyzeQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateQuestionForm()) return;

    // For editing, skip analysis and submit directly
    if (editingQuestion) {
      await handleFinalSubmit();
      return;
    }

    setIsAnalyzing(true);
    const filteredOptions = questionForm.options.filter((o) => o.content.trim());

    try {
      const response = await api.post('/quizzes/questions/analyze', {
        quizId: id,
        content: questionForm.content,
        options: filteredOptions,
      });

      setAnalysisResult(response.data);
      setIsQuestionDialogOpen(false);
      setIsAnalysisModalOpen(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur d\'analyse',
        description: err.response?.data?.message || 'Impossible d\'analyser la question',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyCorrections = () => {
    if (!analysisResult) return;

    // Apply corrected content
    const newForm = { ...questionForm };
    newForm.content = analysisResult.spelling.corrected;

    // Apply corrected options if available
    if (analysisResult.spelling.correctedOptions) {
      newForm.options = questionForm.options.map((opt, idx) => ({
        ...opt,
        content: analysisResult.spelling.correctedOptions?.[idx] || opt.content,
      }));
    }

    setQuestionForm(newForm);
    toast({ title: 'Corrections appliquées' });
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const filteredOptions = questionForm.options.filter((o) => o.content.trim());

    try {
      if (editingQuestion) {
        // Update: don't send quizId
        const updatePayload = {
          content: questionForm.content,
          type: questionForm.type,
          options: filteredOptions,
        };
        await api.patch(`/quizzes/questions/${editingQuestion.id}`, updatePayload);
        toast({ title: 'Question modifiée avec succès' });
      } else {
        // Create: include quizId
        const createPayload = {
          quizId: id,
          content: questionForm.content,
          type: questionForm.type,
          options: filteredOptions,
        };
        await api.post('/quizzes/questions', createPayload);
        toast({ title: 'Question ajoutée avec succès' });
      }

      setIsQuestionDialogOpen(false);
      setIsAnalysisModalOpen(false);
      setAnalysisResult(null);
      fetchQuiz();
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

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);

    try {
      const response = await api.post('/quizzes/questions/generate', {
        quizId: id,
        numberOfQuestions: generateQuestionsForm.numberOfQuestions,
        type: generateQuestionsForm.type,
      });

      toast({
        title: 'Questions générées !',
        description: response.data.message,
      });

      setIsGenerateQuestionsModalOpen(false);
      fetchQuiz();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur de génération',
        description: err.response?.data?.message || 'Impossible de générer les questions',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return;

    try {
      await api.delete(`/quizzes/questions/${questionId}`);
      toast({ title: 'Question supprimée avec succès' });
      fetchQuiz();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la question',
        variant: 'destructive',
      });
    }
  };

  const handlePurchaseAttempt = async () => {
    if (!quiz || isPurchasing) return;

    setIsPurchasing(true);
    try {
      const response = await api.post('/quizzes/purchase-attempt', { quizId: quiz.id });

      toast({
        title: 'Tentative achetée !',
        description: response.data.message,
      });

      // Update user stars in auth store
      if (user) {
        useAuthStore.setState({
          user: { ...user, stars: response.data.remainingStars },
        });
      }

      // Refresh attempt info
      fetchQuiz();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Impossible d\'acheter une tentative',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleStartQuiz = () => {
    if (isAdmin) {
      toast({
        title: 'Action non autorisée',
        description: 'Les administrateurs ne peuvent pas participer aux quiz',
        variant: 'destructive',
      });
      return;
    }
    if (!quiz || quiz.questions.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Ce quiz ne contient aucune question',
        variant: 'destructive',
      });
      return;
    }
    // Check premium access for non-free quizzes
    if (!quiz.isFree) {
      const userAny = user as { isPremium?: boolean; premiumExpiresAt?: string };
      const isPremiumValid = userAny?.isPremium && 
        (!userAny?.premiumExpiresAt || new Date(userAny.premiumExpiresAt) > new Date());
      
      if (!isPremiumValid) {
        toast({
          title: 'Quiz Premium',
          description: 'Ce quiz est réservé aux membres Premium. Souscrivez à un abonnement pour y accéder.',
          variant: 'destructive',
        });
        navigate('/premium');
        return;
      }
    }
    if (attemptInfo && attemptInfo.remainingAttempts <= 0 && !attemptInfo.hasPassed) {
      toast({
        title: 'Tentatives épuisées',
        description: 'Vous avez utilisé vos 3 tentatives. Consultez la correction.',
        variant: 'destructive',
      });
      return;
    }
    // Start countdown
    setIsCountdown(true);
    setCountdownTime(15);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(quiz.timeLimit * 60);
    setQuizResult(null);
  };

  const handleViewCorrection = async () => {
    setQuizResult(null);
    try {
      // Load quiz with corrections (includes explanations)
      const response = await api.get(`/quizzes/${id}/correction`);
      setQuiz(response.data);
      setShowCorrection(true);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la correction',
        variant: 'destructive',
      });
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    const question = quiz?.questions.find((q) => q.id === questionId);
    if (!question) return;

    if (question.type === 'QCU') {
      setAnswers({ ...answers, [questionId]: [optionId] });
    } else {
      const current = answers[questionId] || [];
      if (current.includes(optionId)) {
        setAnswers({ ...answers, [questionId]: current.filter((id) => id !== optionId) });
      } else {
        setAnswers({ ...answers, [questionId]: [...current, optionId] });
      }
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    try {
      const response = await api.post('/quizzes/submit', {
        quizId: quiz.id,
        answers: Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
          questionId,
          selectedOptionIds,
        })),
      });

      const result = {
        score: response.data.score,
        passed: response.data.passed,
        starsEarned: response.data.starsEarned,
        totalStars: response.data.totalStars,
        remainingAttempts: response.data.remainingAttempts,
        canViewCorrection: response.data.canViewCorrection,
        themeCompleted: response.data.themeCompleted || false,
        themeName: response.data.themeName || '',
      };

      setQuizResult(result);

      // Update attempt info
      setAttemptInfo((prev) => prev ? {
        ...prev,
        remainingAttempts: response.data.remainingAttempts,
        canViewCorrection: response.data.canViewCorrection,
        hasPassed: response.data.passed,
        failedAttempts: response.data.passed ? prev.failedAttempts : prev.failedAttempts + 1,
      } : null);

      setIsPlaying(false);

      // Trigger confetti on success
      if (result.passed) {
        if (result.themeCompleted) {
          // Grand celebration for completing all quizzes of a theme
          setTimeout(() => fireThemeCompletion(), 300);
        } else {
          // Standard celebration for passing a quiz
          setTimeout(() => fireTrophyCelebration(), 300);
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Impossible de soumettre le quiz',
        variant: 'destructive',
      });
    }
  };

  const filteredQuestions = quiz?.questions.filter(
    (q) => q.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F5A623] to-[#C0C0C0] blur-xl opacity-30 animate-pulse" />
          <Loader2 className="h-16 w-16 animate-spin text-[#D4AF37] dark:text-[#C0C0C0] relative" />
        </div>
        <p className="mt-4 text-[#5A7265] dark:text-[#8BA898]">Chargement du quiz...</p>
      </div>
    );
  }

  if (!quiz) return null;

  // Quiz result view
  if (quizResult) {
    const isSuccess = quizResult.passed;
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <Card className="border border-slate-200 dark:border-slate-700/50 shadow-2xl overflow-hidden bg-white dark:bg-slate-900/95">
            <motion.div
              className={`h-2 bg-gradient-to-r ${isSuccess ? 'from-emerald-500 via-green-500 to-teal-500' : 'from-rose-500 via-red-500 to-pink-500'}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ transformOrigin: 'left' }}
            />
            <CardContent className="pt-12 pb-10 text-center relative">
              {/* Background decorations */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {isSuccess ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 0.1, y: 0 }}
                      className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 0.1, y: 0 }}
                      className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-400"
                    />
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 0.08, 0.04, 0.08], scale: [0.5, 1.2, 1, 1.1] }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                      className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-rose-400 to-pink-400"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 0.06, 0.03, 0.06], scale: [0.5, 1.1, 0.9, 1.1] }}
                      transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }}
                      className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-gradient-to-br from-red-400 to-rose-400"
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.05, 0.02, 0.05] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-radial from-rose-300 to-transparent"
                    />
                  </>
                )}
              </div>

              {/* Result icon */}
              {isSuccess ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="mx-auto w-28 h-28 rounded-full flex items-center justify-center mb-8 relative bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50"
                >
                  <Trophy className="h-14 w-14 text-emerald-600 dark:text-emerald-400" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="h-8 w-8 text-amber-500" />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0, y: -40 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.2 }}
                  className="mb-6 flex flex-col items-center"
                >
                  {/* Big animated crying emoji */}
                  <motion.div
                    animate={{ rotate: [0, -6, 6, -3, 0], x: [0, -5, 5, -3, 0] }}
                    transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
                  >
                    <span className="text-[80px] leading-none block">😭</span>
                  </motion.div>
                  {/* Animated tear drops */}
                  <div className="flex gap-6 mt-1">
                    <motion.span
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: [0, 1, 0], y: [0, 16, 32] }}
                      transition={{ delay: 1.2, duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                      className="text-xl"
                    >💧</motion.span>
                    <motion.span
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: [0, 1, 0], y: [0, 12, 24] }}
                      transition={{ delay: 1.6, duration: 1.2, repeat: Infinity, repeatDelay: 1.3 }}
                      className="text-base"
                    >💧</motion.span>
                  </div>
                </motion.div>
              )}

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={cn(
                  'text-3xl font-bold mb-3',
                  isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {quizResult.themeCompleted ? (
                  <motion.span
                    initial={{ scale: 0.5 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                    className="inline-block"
                  >
                    Champion !
                  </motion.span>
                ) : isSuccess ? 'Félicitations !' : (
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                    className="inline-block"
                  >
                    Oups, raté ! 😔
                  </motion.span>
                )}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-600 dark:text-slate-400 mb-8"
              >
                {quizResult.themeCompleted ? (
                  <span className="text-lg">
                    Vous avez terminé tous les quiz du thème{' '}
                    <span className="font-bold text-primary">"{quizResult.themeName}"</span> !
                  </span>
                ) : isSuccess
                  ? 'Vous avez brillamment réussi ce quiz !'
                  : 'Ne baisse pas les bras, tu peux y arriver ! 💪'}
              </motion.p>

              {/* Theme completion badge */}
              {quizResult.themeCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                  className="mb-6"
                >
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold shadow-lg">
                    <PartyPopper className="h-5 w-5" />
                    <span>Thème Complété !</span>
                    <PartyPopper className="h-5 w-5" />
                  </div>
                </motion.div>
              )}

              {/* Score display with animated counter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="mb-8"
              >
                <motion.div
                  className={cn(
                    'text-7xl font-bold mb-2 tabular-nums',
                    isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.3 }}
                  >
                    {quizResult.score}%
                  </motion.span>
                </motion.div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Target className="h-4 w-4" />
                  <span>Score minimum requis: {quiz.passingScore}%</span>
                </div>
              </motion.div>

              {/* Stars earned */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700/50">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                  >
                    <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                  </motion.div>
                  <div className="text-center">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-3xl font-bold text-yellow-700 dark:text-yellow-400"
                    >
                      +{quizResult.starsEarned}
                    </motion.span>
                    <span className="text-yellow-700 dark:text-yellow-400 ml-1">
                      étoile{quizResult.starsEarned > 1 ? 's' : ''}
                    </span>
                    <p className="text-sm text-yellow-600/80 dark:text-yellow-500/80">
                      Total: {quizResult.totalStars} étoiles
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Progress bar */}
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                transition={{ delay: 1.1 }}
                className="mb-8 px-4"
              >
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${quizResult.score}%` }}
                    transition={{ delay: 1.3, duration: 1, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      isSuccess
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-gradient-to-r from-rose-500 to-pink-500'
                    )}
                  />
                </div>
              </motion.div>

              {/* Remaining attempts info */}
              {!isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, type: 'spring' }}
                  className="mb-6 text-center"
                >
                  {quizResult.remainingAttempts > 0 ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Play className="h-4 w-4 text-rose-500" />
                      </motion.div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Il vous reste <span className="font-bold text-slate-900 dark:text-white">{quizResult.remainingAttempts}</span> tentative{quizResult.remainingAttempts > 1 ? 's' : ''}
                      </p>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <p className="text-amber-700 dark:text-amber-400 font-medium">
                        Vous avez utilisé vos 3 tentatives
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button variant="outline" size="lg" onClick={() => navigate('/quizzes')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                {quizResult.remainingAttempts > 0 && !isSuccess && (
                  <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Button
                      size="lg"
                      onClick={handleStartQuiz}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-500/25"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Réessayer ({quizResult.remainingAttempts} restante{quizResult.remainingAttempts > 1 ? 's' : ''})
                    </Button>
                  </motion.div>
                )}
                {quizResult.canViewCorrection && (
                  <Button
                    size="lg"
                    onClick={handleViewCorrection}
                    className="bg-[#D4AF37] hover:bg-[#A89030] text-white"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Voir la correction
                  </Button>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Countdown view before quiz starts
  if (isCountdown) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl text-center"
        >
          <Card className="border border-slate-200 dark:border-slate-700/50 shadow-2xl overflow-hidden bg-white dark:bg-slate-900/95">
            <div className="h-2 bg-gradient-to-r from-[#D4AF37] via-[#F5A623] to-[#C0C0C0]" />
            <CardContent className="py-16 px-8">
              {/* Countdown timer */}
              <motion.div
                key={countdownTime}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-10"
              >
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={553}
                      strokeDashoffset={553 - (553 * countdownTime) / 15}
                      className="transition-all duration-1000 ease-linear"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="50%" stopColor="#F5A623" />
                        <stop offset="100%" stopColor="#C0C0C0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute text-7xl font-bold bg-gradient-to-r from-[#D4AF37] via-[#F5A623] to-[#C0C0C0] bg-clip-text text-transparent">
                    {countdownTime}
                  </span>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-6 text-slate-900 dark:text-white"
              >
                Préparez-vous !
              </motion.h2>

              {/* Quiz info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 text-left bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-6"
              >
                <h3 className="font-semibold text-lg mb-4 text-center text-slate-900 dark:text-white">Comment ça marche :</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#C0C0C0] text-sm font-bold">1</div>
                    <p className="text-slate-600 dark:text-slate-400 pt-1">
                      <span className="font-medium text-slate-900 dark:text-white">{quiz.questions.length} questions</span> à répondre en <span className="font-medium text-slate-900 dark:text-white">{quiz.timeLimit} minutes</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5A623]/10 text-[#F5A623] text-sm font-bold">2</div>
                    <p className="text-slate-600 dark:text-slate-400 pt-1">
                      Score minimum requis : <span className="font-medium text-slate-900 dark:text-white">{quiz.passingScore}%</span> pour réussir
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C0C0C0]/10 text-[#C0C0C0] text-sm font-bold">3</div>
                    <p className="text-slate-600 dark:text-slate-400 pt-1">
                      Gagnez des <span className="font-medium text-slate-900 dark:text-white">étoiles</span> selon votre performance et la difficulté
                    </p>
                  </div>
                  {attemptInfo && attemptInfo.remainingAttempts < 3 && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-bold">!</div>
                      <p className="text-amber-700 dark:text-amber-400 pt-1">
                        Tentative <span className="font-bold">{4 - attemptInfo.remainingAttempts}</span> sur 3
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4 justify-center"
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCountdown(false);
                    setCountdownTime(15);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#D4AF37] to-[#C0C0C0] hover:from-[#164a31] hover:to-[#2d7a54] text-white"
                  onClick={() => {
                    setIsCountdown(false);
                    setIsPlaying(true);
                  }}
                >
                  Commencer maintenant
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Correction view
  if (showCorrection) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setShowCorrection(false)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Correction : {quiz.title}</h1>
            <p className="text-slate-600 dark:text-slate-400">{quiz.theme?.title}</p>
          </div>
        </div>

        <Card className="border border-[#D4AF37]/20 dark:border-[#C0C0C0]/30 shadow-lg bg-[#D4AF37]/5 dark:bg-[#C0C0C0]/10">
          <CardContent className="py-4 px-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-[#D4AF37] dark:text-[#C0C0C0]" />
              <p className="text-[#D4AF37] dark:text-[#C0C0C0]">
                Voici les réponses correctes pour chaque question. Étudiez-les attentivement pour mieux vous préparer.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border border-slate-200 dark:border-slate-700/50 shadow-lg overflow-hidden bg-white dark:bg-slate-900/90">
                <div className={cn('h-1 bg-gradient-to-r', difficultyGradients[quiz.difficulty])} />
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37] text-white font-bold text-lg shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {question.type === 'QCU' ? 'Choix unique' : 'Choix multiple'}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-medium text-slate-900 dark:text-white">{question.content}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {question.options.map((option, idx) => (
                      <div
                        key={option.id}
                        className={cn(
                          'p-4 rounded-xl border-2 text-sm',
                          option.isCorrect
                            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-700'
                            : 'border-rose-200 bg-rose-50/50 dark:bg-rose-900/20 dark:border-rose-700/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                            option.isCorrect
                              ? 'bg-emerald-500 text-white'
                              : 'bg-rose-200 dark:bg-rose-800 text-rose-700 dark:text-rose-200'
                          )}>
                            {['A', 'B', 'C', 'D', 'E', 'F'][idx]}
                          </span>
                          <span className="flex-1 font-medium">{option.content}</span>
                          {option.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
                          )}
                        </div>
                        {option.explanation && (
                          <div className={cn(
                            'mt-3 pt-3 border-t text-sm',
                            option.isCorrect
                              ? 'border-emerald-200 dark:border-emerald-700/50'
                              : 'border-rose-200 dark:border-rose-700/50'
                          )}>
                            <div className="flex items-start gap-2">
                              <Lightbulb className={cn(
                                'h-4 w-4 mt-0.5 flex-shrink-0',
                                option.isCorrect
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-500 dark:text-rose-400'
                              )} />
                              <p className={cn(
                                option.isCorrect
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : 'text-rose-600 dark:text-rose-300'
                              )}>
                                {option.explanation}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={() => {
              setShowCorrection(false);
              navigate('/quizzes');
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
          >
            Retour aux quiz
          </Button>
        </div>
      </div>
    );
  }

  // Quiz playing view
  if (isPlaying) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedOptions = answers[currentQuestion.id] || [];
    const answeredCount = Object.keys(answers).length;
    const progressPercent = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border border-slate-200 dark:border-slate-700/50 shadow-lg bg-white dark:bg-slate-900/90">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setIsPlaying(false)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Quitter
                    </Button>
                    <div className="hidden sm:block">
                      <h2 className="font-semibold text-lg text-slate-900 dark:text-white">{quiz.title}</h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{quiz.theme?.title}</p>
                    </div>
                  </div>
                  <div className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold transition-colors',
                    getTimeColor(),
                    timeLeft <= 60 ? 'bg-red-100 dark:bg-red-900/30 animate-pulse' : 'bg-muted'
                  )}>
                    <Clock className="h-5 w-5" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Question <span className="font-bold text-slate-900 dark:text-white">{currentQuestionIndex + 1}</span> sur {quiz.questions.length}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-slate-900 dark:text-white">{answeredCount}</span> répondue{answeredCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Question navigation sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block"
            >
              <Card className="border border-slate-200 dark:border-slate-700/50 shadow-lg sticky top-4 bg-white dark:bg-slate-900/90">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {quiz.questions.map((q, idx) => {
                      const isAnswered = answers[q.id]?.length > 0;
                      const isCurrent = idx === currentQuestionIndex;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={cn(
                            'w-full aspect-square rounded-lg text-sm font-medium transition-all',
                            isCurrent
                              ? 'bg-[#D4AF37] text-white shadow-lg scale-110'
                              : isAnswered
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-300 dark:border-emerald-800'
                                : 'bg-muted hover:bg-muted/80'
                          )}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main question area */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border border-slate-200 dark:border-slate-700/50 shadow-xl overflow-hidden bg-white dark:bg-slate-900/95">
                    <div className={cn('h-2 bg-gradient-to-r', difficultyGradients[quiz.difficulty])} />
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="outline" className="bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#C0C0C0] border-[#D4AF37]/20">
                          {currentQuestion.type === 'QCU' ? (
                            <><Circle className="h-3 w-3 mr-1" /> Choix unique</>
                          ) : (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Choix multiple</>
                          )}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl leading-relaxed text-slate-900 dark:text-white">
                        {currentQuestion.content}
                      </CardTitle>
                      {currentQuestion.type === 'QCM' && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          <HelpCircle className="inline h-4 w-4 mr-1" />
                          Sélectionnez toutes les réponses correctes
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3 pb-8">
                      {currentQuestion.options.map((option, idx) => {
                        const isSelected = selectedOptions.includes(option.id!);
                        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

                        return (
                          <motion.button
                            key={option.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => handleSelectOption(currentQuestion.id, option.id!)}
                            className={cn(
                              'w-full p-5 text-left rounded-2xl border-2 transition-all duration-200 flex items-start gap-4 group',
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                            )}
                          >
                            <div className={cn(
                              'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all',
                              isSelected
                                ? 'bg-[#D4AF37] text-white'
                                : 'bg-muted group-hover:bg-[#D4AF37]/10'
                            )}>
                              {letters[idx]}
                            </div>
                            <span className="flex-1 text-base pt-2">{option.content}</span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex-shrink-0 pt-2"
                              >
                                <CheckCircle className="h-6 w-6 text-primary" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between mt-6">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                      disabled={currentQuestionIndex === 0}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      Précédent
                    </Button>

                    {/* Mobile question indicator */}
                    <div className="lg:hidden flex items-center gap-1">
                      {quiz.questions.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={cn(
                            'w-2 h-2 rounded-full transition-all',
                            idx === currentQuestionIndex
                              ? 'w-6 bg-primary'
                              : answers[quiz.questions[idx].id]?.length > 0
                                ? 'bg-emerald-500'
                                : 'bg-muted'
                          )}
                        />
                      ))}
                    </div>

                    {currentQuestionIndex < quiz.questions.length - 1 ? (
                      <Button
                        size="lg"
                        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                        className="gap-2 bg-[#D4AF37] hover:bg-[#A89030] text-white"
                      >
                        Suivant
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        onClick={handleSubmitQuiz}
                        className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                      >
                        <CheckCircle className="h-5 w-5" />
                        Terminer
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz detail view (admin/start)
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/quizzes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
            <Badge className={cn('border', difficultyColors[quiz.difficulty])}>
              {quiz.difficulty}
            </Badge>
          </div>
          <p className="text-muted-foreground">{quiz.theme?.title}</p>
        </div>
        {!isAdmin && (
          <div className="flex items-center gap-3">
            {attemptInfo?.canViewCorrection && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleViewCorrection}
                className="gap-2"
              >
                <HelpCircle className="h-5 w-5" />
                Voir la correction
              </Button>
            )}
            {/* Quiz locked by stars */}
            {isLocked ? (
              <Button
                size="lg"
                disabled
                className="gap-2 bg-amber-500/20 text-amber-700 dark:text-amber-400 cursor-not-allowed border border-amber-500/30"
              >
                <Lock className="h-5 w-5" />
                {quiz.requiredStars} <Star className="h-4 w-4" /> requises
              </Button>
            ) : attemptInfo?.hasPassed ? (
              <Button
                size="lg"
                onClick={handleStartQuiz}
                className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <RotateCcw className="h-5 w-5" />
                Rejouer (sans étoiles)
              </Button>
            ) : attemptInfo?.canPurchaseAttempt ? (
              <Button
                size="lg"
                onClick={handlePurchaseAttempt}
                disabled={isPurchasing || (user?.stars || 0) < (attemptInfo?.extraAttemptCost || 10)}
                className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
              >
                {isPurchasing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RotateCcw className="h-5 w-5" />
                )}
                Acheter une tentative ({attemptInfo?.extraAttemptCost} <Star className="h-4 w-4" />)
              </Button>
            ) : attemptInfo && attemptInfo.remainingAttempts > 0 ? (
              <Button
                size="lg"
                onClick={handleStartQuiz}
                className="gap-2 bg-[#D4AF37] hover:bg-[#A89030] text-white"
              >
                <Play className="h-5 w-5" />
                {attemptInfo.failedAttempts > 0 ? `Réessayer (${attemptInfo.remainingAttempts}/3)` : 'Commencer'}
              </Button>
            ) : (
              <Button
                size="lg"
                disabled
                className="gap-2 bg-muted text-muted-foreground cursor-not-allowed"
              >
                <XCircle className="h-5 w-5" />
                0 tentatives
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Quiz locked by stars info */}
      {!isAdmin && isLocked && quiz.requiredStars > 0 && (
        <Card className="shadow-lg border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <p className="text-amber-700 dark:text-amber-300">
                  Ce quiz nécessite <span className="font-bold">{quiz.requiredStars}</span> étoiles pour être débloqué.
                  Vous avez actuellement <span className="font-bold">{user?.stars || 0}</span> étoiles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attempt status for users */}
      {!isAdmin && !isLocked && attemptInfo && (attemptInfo.failedAttempts > 0 || attemptInfo.hasPassed || attemptInfo.canPurchaseAttempt) && (
        <Card className={cn(
          'shadow-lg',
          attemptInfo.hasPassed
            ? 'border border-emerald-200 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-950/30'
            : attemptInfo.canPurchaseAttempt
              ? 'border border-orange-200 dark:border-orange-700/50 bg-orange-50 dark:bg-orange-950/30'
              : attemptInfo.canViewCorrection
                ? 'border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/30'
                : 'border border-blue-200 dark:border-blue-700/50 bg-blue-50 dark:bg-blue-950/30'
        )}>
          <CardContent className="py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {attemptInfo.hasPassed ? (
                  <>
                    <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                      Vous avez réussi ce quiz !
                    </p>
                  </>
                ) : attemptInfo.canPurchaseAttempt ? (
                  <>
                    <RotateCcw className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <p className="text-orange-700 dark:text-orange-300 font-medium">
                        Tentatives épuisées ({3 + attemptInfo.extraAttemptsPurchased} utilisées)
                      </p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        Achetez une tentative supplémentaire pour {attemptInfo.extraAttemptCost} étoiles
                        {(user?.stars || 0) < attemptInfo.extraAttemptCost &&
                          ` (vous avez ${user?.stars || 0} étoiles)`
                        }
                      </p>
                    </div>
                  </>
                ) : attemptInfo.canViewCorrection ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <p className="text-amber-700 dark:text-amber-300">
                      3 tentatives échouées. La correction est disponible.
                    </p>
                  </>
                ) : (
                  <>
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <p className="text-blue-700 dark:text-blue-300">
                      {attemptInfo.failedAttempts} tentative{attemptInfo.failedAttempts > 1 ? 's' : ''} échouée{attemptInfo.failedAttempts > 1 ? 's' : ''} • {attemptInfo.remainingAttempts} restante{attemptInfo.remainingAttempts > 1 ? 's' : ''}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-blue-200 dark:border-blue-800/50 shadow-lg bg-white dark:bg-slate-900/80">
          <CardContent className="pt-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.timeLimit} min</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Durée</p>
          </CardContent>
        </Card>
        <Card className="border border-purple-200 dark:border-purple-800/50 shadow-lg bg-white dark:bg-slate-900/80">
          <CardContent className="pt-6">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-3">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.passingScore}%</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Score requis</p>
          </CardContent>
        </Card>
        <Card className="border border-amber-200 dark:border-amber-800/50 shadow-lg bg-white dark:bg-slate-900/80">
          <CardContent className="pt-6">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-3">
              <Star className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.questions.length}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Questions</p>
          </CardContent>
        </Card>
        <Card className="border border-emerald-200 dark:border-emerald-800/50 shadow-lg bg-white dark:bg-slate-900/80">
          <CardContent className="pt-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-3">
              <Trophy className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.isFree ? 'Gratuit' : 'Premium'}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Accès</p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card className="border border-slate-200 dark:border-slate-700/50 shadow-lg bg-white dark:bg-slate-900/90">
        <CardContent className="pt-6">
          <div
            className="text-slate-700 dark:text-slate-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none [&>*]:m-0"
            dangerouslySetInnerHTML={{ __html: quiz.description }}
          />
        </CardContent>
      </Card>

      {/* Questions section - Admin only */}
      {isAdmin && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Questions ({quiz.questions.length})</h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une question..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => handleOpenQuestionDialog()} className="gap-2 bg-[#D4AF37] hover:bg-[#A89030] text-white">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
              <Button 
                onClick={() => setIsGenerateQuestionsModalOpen(true)} 
                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                <Sparkles className="h-4 w-4" />
                Générer par IA
              </Button>
            </div>
          </div>

          {filteredQuestions.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                {searchQuery ? (
                  <>
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Aucune question trouvée</p>
                    <p className="text-muted-foreground">Essayez une autre recherche</p>
                  </>
                ) : (
                  <>
                    <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Aucune question</p>
                    <p className="text-muted-foreground mb-4">Ajoutez des questions pour ce quiz</p>
                    <Button onClick={() => handleOpenQuestionDialog()} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter une question
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group border border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-slate-900/90">
                    <div className={cn('h-1 bg-gradient-to-r', difficultyGradients[quiz.difficulty])} />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37] text-white font-bold text-lg">
                            {quiz.questions.indexOf(question) + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {question.type === 'QCU' ? 'Choix unique' : 'Choix multiple'}
                              </Badge>
                            </div>
                            <CardTitle className="text-base font-medium text-slate-900 dark:text-white">{question.content}</CardTitle>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => handleOpenQuestionDialog(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {question.options.map((option, idx) => (
                          <div
                            key={option.id}
                            className={cn(
                              'p-3 rounded-xl border-2 text-sm',
                              option.isCorrect
                                ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800'
                                : 'border-muted bg-muted/30'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                                option.isCorrect
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-muted'
                              )}>
                                {['A', 'B', 'C', 'D'][idx]}
                              </span>
                              <span className="flex-1">{option.content}</span>
                              {option.isCorrect && (
                                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                              )}
                            </div>
                            {option.explanation && (
                              <div className="mt-2 ml-10 flex items-start gap-2 text-xs text-muted-foreground">
                                <Lightbulb className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                                <span>{option.explanation}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Question Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Modifier la question' : 'Nouvelle question'}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion
                ? 'Modifiez les informations de la question'
                : 'Ajoutez une nouvelle question au quiz'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAnalyzeQuestion}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="content">Question</Label>
                <textarea
                  id="content"
                  className="flex min-h-[100px] w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                  value={questionForm.content}
                  onChange={(e) => setQuestionForm({ ...questionForm, content: e.target.value })}
                  placeholder="Entrez votre question..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none transition-colors"
                    value={questionForm.type}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, type: e.target.value as 'QCM' | 'QCU' })
                    }
                  >
                    <option value="QCU">Choix unique (QCU)</option>
                    <option value="QCM">Choix multiple (QCM)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Options de réponse</Label>
                <p className="text-xs text-muted-foreground">
                  {questionForm.type === 'QCU'
                    ? 'Cochez la seule bonne réponse'
                    : 'Cochez toutes les bonnes réponses'}
                </p>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="space-y-2 p-3 rounded-lg border border-input bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                        option.isCorrect ? 'bg-emerald-500 text-white' : 'bg-muted'
                      )}>
                        {['A', 'B', 'C', 'D'][index]}
                      </div>
                      <input
                        type={questionForm.type === 'QCU' ? 'radio' : 'checkbox'}
                        name="correctOption"
                        checked={option.isCorrect}
                        onChange={() => {
                          if (questionForm.type === 'QCU') {
                            setQuestionForm({
                              ...questionForm,
                              options: questionForm.options.map((o, i) => ({
                                ...o,
                                isCorrect: i === index,
                              })),
                            });
                          } else {
                            setQuestionForm({
                              ...questionForm,
                              options: questionForm.options.map((o, i) =>
                                i === index ? { ...o, isCorrect: !o.isCorrect } : o
                              ),
                            });
                          }
                        }}
                        className="h-5 w-5 accent-emerald-500"
                      />
                      <Input
                        value={option.content}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            options: questionForm.options.map((o, i) =>
                              i === index ? { ...o, content: e.target.value } : o
                            ),
                          })
                        }
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                    </div>
                    <div className="ml-11">
                      <Input
                        value={option.explanation || ''}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            options: questionForm.options.map((o, i) =>
                              i === index ? { ...o, explanation: e.target.value } : o
                            ),
                          })
                        }
                        placeholder="Explication (affichée lors de la correction)"
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || isAnalyzing} className="bg-[#D4AF37] hover:bg-[#A89030] text-white">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyse IA...
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingQuestion ? 'Modification...' : 'Ajout...'}
                  </>
                ) : editingQuestion ? (
                  'Modifier'
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Analyser et ajouter
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Modal */}
      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              Analyse IA de la question
            </DialogTitle>
            <DialogDescription>
              Vérifiez les suggestions de l'IA avant de créer la question
            </DialogDescription>
          </DialogHeader>

          {analysisResult && (
            <div className="space-y-6 py-4">
              {/* Spelling Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileWarning className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold">Orthographe et grammaire</h3>
                  {analysisResult.spelling.hasCorrections ? (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                      Corrections suggérées
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aucune erreur
                    </Badge>
                  )}
                </div>

                {analysisResult.spelling.hasCorrections ? (
                  <div className="space-y-3">
                    <div className="grid gap-3">
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Texte original</p>
                        <p className="text-sm">{analysisResult.spelling.original}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Texte corrigé</p>
                        <p className="text-sm">{analysisResult.spelling.corrected}</p>
                      </div>
                    </div>

                    {analysisResult.spelling.corrections.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Détail des corrections :</p>
                        {analysisResult.spelling.corrections.map((correction, idx) => (
                          <div key={idx} className="p-2 rounded bg-muted/50 text-sm">
                            <span className="line-through text-red-500">{correction.original}</span>
                            {' → '}
                            <span className="text-green-600 font-medium">{correction.corrected}</span>
                            {correction.explanation && (
                              <p className="text-xs text-muted-foreground mt-1">{correction.explanation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleApplyCorrections}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Appliquer les corrections
                      </Button>
                      <Button size="sm" variant="outline">
                        Ignorer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    La question est bien rédigée, aucune correction nécessaire.
                  </p>
                )}
              </div>

              {/* Redundancy Section */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Copy className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Vérification de redondance</h3>
                  {analysisResult.redundancy.hasSimilarQuestions ? (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                      Questions similaires détectées
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aucune redondance
                    </Badge>
                  )}
                </div>

                {analysisResult.redundancy.hasSimilarQuestions ? (
                  <div className="space-y-3">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Des questions similaires existent déjà dans ce quiz :
                    </p>

                    {showSimilarQuestions ? (
                      <div className="space-y-3">
                        {analysisResult.redundancy.similarQuestions.map((q, idx) => (
                          <div key={idx} className="p-4 rounded-lg border bg-muted/30 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                  Similarité : {Math.round(q.similarityScore * 100)}%
                                </Badge>
                                {q.type && (
                                  <Badge variant="outline">{q.type}</Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm font-medium">{q.content}</p>
                            {q.options && q.options.length > 0 && (
                              <div className="space-y-1 pl-3 border-l-2 border-muted-foreground/20">
                                <p className="text-xs text-muted-foreground font-medium">Options :</p>
                                {q.options.map((opt, optIdx) => (
                                  <div 
                                    key={optIdx} 
                                    className={cn(
                                      "text-sm flex items-center gap-2",
                                      opt.isCorrect && "text-green-600 font-medium"
                                    )}
                                  >
                                    {opt.isCorrect ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Circle className="h-3 w-3 text-muted-foreground" />
                                    )}
                                    {opt.content}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowSimilarQuestions(false)}
                        >
                          Masquer
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSimilarQuestions(true)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir les questions similaires ({analysisResult.redundancy.similarQuestions.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Cette question est unique et n'a pas de similarité avec les questions existantes.
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800">
                <h4 className="font-medium mb-2">Résumé de la question à créer</h4>
                <p className="text-sm mb-2"><strong>Question :</strong> {questionForm.content}</p>
                <p className="text-sm mb-2"><strong>Type :</strong> {questionForm.type}</p>
                <p className="text-sm"><strong>Options :</strong></p>
                <ul className="text-sm list-disc list-inside">
                  {questionForm.options.filter(o => o.content.trim()).map((opt, idx) => (
                    <li key={idx} className={opt.isCorrect ? 'text-green-600 font-medium' : ''}>
                      {opt.content} {opt.isCorrect && '✓'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAnalysisModalOpen(false);
                setIsQuestionDialogOpen(true);
              }}
            >
              Retour au formulaire
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Créer la question
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Question Generation Modal */}
      <Dialog open={isGenerateQuestionsModalOpen} onOpenChange={setIsGenerateQuestionsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              Générer des questions par IA
            </DialogTitle>
            <DialogDescription>
              L'IA va générer des questions pertinentes pour ce quiz
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre de questions</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={generateQuestionsForm.numberOfQuestions}
                onChange={(e) => setGenerateQuestionsForm({
                  ...generateQuestionsForm,
                  numberOfQuestions: parseInt(e.target.value) || 1,
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Type de question</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={generateQuestionsForm.type === 'QCU' ? 'default' : 'outline'}
                  className={generateQuestionsForm.type === 'QCU' ? 'bg-blue-600' : ''}
                  onClick={() => setGenerateQuestionsForm({ ...generateQuestionsForm, type: 'QCU' })}
                >
                  QCU (Choix unique)
                </Button>
                <Button
                  type="button"
                  variant={generateQuestionsForm.type === 'QCM' ? 'default' : 'outline'}
                  className={generateQuestionsForm.type === 'QCM' ? 'bg-blue-600' : ''}
                  onClick={() => setGenerateQuestionsForm({ ...generateQuestionsForm, type: 'QCM' })}
                >
                  QCM (Choix multiple)
                </Button>
                <Button
                  type="button"
                  variant={generateQuestionsForm.type === 'MIXTE' ? 'default' : 'outline'}
                  className={generateQuestionsForm.type === 'MIXTE' ? 'bg-purple-600' : ''}
                  onClick={() => setGenerateQuestionsForm({ ...generateQuestionsForm, type: 'MIXTE' })}
                >
                  Mixte (QCU + QCM)
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                L'IA utilisera le contexte du quiz et les documents de référence pour générer des questions pertinentes.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateQuestionsModalOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleGenerateQuestions}
              disabled={isGeneratingQuestions}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              {isGeneratingQuestions ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer {generateQuestionsForm.numberOfQuestions} question(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
