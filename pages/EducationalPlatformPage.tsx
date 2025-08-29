import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { User, Page, PlatformTeacher, Lesson, ToastType, SubscriptionRequest } from '../types.ts';
import { getSubjectStyle, MOCK_SUBJECTS } from '../constants.ts';

// --- MOCK DATA & TYPES (As requested, temporary mock data based on screenshots) ---

interface PlatformContent {
    id: string;
    type: 'video' | 'summary' | 'exercise';
    title: string;
    duration?: string;
    isFree: boolean;
    url: string;
}

interface PlatformLesson {
    id: string;
    title: string;
    subtitle: string;
    availability: string;
    isFree: boolean;
    content: PlatformContent[];
    term: 'foundation' | 'first' | 'second';
    review?: boolean;
}

interface PlatformUnit {
    id: string;
    title: string;
    lessons: PlatformLesson[];
}

// Mock data for a single course, to be reused for any selected teacher for demonstration
const mockCourseData: PlatformUnit[] = [
    {
        id: 'unit_1',
        title: 'الباب (1) - الحملة الفرنسية علي مصر والشام (2 حصص)',
        lessons: [
            {
                id: 'l_u1_1',
                title: 'الحصة (1)',
                subtitle: 'الدرس (1) - الظروف التي سبقت الحملة الفرنسية',
                availability: 'حصة مجانية',
                isFree: true,
                term: 'first',
                content: [
                    { id: 'c_u1_1_1', type: 'video', title: 'مقدمة المنهج', duration: '3 دقيقة', isFree: true, url: 'https://mxdrop.to/e/4d7z679nu8499p' },
                    { id: 'c_u1_1_2', type: 'video', title: 'شرح - محاولات الفرنسيين وعوامل مجيء الحملة', duration: '16 دقيقة', isFree: true, url: '#' },
                    { id: 'c_u1_1_3', type: 'video', title: 'شرح - أحوال مصر قبل مجيء الحملة', duration: '21 دقيقة', isFree: true, url: '#' },
                    { id: 'c_u1_1_4', type: 'video', title: 'شرح - مجيء الحملة ومقاومة المصريين', duration: '25 دقيقة', isFree: true, url: '#' },
                ]
            },
            {
                id: 'l_u1_2',
                title: 'الحصة (2)',
                subtitle: 'الدرس (2+3) - الحملة الفرنسية مصر واثر الوجود الفرنسي',
                availability: 'سيكون متاح 30 أغسطس',
                isFree: false,
                term: 'first',
                content: []
            },
        ],
    },
    {
        id: 'review_1',
        title: 'مراجعة الباب الأول',
        lessons: [
             { id: 'l_rev_1', title: 'مراجعة شاملة - الباب الأول', subtitle: '', availability: 'سيكون متاح 6 سبتمبر', isFree: false, term: 'first', review: true, content: [] },
        ]
    },
    {
        id: 'unit_2',
        title: 'الباب (2) - بناء الدور الحديثة في مصر (5 حصص)',
        lessons: [
            { id: 'l_u2_1', title: 'الحصة (3)', subtitle: 'الدرس (1) - أحوال مصر بعد خروج الحملة الفرنسية وبروز شخصية محم...', availability: 'سيكون متاح 13 سبتمبر', isFree: false, term: 'first', content: [] },
            { id: 'l_u2_2', title: 'الحصة (4)', subtitle: 'الدرس (3) - مظاهر بناء الدولة الحديثة في عهد محمد علي', availability: 'سيكون متاح 20 سبتمبر', isFree: false, term: 'first', content: [] },
            { id: 'l_u2_3', title: 'الحصة (5)', subtitle: 'الدرس (4) - سياسية مصر الخارجية في عهد محمد ومحاولة الاستقلال ع...', availability: 'سيكون متاح 27 سبتمبر', isFree: false, term: 'first', content: [] },
            { id: 'l_u2_4', title: 'الحصة (6)', subtitle: 'الدرس (5) - أحوال مصر في عهد خلفاء محمد علي', availability: 'سيكون متاح 4 أكتوبر', isFree: false, term: 'first', content: [] },
        ]
    }
];


