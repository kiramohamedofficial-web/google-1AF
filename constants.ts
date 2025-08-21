import { User, Lesson, Trip, Teacher, Post, Book, Question, GalleryImage, Booking } from './types';

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
    }
];

export const MOCK_LESSONS: Lesson[] = [
    // --- الأحد ---
    { id: 'l1', day: 'الأحد', subject: 'فيزياء', teacher: 'أ. نيوتن', time: '4:00 م - 6:00 م', hall: 'قاعة 1', grade: 'الصف الثالث الثانوي', notes: 'مراجعة على الفصل الأول وامتحان سريع.', capacity: 50, bookedCount: 45 },
    { id: 'l2', day: 'الأحد', subject: 'كيمياء', teacher: 'أ. مندليف', time: '6:00 م - 8:00 م', hall: 'قاعة 2', grade: 'الصف الثالث الثانوي', notes: 'شرح درس جديد: الكيمياء العضوية.', capacity: 50, bookedCount: 50 },
    { id: 'l9', day: 'الأحد', subject: 'رياضيات', teacher: 'أ. فيثاغورس', time: '5:00 م - 7:00 م', hall: 'قاعة 3', grade: 'الصف الثاني الثانوي', capacity: 40, bookedCount: 38 },
    { id: 'l10', day: 'الأحد', subject: 'لغة عربية', teacher: 'أ. سيبويه', time: '3:00 م - 5:00 م', hall: 'قاعة 4', grade: 'الصف الأول الثانوي', capacity: 60, bookedCount: 55 },
    { id: 'l11', day: 'الأحد', subject: 'أحياء', teacher: 'أ. داروين', time: '7:00 م - 9:00 م', hall: 'قاعة 1', grade: 'الصف الأول الثانوي', capacity: 50, bookedCount: 25 },

    // --- الاثنين ---
    { id: 'l3', day: 'الاثنين', subject: 'لغة عربية', teacher: 'أ. سيبويه', time: '5:00 م - 7:00 م', hall: 'قاعة 3', grade: 'الصف الثالث الثانوي', notes: 'حل تدريبات على البلاغة.', capacity: 40, bookedCount: 22 },
    { id: 'l4', day: 'الاثنين', subject: 'رياضيات', teacher: 'أ. فيثاغورس', time: '3:00 م - 5:00 م', hall: 'قاعة 1', grade: 'الصف الثالث الإعدادي', notes: 'هندسة فراغية.', capacity: 60, bookedCount: 30 },
    { id: 'l12', day: 'الاثنين', subject: 'لغة إنجليزية', teacher: 'أ. شكسبير', time: '6:00 م - 8:00 م', hall: 'قاعة 2', grade: 'الصف الثاني الثانوي', capacity: 50, bookedCount: 40 },
    { id: 'l13', day: 'الاثنين', subject: 'فيزياء', teacher: 'أ. نيوتن', time: '4:00 م - 6:00 م', hall: 'قاعة 4', grade: 'الصف الثاني الثانوي', capacity: 45, bookedCount: 15 },
    { id: 'l14', day: 'الاثنين', subject: 'تاريخ', teacher: 'أ. هيرودوت', time: '7:00 م - 9:00 م', hall: 'قاعة VIP', grade: 'الصف الثالث الثانوي', capacity: 25, bookedCount: 25 },

    // --- الثلاثاء ---
    { id: 'l5', day: 'الثلاثاء', subject: 'أحياء', teacher: 'أ. داروين', time: '4:00 م - 6:00 م', hall: 'قاعة 2', grade: 'الصف الثالث الثانوي', notes: 'مراجعة عامة على المنهج.', capacity: 50, bookedCount: 15 },
    { id: 'l15', day: 'الثلاثاء', subject: 'كيمياء', teacher: 'أ. مندليف', time: '6:00 م - 8:00 م', hall: 'قاعة 1', grade: 'الصف الثاني الثانوي', capacity: 50, bookedCount: 49 },
    { id: 'l16', day: 'الثلاثاء', subject: 'فلسفة وعلم نفس', teacher: 'أ. أرسطو', time: '5:00 م - 7:00 م', hall: 'قاعة 3', grade: 'الصف الثالث الثانوي', capacity: 40, bookedCount: 20 },
    { id: 'l17', day: 'الثلاثاء', subject: 'لغة فرنسية', teacher: 'أ. موليير', time: '7:00 م - 9:00 م', hall: 'قاعة 4', grade: 'الصف الأول الثانوي', capacity: 30, bookedCount: 18 },

    // --- الأربعاء ---
    { id: 'l6', day: 'الأربعاء', subject: 'جيولوجيا', teacher: 'أ. جيمس هوتون', time: '5:00 م - 7:00 م', hall: 'قاعة 1', grade: 'الصف الثالث الثانوي', capacity: 30, bookedCount: 30 },
    { id: 'l18', day: 'الأربعاء', subject: 'رياضيات', teacher: 'أ. فيثاغورس', time: '3:00 م - 5:00 م', hall: 'قاعة 2', grade: 'الصف الثالث الثانوي', notes: 'تفاضل وتكامل.', capacity: 60, bookedCount: 58 },
    { id: 'l19', day: 'الأربعاء', subject: 'فيزياء', teacher: 'أ. نيوتن', time: '6:00 م - 8:00 م', hall: 'قاعة 3', grade: 'الصف الأول الثانوي', capacity: 55, bookedCount: 43 },
    { id: 'l20', day: 'الأربعاء', subject: 'لغة عربية', teacher: 'أ. سيبويه', time: '4:00 م - 6:00 م', hall: 'قاعة 4', grade: 'الصف الثاني الثانوي', capacity: 50, bookedCount: 33 },

    // --- الخميس ---
    { id: 'l7', day: 'الخميس', subject: 'لغة إنجليزية', teacher: 'أ. شكسبير', time: '6:00 م - 8:00 م', hall: 'قاعة 3', grade: 'الصف الثالث الثانوي', notes: 'تدريب على سؤال الترجمة.', capacity: 50, bookedCount: 48 },
    { id: 'l21', day: 'الخميس', subject: 'كيمياء', teacher: 'أ. مندليف', time: '4:00 م - 6:00 م', hall: 'قاعة 1', grade: 'الصف الأول الثانوي', capacity: 60, bookedCount: 50 },
    { id: 'l22', day: 'الخميس', subject: 'أحياء', teacher: 'أ. داروين', time: '5:00 م - 7:00 م', hall: 'قاعة 2', grade: 'الصف الثاني الثانوي', capacity: 50, bookedCount: 30 },
    { id: 'l23', day: 'الخميس', subject: 'جغرافيا', teacher: 'أ. بطليموس', time: '7:00 م - 9:00 م', hall: 'قاعة 4', grade: 'الصف الثاني الثانوي', capacity: 40, bookedCount: 11 },

    // --- الجمعة ---
    { id: 'l24', day: 'الجمعة', subject: 'مراجعة فيزياء', teacher: 'أ. نيوتن', time: '1:00 م - 3:00 م', hall: 'قاعة 1', grade: 'الصف الثالث الثانوي', notes: 'حل إمتحان شامل.', capacity: 70, bookedCount: 65 },
    { id: 'l25', day: 'الجمعة', subject: 'مراجعة رياضيات', teacher: 'أ. فيثاغورس', time: '3:00 م - 5:00 م', hall: 'قاعة 2', grade: 'الصف الثالث الثانوي', capacity: 70, bookedCount: 70 },
    { id: 'l26', day: 'الجمعة', subject: 'مراجعة لغة عربية', teacher: 'أ. سيبويه', time: '10:00 ص - 12:00 م', hall: 'قاعة 3', grade: 'الصف الثالث الثانوي', capacity: 60, bookedCount: 45 },

    // --- السبت ---
    { id: 'l8', day: 'السبت', subject: 'تاريخ', teacher: 'أ. هيرودوت', time: '2:00 م - 4:00 م', hall: 'قاعة 2', grade: 'الصف الأول الثانوي', capacity: 40, bookedCount: 10 },
    { id: 'l27', day: 'السبت', subject: 'لغة إيطالية', teacher: 'أ. دافنشي', time: '4:00 م - 6:00 م', hall: 'قاعة 4', grade: 'الصف الثاني الثانوي', capacity: 25, bookedCount: 12 },
    { id: 'l28', day: 'السبت', subject: 'فيزياء', teacher: 'أ. نيوتن', time: '12:00 م - 2:00 م', hall: 'قاعة 1', grade: 'الصف الثالث الثانوي', capacity: 50, bookedCount: 50 },
    { id: 'l29', day: 'السبت', subject: 'كيمياء', teacher: 'أ. مندليف', time: '6:00 م - 8:00 م', hall: 'قاعة 3', grade: 'الصف الثالث الثانوي', capacity: 50, bookedCount: 41 },
    { id: 'l30', day: 'السبت', subject: 'دين', teacher: 'الشيخ الشعراوي', time: '8:00 م - 9:00 م', hall: 'قاعة VIP', grade: 'جميع الصفوف', capacity: 100, bookedCount: 95 },
];

