
import React from 'react';
import { Theme } from '../../types.ts';

interface ThemeSwitcherProps {
    currentTheme: Theme;
    onChangeTheme: (theme: Theme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onChangeTheme }) => {
    const themes: { name: Theme; icon: string; bg: string }[] = [
        { name: 'light', icon: '☀️', bg: 'bg-yellow-400' },
        { name: 'dark', icon: '🌙', bg: 'bg-indigo-500' },
        { name: 'pink', icon: '🌸', bg: 'bg-pink-400' },
        { name: 'cocktail', icon: '🍹', bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500' },
        { name: 'ocean', icon: '🌊', bg: 'bg-blue-500' },
        { name: 'forest', icon: '🌳', bg: 'bg-green-600' },
        { name: 'sunset', icon: '🌇', bg: 'bg-gradient-to-br from-orange-400 via-red-500 to-purple-600' },
        { name: 'matrix', icon: '📟', bg: 'bg-black' },
        { name: 'wave', icon: '🌃', bg: 'bg-gradient-to-br from-pink-500 to-cyan-400' },
    ];

    return (
        <div className="theme-switcher-container flex items-center justify-start gap-2 p-1.5 mb-2 rounded-xl bg-black/5 dark:bg-white/5 overflow-x-auto">
            {themes.map(theme => (
                <button
                    key={theme.name}
                    onClick={() => onChangeTheme(theme.name)}
                    className={`flex-shrink-0 w-12 h-10 rounded-lg text-xl flex items-center justify-center transition-all duration-300
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