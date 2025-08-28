

import { Book, Question, User, GalleryImage } from './types.ts';

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
    'علوم': { icon: '🔬', progressBarClass: 'bg-sky-500', bgColor: 'bg-sky-500/10 border-sky-500/20' },
    'دراسات اجتماعية': { icon: '🏛️', progressBarClass: 'bg-stone-500', bgColor: 'bg-stone-500/10 border-stone-500/20' },
    'Default': { icon: '📚', progressBarClass: 'bg-gray-500', bgColor: 'bg-gray-500/10 border-gray-500/20' },
};

export const DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const getSubjectStyle = (subject: string) => {
    const key = Object.keys(subjectStyles).find(s => subject.includes(s) && s !== 'Default') || 'Default';
    return subjectStyles[key];
};

export const MOCK_SUBJECTS = ['الفيزياء', 'الكيمياء', 'الأحياء', 'لغة عربية', 'لغة إنجليزية', 'رياضيات', 'تاريخ', 'جغرافيا', 'لغة فرنسية', 'لغة إيطالية', 'دين', 'فلسفة وعلم نفس', 'العلوم', 'الدراسات الاجتماعية'];

export const MOCK_BOOKS: Book[] = [
    { id: 'book1', title: 'كتاب الفيزياء للصف الثالث الثانوي', description: 'شرح كامل ومفصل لمنهج الفيزياء.', pdf_url: '#' },
    { id: 'book2', title: 'ملزمة الكيمياء العضوية', description: 'ملخص لأهم تفاعلات الكيمياء العضوية.', pdf_url: '#' },
];

export const MOCK_QUESTIONS: Question[] = [
    { id: 'q1', subject: 'فيزياء', grade: 'الصف الثالث الثانوي', cognitive_level: 'Apply', difficulty: 'M2', stem: 'ما هي وحدة قياس شدة التيار الكهربي؟', options: ['فولت', 'أوم', 'أمبير', 'واط'], correct_option_index: 2, rationale: 'الأمبير هو وحدة قياس شدة التيار الكهربي.' },
    { id: 'q2', subject: 'كيمياء', grade: 'الصف الثالث الثانوي', cognitive_level: 'Remember', difficulty: 'M1', stem: 'ما هو الرمز الكيميائي للذهب؟', options: ['Ag', 'Au', 'Fe', 'Pb'], correct_option_index: 1, rationale: 'Au هو الرمز الكيميائي للذهب.' }
];

export const MOCK_STUDENTS: User[] = [
    { id: 'STU-2024-0001', role: 'student', name: 'أحمد محمود', email: 'ahmed@example.com', phone: '01012345678', guardian_phone: '01112345678', school: 'مدرسة المستقبل', grade: 'الصف الثالث الثانوي', profile_picture_url: 'https://i.pravatar.cc/150?u=ahmed', section: 'علمي علوم' },
    { id: 'STU-2024-0002', role: 'student', name: 'فاطمة علي', email: 'fatima@example.com', phone: '01212345678', guardian_phone: '01512345678', school: 'مدرسة النهضة', grade: 'الصف الثاني الثانوي', profile_picture_url: 'https://i.pravatar.cc/150?u=fatima', section: 'أدبي' }
];

export const MOCK_GALLERY_IMAGES: GalleryImage[] = [
    { id: 'g1', image_url: 'https://picsum.photos/seed/trip1/400/300', title: 'رحلة الأهرامات', album: 'رحلات' },
    { id: 'g2', image_url: 'https://picsum.photos/seed/activity1/400/300', title: 'يوم رياضي', album: 'أنشطة' },
    { id: 'g3', image_url: 'https://picsum.photos/seed/honor1/400/300', title: 'تكريم الأوائل', album: 'تكريم' },
    { id: 'g4', image_url: 'https://picsum.photos/seed/class1/400/300', title: 'حصص المراجعة', album: 'حصص' },
];