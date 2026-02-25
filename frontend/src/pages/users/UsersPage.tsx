import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Shield,
  Mail,
  Calendar,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usersService } from '@/services/users.service';
import type { User, UserStats } from '@/services/users.service';

export function UsersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'USER' as 'USER' | 'ADMIN',
  });
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = useCallback(async (page = 1, search?: string, role?: string) => {
    try {
      setLoading(true);
      const result = await usersService.getAll(page, 50, search, role);
      setUsers(result.data);
      setTotalPages(result.totalPages);
      setTotalUsers(result.total);
      setCurrentPage(result.page);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchStats = async () => {
    try {
      const data = await usersService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchUsers(1, searchTerm, roleFilter);
    fetchStats();
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, searchTerm, roleFilter);
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchTerm, roleFilter]);

  const handlePageChange = (page: number) => {
    fetchUsers(page, searchTerm, roleFilter);
  };

  const filteredUsers = users;

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({ firstName: '', lastName: '', email: '', role: 'USER' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        await usersService.update(editingUser.id, formData);
        toast({ title: 'Utilisateur mis à jour', description: 'Les modifications ont été sauvegardées.' });
      } else {
        await usersService.create(formData);
        toast({ title: 'Utilisateur créé', description: 'Le nouvel utilisateur a été ajouté.' });
      }
      setIsDialogOpen(false);
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await usersService.delete(id);
      toast({ title: 'Utilisateur supprimé', description: "L'utilisateur a été retiré." });
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de supprimer l\'utilisateur',
        variant: 'destructive',
      });
    }
  };

  const toggleVerification = async (id: string) => {
    try {
      await usersService.toggleVerification(id);
      toast({ title: 'Statut mis à jour' });
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de modifier le statut',
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

  const statsData = stats ? [
    { label: 'Total utilisateurs', value: stats.total, icon: Users, color: 'text-[#D4AF37] dark:text-[#C0C0C0]', bg: 'bg-[#D4AF37]/10' },
    { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-[#F5A623]', bg: 'bg-[#F5A623]/10' },
    { label: 'Vérifiés', value: stats.verified, icon: UserCheck, color: 'text-[#C0C0C0]', bg: 'bg-[#C0C0C0]/10' },
    { label: 'En attente', value: stats.pending, icon: UserX, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37] dark:text-[#C0C0C0] mx-auto" />
          <p className="mt-4 text-[#5A7265] dark:text-[#8BA898]">Chargement des utilisateurs...</p>
        </div>
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
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2E23] dark:text-[#E8F0EC] flex items-center gap-3">
            <Users className="h-8 w-8 text-[#D4AF37] dark:text-[#C0C0C0]" />
            Gestion des utilisateurs
          </h1>
          <p className="text-[#5A7265] dark:text-[#8BA898] mt-1">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-hover">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn('p-3 rounded-xl', stat.bg)}>
                  <stat.icon className={cn('h-6 w-6', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px] h-11">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="USER">Utilisateurs</SelectItem>
                    <SelectItem value="ADMIN">Administrateurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs</CardTitle>
            <CardDescription>
              {totalUsers} utilisateur{totalUsers > 1 ? 's' : ''} trouvé{totalUsers > 1 ? 's' : ''}
              {totalPages > 1 && ` — Page ${currentPage}/${totalPages}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src="" alt={user.firstName} />
                      <AvatarFallback className="gradient-primary text-white font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </p>
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          user.role === 'ADMIN'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {user.role === 'ADMIN' ? 'Admin' : 'User'}
                        </span>
                        {user.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <UserCheck className="h-3 w-3" />
                            Vérifié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <UserX className="h-3 w-3" />
                            Non vérifié
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        Voir détail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(user)} className="cursor-pointer">
                        <Edit2 className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleVerification(user.id)} className="cursor-pointer">
                        {user.isEmailVerified ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Retirer vérification
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Vérifier
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(user.id)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-9"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Modifiez les informations de l\'utilisateur.'
                : 'Créez un nouveau compte utilisateur.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'USER' | 'ADMIN') => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Utilisateur</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingUser ? 'Sauvegarder' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
