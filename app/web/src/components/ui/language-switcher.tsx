import { useAppSelector, useAppDispatch } from '@/app/stores/store';
import { setLanguage } from '@/app/stores/slices/uiSlice';
import { Button } from './button';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.ui.language);
  const { t } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    dispatch(setLanguage(newLanguage));
  };

  return (
    <Button
      variant="outline"
      size="default"
      onClick={toggleLanguage}
      title={language === 'en' ? t('language.switchToArabic') : t('language.switchToEnglish')}
      className="gap-2"
    >
      <Languages className="h-4 w-4" />
      <span>{language === 'en' ? 'AR' : 'EN'}</span>
    </Button>
  );
}

