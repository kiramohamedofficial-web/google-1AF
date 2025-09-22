

export type Theme = 'light' | 'dark' | 'pink' | 'cocktail' | 'ocean' | 'forest' | 'sunset' | 'matrix' | 'wave' | 'royal' | 'paper';

export type Page = 
    | 'home' 
    | 'full-schedule' 
    | 'teachers' 
    | 'admin-dashboard' 
    | 'profile' 
    | 'about'
    | 'privacy-policy'
    | 'terms-of-service'
    | 'news'
    | 'app-control';

export interface Center {
    id: string;
    name: string;
}

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
    gender?: 'ذكر' | 'أنثى';
    section?: 'علمي علوم' | 'علمي رياضة' | 'أدبي' | 'عام';
    lastScheduleEdit?: number;
    xpPoints?: number;
    center_id: string;
    center?: Center;
}

export interface Lesson {
    id: string;
    day: 'الأحد' | 'الاثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس' | 'الجمعة' | 'السبت';
    subject: string;
    teacher_id: string;
    time: string;
    hall: string;
    grade: string;
    notes?: string;
    center_id: string;
    // Populated at runtime for backwards compatibility with components
    teacher: string; 
    // Holds the result of the Supabase join
    teachers?: { 
        name: string;
    };
}

export interface Teacher {
    id: string;
    name: string;
    subject: string;
    imageUrl?: string;
    bio: string;
    phone?: string;
    email?: string;
    grades?: string;
    center_id: string;
}

export interface Notification {
  id: string;
  type: 'general' | 'new_post';
  message: string;
  created_at: string;
  read: boolean;
  user_id: string;
  related_id?: string;
  center_id: string;
}

export interface Post {
    id: string;
    title: string;
    content: string;
    author: string;
    timestamp: string;
    imageUrls?: string[];
    center_id: string;
}

export interface DefaultProfilePicture {
  id: string;
  gender: 'male' | 'female';
  image_url: string;
  created_at: string;
}