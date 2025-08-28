import { supabase, getPublicUrl } from './supabaseClient.ts';
// FIX: Changed import from 'Notification' to 'AppNotification' to match exported type.
import { User, Lesson, Trip, Post, Teacher, Booking, AppNotification, Page, SiteSettings, PlatformTeacher, Course, SubscriptionRequest } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
// FIX: Import AuthError from @supabase/gotrue-js to solve export issue.
import { AuthError } from '@supabase/gotrue-js';

// --- NEW Error Handling Helper ---
export const getSupabaseErrorMessage = (error: unknown): string => {
    // 1. Handle if it's already a standard Error object
    if (error instanceof Error) {
        // Even if it's an Error, its message could theoretically be non-string.
        return String(error.message || 'An error occurred.');
    }

    // 2. Handle if it's a Supabase-like error object
    if (error && typeof error === 'object' && 'message' in error) {
        const errorWithMessage = error as { message: unknown; details?: unknown; hint?: unknown; };
        
        let msg = String(errorWithMessage.message || '');
        if (errorWithMessage.details) msg += `\nDetails: ${String(errorWithMessage.details)}`;
        if (errorWithMessage.hint) msg += `\nHint: ${String(errorWithMessage.hint)}`;
        
        // Final check to prevent empty or weird messages
        return msg.trim().length > 0 ? msg : 'A Supabase error occurred with no message.';
    }
    
    // 3. Handle if it's a plain string
    if (typeof error === 'string') {
        return error.trim().length > 0 ? error : 'An empty error string was thrown.';
    }
    
    // 4. Fallback for other types
    try {
        return `An unexpected error occurred: ${JSON.stringify(error, null, 2)}`;
    } catch {
        return `An unstringifiable error object was caught.`;
    }
};


// A helper to check if a string is a full URL that shouldn't be processed further.
const isFullUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:');
}

// Helper to extract storage path from a full public URL
export const getPathFromUrl = (url: string | undefined | null): string | undefined => {
    if (!url || !isFullUrl(url) || !url.includes(process.env.SUPABASE_URL!)) {
        return url || undefined;
    }
    try {
        const urlObject = new URL(url);
        // Path is like /storage/v1/object/public/bucket/path/to/file.png
        // We want path/to/file.png
        const parts = urlObject.pathname.split('/');
        // The bucket name might contain slashes if it's nested, so we find the index of the bucket name
        const bucketIndex = parts.indexOf('public') + 2;
        if (bucketIndex > 1 && bucketIndex < parts.length) {
          return parts.slice(bucketIndex).join('/');
        }
        return url;
    } catch (e) {
        return url; // Not a valid URL, return as is.
    }
};

// --- File Upload Helper ---
export const uploadFile = async (bucket: string, file: File): Promise<string> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
        if (error) throw error;
        return data.path;
    } catch (error) {
        console.error(`Error uploading file to bucket ${bucket}:`, error);
        let errorMessage = getSupabaseErrorMessage(error);
        if (errorMessage.includes('Bucket not found')) {
            errorMessage += `\n\nتلميح: تأكد من إنشاء "bucket" باسم "${bucket}" في قسم التخزين (Storage) بمشروع Supabase الخاص بك، وتأكد من أن سياسات الوصول (policies) تسمح بالرفع.`;
        }
        throw new Error(errorMessage);
    }
};

// --- Site-wide Settings ---
export const getSiteSettings = async (): Promise<SiteSettings | null> => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('key', 'main_settings') // Fetch the specific settings row.
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') { // "Not a single row" - means no settings yet, which is fine
                console.log("No site settings found in database. This is normal if they haven't been configured yet.");
                return null;
            }
            // "relation does not exist" - the table hasn't been created yet, also fine.
            if (error.code === '42P01') {
                console.warn("The 'site_settings' table does not exist. Features like social media links in the footer will be disabled. This is expected on a fresh install.");
                return null;
            }
            throw error;
        }
        
        if (data) {
            // The column in the DB is `favicon_url` and it stores a path.
            // We convert this path to a full public URL for the app to use.
            const { favicon_url: path, ...rest } = data;
            return { ...rest, id: data.id, favicon_url: getPublicUrl('site_assets', path) };
        }
        return null;

    } catch (error) {
        console.error('Error fetching site settings:', getSupabaseErrorMessage(error));
        return null;
    }
};

