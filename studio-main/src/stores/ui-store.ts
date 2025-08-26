'use client';

import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  isMounted: boolean;
  isMobile: boolean;
  toggleTheme: () => void;
  init: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'light',
  isMounted: false,
  isMobile: false,
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    set({ theme: newTheme });
  },
  init: () => {
    if (get().isMounted) return;
    try {
      const storedTheme = (localStorage.getItem('theme') as Theme) || 'light';
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      
      const checkMobile = () => {
          set({ isMobile: window.innerWidth < 768 });
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);

      set({ theme: storedTheme, isMounted: true });

      // Clean up event listener on unmount
      return () => {
          window.removeEventListener('resize', checkMobile);
      };
    } catch (error) {
        // localStorage or window is not available
        set({isMounted: true})
    }
  },
}));
