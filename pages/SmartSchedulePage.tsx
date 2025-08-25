import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Lesson, ScheduleItem } from '../types.ts';
import { MOCK_SUBJECTS } from '../constants.ts';
import { generateSmartSchedule } from '../services/geminiService.ts';

const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// New item styles inspired by the user's image
const itemStyles: Record<ScheduleItem['type'], { bg: string; text: string; icon: string; border: string; checkbox: string; dot: string; }> = {
    study:    { bg: 'bg-[#E3F2FD]', border: 'border-[#42A5F5]', text: 'text-[#0D47A1]', icon: '📚', checkbox: 'bg-[#90CAF9] border-[#42A5F5]', dot: 'bg-blue-400' },
    break:    { bg: 'bg-[#E8F5E9]', border: 'border-[#66BB6A]', text: 'text-[#1B5E20]', icon: '☕', checkbox: 'bg-[#A5D6A7] border-[#66BB6A]', dot: 'bg-green-400' },
    lesson:   { bg: 'bg-[#FFF3E0]', border: 'border-[#FFB74D]', text: 'text-[#E65100]', icon: '🏫', checkbox: 'bg-[#FFCC80] border-[#FFB74D]', dot: 'bg-orange-400' },
    sleep:    { bg: 'bg-[#EDE7F6]', border: 'border-[#9575CD]', text: 'text-[#311B92]', icon: '😴', checkbox: 'bg-[#B39DDB] border-[#9575CD]', dot: 'bg-indigo-400' },
    personal: { bg: 'bg-[#F3E5F5]', border: 'border-[#CE93D8]', text: 'text-[#4A148C]', icon: '🧘', checkbox: 'bg-[#E1BEE7] border-[#CE93D8]', dot: 'bg-purple-400' },
};

const motivationalTips = [
    "ابدأ بالمادة الأصعب أول اليوم، فعقلك في ذروة نشاطه.",
    "استخدم تقنية Pomodoro: 25 دقيقة تركيز ثم 5 دقائق راحة لإنتاجية قصوى.",
    "كل ساعة تذاكرها اليوم هي خطوة أقرب لحلمك غدًا.",
    "لا تنسَ شرب الماء، فالدماغ يحتاج إلى ترطيب ليعمل بكفاءة.",
    "المراجعة السريعة قبل النوم تساعد على تثبيت المعلومات بشكل أفضل.",
];