export const saveSiteSettings = async (settingsData: Partial<SiteSettings>): Promise<SiteSettings> => {
    try {
        let response;
        const payload = { ...settingsData };
        
        if (!payload.key) payload.key = 'main_settings';

        if (payload.id) {
            const { id, ...updateData } = payload;
            response = await supabase.from('site_settings').update(updateData).eq('id', id).select().single();
        } else {
            delete payload.id; 
            response = await supabase.from('site_settings').insert([payload]).select().single();
        }
        
        const { data, error } = response;
        if (error) throw error;
        if (!data) throw new Error("Failed to save site settings, no data returned.");
        
        const { favicon_url: savedPath, ...savedRest } = data;
        return { ...savedRest, id: data.id, favicon_url: getPublicUrl('site_assets', savedPath) };
    } catch (error) {
        console.error('Error saving site settings:', error);
        throw new Error(getSupabaseErrorMessage(error));
    }
};


// --- Profile / User Functions ---

export const getProfile = async (userId: string): Promise<User | null> => {
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (error) throw error;
        return data ? { ...data, profile_picture_url: getPublicUrl('avatars', data.profile_picture_url) } : null;
    } catch (error) {
        console.error('Error fetching profile:', getSupabaseErrorMessage(error));
        return null;
    }
};

export const updateProfile = async (userId: string, updatedData: Partial<User>): Promise<User> => {
    try {
        const { supabaseUser, ...profileData } = updatedData;
        const { data, error } = await supabase.from('profiles').update(profileData).eq('id', userId).select().single();
        if (error) throw error;
        if (!data) throw new Error("Profile data not found after update.");
        return { ...data, profile_picture_url: getPublicUrl('avatars', data.profile_picture_url) };
    } catch (error) {
        console.error('Error updating profile:', error);
        throw new Error(getSupabaseErrorMessage(error));
    }
};

export const getStudents = async (): Promise<User[]> => {
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('role', 'student');
        if (error) throw error;
        if (!data) return [];
        return data.map(s => ({ ...s, profile_picture_url: getPublicUrl('avatars', s.profile_picture_url) }));
    } catch (error) {
        console.error('Error fetching students:', getSupabaseErrorMessage(error));
        return [];
    }
};

export const deleteStudentProfile = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase.rpc('delete_user_by_id', { user_id_to_delete: id });
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting student and profile:', error);
        const errorMessage = getSupabaseErrorMessage(error);
        throw new Error(`${errorMessage}. تأكد من إنشاء دالة RPC 'delete_user_by_id' في قاعدة بيانات Supabase.`);
    }
}

// --- Auth Functions ---

export const signUpUser = async (details: any): Promise<{ user: User | null, error: AuthError | null }> => {
    const { email, password, name, phone, guardian_phone, school, grade, section } = details;
    try {
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { name, phone, guardian_phone, school, grade, section, role: 'student' } }
        });
        if (error) throw error;
        return { user: data.user as any, error: null };
    } catch (error) {
        console.error('Error signing up:', error);
        return { user: null, error: error as AuthError };
    }
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', getSupabaseErrorMessage(error));
};

// --- Data Fetching Functions (Read operations can return empty on error to prevent UI crash) ---

export const getLessons = async (): Promise<Lesson[]> => {
    try {
        const { data, error } = await supabase.from('lessons').select('*').order('time');
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching lessons:', getSupabaseErrorMessage(error));
        return [];
    }
};

export const getTrips = async (): Promise<Trip[]> => {
    try {
        const { data, error } = await supabase.from('trips').select('*').order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(trip => ({
            ...trip,
            image_urls: (trip.image_urls || []).map((path: string) => isFullUrl(path) ? path : getPublicUrl('trip_images', path))
        }));
    } catch (error) {
        console.error('Error fetching trips:', getSupabaseErrorMessage(error));
        return [];
    }
};