export const MOCK_TRIPS: Trip[] = [
    { id: 't1', title: 'رحلة إلى الأهرامات وأبو الهول', description: 'يوم ترفيهي وتعليمي لاستكشاف عجائب مصر القديمة. شاملة وجبة غداء وانتقالات فاخرة.', date: '25 ديسمبر 2024', time: '8:00 ص - 6:00 م', meetingPoint: 'أمام السنتر', capacity: 50, bookedCount: 35, cost: 150, imageUrls: ['https://picsum.photos/seed/pyramids/400/300'] },
    { id: 't2', title: 'زيارة المتحف المصري الكبير', description: 'انضم إلينا في جولة ملهمة عبر تاريخ مصر العظيم في أحدث متاحف العالم. فرصة لا تعوض.', date: '15 يناير 2025', time: '9:00 ص - 4:00 م', meetingPoint: 'ميدان التحرير', capacity: 40, bookedCount: 40, cost: 120, imageUrls: ['https://picsum.photos/seed/museum/400/300'] },
    { id: 't3', title: 'يوم رياضي في القرية الأولمبية', description: 'يوم كامل من الأنشطة الرياضية والترفيهية. مسابقات وجوائز قيمة في انتظاركم.', date: '1 فبراير 2025', time: '10:00 ص - 5:00 م', meetingPoint: 'أمام السنتر', capacity: 100, bookedCount: 78, cost: 80, imageUrls: ['https://picsum.photos/seed/olympic/400/300'] },
    { id: 't4', title: 'رحلة سفاري وتخييم في الفيوم', description: 'مغامرة مثيرة في قلب الصحراء مع التزحلق على الرمال وحفل شواء ليلي تحت النجوم.', date: '20 فبراير 2025', time: 'تبدأ 12:00 م', meetingPoint: 'أمام السنتر', capacity: 30, bookedCount: 12, cost: 250, imageUrls: ['https://picsum.photos/seed/safari/400/300'] },
    { id: 't5', title: 'زيارة مكتبة الإسكندرية', description: 'يوم ثقافي لاستكشاف صرح من أعظم صروح المعرفة في العالم والتعرف على تاريخها العريق.', date: '5 مارس 2025', time: '7:00 ص - 8:00 م', meetingPoint: 'أمام السنتر', capacity: 45, bookedCount: 41, cost: 180, imageUrls: ['https://picsum.photos/seed/library/400/300'] },
];

