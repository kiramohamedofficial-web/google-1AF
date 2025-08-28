import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, AppNotification, Page } from '../../types.ts';
import { SparklesIcon } from '../common/Icons.tsx';

const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 60) return 'الآن';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
};

interface NotificationPanelProps {
    notifications: AppNotification[];
    onNavigate: (page: Page) => void;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onDismiss: (id: string) => void;
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onNavigate, onMarkAsRead, onMarkAllAsRead, onDismiss, onClose }) => {
    
    const handleNotificationClick = (notification: AppNotification) => {
        onMarkAsRead(notification.id);
        if (notification.link) {
            onNavigate(notification.link);
        }
        onClose();
    };
    
    return (
        <div 
            className="
                absolute top-full mt-3 left-0 w-[90vw] max-w-[24rem]
                bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl border border-[hsl(var(--color-border))] 
                overflow-hidden flex flex-col animate-fade-in-up
            " 
            style={{ animationDuration: '0.3s' }}
        >
            <div className="p-4 border-b border-[hsl(var(--color-border))] flex justify-between items-center">
                <h3 className="font-bold text-lg">الإشعارات</h3>
                {notifications.some(n => !n.read) && (
                    <button onClick={onMarkAllAsRead} className="text-sm font-semibold text-[hsl(var(--color-primary))] hover:underline">
                        تحديد الكل كمقروء
                    </button>
                )}
            </div>
            {notifications.length > 0 ? (
                <div className="max-h-[70vh] lg:max-h-96 overflow-y-auto">
                    {notifications.map(n => (
                        <div key={n.id} className={`p-5 border-b border-[hsl(var(--color-border))] last:border-b-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group ${!n.read ? 'bg-blue-500/5' : ''}`}>
                            <div className="flex items-start gap-4">
                                {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--color-primary))] mt-2.5 flex-shrink-0"></div>}
                                <div className="flex-grow">
                                    <button onClick={() => handleNotificationClick(n)} className="text-right w-full">
                                        <p className={`font-bold text-base ${!n.read ? 'text-[hsl(var(--color-text-primary))]' : 'text-[hsl(var(--color-text-secondary))]'}`}>{n.title}</p>
                                        <p className="text-base text-[hsl(var(--color-text-secondary))] mt-1">{n.message}</p>
                                        <p className="text-sm text-[hsl(var(--color-primary))] mt-2">{timeAgo(new Date(n.created_at).getTime())}</p>
                                    </button>
                                </div>
                                <button onClick={() => onDismiss(n.id)} className="p-1 rounded-full opacity-0 group-hover:opacity-100 text-[hsl(var(--color-text-secondary))] hover:bg-black/10 dark:hover:bg-white/10" aria-label="Dismiss notification">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center text-[hsl(var(--color-text-secondary))]">
                    <p className="font-semibold text-lg">لا توجد إشعارات جديدة</p>
                    <p className="text-base mt-1">ستظهر إشعاراتك هنا.</p>
                </div>
            )}
        </div>
    );
};

interface HeaderProps {
    user: User;
    title: string;
    onMenuClick: () => void;
    notifications: AppNotification[];
    onNavigate: (page: Page) => void;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: (userId: string) => void;
    onDismiss: (id: string) => void;
    onAiChatClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, title, onMenuClick, notifications, onNavigate, onMarkAsRead, onMarkAllAsRead, onDismiss, onAiChatClick }) => {
    const [isPanelOpen, setPanelOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setPanelOpen(false);
            }
        };

        if (isPanelOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPanelOpen]);

    const userNotifications = useMemo(() =>
        notifications.filter(n => n.user_id === user.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        [notifications, user.id]
    );

    const unreadCount = useMemo(() =>
        userNotifications.filter(n => !n.read).length,
        [userNotifications]
    );

    return (
        <header className="absolute top-0 right-0 left-0 z-40 h-20 transition-all duration-300">
            <div className="container mx-auto px-4 sm:px-6 h-full flex items-center">
                <div className="w-full flex items-center justify-between bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg p-2 border border-[hsl(var(--color-border))]">
                    <button
                        onClick={onMenuClick}
                        className="p-3 rounded-full bg-[hsl(var(--color-background))] text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/10 transition-colors lg:hidden"
                        aria-label="Open menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <h1 className="text-xl font-bold text-[hsl(var(--color-text-primary))]">{title}</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onAiChatClick}
                            className="p-3 rounded-full bg-[hsl(var(--color-background))] text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            aria-label="Open AI Chat"
                        >
                            <SparklesIcon className="w-6 h-6 text-[hsl(var(--color-primary))]" />
                        </button>
                        <div ref={panelRef} className="relative">
                            <button
                                onClick={() => setPanelOpen(prev => !prev)}
                                className="p-3 rounded-full bg-[hsl(var(--color-background))] text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative"
                                aria-label="Notifications"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1/4 translate-x-1/4">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-xs font-bold text-white">{unreadCount}</span>
                                    </span>
                                )}
                            </button>
                            {isPanelOpen && (
                                <NotificationPanel
                                    notifications={userNotifications}
                                    onNavigate={onNavigate}
                                    onMarkAsRead={onMarkAsRead}
                                    onMarkAllAsRead={() => onMarkAllAsRead(user.id)}
                                    onDismiss={onDismiss}
                                    onClose={() => setPanelOpen(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;