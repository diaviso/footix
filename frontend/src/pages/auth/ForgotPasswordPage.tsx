import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setIsEmailSent(true);
      toast({
        title: 'Email envoyé',
        description: 'Vérifiez votre boîte de réception',
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-2xl bg-white/95 dark:bg-[#141F1A]/95 backdrop-blur-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#B8960F] to-[#F5A623]" />
          <CardContent className="pt-8 pb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto w-20 h-20 rounded-full bg-[#D4AF37]/10 dark:bg-[#C0C0C0]/20 flex items-center justify-center mb-6"
            >
              <CheckCircle className="h-10 w-10 text-[#D4AF37] dark:text-[#C0C0C0]" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2 text-[#1A2E23] dark:text-[#E8F0EC]">Email envoyé !</h2>
            <p className="text-[#5A7265] dark:text-[#8BA898] mb-6">
              Si un compte existe avec l'adresse <strong className="text-[#D4AF37] dark:text-[#C0C0C0]">{email}</strong>, vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <p className="text-sm text-[#5A7265] dark:text-[#8BA898] mb-4">
              Vérifiez votre boîte de réception et vos spams.
            </p>
            <Link to="/login">
              <Button 
                variant="outline" 
                className="gap-2 border-2 border-[#D1DDD6] dark:border-[#2D3F35] hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26] hover:border-[#D4AF37] dark:hover:border-[#C0C0C0]"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <div className="flex justify-center mb-4">
          <img src="/logo.svg" alt="Footix" className="h-20 w-20 rounded-2xl shadow-lg" />
        </div>
        <h1 className="text-3xl font-bold text-[#D4AF37] dark:text-[#C0C0C0]">Footix</h1>
        <p className="text-muted-foreground mt-2">Plateforme d'apprentissage</p>
      </div>

      <Card className="border-0 shadow-2xl bg-white/95 dark:bg-[#141F1A]/95 backdrop-blur-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#F5A623] via-[#B8960F] to-[#D4AF37]" />
        <CardHeader className="space-y-1 pb-4 pt-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#F5A623]/10 dark:bg-[#FFBE4D]/20 flex items-center justify-center mb-4">
            <KeyRound className="h-8 w-8 text-[#F5A623] dark:text-[#FFBE4D]" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-[#1A2E23] dark:text-[#E8F0EC]">
            Mot de passe oublié ?
          </CardTitle>
          <CardDescription className="text-center text-[#5A7265] dark:text-[#8BA898]">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pb-6">
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
                  className="pl-10 h-12 border-2 border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#0D1512] focus:border-[#D4AF37] dark:focus:border-[#C0C0C0] transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-[#D4AF37] hover:bg-[#A89030] dark:bg-[#B8960F] dark:hover:bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/25 dark:shadow-[#B8960F]/25 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer le lien de réinitialisation
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-[#5A7265] hover:text-[#D4AF37] dark:text-[#8BA898] dark:hover:text-[#C0C0C0] transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
