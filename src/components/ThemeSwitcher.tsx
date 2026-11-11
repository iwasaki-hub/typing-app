import { useLocale } from '../features/locale/useLocale'
import { useId } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { paletteIcon } from '../lib/icons';
import { useTheme } from '../features/theme/context';
import './ThemeSwitcher.css';
export default function ThemeSwitcher() {
    const { t } = useLocale();
    const { theme, changeTheme } = useTheme();
    const id = useId();
    return <label className="theme-switcher" htmlFor={id}><FontAwesomeIcon icon={paletteIcon} aria-hidden="true"/><span className="theme-switcher-label">{t("デザイン")}</span><select id={id} value={theme} onChange={(event) => changeTheme(event.target.value === 'calm' ? 'calm' : 'classic')}><option value="classic">{t("シンプル")}</option><option value="calm">{t("リラックス")}</option></select></label>;
}
