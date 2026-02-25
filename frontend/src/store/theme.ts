import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setTheme: (isDark: boolean) => void;
}

// Apply theme to document
const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Initialize theme from localStorage before React hydration
const initializeTheme = () => {
  try {
    const stored = localStorage.getItem('theme-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.isDark) {
        document.documentElement.classList.add('dark');
        return true;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return false;
};

// Run immediately to prevent flash
const initialIsDark = initializeTheme();

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: initialIsDark,
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      toggleTheme: () => set((state) => {
        const newIsDark = !state.isDark;
        applyTheme(newIsDark);
        return { isDark: newIsDark };
      }),
      setTheme: (isDark: boolean) => set(() => {
        applyTheme(isDark);
        return { isDark };
      }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileSidebarOpen: (open: boolean) => set(() => ({ mobileSidebarOpen: open })),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.isDark);
        }
      },
    }
  )
);
