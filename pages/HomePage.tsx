import React, { useState, useMemo } from 'react';
import { User, Lesson, Trip, Post, Page, Booking } from '../types';
import { getSubjectStyle } from '../constants';

const LessonDetailsModal: React.FC<{ lesson: Lesson; isBooked: boolean; onBook: (lesson: Lesson) => void; onClose: () => void; }> = ({ lesson, isBooked, onBook, onClose }) => {
    const isFull = lesson.capacity ? lesson.bookedCount! >= lesson.capacity : false;
    const style = getSubjectStyle(lesson.subject);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-lg relative border border-[hsl(var(--color-border))]" onClick={e => e.stopPropagation()}>
                <div className={`h-32 rounded-t-2xl flex items-center justify-center text-6xl ${style.bgColor}`}>
                    {style.icon}
                </div>
                <button onClick={onClose} className="absolute top-4 left-4 bg-black/10 dark:bg-white/10 p-2 rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="p-6">
                    <h2 className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">{lesson.subject}</h2>
                    <p className="text-lg text-[hsl(var(--color-text-secondary))] font-medium">{lesson.teacher}</p>
                    <div className="my-4 space-y-2 text-md">
                        <p><span className="font-semibold">🗓️ اليوم:</span> {lesson.day}</p>
                        <p><span className="font-semibold">🕒 التوقيت:</span> {lesson.time}</p>
                        <p><span className="font-semibold">📍 القاعة:</span> {lesson.hall}</p>
                        {lesson.notes && <p><span className="font-semibold">📝 ملاحظات:</span> {lesson.notes}</p>}
                    </div>
                    <div className="bg-[hsl(var(--color-background))] p-3 rounded-lg flex justify-between items-center">
                        <span className="font-semibold">الحجوزات</span>
                        <div className="flex items-center gap-2">
                             <div className="w-24 bg-black/10 dark:bg-white/10 rounded-full h-2.5">
                                <div className={`${style.progressBarClass} h-2.5 rounded-full`} style={{ width: `${((lesson.bookedCount || 0) / (lesson.capacity || 1)) * 100}%` }}></div>
                            </div>
                            <span>{lesson.bookedCount} / {lesson.capacity}</span>
                        </div>
                    </div>
                     <button 
                        onClick={() => onBook(lesson)}
                        disabled={isBooked || isFull}
                        className={`mt-4 w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 text-lg
                            ${isBooked ? 'bg-yellow-500 text-white cursor-default' : 
                            isFull ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 
                            'bg-[hsl(var(--color-primary))] hover:opacity-90 text-white'}`}
                    >
                        {isBooked ? '⏳ تم إرسال الطلب' : isFull ? '❌ مكتمل العدد' : '📌 إرسال طلب حجز'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DailyScheduleBar: React.FC<{ lessons: Lesson[], onLessonClick: (lesson: Lesson) => void }> = ({ lessons, onLessonClick }) => (
    <div className="flex space-x-4 space-x-reverse overflow-x-auto pb-4 -mx-4 px-4">
        {lessons.length > 0 ? lessons.map(lesson => {
             const style = getSubjectStyle(lesson.subject);
            return (
                <button key={lesson.id} onClick={() => onLessonClick(lesson)} className={`flex-shrink-0 w-56 p-4 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 text-right ${style.bgColor}`}>
                    <span className="text-2xl">{style.icon}</span>
                    <h4 className="font-bold text-[hsl(var(--color-text-primary))] mt-2">{lesson.subject}</h4>
                    <p className="text-sm text-[hsl(var(--color-text-secondary))]">{lesson.time}</p>
                </button>
            )
        }) : <p className="text-center text-[hsl(var(--color-text-secondary))] w-full">لا توجد حصص اليوم. استمتع بيومك!</p>}
    </div>
);

const TeacherIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const TimeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;

const UpcomingWeekSchedule: React.FC<{ lessons: Lesson[], onLessonClick: (lesson: Lesson) => void, bookedLessonIds: string[] }> = ({ lessons, onLessonClick, bookedLessonIds }) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const todayName = new Date().toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long' });
    const todayIndex = days.indexOf(todayName);
    const orderedDays = todayIndex !== -1 ? [...days.slice(todayIndex + 1), ...days.slice(0, todayIndex + 1)] : days;

    return (
        <div className="flex space-x-6 space-x-reverse overflow-x-auto pb-4 -mx-6 px-6">
            {orderedDays.map((day, dayIndex) => {
                const dayLessons = lessons.filter(l => l.day === day).sort((a,b) => a.time.localeCompare(b.time));
                if (dayLessons.length === 0) return null;

                return (
                    <div key={day} className="flex-shrink-0 w-72 md:w-80 h-[50vh] flex flex-col bg-[hsl(var(--color-surface))] rounded-2xl shadow-xl border border-[hsl(var(--color-border))] overflow-hidden animate-fade-in-up" style={{ animationDelay: `${dayIndex * 150}ms` }}>
                        <div className="p-4 border-b-2 border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))]">
                            <h3 className="text-2xl font-bold text-center text-[hsl(var(--color-primary))]">{day}</h3>
                        </div>
                        <div className="p-2 md:p-4 space-y-3 flex-grow overflow-y-auto">
                            {dayLessons.map((lesson, lessonIndex) => {
                                const style = getSubjectStyle(lesson.subject);
                                const isBooked = bookedLessonIds.includes(lesson.id);
                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => onLessonClick(lesson)}
                                        className={`w-full text-right p-3 rounded-xl transition-all duration-300 border-2 hover:shadow-lg hover:border-[hsl(var(--color-primary))]
                                            ${isBooked ? 'bg-yellow-400/10 border-yellow-400' : 'bg-[hsl(var(--color-background))] border-transparent'}`}
                                        style={{ animation: `fadeIn-up 0.5s ${(dayIndex * 150) + (lessonIndex * 80)}ms backwards cubic-bezier(0.25, 1, 0.5, 1)` }}
                                    >
                                        <div className="flex items-center gap-3 mb-2.5">
                                            <span className="text-3xl p-2 rounded-lg" style={{ backgroundColor: `hsla(var(--color-primary), 0.1)` }}>{style.icon}</span>
                                            <h4 className="text-lg font-bold text-[hsl(var(--color-text-primary))] truncate">{lesson.subject}</h4>
                                        </div>
                                        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-sm text-[hsl(var(--color-text-secondary))] items-center">
                                            <TeacherIcon />
                                            <span className="truncate">{lesson.teacher}</span>
                                            
                                            <TimeIcon />
                                            <span>{lesson.time}</span>
                                            
                                            <LocationIcon />
                                            <span className="truncate">{lesson.hall}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


const Announcements: React.FC<{ posts: Post[], onNavigate: (page: Page) => void; }> = ({ posts, onNavigate }) => (
    <div className="space-y-6">
        {posts.filter(p => p.status === 'published').slice(0, 2).map(post => (
            <div key={post.id} className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg overflow-hidden border border-[hsl(var(--color-border))]">
                {post.imageUrls && post.imageUrls.length > 0 && <img src={post.imageUrls[0]} alt="Announcement" className="w-full h-48 object-cover" />}
                <div className="p-5">
                    <h3 className="font-bold text-xl text-[hsl(var(--color-text-primary))]">{post.title}</h3>
                    <p className="text-sm text-[hsl(var(--color-text-secondary))] mb-2">{post.author} - {post.timestamp}</p>
                    <p className="text-[hsl(var(--color-text-primary))] text-lg line-clamp-2">{post.content}</p>
                </div>
            </div>
        ))}
        <button onClick={() => onNavigate('news-board')} className="w-full text-center py-3 font-semibold text-[hsl(var(--color-primary))] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
            عرض كل الإعلانات...
        </button>
    </div>
);

const TripsSection: React.FC<{ trips: Trip[], onNavigate: (page: Page) => void; }> = ({ trips, onNavigate }) => (
    <div className="space-y-6">
        {trips.slice(0, 2).map(trip => (
            <div key={trip.id} className="relative rounded-2xl overflow-hidden shadow-lg group">
                <img src={trip.imageUrls[0]} alt={trip.title} className="w-full h-60 object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 right-0 p-5 text-white">
                    <h3 className="text-2xl font-bold">{trip.title}</h3>
                    <p className="text-sm opacity-90 mt-1 line-clamp-1">{trip.description}</p>
                    <p className="text-xs mt-2 font-semibold bg-yellow-400 text-black inline-block px-2 py-1 rounded">{trip.date}</p>
                </div>
            </div>
        ))}
        <button onClick={() => onNavigate('trips')} className="w-full text-center py-3 font-semibold text-[hsl(var(--color-primary))] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
            عرض كل الرحلات...
        </button>
    </div>
);

interface HomePageProps {
    user: User;
    lessons: Lesson[];
    posts: Post[];
    trips: Trip[];
    onNavigate: (page: Page) => void;
    bookings: Booking[];
    onCreateBooking: (lesson: Lesson, type: 'حصة') => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, lessons, posts, trips, onNavigate, bookings, onCreateBooking }) => {
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    
    const userBookedLessonIds = useMemo(() => 
        bookings.filter(b => b.studentId === user.id && b.serviceType === 'حصة').map(b => b.serviceId),
        [bookings, user.id]
    );
    
    const userLessons = lessons.filter(l => l.grade === user.grade);
    const today = new Date().toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long' });
    const todayLessons = userLessons.filter(l => l.day === today);

    const handleLessonClick = (lesson: Lesson) => {
        setSelectedLesson(lesson);
    };

    const handleCloseModal = () => {
        setSelectedLesson(null);
    };
    
    const handleBookLesson = (lesson: Lesson) => {
        onCreateBooking(lesson, 'حصة');
        setSelectedLesson(null);
    };


    return (
        <div className="space-y-12 animate-fade-in-up">
            <div>
                <h1 className="text-4xl font-extrabold mb-1">مرحباً بك، {user.name.split(' ')[0]}!</h1>
                <p className="text-lg text-[hsl(var(--color-text-secondary))]">إليك ملخص يومك وأهم الأحداث القادمة.</p>
            </div>

            <section>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[hsl(var(--color-primary))]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                    <span>حصص اليوم</span>
                </h2>
                <DailyScheduleBar lessons={todayLessons} onLessonClick={handleLessonClick} />
            </section>
            
            <section>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[hsl(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span>الأسبوع القادم</span>
                </h2>
                <UpcomingWeekSchedule lessons={userLessons} onLessonClick={handleLessonClick} bookedLessonIds={userBookedLessonIds} />
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                     <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[hsl(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.584C18.354 5.286 18 6.633 18 8a6 6 0 01-6 6h-1.932a4.001 4.001 0 00-2.632 1.158z" /></svg>
                        <span>آخر الإعلانات</span>
                    </h2>
                    <Announcements posts={posts} onNavigate={onNavigate} />
                </div>
                <div>
                     <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[hsl(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>الرحلات القادمة</span>
                    </h2>
                    <TripsSection trips={trips} onNavigate={onNavigate} />
                </div>
            </div>
            
            {selectedLesson && (
                <LessonDetailsModal 
                    lesson={selectedLesson}
                    isBooked={userBookedLessonIds.includes(selectedLesson.id)}
                    onBook={handleBookLesson}
                    onClose={handleCloseModal} 
                />
            )}
        </div>
    );
};

export default HomePage;