export const getPosts = async (): Promise<Post[]> => {
    try {
        const { data, error } = await supabase.from('posts').select('*').order('is_pinned', { ascending: false }).order('timestamp', { ascending: false });
        if (error) throw error;
        return (data || []).map(post => ({
            ...post,
            image_urls: (post.image_urls || []).map((path: string) => isFullUrl(path) ? path : getPublicUrl('post_images', path))
        }));
    } catch (error) {
        console.error('Error fetching posts:', getSupabaseErrorMessage(error));
        return [];
    }
};

export const getTeachers = async (): Promise<Teacher[]> => {
    try {
        const { data, error } = await supabase.from('teachers').select('*');
        if (error) throw error;
        return (data || []).map(t => ({ 
            ...t, 
            image_url: isFullUrl(t.image_url) ? t.image_url : getPublicUrl('teacher_images', t.image_url) 
        }));
    } catch (error) {
        console.error('Error fetching teachers:', getSupabaseErrorMessage(error));
        return [];
    }
};

// --- Booking Functions ---

export const getBookings = async (userId: string): Promise<Booking[]> => {
    try {
        const { data, error } = await supabase.from('bookings').select('*').eq('student_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching user bookings:', getSupabaseErrorMessage(error));
        return [];
    }
};

export const getAllBookings = async (): Promise<Booking[]> => {
    try {
        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching all bookings:', getSupabaseErrorMessage(error));
        return [];
    }
};

export const createBooking = async (user: User, service: Lesson | Trip, type: 'حصة' | 'رحلة'): Promise<Booking> => {
    try {
        const isLesson = 'subject' in service;
        const bookingData = {
            student_id: user.id, student_name: user.name, service_type: type,
            service_id: service.id, service_name: isLesson ? service.subject : service.title,
            date: isLesson ? service.day : service.date, time: service.time,
            location: isLesson ? service.hall : service.meeting_point, status: 'قيد المراجعة' as const,
        };
        const { data, error } = await supabase.from('bookings').insert(bookingData).select().single();
        if (error) throw error;
        if (!data) throw new Error("Booking creation failed.");

        const serviceTable = type === 'حصة' ? 'lessons' : 'trips';
        const { error: rpcError } = await supabase.rpc('increment_booked_count', { 
            p_table_name: serviceTable, 
            p_service_id: service.id 
        });
        if (rpcError) {
             console.error("RPC Error (increment_booked_count), booking count might be inaccurate:", rpcError);
             throw new Error(`Booking created, but failed to update count. ${getSupabaseErrorMessage(rpcError)}`);
        }
        
        return data;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw new Error(getSupabaseErrorMessage(error));
    }
};

export const updateBookingStatus = async (bookingId: string, status: Booking['status']): Promise<void> => {
    try {
        const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
        if (error) throw error;
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw new Error(getSupabaseErrorMessage(error));
    }
};

// --- Notification Functions ---

export const getNotifications = async (userId: string): Promise<AppNotification[]> => {
    try {
        const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching notifications:', getSupabaseErrorMessage(error));
        return [];
    }
};

export const createNotification = async (userId: string, title: string, message: string, link?: Page): Promise<AppNotification> => {
    try {
        const notificationData = { user_id: userId, title, message, link, read: false };
        const { data, error } = await supabase.from('notifications').insert(notificationData).select().single();
        if (error) throw error;
        if (!data) throw new Error("Notification creation failed.");
        return data;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw new Error(getSupabaseErrorMessage(error));
    }
};

export const markNotificationRead = async (notificationId: string): Promise<void> => {
    try {
        const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
        if (error) throw error;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw new Error(getSupabaseErrorMessage(error));
    }
};

export const markAllNotificationsRead = async (userId: string): Promise<void> => {
    try {
        const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
        if (error) throw error;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw new Error(getSupabaseErrorMessage(error));
    }
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
        const { error } = await supabase.from('notifications').delete().eq('id', notificationId);
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw new Error(getSupabaseErrorMessage(error));
    }
};