const timeToMinutes = (time: string): number => {
    if (!time || !time.includes(':')) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const GamificationStats: React.FC<{ schedule: ScheduleItem[] }> = ({ schedule }) => {
    const { completedStudyMinutes, totalStudyMinutes, points, level, studyProgress } = useMemo(() => {
        const completedMins = schedule
            .filter(item => item.type === 'study' && item.isCompleted)
            .reduce((total, item) => total + (timeToMinutes(item.end) - timeToMinutes(item.start)), 0);
        const totalMins = schedule
            .filter(item => item.type === 'study')
            .reduce((total, item) => total + (timeToMinutes(item.end) - timeToMinutes(item.start)), 0);
            
        const pts = Math.floor(completedMins / 6); // 10 points per hour
        let lvl = { name: 'مبتدئ 🌱', current: 0, next: 50, progress: pts / 50 };
        if (pts >= 50) lvl = { name: 'مجتهد 🧠', current: 50, next: 150, progress: (pts - 50) / 100 };
        if (pts >= 150) lvl = { name: 'محترف 🚀', current: 150, next: 300, progress: (pts - 150) / 150 };
        if (pts >= 300) lvl = { name: 'أسطورة 👑', current: 300, next: Infinity, progress: 1 };
        
        const prog = totalMins > 0 ? (completedMins / totalMins) * 100 : 0;

        return { completedStudyMinutes: completedMins, totalStudyMinutes: totalMins, points: pts, level: lvl, studyProgress: prog };
    }, [schedule]);

    return (
        <div className="bg-[hsl(var(--color-surface))] p-4 rounded-2xl shadow-lg border border-[hsl(var(--color-border))]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                    <p className="font-bold text-lg">🎯 إنجاز اليوم</p>
                    <p className="text-2xl font-bold text-[hsl(var(--color-primary))]">{Math.round(studyProgress)}%</p>
                    <p className="text-xs text-[hsl(var(--color-text-secondary))]">{Math.round(completedStudyMinutes)}/{totalStudyMinutes} دقيقة مذاكرة</p>
                </div>
                <div>
                    <p className="font-bold text-lg">🏆 نقاطك</p>
                    <p className="text-2xl font-bold text-[hsl(var(--color-primary))]">{points}</p>
                    <p className="text-xs text-[hsl(var(--color-text-secondary))]">نقطة خبرة</p>
                </div>
                <div>
                    <p className="font-bold text-lg">✨ مستواك</p>
                    <p className="text-2xl font-bold text-[hsl(var(--color-primary))]">{level.name}</p>
                    <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 mt-1"><div className="bg-[hsl(var(--color-primary))] h-1.5 rounded-full" style={{width: `${level.progress * 100}%`}}></div></div>
                </div>
            </div>
        </div>
    );
};


const SmartSchedulePage: React.FC<{ user: User, onUserUpdate: (user: User) => void, lessons: Lesson[] }> = ({ user, onUserUpdate, lessons }) => {
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPrefs, setShowPrefs] = useState(true);
    const [studySubjects, setStudySubjects] = useState<string[]>([]);
    const [prefs, setPrefs] = useState({ studyHours: 4, wakeTime: '07:00', sleepTime: '23:00' });
    
    const todayName = dayNames[new Date().getDay()];
    
    const handleToggleComplete = useCallback((itemId: string) => {
        setSchedule(prev => prev.map(item => item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item));
    }, []);

    const handleGenerate = async () => {
        if (studySubjects.length === 0) {
            alert('الرجاء اختيار مادة واحدة على الأقل للمذاكرة.');
            return;
        }
        setIsLoading(true);
        setShowPrefs(false);
        const lessonsForToday = lessons.filter(l => l.day === todayName && l.grade === user.grade);
        const generatedSchedule = await generateSmartSchedule(user, lessonsForToday, studySubjects, prefs);
        setSchedule(generatedSchedule.map(item => ({...item, ...item, isCompleted: item.isCompleted || false})));
        setIsLoading(false);
    };
    
    const randomTip = useMemo(() => motivationalTips[Math.floor(Math.random() * motivationalTips.length)], []);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">🗓️ الجدول الذكي</h1>
                    <p className="text-lg text-[hsl(var(--color-text-secondary))]">مرحباً {user.name.split(' ')[0]}، إليك خطة يوم {todayName}.</p>
                </div>
                <button onClick={() => setShowPrefs(p => !p)} className="bg-[hsl(var(--color-surface))] hover:bg-black/5 dark:hover:bg-white/5 font-bold py-2 px-4 rounded-lg flex items-center gap-2 border border-[hsl(var(--color-border))]">
                    {showPrefs ? 'إخفاء الإعدادات' : '⚙️ إظهار الإعدادات'}
                </button>
            </div>

            {showPrefs && (
                <div className="bg-[hsl(var(--color-surface))] p-6 rounded-2xl shadow-lg border border-[hsl(var(--color-border))] space-y-4 animate-fade-in-down">
                    <h2 className="text-xl font-bold">حدد تفضيلاتك لليوم</h2>
                    <div>
                        <label className="font-semibold block mb-2">المواد التي تريد مذاكرتها اليوم:</label>
                        <div className="flex flex-wrap gap-2">
                            {MOCK_SUBJECTS.map(s => (
                                <button key={s} onClick={() => setStudySubjects(p => p.includes(s) ? p.filter(i => i !== s) : [...p, s])} className={`px-3 py-1 rounded-full text-sm font-semibold border-2 transition-all ${studySubjects.includes(s) ? 'bg-[hsl(var(--color-primary))] text-white border-transparent' : 'bg-transparent border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))]'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                         <div><label className="font-semibold">ساعات المذاكرة ({prefs.studyHours})</label><input type="range" min="1" max="8" value={prefs.studyHours} onChange={e => setPrefs(p => ({...p, studyHours: +e.target.value}))} className="w-full mt-1"/></div>
                         <div><label className="font-semibold">وقت الاستيقاظ</label><input type="time" value={prefs.wakeTime} onChange={e => setPrefs(p => ({...p, wakeTime: e.target.value}))} className="w-full mt-1 p-2 rounded-md bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))]"/></div>
                         <div><label className="font-semibold">وقت النوم</label><input type="time" value={prefs.sleepTime} onChange={e => setPrefs(p => ({...p, sleepTime: e.target.value}))} className="w-full mt-1 p-2 rounded-md bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))]"/></div>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg text-lg disabled:bg-gray-400 transition-colors shadow-[0_4px_14px_0_rgba(34,197,94,0.35)]">
                        {isLoading ? 'جاري التوليد...' : '🚀 توليد الجدول'}
                    </button>
                </div>
            )}
            
            {isLoading && <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--color-primary))] mx-auto"></div><p className="mt-4 font-semibold">يقوم الذكاء الاصطناعي بإعداد جدولك...</p></div>}
            
            {!isLoading && schedule.length === 0 && !showPrefs && (
                 <div className="text-center p-10 bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))]">
                    <p className="text-xl font-bold">لم يتم توليد جدول بعد.</p>
                    <p className="text-[hsl(var(--color-text-secondary))] mt-2">افتح لوحة الإعدادات وابدأ!</p>
                </div>
            )}

            {!isLoading && schedule.length > 0 && (
                 <div className="space-y-6">
                    <GamificationStats schedule={schedule} />
                    
                    <div className="max-w-2xl mx-auto">
                        <div className="relative pr-16 py-4">
                            <div className="absolute top-0 bottom-0 right-8 w-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                            
                            {schedule.map((item, index) => {
                                const style = itemStyles[item.type];
                                return (
                                <div key={item.id} className="flex items-start gap-4 mb-2">
                                    {/* Timeline Dot */}
                                    <div className={`mt-1.5 w-5 h-5 rounded-full z-10 flex-shrink-0 border-4 border-[hsl(var(--color-surface))] ${style.dot}`}></div>
                                    
                                    {/* Card Content */}
                                    <div className="flex-grow">
                                        <div className={`relative flex items-center gap-4 rounded-2xl p-4 shadow-sm transition-opacity duration-500 ${style.bg} border-r-4 ${style.border} ${item.isCompleted ? 'opacity-50' : ''}`}>
                                            <span className="text-2xl">{style.icon}</span>
                                            <div className="flex-grow">
                                                <p className={`font-bold ${style.text} ${item.isCompleted ? 'line-through' : ''}`}>{item.title}</p>
                                                <p className={`text-sm ${style.text}/80`}>{item.start} - {item.end}</p>
                                            </div>
                                             <button 
                                                onClick={() => handleToggleComplete(item.id)}
                                                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0
                                                    ${item.isCompleted ? `${style.checkbox} text-white` : 'bg-transparent border-gray-400'}`}
                                                aria-label={`Mark ${item.title} as ${item.isCompleted ? 'incomplete' : 'complete'}`}
                                            >
                                                {item.isCompleted && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="bg-[hsl(var(--color-surface))] p-4 rounded-2xl shadow-lg border border-[hsl(var(--color-border))]">
                        <h3 className="font-bold text-lg mb-2 text-center">💡 نصيحة اليوم</h3>
                        <p className="text-sm text-center text-[hsl(var(--color-text-secondary))]">{randomTip}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartSchedulePage;
