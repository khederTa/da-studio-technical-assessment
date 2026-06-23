import { useEffect } from 'react';
import { useAppDispatch } from '@/app/stores/store';
import { setLanguage } from '@/app/stores/slices/uiSlice';

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize language from localStorage on mount
    const storedLanguage = localStorage.getItem('language') as 'en' | 'ar' | null;
    if (storedLanguage) {
      dispatch(setLanguage(storedLanguage));
    }
  }, [dispatch]);

  return <>{children}</>;
}