// --- Generic Admin Content Management Functions ---

async function saveData<T extends { id?: string | number }>(tableName: string, data: Partial<T>): Promise<T> {
    try {
        const payload = { ...data };
        const recordId = payload.id;
        
        let response;
        if (recordId && typeof recordId === 'string' && !recordId.startsWith('new_')) {
            const { id, ...updatePayload } = payload;
            response = await supabase.from(tableName).update(updatePayload as any).eq('id', recordId).select().single();
        } else {
            delete payload.id;
            response = await supabase.from(tableName).insert([payload] as any).select().single();
        }
        
        const { data: result, error } = response;
        if (error) throw error;
        if (!result) throw new Error("Operation did not return the expected data.");
        return result;
    } catch (error) {
        console.error(`Error saving data to ${tableName}:`, error);
        throw new Error(getSupabaseErrorMessage(error));
    }
}

async function deleteData(tableName: string, id: string): Promise<void> {
    try {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) throw error;
    } catch (error) {
        console.error(`Error deleting data from ${tableName}:`, error);
        throw new Error(getSupabaseErrorMessage(error));
    }
}

// --- Specific Implementations ---

export const saveTeacher = async (teacherData: Partial<Teacher>): Promise<Teacher> => {
    const dataToSave = { ...teacherData, image_url: getPathFromUrl(teacherData.image_url) };
    const saved = await saveData<Teacher>('teachers', dataToSave);
    return { ...saved, image_url: getPublicUrl('teacher_images', saved.image_url) };
};
export const deleteTeacher = (id: string) => deleteData('teachers', id);

export const saveLesson = (lessonData: Partial<Lesson>) => saveData<Lesson>('lessons', lessonData);
export const deleteLesson = (id: string) => deleteData('lessons', id);

export const saveTrip = async (tripData: Partial<Trip>): Promise<Trip> => {
    const dataToSave = { ...tripData, image_urls: (tripData.image_urls || []).map(p => getPathFromUrl(p) || '').filter(Boolean) as string[] };
    const saved = await saveData<Trip>('trips', dataToSave);
    return { ...saved, image_urls: (saved.image_urls || []).map(path => getPublicUrl('trip_images', path)) };
};
export const deleteTrip = (id: string) => deleteData('trips', id);

export const savePost = async (postData: Partial<Post>): Promise<Post> => {
    const dataToSave = { ...postData, timestamp: new Date().toISOString(), image_urls: (postData.image_urls || []).map(p => getPathFromUrl(p) || '').filter(Boolean) as string[] };
    const saved = await saveData<Post>('posts', dataToSave);
    return { ...saved, image_urls: (saved.image_urls || []).map((path: string) => getPublicUrl('post_images', path)) };
};
export const deletePost = (postId: string) => deleteData('posts', postId);

