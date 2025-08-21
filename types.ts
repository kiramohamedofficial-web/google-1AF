

export type Theme = 'light' | 'dark' | 'pink';

export type Page = 
    | 'home' 
    | 'full-schedule' 
    | 'teachers' 
    | 'trips' 
    | 'books' 
    | 'gallery'
    | 'news-board'
    | 'ai-exam' 
    | 'admin-stats' 
    | 'admin-dashboard' 
    | 'profile' 
    | 'about'
    | 'my-bookings';

export interface User {
    id: string;
    role: 'student' | 'admin';
    name: string;
    email: string;
    phone: string;
    guardianPhone: string;
    school: string;
    grade: string;
    profilePicture?: string;
    dob?: string;
    section?: 'علمي علوم' | 'علمي رياضة' | 'أدبي' | 'عام';
}

export interface Lesson {
    id: string;
    day: 'الأحد' | 'الاثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس' | 'الجمعة' | 'السبت';
    subject: string;
    teacher: string;
    time: string;
    hall: string;
    grade: string;
    notes?: string;
    capacity?: number;
    bookedCount?: number;
}

export interface Trip {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    meetingPoint: string;
    capacity: number;
    bookedCount: number;
    cost?: number;
    imageUrls: string[];
}

export interface Post {
    id: string;
    title: string;
    author: string;
    content: string;
    imageUrls?: string[];
    timestamp: string;
    status: 'published' | 'draft';
}

export interface Teacher {
    id: string;
    name: string;
    subject: string;
    imageUrl: string;
    bio: string;
    phone?: string;
    email?: string;
    grades?: string;
}

export interface Book {
    id: string;
    title: string;
    description: string;
    pdfUrl: string;
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
    subject: string;
}

export interface SubjectScore {
    score: number;
    total: number;
}

export interface ExamResult {
    totalScore: number;
    totalQuestions: number;
    subjectScores: Record<string, SubjectScore>;
    feedback: {
        question: string;
        subject: string;
        studentAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
        explanation?: string;
    }[];
    neoMessage: string;
}

export interface GalleryImage {
    id: string;
    imageUrl: string;
    title: string;
    album: 'رحلات' | 'أنشطة' | 'تكريم' | 'حصص';
}

export type BookingStatus = 'قيد المراجعة' | 'مؤكد' | 'ملغي' | 'منتهي';

export type ServiceType = 'حصة' | 'رحلة';

export interface Booking {
    id: string;
    studentId: string;
    studentName: string;
    serviceType: ServiceType;
    serviceId: string;
    serviceName: string;
    date: string;
    time: string;
    location: string;
    status: BookingStatus;
    notes?: string;
    createdAt: number;
}