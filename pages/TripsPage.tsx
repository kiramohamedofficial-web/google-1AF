
import React, { useMemo } from 'react';
import { Trip, User, Booking } from '../types';

interface TripsPageProps {
    trips: Trip[];
    setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
    user: User;
    onCreateBooking: (trip: Trip, type: 'رحلة') => void;
    bookings: Booking[];
}

const TripsPage: React.FC<TripsPageProps> = ({ trips, user, onCreateBooking, bookings }) => {
    
    const userBookedTripIds = useMemo(() =>
        bookings.filter(b => b.studentId === user.id && b.serviceType === 'رحلة').map(b => b.serviceId),
        [bookings, user.id]
    );

    const handleBooking = (trip: Trip) => {
        onCreateBooking(trip, 'رحلة');
    };

    return (
        <div className="animate-fade-in-up">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold mb-2 text-[hsl(var(--color-text-primary))]">🚌 الرحلات والأنشطة</h1>
                <p className="text-lg text-[hsl(var(--color-text-secondary))] max-w-2xl mx-auto">
                    استكشف الأنشطة والرحلات الممتعة التي ننظمها لطلابنا. إنها فرصة رائعة للتعلم خارج الفصول الدراسية وتكوين صداقات جديدة.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trips.map(trip => {
                    const isBooked = userBookedTripIds.includes(trip.id);
                    const isFull = trip.bookedCount >= trip.capacity;
                    
                    return (
                        <div key={trip.id} className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg overflow-hidden flex flex-col border border-[hsl(var(--color-border))] transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="relative">
                                <img src={trip.imageUrls[0]} alt={trip.title} className="w-full h-56 object-cover" />
                                {trip.cost && (
                                     <div className="absolute top-4 right-4 bg-yellow-400 text-black font-bold px-3 py-1 rounded-full shadow-md">
                                        {trip.cost} ج.م
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <h2 className="text-2xl font-bold text-[hsl(var(--color-text-primary))] mb-2">{trip.title}</h2>
                                <p className="text-[hsl(var(--color-text-secondary))] flex-grow mb-4">{trip.description}</p>
                                
                                <div className="space-y-2 text-sm text-[hsl(var(--color-text-primary))] mb-4">
                                    <div className="flex items-center gap-2"><span className="w-5 text-center">📅</span><span className="font-medium">{trip.date}</span></div>
                                    <div className="flex items-center gap-2"><span className="w-5 text-center">🕒</span><span className="font-medium">{trip.time}</span></div>
                                    <div className="flex items-center gap-2"><span className="w-5 text-center">📍</span><span className="font-medium">{trip.meetingPoint}</span></div>
                                </div>

                                <div className="bg-[hsl(var(--color-background))] p-3 rounded-lg flex justify-between items-center mb-4">
                                    <span className="font-semibold">المقاعد</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-black/10 dark:bg-white/10 rounded-full h-2.5">
                                            <div className="bg-[hsl(var(--color-primary))] h-2.5 rounded-full" style={{ width: `${(trip.bookedCount / trip.capacity) * 100}%` }}></div>
                                        </div>
                                        <span className="font-mono text-sm">{trip.bookedCount} / {trip.capacity}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleBooking(trip)}
                                    disabled={isBooked || isFull}
                                    className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 text-lg mt-auto
                                        ${isBooked ? 'bg-yellow-600 text-white cursor-default' : 
                                        isFull ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 
                                        'bg-[hsl(var(--color-primary))] hover:opacity-90 text-white'}`}
                                >
                                    {isBooked ? '🎉 تم إرسال طلب الحجز' : isFull ? '❌ مكتمل العدد' : '🎟️ احجز مكانك الآن'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TripsPage;
