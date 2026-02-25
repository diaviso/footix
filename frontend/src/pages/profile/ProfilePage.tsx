import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Camera,
  Save,
  MapPin,
  Loader2,
  Crown,
  XCircle,
} from 'lucide-react';
import { cn, getAvatarUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';


export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    country: user?.country || '',
    city: user?.city || '',
  });

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une image valide.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'L\'image ne doit pas dépasser 5 Mo.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post('/auth/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(response.data.user);
      toast({
        title: 'Photo mise à jour',
        description: 'Votre photo de profil a été modifiée avec succès.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de mettre à jour la photo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.patch('/auth/profile', formData);
      updateUser(response.data.user);
      setIsEditing(false);
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été sauvegardées avec succès.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Vous conserverez l\'accès premium jusqu\'à la fin de la période en cours.')) {
      return;
    }
    setIsCancelling(true);
    try {
      const response = await api.post('/stripe/cancel-subscription');
      updateUser({ ...user, autoRenew: false });
      toast({
        title: 'Abonnement annulé',
        description: response.data.message,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
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
        <h1 className="text-3xl font-bold text-[#1A2E23] dark:text-[#E8F0EC]">Mon Profil</h1>
        <p className="text-[#5A7265] dark:text-[#8BA898] mt-1">
          Gérez vos informations personnelles
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="overflow-hidden border border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#141F1A]">
            <div className="h-24 bg-gradient-to-r from-[#D4AF37] via-[#B8960F] to-[#C0C0C0]" />
            <CardContent className="pt-0 -mt-12 text-center">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                  <AvatarImage src={getAvatarUrl((user as any)?.avatar, user?.id)} alt={user?.firstName} />
                  <AvatarFallback className="bg-[#D4AF37] text-white text-2xl font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg bg-[#F5A623] hover:bg-[#D4890A] text-white"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-[#1A2E23] dark:text-[#E8F0EC]">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-[#5A7265] dark:text-[#8BA898]">{user?.email}</p>
              <span className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mt-3',
                user?.role === 'ADMIN'
                  ? 'bg-[#F5A623]/10 text-[#F5A623]'
                  : 'bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#C0C0C0]'
              )}>
                <Shield className="h-3 w-3 mr-1" />
                {user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
              </span>
              <p className="text-xs text-[#5A7265] dark:text-[#8BA898] mt-4">
                Cliquez sur l'icône appareil photo pour changer votre photo
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Information */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          {/* Personal Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Informations personnelles</CardTitle>
                <CardDescription>Modifiez vos informations de profil</CardDescription>
              </div>
              <Button
                variant={isEditing ? 'ghost' : 'outline'}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="h-11"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Pays
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Ex: France"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Ville
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Ex: Paris"
                    className="h-11"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Membre depuis</span>
                </div>
                <span className="font-medium text-foreground">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Non disponible'}
                </span>
              </div>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end pt-4"
                >
                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subscription Management Card - Only show for premium users */}
      {user?.isPremium && (
        <motion.div variants={itemVariants}>
          <Card className="border border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#141F1A]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1A2E23] dark:text-[#E8F0EC]">
                <Crown className="h-5 w-5 text-amber-500" />
                Gestion de l'abonnement Premium
              </CardTitle>
              <CardDescription>
                Gérez votre abonnement et vos préférences de renouvellement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subscription Status */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Statut : Actif</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    {user.premiumExpiresAt 
                      ? `Expire le ${new Date(user.premiumExpiresAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}`
                      : 'Abonnement actif'}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-amber-500" />
              </div>

              {/* Cancel subscription */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">Annuler l'abonnement</p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Vous conserverez l'accès jusqu'à la fin de la période en cours
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                  className="w-full sm:w-auto shrink-0"
                >
                  {isCancelling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Annuler'
                  )}
                </Button>
              </div>

              {/* Price info */}
              <p className="text-center text-sm text-[#5A7265] dark:text-[#8BA898]">
                Abonnement mensuel : <span className="font-semibold text-[#D4AF37]">9,99€/mois</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