export const togglePinPost = async (postId: string, shouldBePinned: boolean): Promise<void> => {
    try {
        const { error } = await supabase.rpc('set_pinned_post', { 
            p_post_id_to_pin: postId, 
            p_should_pin: shouldBePinned
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error toggling pin status via RPC:', error);
        throw new Error(`${getSupabaseErrorMessage(error)}. Make sure the 'set_pinned_post' RPC function is created.`);
    }
};

// --- EDUCATIONAL PLATFORM SERVICES ---

export const getPlatformTeachers = async (): Promise<PlatformTeacher[]> => {
    try {
        const { data, error } = await supabase.from('platform_teachers').select('*');
        if (error) {
            if (error.code === '42P01') {
                console.warn("The 'platform_teachers' table does not exist."); return [];
            } throw error;
        }
        return (data || []).map(t => ({...t, image_url: getPublicUrl('platform_teacher_images', t.image_url) }));
    } catch (error) {
        console.error('Error fetching platform teachers:', getSupabaseErrorMessage(error));
        return [];
    }
};

export const savePlatformTeacher = async (teacherData: Partial<PlatformTeacher>): Promise<PlatformTeacher> => {
    const dataToSave = { ...teacherData, image_url: getPathFromUrl(teacherData.image_url) };
    const saved = await saveData<PlatformTeacher>('platform_teachers', dataToSave);
    return { ...saved, image_url: getPublicUrl('platform_teacher_images', saved.image_url) };
};
export const deletePlatformTeacher = (id: string) => deleteData('platform_teachers', id);

export const getCourses = async (): Promise<Course[]> => {
    try {
        // Step 1: Fetch all courses
        const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('*');

        if (coursesError) {
             if (coursesError.code === '42P01') { // table does not exist
                console.warn("The 'courses' table does not exist. This is expected on a fresh install.");
                return [];
            }
            throw coursesError;
        }
        if (!coursesData) return [];

        // Step 2: Fetch all platform teachers
        const { data: teachersData, error: teachersError } = await supabase
            .from('platform_teachers')
            .select('id, name, image_url');
        
        if (teachersError) {
             console.error('Could not fetch teachers to join with courses:', teachersError);
             // Return courses without teacher info if teachers fail to load
             return coursesData.map(course => ({
                 ...course,
                 teacher_name: 'غير محدد',
                 teacher_image: getPublicUrl('platform_teacher_images', null),
                 image_url: getPublicUrl('course_images', course.image_url)
             }));
        }

        // Step 3: Create a map for quick teacher lookup
        const teacherMap = new Map(teachersData.map(t => [t.id, t]));

        // Step 4: Join the data
        return coursesData.map(course => {
            // FIX: Cast the result of map.get from 'any' to a specific type to allow property access.
            const teacher = teacherMap.get(course.teacher_id) as { name: string; image_url: string } | undefined;
            return {
                ...course,
                teacher_name: teacher?.name || 'غير محدد',
                teacher_image: getPublicUrl('platform_teacher_images', teacher?.image_url),
                image_url: getPublicUrl('course_images', course.image_url)
            };
        });

    } catch (error) {
        console.error('Error fetching courses:', getSupabaseErrorMessage(error));
        return [];
    }
};

export const saveCourse = async (courseData: Partial<Course>): Promise<Course> => {
    const { teacher_name, teacher_image, ...savableData } = courseData;
    const dataToSave = { ...savableData, image_url: getPathFromUrl(savableData.image_url) };
    return saveData<Course>('courses', dataToSave);
};
export const deleteCourse = (id: string) => deleteData('courses', id);

// --- Subscription Requests ---
export const createSubscriptionRequest = async (requestData: Omit<SubscriptionRequest, 'id' | 'created_at' | 'status'>): Promise<SubscriptionRequest> => {
    try {
        const { data, error } = await supabase.from('subscription_requests').insert({ ...requestData, status: 'pending' }).select().single();
        if (error) {
            if (error.code === '42P01') throw new Error("عذرًا، خدمة الاشتراكات غير متاحة حاليًا. يرجى مراجعة الإدارة.");
            throw error;
        }
        if (!data) throw new Error("Subscription request failed.");
        return data;
    } catch (error) {
        console.error('Error creating subscription request:', error);
        throw new Error(getSupabaseErrorMessage(error));
    }
};

export const getSubscriptionRequestsForAdmin = async (): Promise<SubscriptionRequest[]> => {
    try {
        const { data, error } = await supabase.from('subscription_requests').select('*').order('created_at', { ascending: false });
        if (error?.code === '42P01') { console.warn("Subscription requests table not found."); return []; }
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching subscription requests:', error);
        return [];
    }
};

export const getSubscriptionRequestForStudent = async (studentId: string): Promise<SubscriptionRequest | null> => {
    try {
        const { data, error } = await supabase.from('subscription_requests').select('*').eq('student_id', studentId).eq('status', 'pending').order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching student subscription request:', error);
        return null; // This is a read operation, can fail gracefully.
    }
};

export const updateSubscriptionRequestStatus = async (id: string, status: SubscriptionRequest['status']): Promise<void> => {
    try {
        const { error } = await supabase.from('subscription_requests').update({ status }).eq('id', id);
        if (error) throw error;
    } catch (error) {
        console.error('Error updating subscription request status:', error);
        throw new Error(getSupabaseErrorMessage(error));
    }
};