// FIX: Imported missing types to be used in mock data.
import { User, Lesson, Teacher } from './types.ts';

// Centralized subject styles to be used across the application
export const subjectStyles: Record<string, { icon: string; progressBarClass: string; bgColor: string }> = {
    'فيزياء': { icon: '⚛️', progressBarClass: 'bg-blue-500', bgColor: 'bg-blue-500/10 border-blue-500/20' },
    'كيمياء': { icon: '🧪', progressBarClass: 'bg-green-500', bgColor: 'bg-green-500/10 border-green-500/20' },
    'لغة عربية': { icon: '📖', progressBarClass: 'bg-red-500', bgColor: 'bg-red-500/10 border-red-500/20' },
    'رياضيات': { icon: '➗', progressBarClass: 'bg-purple-500', bgColor: 'bg-purple-500/10 border-purple-500/20' },
    'أحياء': { icon: '🧬', progressBarClass: 'bg-teal-500', bgColor: 'bg-teal-500/10 border-teal-500/20' },
    'جيولوجيا': { icon: '🌍', progressBarClass: 'bg-orange-500', bgColor: 'bg-orange-500/10 border-orange-500/20' },
    'لغة إنجليزية': { icon: '🇬🇧', progressBarClass: 'bg-indigo-500', bgColor: 'bg-indigo-500/10 border-indigo-500/20' },
    'تاريخ': { icon: '📜', progressBarClass: 'bg-amber-500', bgColor: 'bg-amber-500/10 border-amber-500/20' },
    'فلسفة وعلم نفس': { icon: '🤔', progressBarClass: 'bg-pink-500', bgColor: 'bg-pink-500/10 border-pink-500/20' },
    'لغة فرنسية': { icon: '🇫🇷', progressBarClass: 'bg-cyan-500', bgColor: 'bg-cyan-500/10 border-cyan-500/20' },
    'لغة إيطالية': { icon: '🇮🇹', progressBarClass: 'bg-lime-500', bgColor: 'bg-lime-500/10 border-lime-500/20' },
    'دين': { icon: '🕌', progressBarClass: 'bg-emerald-500', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
    'جغرافيا': { icon: '🗺️', progressBarClass: 'bg-sky-500', bgColor: 'bg-sky-500/10 border-sky-500/20'},
    'Default': { icon: '📚', progressBarClass: 'bg-gray-500', bgColor: 'bg-gray-500/10 border-gray-500/20' },
};

export const getSubjectStyle = (subject: string) => {
    const key = Object.keys(subjectStyles).find(s => subject.includes(s) && s !== 'Default') || 'Default';
    return subjectStyles[key];
};

/**
 * Normalizes an Arabic string for more reliable comparisons.
 * - Replaces different forms of alef with a plain alef.
 * - Replaces 'ى' (Alef Maqsura) with 'ي' (Yeh).
 * - Replaces 'ة' (Teh Marbuta) with 'ه' (Heh).
 * - Removes Arabic diacritics (tashkeel).
 * - Trims and collapses whitespace.
 * @param str The string to normalize.
 * @returns The normalized string.
 */
export const normalizeArabic = (str: string | undefined): string => {
    if (!str) return '';
    return str
        .replace(/[أإآ]/g, 'ا') // Normalize Alef
        .replace(/ى/g, 'ي')     // Normalize Alef Maqsura to Yeh
        .replace(/ة/g, 'ه')     // Normalize Teh Marbuta to Heh
        .replace(/[\u064B-\u0652]/g, '') // Remove diacritics
        .replace(/\s+/g, ' ')
        .trim();
};

export const generateAvatar = (name: string): string => {
    if (!name) name = '?';
    const nameParts = name.split(' ').filter(Boolean);
    const initials = (
      nameParts.length > 1 
      ? nameParts[0][0] + nameParts[nameParts.length - 1][0] 
      : nameParts.length === 1 
      ? nameParts[0].slice(0, 2) 
      : '?'
    ).toUpperCase();
    
    const colors = ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#9e9e9e", "#607d8b"];
    const charCodeSum = initials.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bgColor = colors[charCodeSum % colors.length];

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="${bgColor}"></rect>
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Cairo, sans-serif" font-size="90" fill="#ffffff">${initials}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};


export const MOCK_USER_STUDENT: User = {
    id: 'STU-2024-0001',
    role: 'student',
    name: 'أحمد محمد علي',
    email: 'ahmed.student@example.com',
    phone: '01234567890',
    guardianPhone: '01098765432',
    school: 'مدرسة المستقبل الثانوية',
    grade: 'الصف الثالث الثانوي',
    profilePicture: 'https://picsum.photos/seed/student/200/200',
    dob: '2006-05-15',
    section: 'علمي علوم',
    lastScheduleEdit: new Date('2024-01-01').getTime(),
    xpPoints: 125,
    // FIX: Added missing center_id property to mock user.
    center_id: 'center-123',
};

export const MOCK_USER_ADMIN: User = {
    id: 'admin001',
    role: 'admin',
    name: 'مدير السنتر',
    email: 'admin@googlecenter.com',
    phone: '01112223334',
    guardianPhone: '',
    school: 'إدارة',
    grade: 'إدارة',
    profilePicture: 'https://picsum.photos/seed/admin/200/200',
    xpPoints: 0,
    // FIX: Added missing center_id property to mock user.
    center_id: 'center-123',
};

export const MOCK_STUDENTS: User[] = [
    MOCK_USER_STUDENT,
    {
        id: 'STU-2024-0002',
        role: 'student',
        name: 'فاطمة الزهراء',
        email: 'fatima.student@example.com',
        phone: '01123456789',
        guardianPhone: '01198765432',
        school: 'مدرسة النور الثانوية',
        grade: 'الصف الثالث الثانوي',
        profilePicture: 'https://picsum.photos/seed/student2/200/200',
        dob: '2006-08-22',
        section: 'أدبي',
        lastScheduleEdit: new Date('2024-01-01').getTime(),
        xpPoints: 210,
        // FIX: Added missing center_id property to mock user.
        center_id: 'center-123',
    },
    {
        id: 'STU-2025-0003',
        role: 'student',
        name: 'علي حسن',
        email: 'ali.student@example.com',
        phone: '01012345678',
        guardianPhone: '01087654321',
        school: 'مدرسة المستقبل الثانوية',
        grade: 'الصف الأول الثانوي',
        profilePicture: 'https://picsum.photos/seed/student3/200/200',
        dob: '2008-01-10',
        section: 'عام',
        lastScheduleEdit: new Date('2024-01-01').getTime(),
        xpPoints: 75,
        // FIX: Added missing center_id property to mock user.
        center_id: 'center-123',
    },
     {
        id: 'STU-2026-0004',
        role: 'student',
        name: 'سارة محمود',
        email: 'sara.student@example.com',
        phone: '01212345678',
        guardianPhone: '01287654321',
        school: 'مدرسة الأمل الإعدادية',
        grade: 'الصف الثاني الإعدادي',
        profilePicture: 'https://picsum.photos/seed/student4/200/200',
        dob: '2009-11-30',
        section: 'عام',
        lastScheduleEdit: new Date('2024-01-01').getTime(),
        xpPoints: 30,
        // FIX: Added missing center_id property to mock user.
        center_id: 'center-123',
    }
];

export const MOCK_LESSONS: Lesson[] = [
    // --- الأحد ---
    { id: 'l1', day: 'الأحد', subject: 'فيزياء', teacher_id: 't1', teacher: 'أ. نيوتن', time: '4:00 م - 6:00 م', hall: 'قاعة 1', grade: 'الصف الثالث الثانوي', notes: 'مراجعة على الفصل الأول وامتحان سريع.', center_id: 'center-123' },
    { id: 'l2', day: 'الأحد', subject: 'كيمياء', teacher_id: 't-other', teacher: 'أ. مندليف', time: '6:00 م - 8:00 م', hall: 'قاعة 2', grade: 'الصف الثالث الثانوي', notes: 'شرح درس جديد: الكيمياء العضوية.', center_id: 'center-123' },
    { id: 'l9', day: 'الأحد', subject: 'رياضيات', teacher_id: 't3', teacher: 'أ. فيثاغورس', time: '5:00 م - 7:00 م', hall: 'قاعة 3', grade: 'الصف الثاني الثانوي', center_id: 'center-123' },
    { id: 'l10', day: 'الأحد', subject: 'لغة عربية', teacher_id: 't2', teacher: 'أ. سيبويه', time: '3:00 م - 5:00 م', hall: 'قاعة 4', grade: 'الصف الأول الثانوي', center_id: 'center-123' },
    { id: 'l11', day: 'الأحد', subject: 'أحياء', teacher_id: 't-other', teacher: 'أ. داروين', time: '7:00 م - 9:00 م', hall: 'قاعة 1', grade: 'الصف الأول الثانوي', center_id: 'center-123' },

    // --- الاثنين ---
    { id: 'l3', day: 'الاثنين', subject: 'لغة عربية', teacher_id: 't2', teacher: 'أ. سيبويه', time: '5:00 م - 7:00 م', hall: 'قاعة 3', grade: 'الصف الثالث الثانوي', notes: 'حل تدريبات على البلاغة.', center_id: 'center-123' },
    { id: 'l4', day: 'الاثنين', subject: 'رياضيات', teacher_id: 't3', teacher: 'أ. فيثاغورس', time: '3:00 م - 5:00 م', hall: 'قاعة 1', grade: 'الصف الثالث الإعدادي', notes: 'هندسة فراغية.', center_id: 'center-123' },
    { id: 'l12', day: 'الاثنين', subject: 'لغة إنجليزية', teacher_id: 't-other', teacher: 'أ. شكسبير', time: '6:00 م - 8:00 م', hall: 'قاعة 2', grade: 'الصف الثاني الثانوي', center_id: 'center-123' },
    { id: 'l13', day: 'الاثنين', subject: 'فيزياء', teacher_id: 't1', teacher: 'أ. نيوتن', time: '4:00 م - 6:00 م', hall: 'قاعة 4', grade: 'الصف الثاني الثانوي', center_id: 'center-123' },
    { id: 'l14', day: 'الاثنين', subject: 'تاريخ', teacher_id: 't-other', teacher: 'أ. هيرودوت', time: '7:00 م - 9:00 م', hall: 'قاعة VIP', grade: 'الصف الثالث الثانوي', center_id: 'center-123' },

    // --- الثلاثاء ---
    { id: 'l5', day: 'الثلاثاء', subject: 'أحياء', teacher_id: 't-other', teacher: 'أ. داروين', time: '4:00 م - 6:00 م', hall: 'قاعة 2', grade: 'الصف الثالث الثانوي', notes: 'مراجعة عامة على المنهج.', center_id: 'center-123' },
    { id: 'l15', day: 'الثلاثاء', subject: 'كيمياء', teacher_id: 't-other', teacher: 'أ. مندليف', time: '6:00 م - 8:00 م', hall: 'قاعة 1', grade: 'الصف الثاني الثانوي', center_id: 'center-123' },
    { id: 'l16', day: 'الثلاثاء', subject: 'فلسفة وعلم نفس', teacher_id: 't-other', teacher: 'أ. أرسطو', time: '5:00 م - 7:00 م', hall: 'قاعة 3', grade: 'الصف الثالث الثانوي', center_id: 'center-123' },
    { id: 'l17', day: 'الثلاثاء', subject: 'لغة فرنسية', teacher_id: 't-other', teacher: 'أ. موليير', time: '7:00 م - 9:00 م', hall: 'قاعة 4', grade: 'الصف الأول الثانوي', center_id: 'center-123' },

    // --- الأربعاء ---
    { id: 'l6', day: 'الأربعاء', subject: 'جيولوجيا', teacher_id: 't-other', teacher: 'أ. جيمس هوتون', time: '5:00 م - 7:00 م', hall: 'قاعة 1', grade: 'الصف الثالث الثانوي', center_id: 'center-123' },
    { id: 'l18', day: 'الأربعاء', subject: 'رياضيات', teacher_id: 't3', teacher: 'أ. فيثاغورس', time: '3:00 م - 5:00 م', hall: 'قاعة 2', grade: 'الصف الثالث الثانوي', notes: 'تفاضل وتكامل.', center_id: 'center-123' },
    { id: 'l19', day: 'الأربعاء', subject: 'فيزياء', teacher_id: 't1', teacher: 'أ. نيوتن', time: '6:00 م - 8:00 م', hall: 'قاعة 3', grade: 'الصف الأول الثانوي', center_id: 'center-123' },
    { id: 'l20', day: 'الأربعاء', subject: 'لغة عربية', teacher_id: 't2', teacher: 'أ. سيبويه', time: '4:00 م - 6:00 م', hall: 'قاعة 4', grade: 'الصف الثاني الثانوي', center_id: 'center-123' },

    // --- الخميس ---
    { id: 'l7', day: 'الخميس', subject: 'لغة إنجليزية', teacher_id: 't-other', teacher: 'أ. شكسبير', time: '6:00 م - 8:00 م', hall: 'قاعة 3', grade: 'الصف الثالث الثانوي', notes: 'تدريب على سؤال الترجمة.', center_id: 'center-123' },
    { id: 'l21', day: 'الخميس', subject: 'كيمياء', teacher_id: 't-other', teacher: 'أ. مندليف', time: '4:00 م - 6:00 م', hall: 'قاعة 1', grade: 'الصف الأول الثانوي', center_id: 'center-123' },
    { id: 'l22', day: 'الخميس', subject: 'أحياء', teacher_id: 't-other', teacher: 'أ. داروين', time: '5:00 م - 7:00 م', hall: 'قاعة 2', grade: 'الصف الثاني الثانوي', center_id: 'center-123' },
    { id: 'l23', day: 'الخميس', subject: 'جغرافيا', teacher_id: 't-other', teacher: 'أ. بطليموس', time: '7:00 م - 9:00 م', hall: 'قاعة 4', grade: 'الصف الثاني الثانوي', center_id: 'center-123' },

    // --- الجمعة ---
    { id: 'l24', day: 'الجمعة', subject: 'مراجعة فيزياء', teacher_id: 't1', teacher: 'أ. نيوتن', time: '1:00 م - 3:00 م', hall: 'قاعة 1', grade: 'الصف الثالث الثانوي', notes: 'حل إمتحان شامل.', center_id: 'center-123' },
    { id: 'l25', day: 'الجمعة', subject: 'مراجعة رياضيات', teacher_id: 't3', teacher: 'أ. فيثاغورس', time: '3:00 م - 5:00 م', hall: 'قاعة 2', grade: 'الصف الثالث الثانوي', center_id: 'center-123' },
    { id: 'l26', day: 'الجمعة', subject: 'مراجعة لغة عربية', teacher_id: 't2', teacher: 'أ. سيبويه', time: '10:00 ص - 12:00 م', hall: 'قاعة 3', grade: 'الصف الثالث الثانوي', center_id: 'center-123' },

    // --- السبت ---
    { id: 'l8', day: 'السبت', subject: 'تاريخ', teacher_id: 't-other', teacher: 'أ. هيرودوت', time: '2:00 م - 4:00 م', hall: 'قاعة 2', grade: 'الصف الأول الثانوي', center_id: 'center-123' },
    { id: 'l27', day: 'السبت', subject: 'لغة إيطالية', teacher_id: 't-other', teacher: 'أ. دافنشي', time: '4:00 م - 6:00 م', hall: 'قاعة 4', grade: 'الصف الثاني الثانوي', center_id: 'center-123' },
    { id: 'l28', day: 'السبت', subject: 'فيزياء', teacher_id: 't1', teacher: 'أ. نيوتن', time: '12:00 م - 2:00 م', hall: 'قاعة 1', grade: 'الصف الثالث الثانوي', center_id: 'center-123' },
    { id: 'l29', day: 'السبت', subject: 'كيمياء', teacher_id: 't-other', teacher: 'أ. مندليف', time: '6:00 م - 8:00 م', hall: 'قاعة 3', grade: 'الصف الثالث الثانوي', center_id: 'center-123' },
    { id: 'l30', day: 'السبت', subject: 'دين', teacher_id: 't-other', teacher: 'الشيخ الشعراوي', time: '8:00 م - 9:00 م', hall: 'قاعة VIP', grade: 'جميع الصفوف', center_id: 'center-123' },
];

export const MOCK_TEACHERS: Teacher[] = [
    { id: 't1', name: 'أ. نيوتن', subject: 'فيزياء', imageUrl: 'https://picsum.photos/seed/newton/200/200', bio: 'خبير في الفيزياء الحديثة والكلاسيكية مع 15 عامًا من الخبرة.', phone: '01012345678', email: 'newton@googlecenter.com', grades: 'الصف الثالث الثانوي', center_id: 'center-123' },
    { id: 't2', name: 'أ. سيبويه', subject: 'لغة عربية', imageUrl: 'https://picsum.photos/seed/sibawayh/200/200', bio: 'متخصص في النحو والبلاغة، ويعمل على تبسيط قواعد اللغة للطلاب.', phone: '01123456789', email: 'sibawayh@googlecenter.com', grades: 'جميع الصفوف الثانوية', center_id: 'center-123' },
    { id: 't3', name: 'أ. فيثاغورس', subject: 'رياضيات', imageUrl: 'https://picsum.photos/seed/pythagoras/200/200', bio: 'مدرس رياضيات شغوف يجعل أصعب المسائل سهلة وممتعة.', phone: '01234567890', email: 'pythagoras@googlecenter.com', grades: 'الصف الأول والثاني الثانوي', center_id: 'center-123' },
];