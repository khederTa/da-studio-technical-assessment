import { useAppSelector, useAppDispatch } from '@/app/stores/store';
import { setTheme } from '@/app/stores/slices/uiSlice';
import { Button } from './button';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ThemeSwitcher() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const { t } = useTranslation();
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      title={theme === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}

