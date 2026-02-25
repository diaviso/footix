import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Trophy,
  History,
  X,
  Sparkles,
  Mail,
  LifeBuoy,
  ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Menu items for regular users
const userMainMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Thèmes', path: '/themes' },
  { icon: HelpCircle, label: 'Quiz', path: '/quizzes' },
  { icon: Sparkles, label: 'Révision', path: '/revision' },
  { icon: History, label: 'Historique', path: '/history' },
  { icon: Trophy, label: 'Classement', path: '/leaderboard' },
];

// Menu items for admins
const adminMainMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Thèmes', path: '/themes' },
  { icon: HelpCircle, label: 'Quiz', path: '/quizzes' },
  { icon: Trophy, label: 'Classement', path: '/leaderboard' },
  { icon: Users, label: 'Utilisateurs', path: '/users' },
  { icon: Mail, label: 'Envoyer Email', path: '/admin/email' },
];

const userAccountMenuItems = [
  { icon: User, label: 'Profil', path: '/profile' },
  { icon: Settings, label: 'Paramètres', path: '/settings' },
];

const infoMenuItems = [
  { icon: LifeBuoy, label: 'Aide', path: '/help' },
  { icon: ScrollText, label: "Conditions d'utilisation", path: '/terms' },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useThemeStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  // Select menu items based on role
  const menuItems = isAdmin ? adminMainMenuItems : userMainMenuItems;

  const NavItem = ({ item, isActive }: { item: typeof menuItems[0]; isActive: boolean }) => {
    const Icon = item.icon;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={item.path}>
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                isActive
                  ? 'bg-[#1B5E3D]/10 dark:bg-[#3D9A6A]/15 text-[#1B5E3D] dark:text-[#3D9A6A]'
                  : 'text-[#5A7265] dark:text-[#8BA898] hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26] hover:text-[#1A2E23] dark:hover:text-[#E8F0EC]'
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                  isActive
                    ? 'bg-[#1B5E3D] dark:bg-[#2D7A50] text-white shadow-md shadow-[#1B5E3D]/25'
                    : 'bg-[#E8F0EC] dark:bg-[#1E2D26]'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !sidebarCollapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto h-2 w-2 rounded-full bg-[#F5A623]"
                />
              )}
            </motion.div>
          </Link>
        </TooltipTrigger>
        {sidebarCollapsed && (
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        )}
      </Tooltip>
    );
  };

  // Animated floating particles for sidebar background
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-[#1B5E3D]/20 to-[#3D9A6A]/10 blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 15, 0],
          x: [0, 10, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/3 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#F5A623]/15 to-[#F5A623]/5 blur-2xl"
      />
      <motion.div
        animate={{
          y: [0, 25, 0],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        className="absolute bottom-1/4 -left-10 w-36 h-36 rounded-full bg-gradient-to-br from-[#2D7A50]/20 to-[#3D9A6A]/10 blur-3xl"
      />
      
      {/* Subtle animated lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]">
        <motion.line
          x1="0"
          y1="20%"
          x2="100%"
          y2="25%"
          stroke="#1B5E3D"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.line
          x1="0"
          y1="60%"
          x2="100%"
          y2="55%"
          stroke="#F5A623"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4, delay: 1, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.line
          x1="0"
          y1="85%"
          x2="100%"
          y2="80%"
          stroke="#3D9A6A"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 5, delay: 2, repeat: Infinity, repeatType: 'reverse' }}
        />
      </svg>
    </div>
  );

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-40 h-screen overflow-hidden',
          'bg-white dark:bg-[#0D1512]',
          'border-r border-[#D1DDD6] dark:border-[#2D3F35]',
          'flex-col',
          'hidden lg:flex'
        )}
      >
        {/* Animated Background */}
        <FloatingParticles />
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#D1DDD6] dark:border-[#2D3F35]">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="Footix" 
              className="h-10 w-10 rounded-xl shadow-lg"
            />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-bold text-[#1B5E3D] dark:text-[#3D9A6A]"
                >
                  Footix
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {/* Main Menu */}
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#5A7265] dark:text-[#8BA898]"
                >
                  Menu principal
                </motion.p>
              )}
            </AnimatePresence>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return <NavItem key={item.path} item={item} isActive={isActive} />;
            })}

            {/* User Account Section */}
            <Separator className="my-4 bg-[#D1DDD6] dark:bg-[#2D3F35]" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#5A7265] dark:text-[#8BA898]"
                >
                  Mon compte
                </motion.p>
              )}
            </AnimatePresence>
            {userAccountMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return <NavItem key={item.path} item={item} isActive={isActive} />;
            })}

            {/* Informations Section */}
            <Separator className="my-4 bg-[#D1DDD6] dark:bg-[#2D3F35]" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#5A7265] dark:text-[#8BA898]"
                >
                  Informations
                </motion.p>
              )}
            </AnimatePresence>
            {infoMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return <NavItem key={item.path} item={item} isActive={isActive} />;
            })}
          </nav>
        </ScrollArea>

        {/* Toggle Button */}
        <div className="border-t border-[#D1DDD6] dark:border-[#2D3F35] p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-full h-10 text-[#5A7265] dark:text-[#8BA898] hover:text-[#1B5E3D] dark:hover:text-[#3D9A6A] hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26]"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              'fixed left-0 top-0 z-50 h-screen w-[280px] overflow-hidden',
              'bg-white dark:bg-[#0D1512]',
              'border-r border-[#D1DDD6] dark:border-[#2D3F35]',
              'flex flex-col',
              'lg:hidden'
            )}
          >
            {/* Animated Background */}
            <FloatingParticles />
            {/* Logo with close button */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-[#D1DDD6] dark:border-[#2D3F35]">
              <Link to="/dashboard" className="flex items-center gap-3" onClick={closeMobileSidebar}>
                <img 
                  src="/logo.svg" 
                  alt="Footix" 
                  className="h-10 w-10 rounded-xl shadow-lg"
                />
                <span className="text-xl font-bold text-[#1B5E3D] dark:text-[#3D9A6A]">
                  Footix
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileSidebar}
                className="h-10 w-10 text-[#5A7265] dark:text-[#8BA898] hover:text-[#1B5E3D] dark:hover:text-[#3D9A6A] hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-1">
                {/* Main Menu */}
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#5A7265] dark:text-[#8BA898]">
                  Menu principal
                </p>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  return (
                    <Link key={item.path} to={item.path} onClick={closeMobileSidebar}>
                      <div
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                          isActive
                            ? 'bg-[#1B5E3D]/10 dark:bg-[#3D9A6A]/15 text-[#1B5E3D] dark:text-[#3D9A6A]'
                            : 'text-[#5A7265] dark:text-[#8BA898] hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26] hover:text-[#1A2E23] dark:hover:text-[#E8F0EC]'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                            isActive
                              ? 'bg-[#1B5E3D] dark:bg-[#2D7A50] text-white shadow-md shadow-[#1B5E3D]/25'
                              : 'bg-[#E8F0EC] dark:bg-[#1E2D26]'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-[#F5A623]" />
                        )}
                      </div>
                    </Link>
                  );
                })}

                {/* User Account Section */}
                <Separator className="my-4 bg-[#D1DDD6] dark:bg-[#2D3F35]" />
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#5A7265] dark:text-[#8BA898]">
                  Mon compte
                </p>
                {userAccountMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path} onClick={closeMobileSidebar}>
                      <div
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                          isActive
                            ? 'bg-[#1B5E3D]/10 dark:bg-[#3D9A6A]/15 text-[#1B5E3D] dark:text-[#3D9A6A]'
                            : 'text-[#5A7265] dark:text-[#8BA898] hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26] hover:text-[#1A2E23] dark:hover:text-[#E8F0EC]'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                            isActive
                              ? 'bg-[#1B5E3D] dark:bg-[#2D7A50] text-white shadow-md shadow-[#1B5E3D]/25'
                              : 'bg-[#E8F0EC] dark:bg-[#1E2D26]'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-[#F5A623]" />
                        )}
                      </div>
                    </Link>
                  );
                })}

                {/* Informations Section */}
                <Separator className="my-4 bg-[#D1DDD6] dark:bg-[#2D3F35]" />
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#5A7265] dark:text-[#8BA898]">
                  Informations
                </p>
                {infoMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path} onClick={closeMobileSidebar}>
                      <div
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                          isActive
                            ? 'bg-[#1B5E3D]/10 dark:bg-[#3D9A6A]/15 text-[#1B5E3D] dark:text-[#3D9A6A]'
                            : 'text-[#5A7265] dark:text-[#8BA898] hover:bg-[#E8F0EC] dark:hover:bg-[#1E2D26] hover:text-[#1A2E23] dark:hover:text-[#E8F0EC]'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                            isActive
                              ? 'bg-[#1B5E3D] dark:bg-[#2D7A50] text-white shadow-md shadow-[#1B5E3D]/25'
                              : 'bg-[#E8F0EC] dark:bg-[#1E2D26]'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-[#F5A623]" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