export const MOCK_TEACHERS: Teacher[] = [
    { id: 't1', name: 'أ. نيوتن', subject: 'فيزياء', imageUrl: 'https://picsum.photos/seed/newton/200/200', bio: 'خبير في الفيزياء الحديثة والكلاسيكية مع 15 عامًا من الخبرة.', phone: '01012345678', email: 'newton@googlecenter.com', grades: 'الصف الثالث الثانوي' },
    { id: 't2', name: 'أ. سيبويه', subject: 'لغة عربية', imageUrl: 'https://picsum.photos/seed/sibawayh/200/200', bio: 'متخصص في النحو والبلاغة، ويعمل على تبسيط قواعد اللغة للطلاب.', phone: '01123456789', email: 'sibawayh@googlecenter.com', grades: 'جميع الصفوف الثانوية' },
    { id: 't3', name: 'أ. فيثاغورس', subject: 'رياضيات', imageUrl: 'https://picsum.photos/seed/pythagoras/200/200', bio: 'مدرس رياضيات شغوف يجعل أصعب المسائل سهلة وممتعة.', phone: '01234567890', email: 'pythagoras@googlecenter.com', grades: 'الصف الأول والثاني الثانوي' },
];

export const MOCK_POSTS: Post[] = [
    { id: 'p1', title: '🏆 تهنئة لأوائل الشهر', author: 'إدارة السنتر', content: 'تهانينا القلبية للطلاب الأوائل في امتحان الشهر الماضي! نتمنى لكم دوام التفوق والنجاح. سيتم تكريمكم يوم الخميس القادم في حفل خاص وتوزيع جوائز قيمة.', imageUrls: ['https://picsum.photos/seed/award/600/300'], timestamp: 'منذ 2 ساعة', status: 'published' },
    { id: 'p3', title: 'فتح باب الحجز لمجموعات المراجعة النهائية', author: 'إدارة السنتر', content: 'تم فتح باب الحجز لمجموعات المراجعة النهائية لجميع المواد. الأماكن محدودة، سارع بحجز مكانك الآن من خلال التطبيق أو السكرتارية.\n\nتشمل المراجعات:\n- حل امتحانات شاملة.\n- شرح لأهم النقاط الصعبة.\n- ملازم مراجعة حصرية.', imageUrls: ['https://picsum.photos/seed/revision/600/300', 'https://picsum.photos/seed/revision2/600/300', 'https://picsum.photos/seed/revision3/600/300'], timestamp: 'منذ 3 أيام', status: 'published'},
    { id: 'p2', title: '📢 تذكير هام بامتحان الفيزياء', author: 'إدارة السنتر', content: 'تذكير هام لطلاب الصف الثالث الثانوي: سيتم عقد امتحان الفيزياء الشامل يوم الأحد القادم. الامتحان يغطي الفصول الثلاثة الأولى. استعدوا جيدًا!', timestamp: 'منذ يوم واحد', status: 'published', imageUrls: [] },
    { id: 'p4', title: 'خطة تطوير السنتر (مسودة)', author: 'إدارة السنتر', content: 'يتم حاليًا دراسة إضافة قاعات جديدة وتطوير المنصة الإلكترونية لتوفير تجربة أفضل للطلاب. نرحب بمقترحاتكم.', timestamp: 'منذ أسبوع', status: 'draft' },
];


