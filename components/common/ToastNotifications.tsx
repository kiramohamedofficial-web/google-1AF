import React, { useEffect, useState } from 'react';
import { ToastNotification, ToastType } from '../../types.ts';

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    info: <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    warning: <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    error: <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const BORDER_COLORS: Record<ToastType, string> = {
    success: 'border-green-500',
    info: 'border-blue-500',
    warning: 'border-yellow-500',
    error: 'border-red-500',
};

interface ToastProps {
    toast: ToastNotification;
    onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(toast.id), 300); // Wait for animation
        }, 5000);

        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
    };

    const animationClass = isExiting ? 'animate-toast-out' : 'animate-toast-in';
    const borderColorClass = BORDER_COLORS[toast.type] || 'border-[hsl(var(--color-primary))]';

    return (
        <div 
            className={`w-full max-w-sm bg-[hsl(var(--color-surface))] shadow-2xl rounded-xl p-4 border-l-4 flex items-start gap-4 ${animationClass} ${borderColorClass}`}
            role="alert"
            aria-live="assertive"
        >
            <div className="flex-shrink-0 pt-0.5">{ICONS[toast.type]}</div>
            <div className="flex-grow">
                <p className="font-bold text-base text-[hsl(var(--color-text-primary))]">{toast.title}</p>
                <p className="text-sm text-[hsl(var(--color-text-secondary))] mt-1">{toast.message}</p>
            </div>
            <button 
                onClick={handleDismiss} 
                className="p-1 rounded-full text-[hsl(var(--color-text-secondary))] hover:bg-black/10 dark:hover:bg-white/10 flex-shrink-0"
                aria-label="Dismiss notification"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};


interface NotificationContainerProps {
    toasts: ToastNotification[];
    onDismiss: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed top-24 left-4 z-[200] space-y-3" dir="ltr">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};
