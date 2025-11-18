import { useI18n } from '../hooks/useI18n';

export default function LanguageSwitcher() {
  const { locale, changeLanguage } = useI18n();

  const toggleLanguage = () => {
    const newLocale = locale === 'es' ? 'en' : 'es';
    changeLanguage(newLocale);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 transition-colors duration-200"
      title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <span className="text-lg">
        {locale === 'es' ? '🇺🇸' : '🇪🇸'}
      </span>
      <span className="font-medium">
        {locale === 'es' ? 'EN' : 'ES'}
      </span>
    </button>
  );
}