export const MOCK_BOOKS: Book[] = [
    { id: 'b1', title: 'ملخص قوانين الفيزياء', description: 'ملف PDF يحتوي على جميع القوانين الهامة والنظريات الأساسية في مادة الفيزياء.', pdfUrl: '#' },
    { id: 'b2', title: 'مراجعة ليلة الامتحان في الكيمياء', description: 'أهم المعادلات والمفاهيم الكيميائية التي تحتاجها قبل الامتحان.', pdfUrl: '#' },
];

export const MOCK_GALLERY_IMAGES: GalleryImage[] = [
    { id: 'g1', imageUrl: 'https://picsum.photos/seed/gallery1/600/400', title: 'يوم رياضي ممتع', album: 'أنشطة' },
    { id: 'g2', imageUrl: 'https://picsum.photos/seed/gallery2/600/400', title: 'زيارة الأهرامات', album: 'رحلات' },
    { id: 'g3', imageUrl: 'https://picsum.photos/seed/gallery3/600/400', title: 'تكريم الأوائل', album: 'تكريم' },
    { id: 'g4', imageUrl: 'https://picsum.photos/seed/gallery4/600/400', title: 'أثناء حصة الفيزياء', album: 'حصص' },
    { id: 'g5', imageUrl: 'https://picsum.photos/seed/gallery5/600/400', title: 'مسابقة علمية', album: 'أنشطة' },
    { id: 'g6', imageUrl: 'https://picsum.photos/seed/gallery6/600/400', title: 'رحلة إلى المتحف', album: 'رحلات' },
];

