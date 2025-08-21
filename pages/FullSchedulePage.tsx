import React, { useState, useMemo } from 'react';
import { User, Lesson } from '../types';

// Enhanced styles to cover all subjects for consistency
const subjectStyles: Record<string, { icon: string; color: string; bgColor: string }> = {
    'فيزياء': { icon: '⚛️', color: 'blue', bgColor: 'bg-blue-500/10 border-blue-500/20' },
    'كيمياء': { icon: '🧪', color: 'green', bgColor: 'bg-green-500/10 border-green-500/20' },
    'لغة عربية': { icon: '📖', color: 'red', bgColor: 'bg-red-500/10 border-red-500/20' },
    'رياضيات': { icon: '➗', color: 'purple', bgColor: 'bg-purple-500/10 border-purple-500/20' },
    'أحياء': { icon: '🧬', color: 'teal', bgColor: 'bg-teal-500/10 border-teal-500/20' },
    'جيولوجيا': { icon: '🌍', color: 'orange', bgColor: 'bg-orange-500/10 border-orange-500/20' },
    'لغة إنجليزية': { icon: '🇬🇧', color: 'indigo', bgColor: 'bg-indigo-500/10 border-indigo-500/20' },
    'تاريخ': { icon: '📜', color: 'amber', bgColor: 'bg-amber-500/10 border-amber-500/20' },
    'فلسفة وعلم نفس': { icon: '🤔', color: 'pink', bgColor: 'bg-pink-500/10 border-pink-500/20' },
    'لغة فرنسية': { icon: '🇫🇷', color: 'cyan', bgColor: 'bg-cyan-500/10 border-cyan-500/20' },
    'لغة إيطالية': { icon: '🇮🇹', color: 'lime', bgColor: 'bg-lime-500/10 border-lime-500/20' },
    'دين': { icon: '🕌', color: 'emerald', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
    'جغرافيا': { icon: '🗺️', color: 'sky', bgColor: 'bg-sky-500/10 border-sky-500/20'},
    'Default': { icon: '📚', color: 'gray', bgColor: 'bg-gray-500/10 border-gray-500/20' },
};

const getSubjectStyle = (subject: string) => {
    // Handles cases like "مراجعة فيزياء" by finding the subject key within the string
    const key = Object.keys(subjectStyles).find(s => subject.includes(s) && s !== 'Default') || 'Default';
    return subjectStyles[key];
};

interface FullSchedulePageProps {
  user: User;
  lessons: Lesson[];
}

const FullSchedulePage: React.FC<FullSchedulePageProps> = ({ user, lessons }) => {
    const [showMyGradeOnly, setShowMyGradeOnly] = useState(false);
    
    const daysOfWeek = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

    const filteredLessons = useMemo(() => {
        const sorted = [...lessons].sort((a, b) => a.time.localeCompare(b.time, 'ar-EG-u-nu-latn'));
        if (showMyGradeOnly) {
            return sorted.filter(lesson => lesson.grade === user.grade);
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
                {daysOfWeek.map(day => {
                    const dayLessons = lessonsByDay[day] || [];
                    return (
                        <div key={day} className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))] overflow-hidden flex flex-col">
                            <h2 className="text-2xl font-bold p-4 text-center text-white bg-gradient-to-br from-[hsl(var(--color-primary))] to-blue-500/80">
                                {day}
                            </h2>
                            <div className="p-4 space-y-3 flex-grow">
                                {dayLessons.length > 0 ? (
                                    dayLessons.map(lesson => {
                                        const style = getSubjectStyle(lesson.subject);
                                        const isMyGrade = lesson.grade === user.grade;
                                        return (
                                            <div 
                                                key={lesson.id} 
                                                className={`bg-[hsl(var(--color-background))] p-4 rounded-xl shadow-sm transition-all duration-300 border-l-4 ${isMyGrade ? 'border-[hsl(var(--color-primary))]' : 'border-transparent'}`}
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-[hsl(var(--color-text-primary))] flex items-center gap-3">
                                                            <span className="text-3xl">{style.icon}</span>
                                                            {lesson.subject}
                                                        </h3>
                                                        <p className="text-md text-[hsl(var(--color-text-secondary))] mt-1">{lesson.teacher}</p>
                                                    </div>
                                                    <div className="text-left flex-shrink-0">
                                                        <p className="font-semibold text-lg text-[hsl(var(--color-text-primary))]">{lesson.time}</p>
                                                        <p className="text-sm text-[hsl(var(--color-text-secondary))]">{lesson.hall}</p>
                                                    </div>
                                                </div>
                                                 {!showMyGradeOnly && (
                                                    <div className="mt-3 pt-2 border-t border-[hsl(var(--color-border))]">
                                                         <p className={`text-sm font-medium ${isMyGrade ? 'text-[hsl(var(--color-primary))]' : 'text-[hsl(var(--color-text-secondary))]'}`}>{lesson.grade}</p>
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
