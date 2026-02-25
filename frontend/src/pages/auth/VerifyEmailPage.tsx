import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

export function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [code, setCode] = useState('');
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/verify-email', { email, code });
      const { token, user } = response.data;

      setIsVerified(true);
      setAuth(user, token);
      
      toast({
        title: 'Email vérifié',
        description: 'Votre compte a été activé avec succès',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur de vérification',
        description: err.response?.data?.message || 'Code invalide ou expiré',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6"
            >
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Email vérifié !</h2>
            <p className="text-muted-foreground mb-4">
              Votre compte a été activé avec succès. Redirection en cours...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient">Footix</h1>
        <p className="text-muted-foreground mt-2">Plateforme d'apprentissage</p>
      </div>

      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Vérifiez votre email</CardTitle>
          <CardDescription className="text-center">
            Nous avons envoyé un code de vérification à<br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code de vérification</Label>
              <Input
                id="code"
                type="text"
                placeholder="Entrez le code à 6 chiffres"
                className="text-center text-2xl tracking-widest font-mono"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
              />
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                className="w-full h-12 text-base"
                variant="gradient"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  'Vérifier'
                )}
              </Button>
            </motion.div>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas reçu le code ?{' '}
              <button
                className="text-primary font-medium hover:underline"
                onClick={async () => {
                  try {
                    await api.post('/auth/resend-verification', { email });
                    toast({
                      title: 'Code renvoyé',
                      description: 'Un nouveau code de vérification a été envoyé à votre email',
                    });
                  } catch (error: unknown) {
                    const err = error as { response?: { data?: { message?: string } } };
                    toast({
                      title: 'Erreur',
                      description: err.response?.data?.message || 'Impossible de renvoyer le code',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                Renvoyer
              </button>
            </p>
            <Link
              to="/register"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour à l'inscription
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
