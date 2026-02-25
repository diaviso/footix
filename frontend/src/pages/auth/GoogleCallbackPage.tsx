import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/hooks/use-toast';

export function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      toast({
        title: 'Erreur d\'authentification',
        description: 'La connexion avec Google a échoué',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setAuth(user, token);
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue ${user.firstName} !`,
        });
        navigate('/dashboard');
      } catch {
        toast({
          title: 'Erreur',
          description: 'Données d\'authentification invalides',
          variant: 'destructive',
        });
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, setAuth, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Connexion en cours...</p>
      </div>
    </div>
  );
}
