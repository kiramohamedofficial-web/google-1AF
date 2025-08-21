
import React, { useState, useMemo } from 'react';
import { User, Booking, BookingStatus } from '../types';

interface MyBookingsPageProps {
    user: User;
    allBookings: Booking[];
}

const statusStyles: Record<BookingStatus, { bg: string; text: string; icon: string; }> = {
    'قيد المراجعة': { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', icon: '⏳' },
    'مؤكد': { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', icon: '✅' },
    'ملغي': { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', icon: '❌' },
    'منتهي': { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', icon: '🏁' },
};

const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
    const style = statusStyles[booking.status];
    return (
        <div className="bg-[hsl(var(--color-surface))] rounded-xl shadow-lg p-5 border-l-4 border-[hsl(var(--color-primary))] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-xl font-bold text-[hsl(var(--color-text-primary))]">{booking.serviceName}</h2>
                <p className="text-sm text-[hsl(var(--color-text-secondary))] mt-1">
                    <span>{booking.date}</span> | <span>{booking.time}</span> | <span>{booking.location}</span>
                </p>
                 <p className="text-xs text-[hsl(var(--color-text-secondary))] mt-2 font-mono">ID: {booking.id}</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 ${style.bg} ${style.text}`}>
                {style.icon}
                <span>{booking.status}</span>
            </div>
        </div>
    );
};

const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ user, allBookings }) => {
    const filters: ('الكل' | BookingStatus)[] = ['الكل', 'قيد المراجعة', 'مؤكد', 'ملغي', 'منتهي'];
    const [activeFilter, setActiveFilter] = useState<'الكل' | BookingStatus>('الكل');

    const userBookings = useMemo(() => {
        const sorted = allBookings
            .filter(b => b.studentId === user.id)
            .sort((a, b) => b.createdAt - a.createdAt);
        if (activeFilter === 'الكل') {
            return sorted;
        }
        return sorted.filter(b => b.status === activeFilter);
    }, [allBookings, user.id, activeFilter]);

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6 text-[hsl(var(--color-text-primary))]">🎫 حجوزاتي</h1>
            
            <div className="flex flex-wrap gap-3 mb-8">
                {filters.map(filter => (
                    <button 
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${activeFilter === filter ? 'bg-[hsl(var(--color-primary))] text-white shadow-md' : 'bg-[hsl(var(--color-surface))] hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
            
            <div className="space-y-4">
                {userBookings.length > 0 ? (
                    userBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
                ) : (
                    <div className="text-center py-16 bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))]">
                        <p className="text-2xl font-bold">لا توجد حجوزات تطابق هذا الفلتر.</p>
                        <p className="text-[hsl(var(--color-text-secondary))] mt-2">
                            {activeFilter === 'الكل' ? 'لم تقم بأي حجوزات بعد. تصفح الحصص والرحلات المتاحة!' : 'جرّب اختيار فلتر مختلف.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookingsPage;