export const MOCK_SUBJECTS = ['الفيزياء', 'الكيمياء', 'الأحياء', 'لغة عربية', 'رياضيات', 'تاريخ', 'جغرافيا', 'لغة فرنسية', 'لغة إيطالية', 'دين', 'فلسفة وعلم نفس'];

export const MOCK_QUESTIONS: Question[] = [
    { id: 'q1', subject: 'لغة عربية', text: 'ما هي عاصمة مصر؟', options: ['القاهرة', 'الإسكندرية', 'الجيزة', 'الأقصر'], correctOptionIndex: 0 },
    { id: 'q2', subject: 'رياضيات', text: 'ما هو حاصل ضرب 5 في 8؟', options: ['35', '40', '45', '50'], correctOptionIndex: 1 },
    { id: 'q3', subject: 'الكيمياء', text: 'ما هو الرمز الكيميائي للماء؟', options: ['CO2', 'O2', 'H2O', 'NaCl'], correctOptionIndex: 2 },
    { id: 'q4', subject: 'الفيزياء', text: 'من هو مكتشف قانون الجاذبية؟', options: ['أينشتاين', 'جاليليو', 'نيوتن', 'تسلا'], correctOptionIndex: 2 },
    { id: 'q5', subject: 'لغة عربية', text: 'كم عدد قارات العالم؟', options: ['5', '6', '7', '8'], correctOptionIndex: 2 },
    { id: 'q6', subject: 'الفيزياء', text: 'ما هو أكبر كوكب في المجموعة الشمسية؟', options: ['الأرض', 'المريخ', 'المشترى', 'زحل'], correctOptionIndex: 2 },
    { id: 'q7', subject: 'لغة عربية', text: 'ما هو أطول نهر في العالم؟', options: ['الأمازون', 'النيل', 'المسيسيبي', 'اليانغتسي'], correctOptionIndex: 1 },
    { id: 'q8', subject: 'الأحياء', text: 'ماذا يسمى بيت النحل؟', options: ['عش', 'جحر', 'خلية', 'عرين'], correctOptionIndex: 2 },
    { id: 'q9', subject: 'الأحياء', text: 'ما هو صوت القطة؟', options: ['نباح', 'صهيل', 'مواء', 'زئير'], correctOptionIndex: 2 },
    { id: 'q10', subject: 'لغة عربية', text: 'في أي عام بدأت الحرب العالمية الثانية؟', options: ['1914', '1939', '1945', '1925'], correctOptionIndex: 1 },
    { id: 'q11', subject: 'رياضيات', text: 'ما هو ناتج 12 + 13؟', options: ['24', '25', '26', '27'], correctOptionIndex: 1 },
    { id: 'q12', subject: 'الكيمياء', text: 'أي عنصر له الرمز "O"؟', options: ['الأكسجين', 'الذهب', 'الفضة', 'الهيدروجين'], correctOptionIndex: 0 },
    { id: 'q13', subject: 'الفيزياء', text: 'ما هي وحدة قياس القوة؟', options: ['واط', 'جول', 'نيوتن', 'فولت'], correctOptionIndex: 2 },
    { id: 'q14', subject: 'رياضيات', text: 'ما هو الجذر التربيعي للعدد 81؟', options: ['7', '8', '9', '10'], correctOptionIndex: 2 },
    { id: 'q15', subject: 'الأحياء', text: 'ما هو العضو المسؤول عن ضخ الدم في الجسم؟', options: ['الرئة', 'الكبد', 'القلب', 'الدماغ'], correctOptionIndex: 2 },
    // New Questions
    { id: 'q16', subject: 'تاريخ', text: 'من هو مؤسس الدولة الأموية؟', options: ['عمر بن الخطاب', 'علي بن أبي طالب', 'معاوية بن أبي سفيان', 'أبو بكر الصديق'], correctOptionIndex: 2 },
    { id: 'q17', subject: 'تاريخ', text: 'في أي عام كانت معركة حطين؟', options: ['1187', '1099', '1258', '1453'], correctOptionIndex: 0 },
    { id: 'q18', subject: 'جغرافيا', text: 'ما هي أكبر قارة في العالم من حيث المساحة؟', options: ['أفريقيا', 'أوروبا', 'آسيا', 'أمريكا الشمالية'], correctOptionIndex: 2 },
    { id: 'q19', subject: 'جغرافيا', text: 'ما هو أطول جبل في العالم؟', options: ['جبل كليمنجارو', 'جبل إفرست', 'جبل فوجي', 'جبل مون بلان'], correctOptionIndex: 1 },
    { id: 'q20', subject: 'لغة فرنسية', text: 'Comment dit-on "Hello" en français ?', options: ['Au revoir', 'Merci', 'Bonjour', 'Oui'], correctOptionIndex: 2 },
    { id: 'q21', subject: 'لغة فرنسية', text: 'Quelle est la capitale de la France ?', options: ['Lyon', 'Marseille', 'Nice', 'Paris'], correctOptionIndex: 3 },
    { id: 'q22', subject: 'لغة إيطالية', text: 'Come si dice "Thank you" in italiano?', options: ['Ciao', 'Prego', 'Grazie', 'Scusi'], correctOptionIndex: 2 },
    { id: 'q23', subject: 'لغة إيطالية', text: 'Qual è la capitale d\'Italia?', options: ['Milano', 'Roma', 'Napoli', 'Firenze'], correctOptionIndex: 1 },
    { id: 'q24', subject: 'دين', text: 'كم عدد أركان الإسلام؟', options: ['أربعة', 'خمسة', 'ستة', 'سبعة'], correctOptionIndex: 1 },
    { id: 'q25', subject: 'دين', text: 'ما هي أول سورة في القرآن الكريم؟', options: ['البقرة', 'الفاتحة', 'الإخلاص', 'الناس'], correctOptionIndex: 1 },
    { id: 'q26', subject: 'فلسفة وعلم نفس', text: 'من هو الفيلسوف اليوناني الذي قال "اعرف نفسك"؟', options: ['أفلاطون', 'أرسطو', 'سقراط', 'فيثاغورس'], correctOptionIndex: 2 },
    { id: 'q27', subject: 'فلسفة وعلم نفس', text: 'ما هو الفرع من علم النفس الذي يدرس سلوك الفرد في الجماعة؟', options: ['علم النفس الإكلينيكي', 'علم النفس الاجتماعي', 'علم النفس التربوي', 'علم النفس المعرفي'], correctOptionIndex: 1 },
];

