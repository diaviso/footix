import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Check for session expired flag on mount
  useEffect(() => {
    const expired = sessionStorage.getItem('sessionExpired');
    if (expired) {
      setSessionExpiredMessage(true);
      sessionStorage.removeItem('sessionExpired');
    }
  }, []);

  const performLogin = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data;

      setAuth(user, token);
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue ${user.firstName} !`,
        variant: 'default',
      });
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || '';
      
      // Backend returns EMAIL_NOT_VERIFIED when user hasn't verified their email
      // A new verification code is automatically sent by the backend
      if (errorMessage === 'EMAIL_NOT_VERIFIED') {
        toast({
          title: 'Vérification requise',
          description: 'Un code de vérification a été envoyé à votre email',
        });
        navigate('/verify-email', { state: { email: formData.email } });
      } else {
        toast({
          title: 'Erreur de connexion',
          description: errorMessage || 'Email ou mot de passe incorrect',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingSession(true);

    try {
      // Check if user has an active session
      const sessionCheck = await api.post('/auth/check-session', { email: formData.email });
      
      if (sessionCheck.data.hasActiveSession) {
        // Show warning dialog
        setShowSessionWarning(true);
      } else {
        // No active session, proceed with login
        await performLogin();
      }
    } catch {
      // If check fails, proceed with login anyway
      await performLogin();
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleConfirmLogin = async () => {
    setShowSessionWarning(false);
    await performLogin();
  };

  const handleGoogleLogin = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="space-y-6">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <div className="flex justify-center mb-4">
          <img src="/logo.svg" alt="Footix" className="h-20 w-20 rounded-2xl shadow-lg" />
        </div>
        <h1 className="text-3xl font-bold text-[#1B5E3D] dark:text-[#3D9A6A]">Footix</h1>
        <p className="text-muted-foreground mt-2">Plateforme d'apprentissage</p>
      </div>

      {/* Session Expired Alert */}
      {sessionExpiredMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">Session terminée</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Vous avez été déconnecté car une connexion a été établie depuis un autre appareil.
            </p>
          </div>
          <button
            onClick={() => setSessionExpiredMessage(false)}
            className="ml-auto text-amber-600 hover:text-amber-800 dark:hover:text-amber-400"
          >
            ×
          </button>
        </motion.div>
      )}

      <Card className="border-0 shadow-2xl bg-white/95 dark:bg-[#141F1A]/95 backdrop-blur-xl overflow-hidden">
        {/* Decorative top border with brand gradient */}
        <div className="h-1.5 bg-gradient-to-r from-[#1B5E3D] via-[#2D7A50] to-[#F5A623]" />
        
        <CardHeader className="space-y-1 pb-4 pt-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-[#1B5E3D]/10 dark:bg-[#3D9A6A]/20">
              <LogIn className="h-5 w-5 text-[#1B5E3D] dark:text-[#3D9A6A]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#1A2E23] dark:text-[#E8F0EC]">
              Connexion
            </CardTitle>
          </div>
          <CardDescription className="text-[#5A7265] dark:text-[#8BA898]">
            Entrez vos identifiants pour accéder à votre compte
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pb-6">
          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 gap-3 text-base border-2 border-[#D1DDD6] dark:border-[#2D3F35] hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26] hover:border-[#1B5E3D] dark:hover:border-[#3D9A6A] transition-all duration-200"
            onClick={handleGoogleLogin}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-[#D1DDD6] dark:bg-[#2D3F35]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#141F1A] px-3 text-[#5A7265] dark:text-[#8BA898] font-medium">
                Ou continuer avec
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1A2E23] dark:text-[#A8C4B4] font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A7265] dark:text-[#8BA898]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  className="pl-10 h-12 border-2 border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#0D1512] focus:border-[#1B5E3D] dark:focus:border-[#3D9A6A] focus:ring-[#1B5E3D]/20 dark:focus:ring-[#3D9A6A]/20 transition-all duration-200"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#1A2E23] dark:text-[#A8C4B4] font-medium">
                  Mot de passe
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#F5A623] hover:text-[#D4890A] dark:text-[#FFBE4D] dark:hover:text-[#F5A623] font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A7265] dark:text-[#8BA898]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 border-2 border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#0D1512] focus:border-[#1B5E3D] dark:focus:border-[#3D9A6A] focus:ring-[#1B5E3D]/20 dark:focus:ring-[#3D9A6A]/20 transition-all duration-200"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A7265] hover:text-[#1B5E3D] dark:text-[#8BA898] dark:hover:text-[#3D9A6A] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-[#1B5E3D] hover:bg-[#144832] dark:bg-[#2D7A50] dark:hover:bg-[#1B5E3D] text-white shadow-lg shadow-[#1B5E3D]/25 dark:shadow-[#2D7A50]/25 transition-all duration-200"
                disabled={isLoading || isCheckingSession}
              >
                {isLoading || isCheckingSession ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCheckingSession ? 'Vérification...' : 'Connexion...'}
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Se connecter
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <p className="text-center text-sm text-[#5A7265] dark:text-[#8BA898]">
            Pas encore de compte ?{' '}
            <Link 
              to="/register" 
              className="text-[#1B5E3D] dark:text-[#3D9A6A] font-semibold hover:text-[#144832] dark:hover:text-[#4DB87D] transition-colors"
            >
              S'inscrire
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Session Warning Dialog */}
      <Dialog open={showSessionWarning} onOpenChange={setShowSessionWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <DialogTitle>Session active détectée</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Vous êtes actuellement connecté sur un autre appareil. Si vous continuez, vous serez automatiquement déconnecté de l'autre appareil.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-2">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Note :</strong> Pour des raisons de sécurité, un seul appareil peut être connecté à la fois sur votre compte.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowSessionWarning(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmLogin}
              disabled={isLoading}
              className="bg-[#1B5E3D] hover:bg-[#144832] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Continuer et me connecter'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
