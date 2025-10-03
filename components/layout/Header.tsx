

import React, { useState, useEffect, useRef } from 'react';
import { User, Page, Notification } from '../../types.ts';
import { generateAvatar } from '../../constants.ts';
import { BellIcon, ChevronDownIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, BookOpenIcon } from '../common/Icons.tsx';
import { useIcons } from '../../contexts/IconContext.tsx';
import IconDisplay from '../common/IconDisplay.tsx';

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
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onMenuClick, onNavigate, notifications, onMarkAllAsRead, onLogout }) => {
    const [isNotificationOpen, setNotificationOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const { iconSettings } = useIcons();
    
    const profileRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const handleNavigate = (page: Page) => {
        onNavigate(page);
        setProfileOpen(false);
    };

    const handleLogoutClick = () => {
        onLogout();
        setProfileOpen(false);
    };

    return (
        <>
            <header className="fixed top-0 right-0 left-0 z-40 h-20 lg:pr-60 transition-all duration-300">
                <div className="container mx-auto px-4 sm:px-6 h-full flex items-center">
                    <div className="w-full flex justify-between items-center bg-[hsl(var(--color-surface))] bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-lg h-[68px] px-4 border border-[hsl(var(--color-border))]">
                        
                        {/* Right Side: Menu Button */}
                        <div className="flex-1 flex justify-start">
                            <button
                                onClick={onMenuClick}
                                className="p-2 rounded-full bg-transparent text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/10 transition-colors lg:hidden"
                                aria-label="Open menu"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Center: Logo + Name */}
                        <div className="flex items-center justify-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
                            <IconDisplay value={iconSettings['header_logo']} fallback={<BookOpenIcon />} className="w-8 h-8 text-[hsl(var(--color-primary))]" />
                            <span className="font-bold text-lg text-[hsl(var(--color-text-primary))]">
                                سنتر جوجل
                            </span>
                        </div>

                        {/* Left Side: Actions */}
                        <div className="flex-1 flex items-center justify-end gap-2">
                            {/* Notifications */}
                            <div className="relative">
                                <button 
                                    onClick={() => setNotificationOpen(prev => !prev)}
                                    className={`p-3 rounded-full bg-transparent text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative ${unreadCount > 0 ? 'has-unread-notifications' : ''}`}
                                    aria-label={`Open notifications. ${unreadCount} unread.`}
                                >
                                    <IconDisplay value={iconSettings['header_notifications']} fallback={<BellIcon />} className="w-10 h-10" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 block w-6 h-6 text-sm leading-6 text-center text-white bg-red-500 rounded-full border-2 border-[hsl(var(--color-surface))]">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Profile Dropdown */}
                            <div ref={profileRef} className="relative">
                                <button onClick={() => setProfileOpen(prev => !prev)} className="flex items-center gap-2 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                    <img src={user.profilePicture || generateAvatar(user.name)} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-[hsl(var(--color-primary))]"/>
                                    <ChevronDownIcon className={`w-5 h-5 text-[hsl(var(--color-text-secondary))] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isProfileOpen && (
                                    <div className="absolute top-14 left-0 w-56 bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl border border-[hsl(var(--color-border))] overflow-hidden animate-fade-in-down p-2">
                                    <button onClick={() => handleNavigate('profile')} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[hsl(var(--color-text-primary))]">
                                        <IconDisplay value={iconSettings['header_profile']} fallback={<UserCircleIcon />} />
                                        <span>الملف الشخصي</span>
                                    </button>
                                    <div className="h-px bg-[hsl(var(--color-border))] my-1"></div>
                                    <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-red-500 hover:bg-red-500/10">
                                        <IconDisplay value={iconSettings['header_logout']} fallback={<ArrowLeftOnRectangleIcon />} />
                                        <span>تسجيل الخروج</span>
                                    </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            {isNotificationOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-down"
                    onClick={() => setNotificationOpen(false)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div 
                        className="w-full max-w-md bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl border border-[hsl(var(--color-border))] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-3 flex justify-between items-center border-b border-[hsl(var(--color-border))]">
                            <h3 className="font-bold text-lg">الإشعارات</h3>
                            {unreadCount > 0 && <button onClick={onMarkAllAsRead} className="text-sm text-[hsl(var(--color-primary))] hover:underline">تحديد الكل كمقروء</button>}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                [...notifications].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(notification => (
                                    <div key={notification.id} className={`p-3 border-b border-[hsl(var(--color-border))] last:border-b-0 flex items-start gap-3 ${notification.read ? 'opacity-60' : 'bg-[hsl(var(--color-background))]'}`}>
                                        <div className="text-[hsl(var(--color-primary))] mt-1">
                                            <IconDisplay value={iconSettings['nav_full-schedule']} fallback={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} className="w-5 h-5" />
                                        </div>
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
                </div>
            )}
        </>
    );
};

export default Header;