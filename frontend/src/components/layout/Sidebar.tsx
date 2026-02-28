import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  Target,
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
  MoreHorizontal,
  LogOut,
  Swords,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

/* ============================================================
   NAVIGATION CONFIG
   ============================================================ */

const userMainMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', emoji: '🏠' },
  { icon: Layers, label: 'Thèmes', path: '/themes', emoji: '📚' },
  { icon: Target, label: 'Quiz', path: '/quizzes', emoji: '⚽' },
  { icon: Sparkles, label: 'Révision', path: '/revision', emoji: '✨' },
  { icon: History, label: 'Historique', path: '/history', emoji: '📋' },
  { icon: Swords, label: 'Duels', path: '/duels', emoji: '⚔️' },
  { icon: Trophy, label: 'Classement', path: '/leaderboard', emoji: '🏆' },
];

const adminMainMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', emoji: '🏠' },
  { icon: Layers, label: 'Thèmes', path: '/themes', emoji: '📚' },
  { icon: Target, label: 'Quiz', path: '/quizzes', emoji: '⚽' },
  { icon: Swords, label: 'Duels', path: '/duels', emoji: '⚔️' },
  { icon: Trophy, label: 'Classement', path: '/leaderboard', emoji: '🏆' },
  { icon: Users, label: 'Utilisateurs', path: '/users', emoji: '👥' },
  { icon: Mail, label: 'Envoyer Email', path: '/admin/email', emoji: '📧' },
];

const userAccountMenuItems = [
  { icon: User, label: 'Profil', path: '/profile' },
  { icon: Settings, label: 'Paramètres', path: '/settings' },
];

const infoMenuItems = [
  { icon: LifeBuoy, label: 'Aide', path: '/help' },
  { icon: ScrollText, label: "Conditions", path: '/terms' },
];

// Bottom nav shows the 5 most important items (user)
const userBottomNavItems = [
  { icon: LayoutDashboard, label: 'Accueil', path: '/dashboard' },
  { icon: Layers, label: 'Thèmes', path: '/themes' },
  { icon: Target, label: 'Quiz', path: '/quizzes' },
  { icon: Trophy, label: 'Classement', path: '/leaderboard' },
];

const adminBottomNavItems = [
  { icon: LayoutDashboard, label: 'Accueil', path: '/dashboard' },
  { icon: Layers, label: 'Thèmes', path: '/themes' },
  { icon: Target, label: 'Quiz', path: '/quizzes' },
  { icon: Trophy, label: 'Classement', path: '/leaderboard' },
];

/* ============================================================
   FOOTBALL FIELD DECORATION (desktop sidebar background)
   ============================================================ */

