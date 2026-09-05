import { setTheme, useTheme, type ThemePreference } from '../theme';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

export default function ThemePicker() {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const preference = useTheme();
  return (
    <label className="theme-picker nav-icon-btn" title={t('appearance')}>
      <svg className="interface-icon" viewBox="0 0 24 24" aria-hidden="true">
        {preference === 'dark' ? <path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z" /> :
          preference === 'light' ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></> :
          <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>}
      </svg>
      <select aria-label={t('appearance')} value={preference} onChange={event => setTheme(event.target.value as ThemePreference)}>
        <option value="system">{t('themeSystem')}</option>
        <option value="light">{t('themeLight')}</option>
        <option value="dark">{t('themeDark')}</option>
      </select>
    </label>
  );
}
