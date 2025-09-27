

import React, { useState, useMemo } from 'react';
import { User, Lesson } from '../types.ts';
import { getSubjectStyle, normalizeArabic } from '../constants.ts';
import { useIcons } from '../contexts/IconContext.tsx';
import IconDisplay from '../components/common/IconDisplay.tsx';

interface FullSchedulePageProps {
  user: User;
  lessons: Lesson[];
}

const FullSchedulePage: React.FC<FullSchedulePageProps> = ({ user, lessons }) => {
    const [showMyGradeOnly, setShowMyGradeOnly] = useState(false);
    const { iconSettings } = useIcons();
    
    const daysOfWeek = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

    const filteredLessons = useMemo(() => {
        const sorted = [...lessons].sort((a, b) => a.time.localeCompare(b.time, 'ar-EG-u-nu-latn'));
        if (showMyGradeOnly) {
            const normalizedUserGrade = normalizeArabic(user.grade);
            if (!normalizedUserGrade) return [];

            return sorted.filter(lesson => {
                 const normalizedLessonGrade = normalizeArabic(lesson.grade);
                 if (!normalizedLessonGrade) return false;
                 // Use flexible matching consistent with HomePage
                 return normalizedUserGrade.includes(normalizedLessonGrade) || normalizedLessonGrade.includes(normalizedUserGrade);
            });
        }
        return sorted;
    }, [lessons, showMyGradeOnly, user.grade]);

    const lessonsByDay = useMemo(() => {
        return filteredLessons.reduce((acc, lesson) => {
            (acc[lesson.day] = acc[lesson.day] || []).push(lesson);
            return acc;
        }, {} as Record<string, Lesson[]>);
    }, [filteredLessons]);
    
    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                 <h1 className="text-4xl font-extrabold mb-2 text-[hsl(var(--color-text-primary))]">جدول الحصص الكامل</h1>
                 <p className="text-lg text-[hsl(var(--color-text-secondary))]">استعرض جميع الحصص المتاحة خلال الأسبوع.</p>
            </div>

            <div className="bg-[hsl(var(--color-surface))] p-2 rounded-xl flex items-center gap-2 max-w-md border border-[hsl(var(--color-border))] shadow-sm">
                <button 
                    onClick={() => setShowMyGradeOnly(false)}
                    className={`w-full text-center py-2 px-4 font-semibold rounded-lg transition-all duration-300 ${!showMyGradeOnly ? 'bg-[hsl(var(--color-primary))] text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                    عرض كل الحصص
                </button>
                <button 
                    onClick={() => setShowMyGradeOnly(true)}
                    className={`w-full text-center py-2 px-4 font-semibold rounded-lg transition-all duration-300 ${showMyGradeOnly ? 'bg-[hsl(var(--color-primary))] text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                    حصص صفي فقط
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {daysOfWeek.map((day, dayIndex) => {
                    const dayLessons = lessonsByDay[day] || [];
                    return (
                        <div key={day} className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))] overflow-hidden flex flex-col">
                            <h2 className="text-2xl font-bold p-4 text-center text-white bg-gradient-to-br from-[hsl(var(--color-primary))] to-blue-500/80">
                                {day}
                            </h2>
                            <div className={`p-3 space-y-2 flex-grow transition-colors duration-300 ${showMyGradeOnly ? 'bg-[hsl(var(--color-primary)/0.05)]' : ''}`}>
                                {dayLessons.length > 0 ? (
                                    dayLessons.map((lesson, lessonIndex) => {
                                        const style = getSubjectStyle(lesson.subject, iconSettings);
                                        const isMyGrade = normalizeArabic(lesson.grade) === normalizeArabic(user.grade);
                                        return (
                                            <div 
                                                key={lesson.id} 
                                                className={`lesson-card p-3 rounded-xl shadow-sm transition-all duration-300 border-l-4 bg-[hsl(var(--color-background))] lesson-card-cocktail lesson-card-ocean ${isMyGrade ? 'border-[hsl(var(--color-primary))]' : 'border-[hsl(var(--color-border))]'}`}
                                                style={{ '--card-index': dayIndex * dayLessons.length + lessonIndex } as React.CSSProperties}
                                                data-subject={lesson.subject}
                                            >
                                                <div className="flex justify-between items-start gap-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-[hsl(var(--color-text-primary))] flex items-center gap-2">
                                                            <IconDisplay value={style.icon} fallback="📚" className="w-6 h-6 lesson-card-icon" />
                                                            <span className="lesson-card-subject">{lesson.subject}</span>
                                                        </h3>
                                                        <div className="lesson-card-details">
                                                          <p className="text-sm text-[hsl(var(--color-text-secondary))] mt-1">{lesson.teacher}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-left flex-shrink-0">
                                                        <p className="font-semibold text-base text-[hsl(var(--color-text-primary))]">{lesson.time}</p>
                                                        <p className="text-xs text-[hsl(var(--color-text-secondary))]">{lesson.hall}</p>
                                                    </div>
                                                </div>
                                                 {!showMyGradeOnly && (
                                                    <div className="mt-2 pt-2 border-t border-[hsl(var(--color-border))]">
                                                         <p className={`text-xs font-medium ${isMyGrade ? 'text-[hsl(var(--color-primary))]' : 'text-[hsl(var(--color-text-secondary))]'}`}>{lesson.grade}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex items-center justify-center h-full text-center py-10">
                                        <p className="text-lg font-semibold text-[hsl(var(--color-text-secondary))]">لا توجد حصص في هذا اليوم</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredLessons.length === 0 && (
                 <div className="text-center py-20 bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))]">
                    <p className="text-2xl font-bold">لا توجد حصص تطابق هذا الفلتر.</p>
                    <p className="text-[hsl(var(--color-text-secondary))] mt-2">جرّب اختيار فلتر مختلف.</p>
                </div>
            )}
        </div>
    );
};

export default FullSchedulePage;