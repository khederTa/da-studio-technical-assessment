import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/stores/store';
import { setTheme } from '@/app/stores/slices/uiSlice';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (storedTheme && storedTheme !== theme) {
        dispatch(setTheme(storedTheme));
      }
      hasInitialized.current = true;
    }
  }, [dispatch, theme]);

  return <>{children}</>;
}