export const MOCK_BOOKINGS: Booking[] = [
    {
        id: `BKG-${Date.now() - 86400000}`,
        studentId: 'STU-2024-0001',
        studentName: 'أحمد محمد علي',
        serviceType: 'حصة',
        serviceId: 'l1',
        serviceName: 'فيزياء',
        date: 'الأحد',
        time: '4:00 م - 6:00 م',
        location: 'قاعة 1',
        status: 'مؤكد',
        createdAt: Date.now() - 86400000,
    },
    {
        id: `BKG-${Date.now() - 172800000}`,
        studentId: 'STU-2024-0002',
        studentName: 'فاطمة الزهراء',
        serviceType: 'حصة',
        serviceId: 'l3',
        serviceName: 'لغة عربية',
        date: 'الاثنين',
        time: '5:00 م - 7:00 م',
        location: 'قاعة 3',
        status: 'قيد المراجعة',
        createdAt: Date.now() - 172800000,
    },
    {
        id: `BKG-${Date.now() - 259200000}`,
        studentId: 'STU-2024-0001',
        studentName: 'أحمد محمد علي',
        serviceType: 'رحلة',
        serviceId: 't1',
        serviceName: 'رحلة إلى الأهرامات وأبو الهول',
        date: '25 ديسمبر 2024',
        time: '8:00 ص - 6:00 م',
        location: 'أمام السنتر',
        status: 'ملغي',
        createdAt: Date.now() - 259200000,
    },
];
