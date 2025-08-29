

// FIX: Import User from @supabase/gotrue-js to solve export issue.
import type { User as SupabaseUser } from '@supabase/gotrue-js';

export type Theme = 'light' | 'dark' | 'pink' | 'cocktail' | 'ocean' | 'sunset' | 'matrix' | 'wave';

export type Page = 
    | 'home' 
    | 'full-schedule' 
    | 'teachers' 
    | 'trips' 
    | 'books' 
    | 'gallery'
    | 'news-board'
    | 'ai-exam' 
    | 'admin-dashboard' 
    | 'profile' 
    | 'about'
    | 'my-bookings'
    | 'smart-schedule'
    | 'educational-platform'
    | 'platform-admin-dashboard'
    | 'instructions'
    | 'privacy-policy'
    | 'terms-of-service';

export interface User {
    id: string;
    supabaseUser?: SupabaseUser | null;
    role: 'student' | 'admin';
    name: string;
    email: string;
    phone: string;
    guardian_phone: string;
    school: string;
    grade: string;
    profile_picture_url?: string;
    dob?: string;
    section?: 'علمي علوم' | 'علمي رياضة' | 'أدبي' | 'عام';
    last_schedule_edit?: number;
    xp_points?: number;
    subscription_end_date?: string; // New field for platform subscription
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
    booked_count?: number;
    booking_required?: boolean;
}

export interface Trip {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    meeting_point: string;
    capacity: number;
    booked_count: number;
    cost?: number;
    image_urls: string[];
}

export interface Post {
    id: string;
    title: string;
    author: string;
    content: string;
    image_urls?: string[];
    timestamp: string; // This will be a ISO string from DB, we can format it
    status: 'published' | 'draft';
    is_pinned?: boolean;
}

export interface Teacher {
    id: string;
    name: string;
    subject: string;
    image_url: string;
    bio: string;
    phone?: string;
    email?: string;
    grades?: string;
}

export interface Book {
    id: string;
    title: string;
    description: string;
    pdf_url: string;
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
    correct_option_index: number;
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
    image_url: string;
    title: string;
    album: 'رحلات' | 'أنشطة' | 'تكريم' | 'حصص';
}

export type BookingStatus = 'قيد المراجعة' | 'مؤكد' | 'ملغي' | 'منتهي';

export type ServiceType = 'حصة' | 'رحلة';

export interface Booking {
    id: string;
    student_id: string;
    student_name: string;
    service_type: ServiceType;
    service_id: string;
    service_name: string;
    date: string;
    time: string;
    location: string;
    status: BookingStatus;
    notes?: string;
    created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string; // ID of the user this notification is for
  title: string;
  message: string;
  created_at: string;
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
    is_locked?: boolean; // For pre-set lessons
    is_completed?: boolean;
}

export interface SocialLinks {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
}

export interface SiteSettings {
    id: number | string; // Can be a number (like 1) or a UUID string.
    key?: string; // The database error indicates this field exists and is NOT NULL.
    site_name?: string;
    seo_title?: string;
    seo_description?: string;
    favicon_url?: string;
    social_links?: SocialLinks;
}

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastNotification {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

// --- Educational Platform Types ---

export interface PlatformTeacher {
  id: string;
  name: string;
  subject: string;
  image_url: string;
  bio: string;
}

export interface LessonContent {
  id: string;
  type: 'video' | 'summary' | 'exercise';
  title: string;
  url: string;
  duration_minutes?: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  is_free?: boolean;
  content: LessonContent[];
}

export interface CourseUnit {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  teacher_name: string; // Denormalized for easy display
  // FIX: Added optional teacher_image property. The `getCourses` service function dynamically adds this
  // denormalized field, but it was missing from the type definition, causing a type error in `saveCourse`.
  teacher_image?: string;
  grade: string;
  subject: string;
  image_url: string;
  structure: CourseUnit[]; // Stored as JSONB in Supabase
}

export interface SubscriptionRequest {
  id: string;
  student_id: string;
  student_name: string;
  selected_subjects: string[];
  duration_months: number;
  amount_paid: number;
  payment_phone: string;
  discount_code?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// --- AI Chat Types ---
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}