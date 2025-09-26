

import React, { useState, useMemo } from 'react';
import { User, Lesson, Page } from '../types.ts';
import { getSubjectStyle, normalizeArabic } from '../constants.ts';


const DailyScheduleBar: React.FC<{ lessons: Lesson[] }> = ({ lessons }) => (
    <div className="flex space-x-4 space-x-reverse overflow-x-auto pb-4 -mx-4 px-4">
        {lessons.length > 0 ? lessons.map((lesson, index) => {
             const style = getSubjectStyle(lesson.subject);
            return (
                <div 
                    key={lesson.id} 
                    className={`lesson-card flex-shrink-0 w-56 p-4 rounded-xl shadow-md text-right ${style.bgColor} lesson-card-cocktail lesson-card-ocean`}
                    style={{ '--card-index': index } as React.CSSProperties}
                    data-subject={lesson.subject}
                >
                    <div className="flex items-center gap-2">
                        <span className="lesson-card-icon text-2xl">{style.icon}</span>
                        <h4 className="lesson-card-subject font-bold text-[hsl(var(--color-text-primary))] mt-2">{lesson.subject}</h4>
                    </div>
                    <p className="lesson-card-details text-sm text-[hsl(var(--color-text-secondary))]">{lesson.time}</p>
                </div>
            )
        }) : <p className="text-center text-[hsl(var(--color-text-secondary))] w-full">لا توجد حصص اليوم. استمتع بيومك!</p>}
    </div>
);

const TeacherIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const TimeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;

const UpcomingWeekSchedule: React.FC<{ lessons: Lesson[] }> = ({ lessons }) => {
    const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    const todayName = new Date().toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long' });
    const todayIndex = days.indexOf(todayName);

    // Show the next 6 days, starting from tomorrow. Today is already in its own section.
    const orderedDays = todayIndex !== -1 
        ? [...days.slice(todayIndex + 1), ...days.slice(0, todayIndex)] 
        : days;

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
                                return (
                                    <div
                                        key={lesson.id}
                                        className={`lesson-card w-full text-right p-3 rounded-xl transition-all duration-300 border-2 bg-[hsl(var(--color-background))] border-transparent lesson-card-cocktail lesson-card-ocean`}
                                        style={{ 
                                            animation: `fadeIn-up 0.5s ${(dayIndex * 150) + (lessonIndex * 80)}ms backwards cubic-bezier(0.25, 1, 0.5, 1)`,
                                            '--card-index': dayIndex * 5 + lessonIndex
                                        } as React.CSSProperties}
                                        data-subject={lesson.subject}
                                    >
                                        <div className="flex items-center gap-3 mb-2.5">
                                            <span className="lesson-card-icon text-3xl p-2 rounded-lg" style={{ backgroundColor: `hsla(var(--color-primary), 0.1)` }}>{style.icon}</span>
                                            <h4 className="lesson-card-subject text-lg font-bold text-[hsl(var(--color-text-primary))] truncate">{lesson.subject}</h4>
                                        </div>
                                        <div className="lesson-card-details grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-sm text-[hsl(var(--color-text-secondary))] items-center">
                                            <TeacherIcon />
                                            <span className="truncate">{lesson.teacher}</span>
                                            
                                            <TimeIcon />
                                            <span>{lesson.time}</span>
                                            
                                            <LocationIcon />
                                            <span className="truncate">{lesson.hall}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

interface HomePageProps {
    user: User;
    lessons: Lesson[];
    onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, lessons, onNavigate }) => {
    const userLessons = useMemo(() => {
        const normalizedUserGrade = normalizeArabic(user.grade);
        return lessons.filter(l => normalizeArabic(l.grade) === normalizedUserGrade);
    }, [lessons, user.grade]);
    
    const today = new Date().toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long' });
    const todayLessons = userLessons.filter(l => l.day === today);

    return (
        <div className="space-y-12 animate-fade-in-up">
            <div>
                <h1 className="text-4xl font-extrabold mb-1">مرحباً بك، {user.name.split(' ')[0]}!</h1>
                <p className="text-lg text-[hsl(var(--color-text-secondary))]">إليك ملخص يومك وأهم الأحداث القادمة.</p>
            </div>

            <section>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[hsl(var(--color-primary))]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002 2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                    <span>حصص اليوم</span>
                </h2>
                <DailyScheduleBar lessons={todayLessons} />
            </section>

            <section>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[hsl(var(--color-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span>الأسبوع القادم</span>
                </h2>
                <UpcomingWeekSchedule lessons={userLessons} />
            </section>
        </div>
    );
};

export default HomePage;