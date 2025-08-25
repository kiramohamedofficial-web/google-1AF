


export type Theme = 'light' | 'dark' | 'pink' | 'cocktail' | 'ocean' | 'forest' | 'sunset' | 'matrix' | 'wave' | 'royal' | 'paper';

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
    | 'my-bookings'
    | 'smart-schedule'
    | 'feedback'
    | 'instructions'
    | 'privacy-policy'
    | 'terms-of-service';

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
    lastScheduleEdit?: number;
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
    bookingRequired?: boolean;
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
    subject: string;
    grade: string;
    cognitive_level: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
    difficulty: 'M1' | 'M2' | 'M3'; // M1=Easy, M2=Medium, M3=Advanced
    stem: string; // The question text itself
    context?: string; // Optional context like a text, graph description, etc.
    options: string[];
    correctOptionIndex: number;
    rationale: string; // Explanation for the correct answer
    skills?: string[]; // e.g., "Reasoning", "Data Interpretation"
    tags?: string[];
    time_suggestion_sec?: number;
}

export interface SubjectScore {
    score: number;
    total: number;
}

// Breakdown by different criteria
export interface PerformanceBreakdown {
    bySubject: Record<string, SubjectScore>;
    byCognitiveLevel: Record<string, SubjectScore>;
    byDifficulty: Record<string, SubjectScore>;
}

export interface AnswerReview {
    questionStem: string;
    subject: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    rationale: string; // The key addition
}

export interface ExamResult {
    totalScore: number;
    totalQuestions: number;
    performanceBreakdown: PerformanceBreakdown;
    review: AnswerReview[];
    aiMessage: string;
    performanceAnalysis?: string; // Textual analysis from AI
    improvementTips?: string[];
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

export interface Notification {
  id: string;
  userId: string; // ID of the user this notification is for
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: Page; // Optional page to navigate to on click
}

export interface ScheduleItem {
    id: string;
    start: string; // "HH:mm" e.g., "09:00"
    end: string;   // "HH:mm" e.g., "10:30"
    title: string;
    type: 'study' | 'break' | 'lesson' | 'sleep' | 'personal';
    subject?: string;
    isLocked?: boolean; // For pre-set lessons
    isCompleted?: boolean;
}