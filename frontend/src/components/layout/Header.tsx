import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  Menu,
} from 'lucide-react';
import { cn, getAvatarUrl } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const navigate = useNavigate();
  const { isDark, toggleTheme, sidebarCollapsed, setMobileSidebarOpen } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26]">
          <Avatar className="h-9 w-9 ring-2 ring-[#D1DDD6] dark:ring-[#2D3F35] transition-all hover:ring-[#1B5E3D]/40 dark:hover:ring-[#3D9A6A]/40">
            <AvatarImage src={getAvatarUrl((user as any)?.avatar, user?.id)} alt={user?.firstName} />
            <AvatarFallback className="bg-[#1B5E3D] dark:bg-[#2D7A50] text-white font-medium text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 bg-white dark:bg-[#141F1A] border-[#D1DDD6] dark:border-[#2D3F35]" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3 bg-[#E8F0EC]/50 dark:bg-[#1E2D26]/50 rounded-lg mb-2">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-semibold leading-none text-[#1A2E23] dark:text-[#E8F0EC]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs leading-none text-[#5A7265] dark:text-[#8BA898]">
              {user?.email}
            </p>
            <span className={cn(
              'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium mt-2 w-fit',
              user?.role === 'ADMIN'
                ? 'bg-[#F5A623]/10 text-[#F5A623]'
                : 'bg-[#1B5E3D]/10 dark:bg-[#3D9A6A]/20 text-[#1B5E3D] dark:text-[#3D9A6A]'
            )}>
              {user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigate('/profile')}
          className="rounded-lg cursor-pointer py-2.5 text-[#1A2E23] dark:text-[#E8F0EC] hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26]"
        >
          <User className="mr-3 h-4 w-4 text-[#5A7265] dark:text-[#8BA898]" />
          <span>Mon profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/settings')}
          className="rounded-lg cursor-pointer py-2.5 text-[#1A2E23] dark:text-[#E8F0EC] hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26]"
        >
          <Settings className="mr-3 h-4 w-4 text-[#5A7265] dark:text-[#8BA898]" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2 bg-[#D1DDD6] dark:bg-[#2D3F35]" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="rounded-lg cursor-pointer py-2.5 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Desktop Header */}
      <motion.header
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed top-0 right-0 z-30 h-16',
          'bg-white/90 dark:bg-[#0D1512]/90 backdrop-blur-xl',
          'border-b border-[#D1DDD6] dark:border-[#2D3F35]',
          'items-center justify-between px-6',
          'hidden lg:flex'
        )}
        style={{ width: `calc(100% - ${sidebarCollapsed ? 80 : 280}px)` }}
      >
        {/* Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <motion.div
            animate={{ width: searchFocused ? '100%' : '320px' }}
            className="relative"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A7265] dark:text-[#8BA898]" />
            <Input
              placeholder="Rechercher..."
              className={cn(
                'pl-10 h-10 bg-[#E8F0EC]/50 dark:bg-[#1E2D26]/50 border-[#D1DDD6] dark:border-[#2D3F35] rounded-xl',
                'focus:bg-white dark:focus:bg-[#141F1A] focus:ring-2 focus:ring-[#1B5E3D]/20 dark:focus:ring-[#3D9A6A]/20 focus:border-[#1B5E3D]/30 dark:focus:border-[#3D9A6A]/30',
                'transition-all placeholder:text-[#5A7265] dark:placeholder:text-[#8BA898]'
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative overflow-hidden h-10 w-10 rounded-xl hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26]"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0.9 : 1 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            >
              {isDark ? (
                <Moon className="h-5 w-5 text-[#3D9A6A]" />
              ) : (
                <Sun className="h-5 w-5 text-[#F5A623]" />
              )}
            </motion.div>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26]">
            <Bell className="h-5 w-5 text-[#5A7265] dark:text-[#8BA898]" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#F5A623] ring-2 ring-white dark:ring-[#0D1512]" />
          </Button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </motion.header>

      {/* Mobile Header */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-30 h-16',
          'bg-white/90 dark:bg-[#0D1512]/90 backdrop-blur-xl',
          'border-b border-[#D1DDD6] dark:border-[#2D3F35]',
          'flex items-center justify-between px-4',
          'lg:hidden'
        )}
      >
        {/* Menu Button & Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(true)}
            className="h-10 w-10 rounded-xl hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26]"
          >
            <Menu className="h-5 w-5 text-[#5A7265] dark:text-[#8BA898]" />
          </Button>
          <img 
            src="/logo.svg" 
            alt="Footix" 
            className="h-8 w-8 rounded-lg shadow"
          />
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative overflow-hidden h-10 w-10 rounded-xl hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26]"
          >
            {isDark ? (
              <Moon className="h-5 w-5 text-[#3D9A6A]" />
            ) : (
              <Sun className="h-5 w-5 text-[#F5A623]" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26]">
            <Bell className="h-5 w-5 text-[#5A7265] dark:text-[#8BA898]" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#F5A623] ring-2 ring-white dark:ring-[#0D1512]" />
          </Button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </header>
    </>
  );
}
