
import React, { useState, useEffect, useRef } from 'react';
import { User, Page, Notification } from '../../types.ts';
import { BellIcon, CalendarIcon } from '../common/Icons.tsx';

const formatTimeAgo = (timestamp: string) => {
    const notificationTime = new Date(timestamp).getTime();
    if (isNaN(notificationTime)) return '...';

    const now = Date.now();
    const seconds = Math.floor((now - notificationTime) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `منذ ${Math.floor(interval)} سنة`;
    interval = seconds / 2592000;
    if (interval > 1) return `منذ ${Math.floor(interval)} شهر`;
    interval = seconds / 86400;
    if (interval > 1) return `منذ ${Math.floor(interval)} يوم`;
    interval = seconds / 3600;
    if (interval > 1) return `منذ ${Math.floor(interval)} ساعة`;
    interval = seconds / 60;
    if (interval > 1) return `منذ ${Math.floor(interval)} دقيقة`;
    return 'الآن';
};

interface HeaderProps {
    user: User;
    onMenuClick: () => void;
    onNavigate: (page: Page) => void;
    notifications: Notification[];
    onMarkAllAsRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onMenuClick, onNavigate, notifications, onMarkAllAsRead }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="fixed top-0 right-0 left-0 z-40 h-20 lg:pr-64 transition-all duration-300">
            <div className="container mx-auto px-4 sm:px-6 h-full flex items-center">
                <div className="w-full flex items-center justify-between relative bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg p-2 border border-[hsl(var(--color-border))]">
                    <button
                        onClick={onMenuClick}
                        className="p-3 rounded-full bg-[hsl(var(--color-background))] text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/10 transition-colors lg:hidden"
                        aria-label="Open menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <h1 className="text-xl font-bold text-center text-[hsl(var(--color-text-primary))]">
                            Google Center
                        </h1>
                    </div>
                    <div ref={dropdownRef} className="relative">
                        <button 
                            onClick={() => setDropdownOpen(prev => !prev)}
                            className="p-3 rounded-full bg-[hsl(var(--color-background))] text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative"
                            aria-label="Open notifications"
                        >
                            <BellIcon />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 block w-4 h-4 text-[10px] leading-4 text-center text-white bg-red-500 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute top-14 left-0 w-80 bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl border border-[hsl(var(--color-border))] overflow-hidden animate-fade-in-down">
                                <div className="p-3 flex justify-between items-center border-b border-[hsl(var(--color-border))]">
                                    <h3 className="font-bold text-lg">الإشعارات</h3>
                                    {unreadCount > 0 && <button onClick={onMarkAllAsRead} className="text-sm text-[hsl(var(--color-primary))] hover:underline">تحديد الكل كمقروء</button>}
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        [...notifications].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(notification => (
                                            <div key={notification.id} className={`p-3 border-b border-[hsl(var(--color-border))] last:border-b-0 flex items-start gap-3 ${notification.read ? 'opacity-60' : 'bg-[hsl(var(--color-background))]'}`}>
                                                <div className="text-[hsl(var(--color-primary))] mt-1"><CalendarIcon /></div>
                                                <div>
                                                    <p className="text-sm font-medium">{notification.message}</p>
                                                    <p className="text-xs text-[hsl(var(--color-text-secondary))] mt-1">{formatTimeAgo(notification.created_at)}</p>
                                                </div>
                                                {!notification.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-4 text-center text-[hsl(var(--color-text-secondary))]">لا توجد إشعارات جديدة.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
