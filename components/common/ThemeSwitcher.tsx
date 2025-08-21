
import React from 'react';
import { Theme } from '../../types';

interface ThemeSwitcherProps {
    currentTheme: Theme;
    onChangeTheme: (theme: Theme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onChangeTheme }) => {
    const themes: { name: Theme; icon: string; bg: string }[] = [
        { name: 'light', icon: '☀️', bg: 'bg-yellow-400' },
        { name: 'dark', icon: '🌙', bg: 'bg-indigo-500' },
        { name: 'pink', icon: '🌸', bg: 'bg-pink-400' },
    ];

    return (
        <div className="flex items-center justify-around gap-2 p-1.5 mb-2 rounded-xl bg-black/5 dark:bg-white/5">
            {themes.map(theme => (
                <button
                    key={theme.name}
                    onClick={() => onChangeTheme(theme.name)}
                    className={`w-full h-10 rounded-lg text-xl flex items-center justify-center transition-all duration-300
                        ${currentTheme === theme.name 
                            ? `${theme.bg} text-white scale-105 shadow-md` 
                            : 'bg-transparent text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    aria-label={`Switch to ${theme.name} theme`}
                >
                    {theme.icon}
                </button>
            ))}
        </div>
    );
};

export default ThemeSwitcher;
