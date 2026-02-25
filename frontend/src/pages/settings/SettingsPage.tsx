import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Shield,
  Globe,
  Palette,
  Lock,
  Eye,
  EyeOff,
  Save,
  Monitor,
  Loader2,
  Trophy,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface SettingsSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingsSwitch({ checked, onChange }: SettingsSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

export function SettingsPage() {
  const { isDark, toggleTheme } = useThemeStore();
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState({
    email: user?.emailNotifications ?? true,
    push: user?.pushNotifications ?? true,
    marketing: user?.marketingEmails ?? false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showProgress: true,
  });

  const [showInLeaderboard, setShowInLeaderboard] = useState(user?.showInLeaderboard ?? true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Sync notifications state when user data changes
  useEffect(() => {
    if (user) {
      setNotifications({
        email: user.emailNotifications ?? true,
        push: user.pushNotifications ?? true,
        marketing: user.marketingEmails ?? false,
      });
    }
  }, [user]);

  const handleNotificationChange = async (key: 'email' | 'push' | 'marketing', checked: boolean) => {
    const newNotifications = { ...notifications, [key]: checked };
    setNotifications(newNotifications);
    setIsSavingNotifications(true);

    try {
      const response = await api.patch('/auth/profile', {
        emailNotifications: newNotifications.email,
        pushNotifications: newNotifications.push,
        marketingEmails: newNotifications.marketing,
      });
      if (response.data.user) {
        updateUser(response.data.user);
      }
      toast({
        title: 'Préférences mises à jour',
        description: 'Vos préférences de notification ont été enregistrées.',
      });
    } catch {
      // Revert on error
      setNotifications(notifications);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les préférences.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0); // 0=hidden, 1=warning, 2=confirm
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleSavePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le nouveau mot de passe doit contenir au moins 6 caractères.',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      toast({
        title: 'Mot de passe mis à jour',
        description: 'Votre mot de passe a été changé avec succès.',
      });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Une erreur est survenue.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLeaderboardVisibilityChange = async (checked: boolean) => {
    setShowInLeaderboard(checked);

    try {
      const response = await api.patch('/auth/leaderboard-visibility', {
        showInLeaderboard: checked,
      });
      if (response.data.user) {
        updateUser(response.data.user);
      }
      toast({
        title: 'Préférence mise à jour',
        description: checked
          ? 'Vous apparaissez maintenant dans le classement.'
          : 'Vous n\'apparaissez plus dans le classement.',
      });
    } catch (error: unknown) {
      setShowInLeaderboard(!checked);
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Une erreur est survenue.',
        variant: 'destructive',
      });
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Paramètres
        </h1>
        <p className="text-muted-foreground mt-1">
          Personnalisez votre expérience et gérez vos préférences
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Apparence
              </CardTitle>
              <CardDescription>
                Personnalisez l'apparence de l'interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Thème</Label>
                  <p className="text-sm text-muted-foreground">
                    Choisissez votre thème préféré
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={!isDark ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => isDark && toggleTheme()}
                    className="gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Clair
                  </Button>
                  <Button
                    variant={isDark ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => !isDark && toggleTheme()}
                    className="gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Sombre
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    Sidebar réduite
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Réduire la barre latérale par défaut
                  </p>
                </div>
                <SettingsSwitch
                  checked={useThemeStore.getState().sidebarCollapsed}
                  onChange={() => useThemeStore.getState().toggleSidebar()}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>
                Gérez vos préférences de notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des mises à jour par email
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isSavingNotifications && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  <SettingsSwitch
                    checked={notifications.email}
                    onChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des notifications dans le navigateur
                  </p>
                </div>
                <SettingsSwitch
                  checked={notifications.push}
                  onChange={(checked) => handleNotificationChange('push', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Communications marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des offres et nouveautés
                  </p>
                </div>
                <SettingsSwitch
                  checked={notifications.marketing}
                  onChange={(checked) => handleNotificationChange('marketing', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Mettez à jour votre mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="h-11"
                />
              </div>
              <Button
                onClick={handleSavePassword}
                disabled={isChangingPassword || !passwords.current || !passwords.new || !passwords.confirm}
                className="w-full gap-2 mt-2"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Mettre à jour le mot de passe
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Confidentialité
              </CardTitle>
              <CardDescription>
                Contrôlez la visibilité de votre profil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Profil public</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux autres de voir votre profil
                  </p>
                </div>
                <SettingsSwitch
                  checked={privacy.profileVisible}
                  onChange={(checked) => setPrivacy({ ...privacy, profileVisible: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Afficher la progression</Label>
                  <p className="text-sm text-muted-foreground">
                    Montrer votre progression aux autres
                  </p>
                </div>
                <SettingsSwitch
                  checked={privacy.showProgress}
                  onChange={(checked) => setPrivacy({ ...privacy, showProgress: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    Apparaître dans le classement
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux autres de voir votre rang et vos étoiles
                  </p>
                </div>
                <SettingsSwitch
                  checked={showInLeaderboard}
                  onChange={handleLeaderboardVisibilityChange}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Langue
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Langue de l'interface
                  </p>
                </div>
                <span className="text-sm font-medium text-foreground">Français</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Account Deletion - Zone dangereuse */}
      <motion.div variants={itemVariants}>
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Zone dangereuse
            </CardTitle>
            <CardDescription>
              Actions irréversibles sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deleteStep === 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">Supprimer le compte</p>
                  <p className="text-sm text-muted-foreground">
                    Cette action supprimera définitivement votre compte et toutes vos données
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto shrink-0"
                  onClick={() => setDeleteStep(1)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer mon compte
                </Button>
              </div>
            )}

            {deleteStep === 1 && (
              <div className="space-y-4 p-4 rounded-lg border-2 border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Attention — Suppression définitive</h4>
                    <p className="text-sm text-muted-foreground">
                      La suppression de votre compte entraînera :
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                      <li>La <strong>suppression totale et irréversible</strong> de toutes vos données personnelles</li>
                      <li>La suppression de votre historique de quiz, étoiles et progression</li>
                      <li>La suppression de vos conversations, commentaires et publications</li>
                      <li>L'<strong>annulation automatique</strong> de votre abonnement Premium en cours (le cas échéant)</li>
                      <li><strong>Aucune information ne sera conservée</strong> par l'application après la suppression</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setDeleteStep(0)}>
                    Annuler
                  </Button>
                  <Button variant="destructive" onClick={() => setDeleteStep(2)}>
                    Je comprends, continuer
                  </Button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="space-y-4 p-4 rounded-lg border-2 border-red-500 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-3 w-full">
                    <h4 className="font-semibold text-foreground">Confirmation finale</h4>
                    <p className="text-sm text-muted-foreground">
                      Pour confirmer la suppression, tapez <strong>SUPPRIMER</strong> ci-dessous :
                    </p>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Tapez SUPPRIMER"
                      className="h-11 border-red-300 dark:border-red-800 focus:ring-red-500"
                      disabled={isDeleting}
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => { setDeleteStep(0); setDeleteConfirmText(''); }} disabled={isDeleting}>
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deleteConfirmText !== 'SUPPRIMER' || isDeleting}
                    onClick={async () => {
                      setIsDeleting(true);
                      try {
                        await api.delete('/auth/account');
                        toast({
                          title: 'Compte supprimé',
                          description: 'Votre compte et toutes vos données ont été supprimés.',
                        });
                        // Clear auth and redirect
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/');
                        window.location.reload();
                      } catch (error: unknown) {
                        const err = error as { response?: { data?: { message?: string } } };
                        toast({
                          title: 'Erreur',
                          description: err.response?.data?.message || 'Impossible de supprimer le compte.',
                          variant: 'destructive',
                        });
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer définitivement
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