const SidebarDecoration = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Gradient orbs */}
    <motion.div
      animate={{ y: [0, -15, 0], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-[#00D97E]/10 blur-3xl"
    />
    <motion.div
      animate={{ y: [0, 12, 0], opacity: [0.15, 0.3, 0.15] }}
      transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      className="absolute bottom-1/4 -right-8 w-32 h-32 rounded-full bg-[#00D97E]/08 blur-2xl"
    />
    {/* Subtle field line */}
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#00D97E]/10 to-transparent" />
  </div>
);

/* ============================================================
   DESKTOP NAV ITEM
   ============================================================ */

function NavItem({
  item,
  isActive,
  collapsed,
}: {
  item: { icon: React.ElementType; label: string; path: string };
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to={item.path}>
          <motion.div
            whileHover={{ x: collapsed ? 0 : 3 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer',
              collapsed ? 'justify-center' : '',
              isActive
                ? 'bg-[#00D97E]/10 dark:bg-[#00D97E]/12 text-[#00924F] dark:text-[#00D97E]'
                : 'text-[#5E7A9A] hover:bg-[#EFF3F7] dark:hover:bg-[#0F1E31] hover:text-[#0A1628] dark:hover:text-[#E2E8F5]'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center rounded-lg transition-all flex-shrink-0',
                collapsed ? 'h-10 w-10' : 'h-8 w-8',
                isActive
                  ? 'bg-[#00924F] dark:bg-[#00D97E] text-white dark:text-black shadow-lg shadow-[#00924F]/25 dark:shadow-[#00D97E]/20'
                  : 'bg-[#EFF3F7] dark:bg-[#111B2E]'
              )}
            >
              <Icon className={cn(isActive ? 'h-4 w-4' : 'h-4 w-4')} />
            </div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="font-medium text-sm leading-none"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {isActive && !collapsed && (
              <motion.div
                layoutId="sidebar-active-dot"
                className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00D97E]"
              />
            )}
          </motion.div>
        </Link>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right" className="font-medium bg-[#0D1525] text-[#E2E8F5] border-[#1B2B40]">
          {item.label}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

/* ============================================================
   SECTION LABEL
   ============================================================ */

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="my-3 h-px bg-[#DCE6F0] dark:bg-[#1B2B40]" />;
  return (
    <AnimatePresence>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-[#5E7A9A] dark:text-[#5E7A9A] select-none"
      >
        {label}
      </motion.p>
    </AnimatePresence>
  );
}

/* ============================================================
   MAIN SIDEBAR COMPONENT
   ============================================================ */

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useThemeStore();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  const menuItems = isAdmin ? adminMainMenuItems : userMainMenuItems;
  const bottomItems = isAdmin ? adminBottomNavItems : userBottomNavItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /* ---- Desktop Sidebar ---- */
  return (
    <TooltipProvider delayDuration={0}>
      {/* ============================================================
          DESKTOP SIDEBAR
          ============================================================ */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-40 h-screen overflow-hidden',
          'bg-white dark:bg-[#050810]',
          'border-r border-[#DCE6F0] dark:border-[#1B2B40]',
          'flex-col',
          'hidden lg:flex'
        )}
      >
        <SidebarDecoration />

        {/* Logo */}
        <div className="relative flex h-16 items-center justify-between px-4 border-b border-[#DCE6F0] dark:border-[#1B2B40]">
          <Link to="/dashboard" className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center w-full')}>
            <div className="relative flex-shrink-0">
              <img
                src="/logo.svg"
                alt="Footix"
                className="h-9 w-9 rounded-xl shadow-lg"
              />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#00D97E] border-2 border-white dark:border-[#050810]" />
            </div>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="text-lg font-black tracking-tight text-[#0A1628] dark:text-[#E2E8F5]">
                    Foot<span className="text-[#00924F] dark:text-[#00D97E]">ix</span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3 scrollbar-thin">
          <nav className="px-3 space-y-0.5">
            <SectionLabel label="Menu principal" collapsed={sidebarCollapsed} />
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + '/');
              return (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={isActive}
                  collapsed={sidebarCollapsed}
                />
              );
            })}

            <SectionLabel label="Mon compte" collapsed={sidebarCollapsed} />
            {userAccountMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={isActive}
                  collapsed={sidebarCollapsed}
                />
              );
            })}

            <SectionLabel label="Aide" collapsed={sidebarCollapsed} />
            {infoMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={isActive}
                  collapsed={sidebarCollapsed}
                />
              );
            })}
          </nav>
        </ScrollArea>

        {/* Collapse Toggle */}
        <div className="border-t border-[#DCE6F0] dark:border-[#1B2B40] p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-full h-9 rounded-lg text-[#5E7A9A] hover:text-[#00924F] dark:hover:text-[#00D97E] hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </motion.aside>

      {/* ============================================================
          MOBILE OVERLAY SIDEBAR (triggered by hamburger)
          ============================================================ */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={cn(
              'fixed left-0 top-0 z-50 h-screen w-[280px] overflow-hidden',
              'bg-white dark:bg-[#050810]',
              'border-r border-[#DCE6F0] dark:border-[#1B2B40]',
              'flex flex-col lg:hidden'
            )}
          >
            <SidebarDecoration />
            {/* Header */}
            <div className="relative flex h-16 items-center justify-between px-4 border-b border-[#DCE6F0] dark:border-[#1B2B40]">
              <Link
                to="/dashboard"
                className="flex items-center gap-3"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <div className="relative">
                  <img src="/logo.svg" alt="Footix" className="h-9 w-9 rounded-xl shadow-lg" />
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#00D97E] border-2 border-white dark:border-[#050810]" />
                </div>
                <span className="text-lg font-black tracking-tight text-[#0A1628] dark:text-[#E2E8F5]">
                  Foot<span className="text-[#00924F] dark:text-[#00D97E]">ix</span>
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(false)}
                className="h-9 w-9 rounded-lg text-[#5E7A9A] hover:text-[#0A1628] dark:hover:text-[#E2E8F5]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Nav */}
            <ScrollArea className="flex-1 py-3 scrollbar-thin">
              <nav className="px-3 space-y-0.5">
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-[#5E7A9A]">
                  Menu principal
                </p>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    location.pathname.startsWith(item.path + '/');
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                          isActive
                            ? 'bg-[#00D97E]/10 text-[#00924F] dark:text-[#00D97E]'
                            : 'text-[#5E7A9A] hover:bg-[#EFF3F7] dark:hover:bg-[#0F1E31] hover:text-[#0A1628] dark:hover:text-[#E2E8F5]'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                            isActive
                              ? 'bg-[#00924F] dark:bg-[#00D97E] text-white dark:text-black shadow-md'
                              : 'bg-[#EFF3F7] dark:bg-[#111B2E]'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-sm">{item.label}</span>
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00D97E]" />
                        )}
                      </div>
                    </Link>
                  );
                })}

                <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-[#5E7A9A]">
                  Mon compte
                </p>
                {userAccountMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                          isActive
                            ? 'bg-[#00D97E]/10 text-[#00924F] dark:text-[#00D97E]'
                            : 'text-[#5E7A9A] hover:bg-[#EFF3F7] dark:hover:bg-[#0F1E31]'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg',
                            isActive
                              ? 'bg-[#00924F] dark:bg-[#00D97E] text-white dark:text-black'
                              : 'bg-[#EFF3F7] dark:bg-[#111B2E]'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}

                <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-[#5E7A9A]">
                  Info
                </p>
                {infoMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[#5E7A9A] hover:bg-[#EFF3F7] dark:hover:bg-[#0F1E31] hover:text-[#0A1628] dark:hover:text-[#E2E8F5] transition-all">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF3F7] dark:bg-[#111B2E]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>

            {/* Logout */}
            <div className="border-t border-[#DCE6F0] dark:border-[#1B2B40] p-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">Déconnexion</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ============================================================
          MOBILE BOTTOM NAVIGATION BAR
          ============================================================ */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="bg-white/95 dark:bg-[#050810]/95 backdrop-blur-xl border-t border-[#DCE6F0] dark:border-[#1B2B40]">
          <div className="flex items-stretch">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex-1"
                >
                  <div
                    className={cn(
                      'flex flex-col items-center justify-center py-2 px-1 min-h-[60px] gap-0.5 transition-all duration-200 relative',
                      isActive
                        ? 'text-[#00924F] dark:text-[#00D97E]'
                        : 'text-[#5E7A9A]'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="bottom-nav-indicator"
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#00924F] dark:bg-[#00D97E]"
                      />
                    )}
                    <div
                      className={cn(
                        'flex items-center justify-center rounded-xl p-1.5 transition-all',
                        isActive ? 'bg-[#00924F]/10 dark:bg-[#00D97E]/10' : ''
                      )}
                    >
                      <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-semibold leading-none',
                        isActive ? 'opacity-100' : 'opacity-60'
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}

            {/* More button */}
            <button
              className="flex-1"
              onClick={() => setShowMoreSheet(true)}
            >
              <div className="flex flex-col items-center justify-center py-2 px-1 min-h-[60px] gap-0.5 text-[#5E7A9A] transition-all">
                <div className="flex items-center justify-center rounded-xl p-1.5">
                  <MoreHorizontal className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold leading-none opacity-60">Plus</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* ============================================================
          MOBILE "MORE" BOTTOM SHEET
          ============================================================ */}
      <AnimatePresence>
        {showMoreSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setShowMoreSheet(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-3xl bg-white dark:bg-[#0D1525] border-t border-[#DCE6F0] dark:border-[#1B2B40] pb-8"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-4">
                <div className="h-1 w-10 rounded-full bg-[#DCE6F0] dark:bg-[#1B2B40]" />
              </div>

              <div className="px-4 pb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[#5E7A9A] mb-3 px-2">Navigation</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {(isAdmin ? adminMainMenuItems : userMainMenuItems).map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === item.path ||
                      location.pathname.startsWith(item.path + '/');
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setShowMoreSheet(false)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all',
                          isActive
                            ? 'bg-[#00924F]/10 dark:bg-[#00D97E]/10'
                            : 'hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl',
                            isActive
                              ? 'bg-[#00924F] dark:bg-[#00D97E] text-white dark:text-black shadow-md'
                              : 'bg-[#EFF3F7] dark:bg-[#111B2E] text-[#5E7A9A]'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span
                          className={cn(
                            'text-xs font-semibold text-center leading-tight',
                            isActive
                              ? 'text-[#00924F] dark:text-[#00D97E]'
                              : 'text-[#5E7A9A]'
                          )}
                        >
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <div className="h-px bg-[#DCE6F0] dark:bg-[#1B2B40] mb-4" />

                <p className="text-xs font-bold uppercase tracking-widest text-[#5E7A9A] mb-3 px-2">Mon compte</p>
                <div className="space-y-1">
                  {[...userAccountMenuItems, ...infoMenuItems].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setShowMoreSheet(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E] transition-all"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF3F7] dark:bg-[#111B2E] text-[#5E7A9A]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-sm text-[#0A1628] dark:text-[#E2E8F5]">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                  <button
                    onClick={() => { setShowMoreSheet(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm text-red-500">Déconnexion</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
