

import React from 'react';
import { Theme } from '../../types.ts';
import { CheckIcon } from './Icons.tsx';

interface ThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: Theme;
    onChangeTheme: (theme: Theme) => void;
}

const themes: { name: Theme; icon: string; bg: string; label: string; }[] = [
    { name: 'light', icon: '☀️', bg: 'bg-slate-100', label: 'فاتح' },
    { name: 'dark', icon: '🌙', bg: 'bg-slate-800', label: 'داكن' },
    { name: 'royal', icon: '👑', bg: 'bg-gradient-to-br from-yellow-400 to-amber-600', label: 'ملكي' },
    { name: 'paper', icon: '📜', bg: 'bg-[#f5eeda]', label: 'ورقي' },
    { name: 'pink', icon: '🌸', bg: 'bg-pink-400', label: 'وردي' },
    { name: 'cocktail', icon: '🍹', bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500', label: 'كوكتيل' },
    { name: 'ocean', icon: '🌊', bg: 'bg-blue-500', label: 'محيط' },
    { name: 'forest', icon: '🌳', bg: 'bg-green-600', label: 'غابة' },
    { name: 'sunset', icon: '🌇', bg: 'bg-gradient-to-br from-orange-400 to-red-500', label: 'غروب' },
    { name: 'matrix', icon: '📟', bg: 'bg-black', label: 'ماتركس' },
    { name: 'wave', icon: '🌃', bg: 'bg-gradient-to-br from-pink-500 to-cyan-400', label: 'موجة' },
];

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose, currentTheme, onChangeTheme }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in-down"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-[hsl(var(--color-surface))] w-full max-w-sm sm:max-w-md md:max-w-2xl rounded-2xl shadow-2xl p-4 sm:p-6 border border-[hsl(var(--color-border))]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--color-text-primary))]">اختر الثيم المفضل</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Close theme selection">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {themes.map(theme => (
                        <button
                            key={theme.name}
                            onClick={() => onChangeTheme(theme.name)}
                            className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 p-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-[hsl(var(--color-surface))] focus:ring-[hsl(var(--color-primary))]
                                ${currentTheme === theme.name ? 'ring-4 ring-[hsl(var(--color-primary))]' : 'ring-1 ring-inset ring-[hsl(var(--color-border))]'}
                            `}
                             aria-label={`Switch to ${theme.label} theme`}
                        >
                            <div className={`absolute inset-0 ${theme.bg} rounded-xl opacity-80`}></div>
                             {currentTheme === theme.name && (
                                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                                    <CheckIcon className="w-10 h-10 text-white drop-shadow-lg" />
                                </div>
                            )}
                            <span className="relative text-3xl sm:text-4xl z-10" aria-hidden="true">{theme.icon}</span>
                            <span className={`relative z-10 font-bold text-sm ${['dark', 'matrix', 'royal', 'wave', 'cocktail', 'sunset', 'ocean', 'forest'].includes(theme.name) ? 'text-white drop-shadow-md' : 'text-slate-800'}`}>{theme.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Card3D: React.FC = () => {
  return null;
};

export default Card3D;