// Expanded mock data for teachers with grades
const MOCK_TEACHERS: (PlatformTeacher & { grades: string[] })[] = [
  // 3rd Secondary Teachers
  { id: '1', name: 'أ/ حسام العشيري', subject: 'لغة إنجليزية', image_url: 'https://i.pravatar.cc/150?u=hossam_ashiry', bio: '', grades: ['الصف الثالث الثانوي'] },
  { id: '2', name: 'أ/ محمود الحلو', subject: 'لغة فرنسية', image_url: 'https://i.pravatar.cc/150?u=mahmoud_helw', bio: '', grades: ['الصف الثالث الثانوي', 'الصف الثاني الثانوي'] },
  { id: '3', name: 'أ/ زكريا سيف الدين', subject: 'لغة عربية', image_url: 'https://i.pravatar.cc/150?u=zakaria_saif', bio: '', grades: ['الصف الثالث الثانوي'] },
  { id: '4', name: 'أ/ علي يوسف', subject: 'جغرافيا', image_url: 'https://i.pravatar.cc/150?u=ali_youssef', bio: '', grades: ['الصف الثالث الثانوي', 'الصف الأول الثانوي'] },
  { id: '5', name: 'أ/ محمد خليل', subject: 'تاريخ', image_url: 'https://i.pravatar.cc/150?u=mohamed_khalil', bio: '', grades: ['الصف الثالث الثانوي'] },
  { id: '6', name: 'أ/ محمد عبدالجواد', subject: 'فيزياء', image_url: 'https://i.pravatar.cc/150?u=abdelgwad', bio: '', grades: ['الصف الثالث الثانوي'] },
  { id: '7', name: 'أ/ محمد حامد', subject: 'كيمياء', image_url: 'https://i.pravatar.cc/150?u=hamed', bio: '', grades: ['الصف الثالث الثانوي'] },

  // 2nd Secondary Teachers
  { id: '8', name: 'أ/ محمد صالح', subject: 'أحياء', image_url: 'https://i.pravatar.cc/150?u=saleh', bio: '', grades: ['الصف الثاني الثانوي', 'الصف الأول الثانوي'] },
  { id: '9', name: 'أ/ تامر العربي', subject: 'لغة عربية', image_url: 'https://i.pravatar.cc/150?u=tamer_elaraby', bio: '', grades: ['الصف الثاني الثانوي'] },
  { id: '10', name: 'أ/ محمد الصاوي', subject: 'فلسفة وعلم نفس', image_url: 'https://i.pravatar.cc/150?u=mohamed_elsawy', bio: '', grades: ['الصف الثاني الثانوي'] },

  // 1st Secondary Teachers
  { id: '11', name: 'أ/ حلمي محمد', subject: 'تاريخ', image_url: 'https://i.pravatar.cc/150?u=helmy_mohamed', bio: '', grades: ['الصف الأول الثانوي'] },
  { id: '12', name: 'أ/ عبد الرحمن السيد', subject: 'رياضيات', image_url: 'https://i.pravatar.cc/150?u=abdelrahman', bio: '', grades: ['الصف الأول الثانوي', 'الصف الثاني الثانوي'] },
  { id: '13', name: 'أ/ إسلام اللحياني', subject: 'دين', image_url: 'https://i.pravatar.cc/150?u=islam_lehyani', bio: '', grades: ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'] },
  { id: '14', name: 'أ/ محمد أبو العطا', subject: 'جغرافيا', image_url: 'https://i.pravatar.cc/150?u=mohamed_abo_ata', bio: '', grades: ['الصف الأول الثانوي'] },

  // Preparatory School Teachers
  { id: '15', name: 'أ/ أحمد علي', subject: 'علوم', image_url: 'https://i.pravatar.cc/150?u=ahmed_ali', bio: '', grades: ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي'] },
  { id: '16', name: 'أ/ سارة حسن', subject: 'دراسات اجتماعية', image_url: 'https://i.pravatar.cc/150?u=sara_hassan', bio: '', grades: ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي'] },
  { id: '17', name: 'أ/ عمر خالد', subject: 'رياضيات', image_url: 'https://i.pravatar.cc/150?u=omar_khaled', bio: '', grades: ['الصف الثالث الإعدادي'] },
];


// --- Icons ---
const ClockIcon: React.FC = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PlayIcon: React.FC = () => <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const ChevronRightIcon: React.FC = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const CloseIcon: React.FC = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

// --- Reusable Components ---
function MainFilterTabs({ items, selected, onSelect }: { items: { key: string, label: string }[], selected: string, onSelect: (key: any) => void }) {
    return (
        <div className="bg-[hsl(var(--color-surface))] p-2 rounded-xl flex items-center gap-2 max-w-md mx-auto border border-[hsl(var(--color-border))] shadow-sm">
            {items.map(item => (
                <button
                    key={item.key}
                    onClick={() => onSelect(item.key)}
                    className={`w-full text-center py-2 px-4 font-semibold rounded-lg transition-all duration-300 ${
                        selected === item.key
                            ? 'bg-[hsl(var(--color-primary))] text-white shadow-md'
                            : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}

function FilterChips({ items, selected, onSelect, className = "" }: { items: { key: string, label: string }[], selected: string, onSelect: (key: string) => void, className?: string }) {
    return (
        <div className={`flex items-center gap-3 overflow-x-auto pb-2 ${className}`}>
            {items.map(item => (
                <button
                    key={item.key}
                    onClick={() => onSelect(item.key)}
                    className={`flex-shrink-0 text-center py-2 px-5 font-semibold rounded-full transition-all duration-300 text-sm ${
                        selected === item.key
                            ? 'bg-[hsl(var(--color-primary))] text-white'
                            : 'bg-[hsl(var(--color-background))] text-[hsl(var(--color-text-primary))] hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}


// --- Page Views ---

const DownloadContentView: React.FC<{ content: PlatformContent; onClose: () => void; }> = ({ content, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-sm border border-[hsl(var(--color-border))] text-center p-8 space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold">انتباه</h2>
                <p className="text-lg text-[hsl(var(--color-text-secondary))]">الملف "{content.title}" جاهز للتنزيل.</p>
                <div className="flex gap-4 pt-4">
                    <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold py-3 rounded-lg transition-colors">
                        إلغاء
                    </button>
                    <a 
                        href={content.url} 
                        download
                        onClick={onClose}
                        className="w-full bg-[hsl(var(--color-primary))] hover:opacity-90 text-white font-bold py-3 rounded-lg transition-colors block"
                    >
                        تحميل
                    </a>
                </div>
            </div>
        </div>
    );
};

const VideoPlayerView: React.FC<{ content: PlatformContent; onClose: () => void; }> = ({ content, onClose }) => {
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const [iframeKey, setIframeKey] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const refreshPlayer = () => {
        setIframeKey(prevKey => prevKey + 1);
    };

    const handleFullscreen = () => {
        iframeRef.current?.requestFullscreen().catch(err => {
            console.error("Failed to enter fullscreen:", err);
            alert("لا يمكن عرض الفيديو في وضع ملء الشاشة. يرجى المحاولة من خلال عناصر التحكم في المشغل نفسه.");
        });
    };
    
    const RefreshIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5m-5-2a9 9 0 0116.8-2.6M20 20v-5h-5m5 2a9 9 0 01-16.8 2.6" /></svg>;
    const FullscreenIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>;


    useEffect(() => {
        let finalUrl = '';
        try {
            const url = new URL(content.url);
            if (url.hostname.includes('dailymotion.com') || url.hostname.includes('dai.ly')) {
                const pathParts = url.pathname.split('/');
                const videoId = pathParts[pathParts.length - 1];
                if (videoId) {
                    finalUrl = `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`;
                }
            } else {
                finalUrl = content.url;
            }

            if (finalUrl) {
                setEmbedUrl(finalUrl);
            } else {
                throw new Error("Could not determine embed URL");
            }

        } catch (e) {
            console.error("Invalid video URL:", content.url, e);
            onClose();
        }
    }, [content.url, onClose]);

    if (!embedUrl) {
        return (
            <div className="fixed inset-0 bg-[hsl(var(--color-background))] z-50 flex items-center justify-center">
                <p>جاري تحميل الفيديو...</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[hsl(var(--color-background))] z-50 flex flex-col animate-fade-in-up">
            <header className="flex-shrink-0 bg-[hsl(var(--color-surface))] p-3 flex items-center justify-between shadow-sm border-b border-[hsl(var(--color-border))]">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                    <CloseIcon />
                </button>
                <h2 className="text-xl font-bold text-[hsl(var(--color-text-primary))] text-center flex-grow">{content.title}</h2>
                <div className="w-10"></div>
            </header>
            
            <div className="flex-grow flex flex-col items-center justify-center p-4 overflow-hidden">
                <div className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                    <iframe
                        ref={iframeRef}
                        key={iframeKey}
                        src={embedUrl}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        title={content.title}
                        sandbox="allow-scripts allow-presentation allow-same-origin"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};


function LessonDetailView({ lesson, onBack, onPlayVideo }: { lesson: PlatformLesson, onBack: () => void, onPlayVideo: (content: PlatformContent) => void }) {
    const contentTypes = useMemo(() => ['الكل', ...Array.from(new Set(lesson.content.map(c => c.type)))], [lesson.content]);
    const [filter, setFilter] = useState('الكل');
    const typeMap: Record<PlatformContent['type'], string> = { video: 'فيديوهات', summary: 'ملخصات', exercise: 'تمارين' };
    
    const filteredContent = useMemo(() => {
        if (filter === 'الكل') return lesson.content;
        return lesson.content.filter(c => c.type === filter);
    }, [lesson.content, filter]);

    return (
        <div className="animate-fade-in-up">
            <header className="bg-[hsl(var(--color-surface))] p-4 rounded-2xl shadow-lg border border-[hsl(var(--color-border))] mb-6">
                <button onClick={onBack} className="flex items-center gap-2 font-bold text-sm text-[hsl(var(--color-text-primary))] mb-4">
                    <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <span>العودة للكورس</span>
                </button>
                <div className="border-t border-[hsl(var(--color-border))] pt-4">
                    <h1 className="text-2xl font-bold mb-1">{lesson.subtitle}</h1>
                    <h2 className="text-lg text-[hsl(var(--color-text-secondary))]">{lesson.title}</h2>
                </div>
            </header>
            
            <div className="my-6">
                <FilterChips 
                    items={contentTypes.map(t => ({ key: t, label: typeMap[t as 'video'] || 'الكل' }))}
                    selected={filter}
                    onSelect={setFilter}
                />
            </div>
            <div className="space-y-4">
                {filteredContent.map((content, index) => (
                    <button 
                        key={content.id}
                        onClick={() => onPlayVideo(content)}
                        className="w-full bg-[hsl(var(--color-surface))] rounded-2xl p-4 flex items-center gap-4 border border-[hsl(var(--color-border))] transition-all hover:shadow-xl hover:border-[hsl(var(--color-primary))]"
                        style={{animation: `fadeIn-up 0.5s ${index * 100}ms backwards cubic-bezier(0.25, 1, 0.5, 1)`}}
                    >
                        <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <PlayIcon />
                        </div>
                        <div className="text-right flex-grow">
                            <h3 className="font-bold text-lg text-[hsl(var(--color-text-primary))]">{content.title}</h3>
                            {content.duration && <p className="text-sm text-[hsl(var(--color-text-secondary))] flex items-center gap-1 mt-1"><ClockIcon />{content.duration}</p>}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function CourseView({ teacher, onSelectLesson, onBack }: { teacher: PlatformTeacher, onSelectLesson: (lesson: PlatformLesson) => void, onBack: () => void }) {
    const [termFilter, setTermFilter] = useState<string>('الكل');

    const termFilters = [{ key: 'الكل', label: 'الكل' }, { key: 'first', label: 'الترم الأول' }, { key: 'second', label: 'الترم الثاني' }];
    const filteredUnits = useMemo(() => {
        if (termFilter === 'الكل') return mockCourseData;
        const foundationUnits = mockCourseData.filter(u => u.lessons.some(l => l.term === 'foundation'));
        const termUnits = mockCourseData
            .map(unit => ({ ...unit, lessons: unit.lessons.filter(l => l.term === termFilter) }))
            .filter(unit => unit.lessons.length > 0);
        return [...foundationUnits, ...termUnits];
    }, [termFilter]);
    
    return (
        <div className="animate-fade-in-up">
            <header className="bg-[hsl(var(--color-surface))] p-4 rounded-2xl shadow-lg border border-[hsl(var(--color-border))] mb-6 sticky top-24 z-10">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--color-text-secondary))]">
                        <button onClick={onBack} className="hover:underline">المدرسين</button>
                        <ChevronRightIcon />
                        <span className="text-[hsl(var(--color-text-primary))] font-bold">{teacher.subject} | {teacher.name}</span>
                    </div>
                </div>
                 <div className="mt-4 pt-4 border-t border-[hsl(var(--color-border))]">
                    <FilterChips items={termFilters} selected={termFilter} onSelect={setTermFilter} />
                 </div>
            </header>
            
            <div className="space-y-6">
                {filteredUnits.map((unit, unitIndex) => (
                    <div key={unit.id} style={{animation: `fadeIn-up 0.5s ${unitIndex * 150}ms backwards cubic-bezier(0.25, 1, 0.5, 1)`}}>
                        <h2 className="text-2xl font-bold mb-4">{unit.title}</h2>
                        <div className="space-y-3">
                            {unit.lessons.map(lesson => (
                                <button 
                                    key={lesson.id}
                                    onClick={() => onSelectLesson(lesson)}
                                    className="w-full p-4 bg-[hsl(var(--color-surface))] rounded-2xl flex items-center gap-4 text-right transition-all duration-300 border border-[hsl(var(--color-border))] hover:shadow-xl hover:border-[hsl(var(--color-primary))]"
                                >
                                    <div className="w-20 h-20 rounded-lg bg-[hsl(var(--color-background))] flex-shrink-0 flex items-center justify-center font-bold text-2xl text-[hsl(var(--color-text-secondary))]">
                                        {lesson.title.match(/\d+/)?.[0] || '★'}
                                    </div>
                                    <div className="flex-grow">
                                        {lesson.isFree && <p className="font-bold text-xs text-green-700 dark:text-green-400 mb-1 bg-green-500/20 px-2 py-0.5 rounded-full inline-block">حصة مجانية</p>}
                                        <p className="font-bold text-lg text-[hsl(var(--color-text-primary))] line-clamp-1">{lesson.title}</p>
                                        <p className="font-semibold text-md text-blue-600 dark:text-blue-400 line-clamp-2">{lesson.subtitle}</p>
                                        <div className="flex items-center gap-2 text-sm text-[hsl(var(--color-text-secondary))] mt-1">
                                            <ClockIcon />
                                            <span>{lesson.availability}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TeachersView({ onSelectTeacher, user }: { onSelectTeacher: (teacher: PlatformTeacher) => void; user: User }) {
    const teachersForGrade = useMemo(() => 
        MOCK_TEACHERS.filter(teacher => teacher.grades.includes(user.grade)), 
    [user.grade]);

    const subjectsForGrade = useMemo(() => 
        ['الكل', ...Array.from(new Set(teachersForGrade.map(t => t.subject)))], 
    [teachersForGrade]);

    const [subjectFilter, setSubjectFilter] = useState<string>('الكل');

    const filteredTeachers = useMemo(() => {
        if (subjectFilter === 'الكل') return teachersForGrade;
        return teachersForGrade.filter(t => t.subject === subjectFilter);
    }, [subjectFilter, teachersForGrade]);
    
    useEffect(() => {
        if (!subjectsForGrade.includes(subjectFilter)) {
            setSubjectFilter('الكل');
        }
    }, [subjectsForGrade, subjectFilter]);

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-center mb-6 text-[hsl(var(--color-text-primary))]">مدرسو {user.grade}</h1>
            <FilterChips items={subjectsForGrade.map(s => ({key: s, label: s}))} selected={subjectFilter} onSelect={setSubjectFilter} className="justify-center"/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {filteredTeachers.map((teacher, index) => {
                    const style = getSubjectStyle(teacher.subject);
                    const colorName = style.bgColor.match(/bg-([a-z]+)-/)?.[1];
                    const textColorClass = colorName ? `text-${colorName}-800 dark:text-${colorName}-300` : 'text-[hsl(var(--color-text-primary))]';
                    
                    return (
                        <button 
                            key={teacher.id} 
                            onClick={() => onSelectTeacher(teacher)}
                            className="w-full bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg p-4 flex items-center justify-between transform hover:-translate-y-1.5 transition-transform duration-300 border border-[hsl(var(--color-border))] hover:shadow-xl"
                            style={{animation: `fadeIn-up 0.5s ${index * 100}ms backwards cubic-bezier(0.25, 1, 0.5, 1)`}}
                        >
                            <div className="text-right">
                                <h2 className="text-xl font-bold text-[hsl(var(--color-text-primary))]">{teacher.name}</h2>
                                <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm font-semibold ${style.bgColor} ${textColorClass}`}>
                                    <span className="text-base">{style.icon}</span>
                                    <span className="text-current">{teacher.subject}</span>
                                </div>
                            </div>
                            <img src={teacher.image_url} alt={teacher.name} className="w-20 h-20 rounded-full object-cover"/>
                        </button>
                    )
                })}
            </div>
        </div>
    );
}

function ScheduleView({ lessons, user }: { lessons: Lesson[], user: User }) {
    const userLessons = useMemo(() => lessons.filter(l => l.grade === user.grade), [lessons, user.grade]);
    const todayName = new Date().toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long' });
    const todayLessons = userLessons.filter(l => l.day === todayName);

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6">جدولي الدراسي</h1>
            <div className="space-y-6">
                <div className="bg-[hsl(var(--color-surface))] p-6 rounded-2xl shadow-lg border border-[hsl(var(--color-border))]">
                    <h2 className="text-2xl font-bold mb-4">حصص اليوم ({todayName})</h2>
                    {todayLessons.length > 0 ? (
                        <div className="space-y-3">
                        {todayLessons.map(lesson => (
                             <div key={lesson.id} className="bg-[hsl(var(--color-background))] p-4 rounded-lg flex items-center justify-between">
                                 <div>
                                    <h3 className="font-bold text-lg">{lesson.subject}</h3>
                                    <p className="text-sm text-[hsl(var(--color-text-secondary))]">{lesson.teacher}</p>
                                 </div>
                                 <div className="font-semibold text-right">
                                    <p>{lesson.time}</p>
                                    <p className="text-sm text-[hsl(var(--color-text-secondary))]">{lesson.hall}</p>
                                 </div>
                             </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-center text-[hsl(var(--color-text-secondary))] py-4">لا توجد حصص مجدولة لك اليوم.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function SubscriptionView({ user, userPendingRequest, onCreateSubscriptionRequest, addToast }: { 
    user: User, 
    userPendingRequest: SubscriptionRequest | null,
    onCreateSubscriptionRequest: (requestData: Omit<SubscriptionRequest, 'id' | 'created_at' | 'status'>) => Promise<boolean>,
    addToast: (type: ToastType, title: string, message: string) => void;
}) {
    const [step, setStep] = useState<'selection' | 'payment'>('selection');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [duration, setDuration] = useState<1 | 3 | 6>(1);
    const [paymentPhone, setPaymentPhone] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isSubscribed = useMemo(() => user.subscription_end_date ? new Date(user.subscription_end_date) > new Date() : false, [user.subscription_end_date]);
    const endDate = useMemo(() => user.subscription_end_date ? new Date(user.subscription_end_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : null, [user.subscription_end_date]);
    
    const VODAFONE_CASH_NUMBER = '01012345678';
    const PRICE_PER_SUBJECT = 75;
    const ALL_SUBJECTS_DISCOUNT_PRICE = 400;
    const DURATION_DISCOUNTS = { 1: 1, 3: 0.9, 6: 0.8 };
    const DISCOUNT_CODES = { 'GEC10': 0.1, 'PROMO25': 0.25 };

    const { basePrice, finalPrice } = useMemo(() => {
        let price = 0;
        if (selectedSubjects.length === MOCK_SUBJECTS.length) {
            price = ALL_SUBJECTS_DISCOUNT_PRICE;
        } else {
            price = selectedSubjects.length * PRICE_PER_SUBJECT;
        }
        
        const base = price * duration * DURATION_DISCOUNTS[duration];
        
        const discountPercent = DISCOUNT_CODES[discountCode.toUpperCase() as keyof typeof DISCOUNT_CODES] || 0;
        const final = base * (1 - discountPercent);

        return { basePrice: Math.round(base), finalPrice: Math.round(final) };
    }, [selectedSubjects, duration, discountCode]);

    const handleNextStep = () => {
        if (selectedSubjects.length === 0) {
            addToast('warning', 'خطأ', 'الرجاء اختيار مادة واحدة على الأقل.');
            return;
        }
        setStep('payment');
    };

    const handleSubmitRequest = async () => {
        if (!paymentPhone.match(/^01[0125][0-9]{8}$/)) {
             addToast('warning', 'خطأ', 'الرجاء إدخال رقم هاتف صحيح (11 رقم).');
            return;
        }
        setIsLoading(true);
        const success = await onCreateSubscriptionRequest({
            student_id: user.id,
            student_name: user.name,
            selected_subjects: selectedSubjects,
            duration_months: duration,
            amount_paid: finalPrice,
            payment_phone: paymentPhone,
            discount_code: discountCode || undefined,
        });
        if (!success) {
             addToast('error', 'فشل الإرسال', 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.');
        }
        setIsLoading(false);
    };

    if (isSubscribed) {
        return (
            <div className="animate-fade-in-up max-w-2xl mx-auto text-center">
                <div className="bg-[hsl(var(--color-surface))] p-8 rounded-2xl shadow-2xl border border-[hsl(var(--color-border))]">
                    <p className="text-8xl mb-4">✅</p>
                    <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">أنت مشترك حاليًا!</h2>
                    <p className="text-lg text-[hsl(var(--color-text-secondary))] mt-2">
                        ينتهي اشتراكك في: <span className="font-bold text-[hsl(var(--color-text-primary))]">{endDate}</span>
                    </p>
                </div>
            </div>
        );
    }
    
    if (userPendingRequest) {
         return (
            <div className="animate-fade-in-up max-w-2xl mx-auto text-center">
                <div className="bg-[hsl(var(--color-surface))] p-8 rounded-2xl shadow-2xl border border-[hsl(var(--color-border))]">
                    <p className="text-8xl mb-4">⏳</p>
                    <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">طلبك قيد المراجعة</h2>
                    <p className="text-lg text-[hsl(var(--color-text-secondary))] mt-2">
                        لقد أرسلت طلب اشتراك بالفعل. سيتم تفعيل حسابك فور تأكيد عملية الدفع من قبل الإدارة.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up max-w-3xl mx-auto">
             <h1 className="text-3xl font-bold mb-6 text-center">الاشتراك في المنصة</h1>
             <div className="bg-[hsl(var(--color-surface))] p-8 rounded-2xl shadow-2xl border border-[hsl(var(--color-border))]">
                {step === 'selection' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold mb-3">1. اختر المواد</h2>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setSelectedSubjects(MOCK_SUBJECTS)} className="px-3 py-1.5 bg-blue-500 text-white rounded-full font-semibold text-sm">اختر الكل</button>
                                {MOCK_SUBJECTS.map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => setSelectedSubjects(p => p.includes(s) ? p.filter(i => i !== s) : [...p, s])} 
                                        className={`px-3 py-1.5 rounded-full font-semibold text-sm border-2 transition-colors ${selectedSubjects.includes(s) ? 'bg-[hsl(var(--color-primary))] border-[hsl(var(--color-primary))] text-white' : 'border-[hsl(var(--color-border))] bg-transparent'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-3">2. اختر المدة</h2>
                            <div className="flex bg-[hsl(var(--color-background))] p-1 rounded-xl gap-1">
                                <button onClick={() => setDuration(1)} className={`w-full py-2 font-bold rounded-lg ${duration === 1 ? 'bg-[hsl(var(--color-primary))] text-white shadow-sm' : ''}`}>شهر</button>
                                <button onClick={() => setDuration(3)} className={`w-full py-2 font-bold rounded-lg ${duration === 3 ? 'bg-[hsl(var(--color-primary))] text-white shadow-sm' : ''}`}>3 شهور (خصم 10%)</button>
                                <button onClick={() => setDuration(6)} className={`w-full py-2 font-bold rounded-lg ${duration === 6 ? 'bg-[hsl(var(--color-primary))] text-white shadow-sm' : ''}`}>ترم كامل (خصم 20%)</button>
                            </div>
                        </div>
                        <div className="bg-[hsl(var(--color-background))] p-4 rounded-xl text-center">
                            <p className="text-lg text-[hsl(var(--color-text-secondary))]">المبلغ الإجمالي</p>
                            <p className="text-4xl font-extrabold text-[hsl(var(--color-primary))]">{basePrice} ج.م</p>
                        </div>
                        <button onClick={handleNextStep} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg text-lg">
                            الانتقال للدفع
                        </button>
                    </div>
                )}
                {step === 'payment' && (
                    <div className="space-y-6">
                        <div>
                            <button onClick={() => setStep('selection')} className="text-sm font-semibold mb-4">&larr; العودة للاختيار</button>
                            <h2 className="text-xl font-bold mb-3">3. إتمام عملية الدفع</h2>
                            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-800 dark:text-orange-300 p-4 rounded-xl text-center">
                                <p>يرجى تحويل المبلغ الإجمالي إلى رقم فودافون كاش التالي:</p>
                                <p className="text-2xl font-bold my-2 tracking-widest">{VODAFONE_CASH_NUMBER}</p>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-3">4. تأكيد الدفع</h2>
                            <div className="space-y-4">
                                <div><label>الرقم الذي تم التحويل منه</label><input type="tel" value={paymentPhone} onChange={e => setPaymentPhone(e.target.value)} placeholder="01xxxxxxxxx" className="mt-1 w-full p-2 rounded-md bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))]"/></div>
                                <div><label>كود الخصم (إن وجد)</label><input type="text" value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="GEC10" className="mt-1 w-full p-2 rounded-md bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))]"/></div>
                            </div>
                        </div>
                        <div className="bg-[hsl(var(--color-background))] p-4 rounded-xl text-center">
                            <p className="text-lg text-[hsl(var(--color-text-secondary))]">المبلغ المطلوب دفعه</p>
                            <p className="text-4xl font-extrabold text-[hsl(var(--color-primary))]">{finalPrice} ج.م</p>
                            {basePrice !== finalPrice && <p className="text-sm text-green-600 line-through">كان {basePrice} ج.م</p>}
                        </div>
                         <button onClick={handleSubmitRequest} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg text-lg">
                            {isLoading ? 'جاري الإرسال...' : 'تأكيد عملية التحويل'}
                        </button>
                    </div>
                )}
             </div>
        </div>
    );
}

// --- Main Page Component ---
interface EducationalPlatformPageProps {
    user: User;
    onNavigate: (page: Page) => void;
    lessons: Lesson[];
    onUserUpdate: (user: User) => void;
    addToast: (type: ToastType, title: string, message: string) => void;
    userPendingRequest: SubscriptionRequest | null;
    onCreateSubscriptionRequest: (requestData: Omit<SubscriptionRequest, 'id' | 'created_at' | 'status'>) => Promise<boolean>;
}

const EducationalPlatformPage: React.FC<EducationalPlatformPageProps> = ({ user, onNavigate, lessons, onUserUpdate, addToast, userPendingRequest, onCreateSubscriptionRequest }) => {
    const [mainTab, setMainTab] = useState<'platform' | 'schedule' | 'subscription'>('platform');
    const [selectedTeacher, setSelectedTeacher] = useState<PlatformTeacher | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<PlatformLesson | null>(null);
    const [playingContent, setPlayingContent] = useState<PlatformContent | null>(null);
    const [downloadingContent, setDownloadingContent] = useState<PlatformContent | null>(null);
    
    const isSubscribed = useMemo(() => user.subscription_end_date ? new Date(user.subscription_end_date) > new Date() : false, [user.subscription_end_date]);

    const handleSelectTeacher = (teacher: PlatformTeacher) => setSelectedTeacher(teacher);
    const handleSelectLesson = (lesson: PlatformLesson) => {
        if (!lesson.isFree && !isSubscribed) {
             addToast('warning', 'محتوى حصري', 'هذا المحتوى للمشتركين فقط. يرجى الاشتراك أولاً.');
        } else {
             setSelectedLesson(lesson);
        }
    };
    
    const handleContentSelect = (content: PlatformContent) => {
        if (!content.isFree && !isSubscribed) {
            addToast('warning', 'محتوى حصري', 'هذا المحتوى للمشتركين فقط. يرجى الاشتراك أولاً.');
            return;
        }

        if (content.url && content.url !== '#') {
            if (content.type === 'video') {
                setPlayingContent(content);
            } else {
                setDownloadingContent(content);
            }
        } else {
            addToast('info', 'محتوى غير متاح', `محتوى "${content.title}" غير متاح للعرض حاليًا.`);
        }
    };
    
    const handleMainTabChange = (tab: 'platform' | 'schedule' | 'subscription') => {
        setMainTab(tab);
        setSelectedTeacher(null);
        setSelectedLesson(null);
    };

    const renderContent = () => {
        if (mainTab === 'platform') {
            if (selectedLesson) {
                return <LessonDetailView lesson={selectedLesson} onBack={() => setSelectedLesson(null)} onPlayVideo={handleContentSelect} />;
            }
            if (selectedTeacher) {
                return <CourseView teacher={selectedTeacher} onSelectLesson={handleSelectLesson} onBack={() => setSelectedTeacher(null)} />;
            }
            return <TeachersView onSelectTeacher={handleSelectTeacher} user={user} />;
        }
        if (mainTab === 'schedule') {
            return <ScheduleView lessons={lessons} user={user} />;
        }
        if (mainTab === 'subscription') {
            return <SubscriptionView 
                        user={user} 
                        userPendingRequest={userPendingRequest}
                        onCreateSubscriptionRequest={onCreateSubscriptionRequest}
                        addToast={addToast}
                    />;
        }
        return null;
    };

    const showHeader = !selectedTeacher && !playingContent && !downloadingContent;

    return (
        <div className="space-y-8">
            {playingContent && (
                <VideoPlayerView content={playingContent} onClose={() => setPlayingContent(null)} />
            )}
            {downloadingContent && (
                <DownloadContentView content={downloadingContent} onClose={() => setDownloadingContent(null)} />
            )}
            
            {!playingContent && !downloadingContent && (
                <>
                    {showHeader && (
                        <header className="text-center">
                             <MainFilterTabs 
                                items={[
                                    {key: 'platform', label: 'المنهج'},
                                    {key: 'schedule', label: 'جدولي الدراسي'},
                                    {key: 'subscription', label: 'اشتراكي'}
                                ]}
                                selected={mainTab}
                                onSelect={handleMainTabChange}
                             />
                        </header>
                    )}
                    
                    <main>
                        {renderContent()}
                    </main>
                </>
            )}
        </div>
    );
};

export default EducationalPlatformPage;