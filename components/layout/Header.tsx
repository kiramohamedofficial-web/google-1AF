
import React from 'react';

interface HeaderProps {
    onMenuClick: () => void;
}

const NotificationIcon: React.FC = () => (
    <button
        className="p-3 rounded-full bg-[hsl(var(--color-background))] text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative"
        aria-label="Notifications"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {/* Notification Badge */}
        <span className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1/4 translate-x-1/4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-xs font-bold text-white">2</span>
        </span>
    </button>
);

const MenuButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
     <button
        onClick={onClick}
        className="p-3 rounded-full bg-[hsl(var(--color-background))] text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/10 transition-colors lg:hidden"
        aria-label="Open menu"
    >
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </button>
);

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="fixed top-0 right-0 left-0 z-40 h-20 lg:pr-72 transition-all duration-300">
            <div className="container mx-auto px-4 sm:px-6 h-full flex items-center">
               <div className="w-full flex items-center justify-between bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg p-2 border border-[hsl(var(--color-border))]">
                    <MenuButton onClick={onMenuClick} />
                    <h1 className="text-xl font-bold text-center text-[hsl(var(--color-text-primary))]">
                        Google Center
                    </h1>
                    <NotificationIcon />
               </div>
            </div>
        </header>
    );
};

export default Header;