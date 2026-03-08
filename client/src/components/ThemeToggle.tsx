import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            id="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <div className={`theme-toggle__track ${theme === 'light' ? 'theme-toggle__track--light' : ''}`}>
                <div className={`theme-toggle__thumb ${theme === 'light' ? 'theme-toggle__thumb--light' : ''}`}>
                    {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                </div>
                <span className="theme-toggle__icon theme-toggle__icon--moon">
                    <Moon size={11} />
                </span>
                <span className="theme-toggle__icon theme-toggle__icon--sun">
                    <Sun size={11} />
                </span>
            </div>
        </button>
    );
}
