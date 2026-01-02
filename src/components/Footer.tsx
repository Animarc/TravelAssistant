import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

const Footer = () => {
  const { state } = useApp();
  const { t } = useTranslation(state.language);

  return (
    <footer className="site-footer">
      <p>
        {t('footerBeta')} | {t('footerContact')}:{' '}
        <a href="mailto:animarc@gmail.com">animarc@gmail.com</a>
      </p>
    </footer>
  );
};

export default Footer;
