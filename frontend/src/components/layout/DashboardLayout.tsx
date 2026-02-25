import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useThemeStore } from '@/store/theme';
import { useEffect } from 'react';

export function DashboardLayout() {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useThemeStore();

  // Close mobile sidebar on route change or resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileSidebarOpen, setMobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-[#0D1512] text-[#1A2E23] dark:text-[#E8F0EC]">
      <Sidebar />
      <Header />
      
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="pt-16 min-h-screen hidden lg:block"
      >
        <div className="p-6">
          <Outlet />
        </div>
      </motion.main>
      
      {/* Mobile main content - no margin */}
      <main className="pt-16 min-h-screen lg:hidden">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
