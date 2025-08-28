



import React, { useState, useCallback, useEffect } from 'react';
// FIX: Import Session from @supabase/gotrue-js to solve export issue.
import type { Session } from '@supabase/gotrue-js';
import { User, Theme, Page, Teacher, Lesson, Trip, Post, Booking, AppNotification, ToastNotification, ToastType, SiteSettings, PlatformTeacher, Course, SubscriptionRequest } from './types.ts';
import * as supabaseService from './services/supabaseService.ts';
import { supabase } from './services/supabaseClient.ts';
import { v4 as uuidv4 } from 'uuid';

import Header from './components/layout/Header.tsx';
import Sidebar from './components/layout/Sidebar.tsx';
import Footer from './components/layout/Footer.tsx';
import { NotificationContainer } from './components/common/ToastNotifications.tsx';
import { AiChatModal } from './components/common/AiChatModal.tsx';
import HomePage from './pages/HomePage.tsx';
import FullSchedulePage from './pages/FullSchedulePage.tsx';
import TeachersPage from './pages/TeachersPage.tsx';
import TripsPage from './pages/TripsPage.tsx';
import BooksPage from './pages/BooksPage.tsx';
import AiExamPage from './pages/AiExamPage.tsx';
import AdminDashboardPage from './pages/AdminDashboardPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import GalleryPage from './pages/GalleryPage.tsx';
import NewsBoardPage from './pages/NewsBoardPage.tsx';
import MyBookingsPage from './pages/MyBookingsPage.tsx';
import SmartSchedulePage from './pages/SmartSchedulePage.tsx';
import EducationalPlatformPage from './pages/EducationalPlatformPage.tsx';
import PlatformAdminDashboardPage from './pages/PlatformAdminDashboardPage.tsx';
import InstructionsPage from './pages/InstructionsPage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.tsx';
import TermsOfServicePage from './pages/TermsOfServicePage.tsx';

const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        try {
            const savedTheme = localStorage.getItem('theme') as Theme;
            const validThemes: Theme[] = ['light', 'dark', 'pink', 'cocktail', 'ocean', 'sunset', 'matrix', 'wave'];
            if (savedTheme && validThemes.includes(savedTheme)) return savedTheme;
        } catch (error) { console.error("Could not read theme from localStorage", error); }
        return 'light';
    });

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [isAiChatOpen, setIsAiChatOpen] = useState(false);

    const addToast = useCallback((type: ToastType, title: string, message: string) => {
        const id = uuidv4();
        setToasts(prev => [...prev, { id, type, title, message }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Data states
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [platformTeachers, setPlatformTeachers] = useState<PlatformTeacher[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [subscriptionRequests, setSubscriptionRequests] = useState<SubscriptionRequest[]>([]);
    const [userPendingRequest, setUserPendingRequest] = useState<SubscriptionRequest | null>(null);

    useEffect(() => {
        try {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark', 'pink', 'cocktail', 'ocean', 'sunset', 'matrix', 'wave', 'royal', 'paper', 'forest');
            root.classList.add(theme);
            localStorage.setItem('theme', theme);
        } catch (error) { console.error("Could not save theme to localStorage", error); }
    }, [theme]);

    const fetchDataForUser = useCallback(async (user: User) => {
        try {
            const [
                fetchedLessons, 
                fetchedTrips, 
                fetchedPosts, 
                fetchedTeachers, 
                fetchedBookings, 
                fetchedNotifications,
                fetchedStudents,
                fetchedPlatformTeachers,
                fetchedCourses,
                fetchedSubscriptionRequests,
                fetchedUserPendingRequest
            ] = await Promise.all([
                supabaseService.getLessons(),
                supabaseService.getTrips(),
                supabaseService.getPosts(),
                supabaseService.getTeachers(),
                user.role === 'admin' ? supabaseService.getAllBookings() : supabaseService.getBookings(user.id),
                supabaseService.getNotifications(user.id),
                user.role === 'admin' ? supabaseService.getStudents() : Promise.resolve([]),
                user.role === 'admin' ? supabaseService.getPlatformTeachers() : Promise.resolve([]),
                user.role === 'admin' ? supabaseService.getCourses() : Promise.resolve([]),
                user.role === 'admin' ? supabaseService.getSubscriptionRequestsForAdmin() : Promise.resolve([]),
                user.role === 'student' ? supabaseService.getSubscriptionRequestForStudent(user.id) : Promise.resolve(null),
            ]);
            setLessons(fetchedLessons);
            setTrips(fetchedTrips);
            setPosts(fetchedPosts);
            setTeachers(fetchedTeachers);
            setBookings(fetchedBookings);
            setNotifications(fetchedNotifications);
            setStudents(fetchedStudents);
            setPlatformTeachers(fetchedPlatformTeachers);
            setCourses(fetchedCourses);
            setSubscriptionRequests(fetchedSubscriptionRequests);
            setUserPendingRequest(fetchedUserPendingRequest);
        } catch (error) {
            console.error("Failed to fetch initial data for user:", error);
            addToast('error', 'فشل تحميل البيانات', 'حدث خطأ أثناء تحميل بيانات التطبيق.');
            setLessons([]);
            setTrips([]);
            setPosts([]);
            setTeachers([]);
            setBookings([]);
            setNotifications([]);
            setStudents([]);
            setPlatformTeachers([]);
            setCourses([]);
            setSubscriptionRequests([]);
            setUserPendingRequest(null);
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    const handleAuthChange = useCallback(async (session: Session | null) => {
        try {
            if (session?.user) {
                const userProfile = await supabaseService.getProfile(session.user.id);
                if (userProfile) {
                    setCurrentUser({ ...userProfile, supabaseUser: session.user });
                    await fetchDataForUser(userProfile);
                } else {
                    await supabase.auth.signOut();
                    setCurrentUser(null);
                    setLoading(false);
                }
            } else {
                setCurrentUser(null);
                setLoading(false);
            }
        } catch (error) {
            console.error("A critical error occurred in the auth state change handler:", supabaseService.getSupabaseErrorMessage(error));
            setCurrentUser(null);
            setLoading(false);
        }
    }, [fetchDataForUser]);
    
    useEffect(() => {
        setLoading(true);
        
        const fetchSiteSettings = async () => {
            const settings = await supabaseService.getSiteSettings();
            setSiteSettings(settings);
            if (settings?.favicon_url) {
                 let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.getElementsByTagName('head')[0].appendChild(link);
                }
                link.href = settings.favicon_url;
            }
        };
        fetchSiteSettings();

        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            handleAuthChange(session);
        };
        checkInitialSession();
        
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session?.user?.id !== currentUser?.id) {
                   handleAuthChange(session);
                }
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [handleAuthChange, currentUser?.id]);
    
    // --- Lesson Reminder Notification Logic ---
    const handleSendAutomaticReminder = useCallback(async (lesson: Lesson, userId: string) => {
        const title = "تذكير بموعد حصة";
        const message = `حصتك (${lesson.subject}) ستبدأ خلال 30 دقيقة.`;
        
        addToast('info', title, message);
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: message, icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%F0%9F%93%9A%3C/text%3E%3C/svg%3E" });
        }
        try {
            const newNotification = await supabaseService.createNotification(userId, title, message, 'full-schedule');
            setNotifications(prev => [newNotification, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } catch (error) {
            console.error("Failed to create in-app reminder notification:", error);
        }
    }, [addToast]);

    useEffect(() => {
        if (!currentUser || lessons.length === 0 || currentUser.role !== 'student') return;
        const scheduledTimeouts = new Map<string, number>();
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const todayName = today.toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long' });
        const userLessonsToday = lessons.filter(l => l.grade === currentUser.grade && l.day === todayName);

        userLessonsToday.forEach(lesson => {
            const notificationKey = `notified_lesson_${lesson.id}_${todayStr}`;
            if (localStorage.getItem(notificationKey)) return;
            const timeMatch = lesson.time.match(/(\d{1,2}):(\d{2})\s*(ص|م)/);
            if (!timeMatch) return;
            let [, hoursStr, minutesStr, period] = timeMatch;
            let hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);
            if (period === 'م' && hours !== 12) hours += 12;
            else if (period === 'ص' && hours === 12) hours = 0;
            const lessonStartTime = new Date();
            lessonStartTime.setHours(hours, minutes, 0, 0);
            const notificationTime = new Date(lessonStartTime.getTime() - 30 * 60 * 1000);
            if (notificationTime > new Date()) {
                const timeoutDuration = notificationTime.getTime() - new Date().getTime();
                const timeoutId = window.setTimeout(() => {
                    handleSendAutomaticReminder(lesson, currentUser.id);
                    localStorage.setItem(notificationKey, 'true');
                    scheduledTimeouts.delete(lesson.id);
                }, timeoutDuration);
                scheduledTimeouts.set(lesson.id, timeoutId);
            }
        });
        return () => scheduledTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    }, [currentUser, lessons, handleSendAutomaticReminder]);
    
    // --- Trip Reminder Notification Logic ---
    useEffect(() => {
        if (!currentUser || trips.length === 0 || bookings.length === 0 || currentUser.role !== 'student') return;
        const scheduledTimeouts = new Map<string, number>();
        const userBookedTrips = trips.filter(trip => bookings.some(b => b.student_id === currentUser.id && b.service_id === trip.id && b.status === 'مؤكد'));
        userBookedTrips.forEach(trip => {
            const today = new Date();
            if (!trip.date || isNaN(new Date(trip.date).getTime())) return;
            const timeMatch = trip.time.match(/(\d{1,2}):(\d{2})\s*(ص|م)/);
            if (!timeMatch) return;
            let [, hoursStr, minutesStr, period] = timeMatch;
            let hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);
            if (period === 'م' && hours !== 12) hours += 12;
            else if (period === 'ص' && hours === 12) hours = 0;
            const tripDateTime = new Date(`${trip.date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
            const reminderTime = new Date(tripDateTime.getTime() - 24 * 60 * 60 * 1000);
            const notificationKey = `notified_trip_${trip.id}_${reminderTime.toISOString().split('T')[0]}`;
            if (localStorage.getItem(notificationKey)) return;
            if (reminderTime > today) {
                const timeoutDuration = reminderTime.getTime() - today.getTime();
                const timeoutId = window.setTimeout(async () => {
                    const title = "تذكير بموعد رحلة";
                    const message = `رحلتك (${trip.title}) غدًا! لا تنس التواجد في ${trip.meeting_point} بالموعد.`;
                    addToast('info', title, message);
                    if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body: message, icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%F0%9F%9A%8C%3C/text%3E%3C/svg%3E" });
                    try {
                        const newNotification = await supabaseService.createNotification(currentUser.id, title, message, 'trips');
                        setNotifications(prev => [newNotification, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
                    } catch (error) { console.error("Failed to create in-app trip reminder:", error); }
                    localStorage.setItem(notificationKey, 'true');
                    scheduledTimeouts.delete(trip.id);
                }, timeoutDuration);
                scheduledTimeouts.set(trip.id, timeoutId);
            }
        });
        return () => scheduledTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    }, [currentUser, trips, bookings, addToast]);

    // --- Manual Reminder Setter ---
    const handleSetReminder = useCallback(async (lesson: Lesson, minutesBefore: number): Promise<boolean> => {
        if (!currentUser) return false;
        const timeMatch = lesson.time.match(/(\d{1,2}):(\d{2})\s*(ص|م)/);
        if (!timeMatch) { addToast('error', 'خطأ', 'صيغة وقت الحصة غير صحيحة.'); return false; }
        let [, hoursStr, minutesStr, period] = timeMatch;
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        if (period === 'م' && hours !== 12) hours += 12; else if (period === 'ص' && hours === 12) hours = 0;
        const lessonStartTime = new Date();
        lessonStartTime.setHours(hours, minutes, 0, 0);
        const notificationTime = new Date(lessonStartTime.getTime() - minutesBefore * 60 * 1000);
        if (notificationTime > new Date()) {
            const timeoutDuration = notificationTime.getTime() - new Date().getTime();
            window.setTimeout(async () => {
                const title = `تذكير: حصة بعد ${minutesBefore} دقيقة`;
                const message = `حصتك (${lesson.subject}) على وشك البدء في قاعة ${lesson.hall}!`;
                addToast('info', title, message);
                if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body: message, icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%F0%9F%93%9A%3C/text%3E%3C/svg%3E" });
                try {
                    const newNotification = await supabaseService.createNotification(currentUser.id, title, message, 'full-schedule');
                    setNotifications(prev => [newNotification, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
                } catch (error) { console.error("Failed to create manual reminder:", error); }
            }, timeoutDuration);
            addToast('success', 'تم ضبط التذكير', `سيصلك إشعار قبل حصة (${lesson.subject}) بـ ${minutesBefore} دقيقة.`);
            return true;
        } else {
            addToast('warning', 'لا يمكن ضبط التذكير', 'موعد الحصة قد فات بالفعل.');
            return false;
        }
    }, [currentUser, addToast]);

    const handleLogin = async (credentials: { email: string; password: string; }): Promise<string | null> => {
        setLoading(true);
        const { email, password } = credentials;
        await supabase.auth.signOut();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) { addToast('error', 'فشل تسجيل الدخول', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'); return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'; }
        return null;
    };

    const handleSignup = async (details: any) => {
        setLoading(true);
        const { error } = await supabaseService.signUpUser(details);
        if (error) { addToast('error', 'فشل إنشاء الحساب', error.message); setLoading(false); }
    };

    const handleLogout = useCallback(async () => {
        await supabaseService.signOut();
        setCurrentUser(null); setBookings([]); setLessons([]); setNotifications([]); setPosts([]); setStudents([]); setTeachers([]); setTrips([]); setPlatformTeachers([]); setCourses([]); setSubscriptionRequests([]); setUserPendingRequest(null); setCurrentPage('home');
    }, []);

    // --- Notification Handlers ---
    const handleMarkNotificationAsRead = useCallback(async (notificationId: string) => {
        try { await supabaseService.markNotificationRead(notificationId); setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n)); } 
        catch (error) { addToast('error', 'خطأ', supabaseService.getSupabaseErrorMessage(error)); }
    }, [addToast]);
    const handleMarkAllAsRead = useCallback(async (userId: string) => {
        try { await supabaseService.markAllNotificationsRead(userId); setNotifications(prev => prev.map(n => ({ ...n, read: true }))); }
        catch (error) { addToast('error', 'خطأ', supabaseService.getSupabaseErrorMessage(error)); }
    }, [addToast]);
    const handleDismissNotification = useCallback(async (notificationId: string) => {
        try { await supabaseService.deleteNotification(notificationId); setNotifications(prev => prev.filter(n => n.id !== notificationId)); }
        catch (error) { addToast('error', 'خطأ', supabaseService.getSupabaseErrorMessage(error)); }
    }, [addToast]);

    // --- Data Manipulation Handlers (For User) ---
    const handleCreateBooking = useCallback(async (service: Lesson | Trip, type: 'حصة' | 'رحلة') => {
        if (!currentUser) return;
        if (bookings.some(b => b.student_id === currentUser.id && b.service_id === service.id)) {
            addToast('warning', 'الحجز مكرر', 'لقد حجزت هذا الموعد بالفعل!');
            return;
        }
        try {
            const newBooking = await supabaseService.createBooking(currentUser, service, type);
            setBookings(prev => [newBooking, ...prev]);
            if (type === 'حصة') setLessons(await supabaseService.getLessons());
            if (type === 'رحلة') setTrips(await supabaseService.getTrips());
            addToast('success', 'تم إرسال طلب الحجز', 'سيتم مراجعته من قبل الإدارة قريبًا.');
        } catch (error) {
            addToast('error', 'خطأ في الحجز', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [currentUser, bookings, addToast]);

    // --- Data Manipulation Handlers (For Admin) ---
    const handleSaveTeacher = useCallback(async (teacher: Teacher) => {
        try {
            const isNew = !teachers.some(t => t.id === teacher.id);
            const savedTeacher = await supabaseService.saveTeacher(teacher);
            setTeachers(prev => isNew ? [savedTeacher, ...prev] : prev.map(t => t.id === teacher.id ? savedTeacher : t));
            addToast('success', 'تم الحفظ', `تم حفظ بيانات المدرس ${savedTeacher.name} بنجاح.`);
        } catch (error) {
            addToast('error', 'فشل حفظ المدرس', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [teachers, addToast]);

    const handleDeleteTeacher = useCallback(async (teacherId: string) => {
        try {
            await supabaseService.deleteTeacher(teacherId);
            setTeachers(prev => prev.filter(t => t.id !== teacherId));
            addToast('success', 'تم الحذف', 'تم حذف المدرس بنجاح.');
        } catch (error) {
            addToast('error', 'فشل الحذف', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [addToast]);

    const handleSaveLesson = useCallback(async (lesson: Lesson) => {
        try {
            const isNew = !lessons.some(l => l.id === lesson.id);
            const savedLesson = await supabaseService.saveLesson(lesson);
            setLessons(prev => isNew ? [savedLesson, ...prev] : prev.map(l => l.id === lesson.id ? savedLesson : l));
            addToast('success', 'تم الحفظ', `تم حفظ حصة ${savedLesson.subject} بنجاح.`);
        } catch (error) {
             addToast('error', 'فشل حفظ الحصة', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [lessons, addToast]);

    const handleDeleteLesson = useCallback(async (lessonId: string) => {
        try {
            await supabaseService.deleteLesson(lessonId);
            setLessons(prev => prev.filter(l => l.id !== lessonId));
            addToast('success', 'تم الحذف', 'تم حذف الحصة بنجاح.');
        } catch (error) {
             addToast('error', 'فشل حذف الحصة', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [addToast]);

    const handleSaveTrip = useCallback(async (trip: Trip) => {
        try {
            const isNew = !trips.some(t => t.id === trip.id);
            const savedTrip = await supabaseService.saveTrip(trip);
            setTrips(prev => isNew ? [savedTrip, ...prev] : prev.map(t => t.id === trip.id ? savedTrip : t));
            addToast('success', 'تم الحفظ', `تم حفظ رحلة "${savedTrip.title}" بنجاح.`);
        } catch (error) {
            addToast('error', 'فشل حفظ الرحلة', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [trips, addToast]);

    const handleDeleteTrip = useCallback(async (tripId: string) => {
        try {
            await supabaseService.deleteTrip(tripId);
            setTrips(prev => prev.filter(t => t.id !== tripId));
            addToast('success', 'تم الحذف', 'تم حذف الرحلة بنجاح.');
        } catch (error) {
            addToast('error', 'فشل حذف الرحلة', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [addToast]);

    const handleSaveStudent = useCallback(async (student: User) => {
        try {
            const savedProfile = await supabaseService.updateProfile(student.id, student);
            setStudents(prev => prev.map(s => s.id === student.id ? savedProfile : s));
            if (currentUser?.id === student.id) {
                setCurrentUser(prev => prev ? {...prev, ...savedProfile} : savedProfile);
            }
            addToast('success', 'تم الحفظ', `تم تحديث بيانات الطالب ${savedProfile.name}.`);
        } catch (error) {
            addToast('error', 'فشل تحديث الطالب', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [currentUser, addToast]);

    const handleDeleteStudent = useCallback(async (studentId: string) => {
        try {
            await supabaseService.deleteStudentProfile(studentId);
            setStudents(prev => prev.filter(s => s.id !== studentId));
            addToast('success', 'تم الحذف', 'تم حذف ملف الطالب بنجاح.');
        } catch (error) {
            addToast('error', 'فشل حذف الطالب', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [addToast]);

    const handleUpdateBookingStatus = useCallback(async (bookingId: string, newStatus: Booking['status']) => {
        const bookingToUpdate = bookings.find(b => b.id === bookingId);
        if (!bookingToUpdate) { addToast('error', 'خطأ', 'لم يتم العثور على الحجز.'); return; }
        try {
            await supabaseService.updateBookingStatus(bookingId, newStatus);
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
            addToast('info', 'تم تحديث الحالة', `تم تحديث حالة الحجز إلى "${newStatus}".`);
            if (newStatus === 'مؤكد' || newStatus === 'ملغي') {
                const studentId = bookingToUpdate.student_id;
                const title = newStatus === 'مؤكد' ? '🎉 تم تأكيد حجزك!' : '❌ تم إلغاء حجزك';
                const message = `تم تحديث حالة حجزك لـ "${bookingToUpdate.service_name}" إلى "${newStatus}".`;
                await supabaseService.createNotification(studentId, title, message, 'my-bookings');
            }
        } catch (error) {
            addToast('error', 'فشل التحديث', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [bookings, addToast]);

    const handleSavePost = useCallback(async (post: Post) => {
        try {
            const isNew = !posts.some(p => p.id === post.id);
            const savedPost = await supabaseService.savePost(post);
            setPosts(prev => isNew ? [savedPost, ...prev] : prev.map(p => p.id === post.id ? savedPost : p));
            addToast('success', 'تم الحفظ', `تم حفظ المنشور "${savedPost.title}" بنجاح.`);
        } catch (error) {
            addToast('error', 'فشل حفظ المنشور', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [posts, addToast]);
    
    const handleDeletePost = useCallback(async (postId: string) => {
        if (confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
            try {
                await supabaseService.deletePost(postId);
                setPosts(prev => prev.filter(p => p.id !== postId));
                addToast('success', 'تم الحذف', 'تم حذف المنشور بنجاح.');
            } catch (error) {
                 addToast('error', 'فشل حذف المنشور', supabaseService.getSupabaseErrorMessage(error));
            }
        }
    }, [addToast]);

    const handleTogglePinPost = useCallback(async (postId: string) => {
        const postToPin = posts.find(p => p.id === postId);
        if (!postToPin) return;
        try {
            await supabaseService.togglePinPost(postId, !postToPin.is_pinned);
            setPosts(await supabaseService.getPosts());
            addToast('info', 'تم التحديث', `تم ${!postToPin.is_pinned ? 'تثبيت' : 'إلغاء تثبيت'} المنشور.`);
        } catch (error) {
            addToast('error', 'فشل التثبيت', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [posts, addToast]);
    
    const handleUserUpdate = useCallback(async(updatedUser: User) => {
        try {
            const savedProfile = await supabaseService.updateProfile(updatedUser.id, updatedUser);
            setStudents(prev => prev.map(s => s.id === updatedUser.id ? { ...s, ...savedProfile } : s));
            if(currentUser?.id === updatedUser.id) {
                setCurrentUser(prev => prev ? {...prev, ...savedProfile} : savedProfile);
            }
            addToast('success', 'تم تحديث الملف الشخصي', 'تم حفظ البيانات بنجاح.');
        } catch (error) {
            addToast('error', 'فشل تحديث الملف الشخصي', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [addToast, currentUser?.id]);

    // --- Platform Admin Handlers ---
    const handleSavePlatformTeacher = useCallback(async (teacher: PlatformTeacher) => {
        try {
            const isNew = !platformTeachers.some(t => t.id === teacher.id);
            const savedTeacher = await supabaseService.savePlatformTeacher(teacher);
            setPlatformTeachers(prev => isNew ? [savedTeacher, ...prev] : prev.map(t => t.id === teacher.id ? savedTeacher : t));
            addToast('success', 'تم الحفظ', `تم حفظ بيانات المدرس ${savedTeacher.name} بنجاح.`);
        } catch (error) {
            addToast('error', 'فشل الحفظ', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [platformTeachers, addToast]);

    const handleDeletePlatformTeacher = useCallback(async (teacherId: string) => {
        try {
            await supabaseService.deletePlatformTeacher(teacherId);
            setPlatformTeachers(prev => prev.filter(t => t.id !== teacherId));
            addToast('success', 'تم الحذف', 'تم حذف المدرس بنجاح.');
        } catch (error) {
            addToast('error', 'فشل الحذف', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [addToast]);

    const handleSaveCourse = useCallback(async (course: Course) => {
        try {
            const savedCourse = await supabaseService.saveCourse(course);
            setCourses(await supabaseService.getCourses());
            addToast('success', 'تم الحفظ', `تم حفظ كورس "${savedCourse.title}" بنجاح.`);
        } catch (error) {
             addToast('error', 'فشل الحفظ', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [addToast]);

    const handleDeleteCourse = useCallback(async (courseId: string) => {
        try {
            await supabaseService.deleteCourse(courseId);
            setCourses(prev => prev.filter(c => c.id !== courseId));
            addToast('success', 'تم الحذف', 'تم حذف الكورس بنجاح.');
        } catch (error) {
             addToast('error', 'فشل الحذف', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [addToast]);
    
    const handleCreateSubscriptionRequest = useCallback(async (requestData: Omit<SubscriptionRequest, 'id' | 'created_at' | 'status'>): Promise<boolean> => {
        try {
            const newRequest = await supabaseService.createSubscriptionRequest(requestData);
            setUserPendingRequest(newRequest); 
            addToast('success', 'تم إرسال طلبك', 'جاري مراجعة طلب الاشتراك الخاص بك.');
            return true;
        } catch(error) {
            addToast('error', 'فشل إرسال الطلب', supabaseService.getSupabaseErrorMessage(error));
            return false;
        }
    }, [addToast]);

    const handleApproveSubscription = useCallback(async (request: SubscriptionRequest) => {
        try {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + request.duration_months);
            const studentProfile = students.find(s => s.id === request.student_id);
            if (!studentProfile) throw new Error('لم يتم العثور على ملف الطالب.');
            
            await supabaseService.updateProfile(request.student_id, { subscription_end_date: endDate.toISOString() });
            await supabaseService.updateSubscriptionRequestStatus(request.id, 'approved');
            await supabaseService.createNotification(request.student_id, '🎉 تم تفعيل اشتراكك!', `تم تفعيل اشتراكك في المنصة بنجاح حتى تاريخ ${endDate.toLocaleDateString('ar-EG')}.`, 'educational-platform');

            setStudents(prev => prev.map(s => s.id === request.student_id ? {...s, subscription_end_date: endDate.toISOString()} : s));
            setSubscriptionRequests(prev => prev.map(r => r.id === request.id ? {...r, status: 'approved'} : r));
            addToast('success', 'تم التفعيل', `تم تفعيل اشتراك الطالب ${request.student_name} بنجاح.`);
        } catch(error) {
            addToast('error', 'فشل تفعيل الاشتراك', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [students, addToast]);

    const handleRejectSubscription = useCallback(async (request: SubscriptionRequest) => {
        try {
            await supabaseService.updateSubscriptionRequestStatus(request.id, 'rejected');
            await supabaseService.createNotification(request.student_id, '⚠️ مشكلة في طلب الاشتراك', `حدثت مشكلة في تأكيد عملية الدفع الخاصة بك. يرجى مراجعة الإدارة.`, 'educational-platform');
            setSubscriptionRequests(prev => prev.map(r => r.id === request.id ? {...r, status: 'rejected'} : r));
            addToast('info', 'تم الرفض', `تم رفض طلب اشتراك الطالب ${request.student_name}.`);
        } catch(error) {
             addToast('error', 'فشل رفض الطلب', supabaseService.getSupabaseErrorMessage(error));
        }
    }, [addToast]);

    if (loading) {
        return <div className="min-h-screen bg-[hsl(var(--color-background))] flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[hsl(var(--color-primary))]"></div></div>;
    }

    if (!currentUser) {
        switch (currentPage) {
            case 'privacy-policy':
                return <div className="min-h-screen bg-[hsl(var(--color-background))] flex flex-col"><main className="flex-grow p-4 md:p-6"><PrivacyPolicyPage onNavigate={setCurrentPage} isInsideApp={false} /></main><Footer onNavigate={setCurrentPage} insideApp={false} siteSettings={siteSettings} /></div>;
            case 'terms-of-service':
                 return <div className="min-h-screen bg-[hsl(var(--color-background))] flex flex-col"><main className="flex-grow p-4 md:p-6"><TermsOfServicePage onNavigate={setCurrentPage} isInsideApp={false} /></main><Footer onNavigate={setCurrentPage} insideApp={false} siteSettings={siteSettings} /></div>;
            default:
                return <LoginPage onNavigate={setCurrentPage} onLogin={handleLogin} onSignup={handleSignup} siteSettings={siteSettings} />;
        }
    }

    const renderPageContent = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage user={currentUser} lessons={lessons} posts={posts} trips={trips} onNavigate={setCurrentPage} bookings={bookings} onCreateBooking={handleCreateBooking} onSetReminder={handleSetReminder} />;
            case 'full-schedule':
                return <FullSchedulePage user={currentUser} lessons={lessons}/>;
            case 'smart-schedule':
                return <SmartSchedulePage user={currentUser} onUserUpdate={handleUserUpdate} lessons={lessons} />;
            case 'teachers':
                return <TeachersPage teachers={teachers} />;
            case 'news-board':
                return <NewsBoardPage posts={posts} />;
            case 'trips':
                return <TripsPage trips={trips} setTrips={setTrips} user={currentUser} onCreateBooking={handleCreateBooking} bookings={bookings} />;
            case 'books':
                return <BooksPage />;
            case 'gallery':
                return <GalleryPage />;
            case 'ai-exam':
                return <AiExamPage user={currentUser} />;
            case 'my-bookings':
                return <MyBookingsPage user={currentUser} allBookings={bookings} />;
            case 'educational-platform':
                return <EducationalPlatformPage 
                    user={currentUser} 
                    onNavigate={setCurrentPage} 
                    lessons={lessons} 
                    onUserUpdate={handleUserUpdate} 
                    addToast={addToast} 
                    userPendingRequest={userPendingRequest}
                    onCreateSubscriptionRequest={handleCreateSubscriptionRequest}
                />;
            case 'platform-admin-dashboard':
                 return currentUser.role === 'admin' ? <PlatformAdminDashboardPage 
                    students={students} 
                    onUserUpdate={handleUserUpdate}
                    platformTeachers={platformTeachers}
                    onSavePlatformTeacher={handleSavePlatformTeacher}
                    onDeletePlatformTeacher={handleDeletePlatformTeacher}
                    courses={courses}
                    onSaveCourse={handleSaveCourse}
                    onDeleteCourse={handleDeleteCourse}
                    subscriptionRequests={subscriptionRequests}
                    onApproveSubscription={handleApproveSubscription}
                    onRejectSubscription={handleRejectSubscription}
                 /> : <HomePage user={currentUser} lessons={lessons} posts={posts} trips={trips} onNavigate={setCurrentPage} bookings={bookings} onCreateBooking={handleCreateBooking} onSetReminder={handleSetReminder} />;
            case 'admin-dashboard':
                return currentUser.role === 'admin' ? <AdminDashboardPage 
                    teachers={teachers} onSaveTeacher={handleSaveTeacher} onDeleteTeacher={handleDeleteTeacher}
                    lessons={lessons} onSaveLesson={handleSaveLesson} onDeleteLesson={handleDeleteLesson}
                    trips={trips} onSaveTrip={handleSaveTrip} onDeleteTrip={handleDeleteTrip}
                    posts={posts} onSavePost={handleSavePost} onDeletePost={handleDeletePost} onTogglePinPost={handleTogglePinPost}
                    bookings={bookings} onUpdateBookingStatus={handleUpdateBookingStatus}
                    students={students} onSaveStudent={handleSaveStudent} onDeleteStudent={handleDeleteStudent}
                    addToast={addToast}
                /> : <HomePage user={currentUser} lessons={lessons} posts={posts} trips={trips} onNavigate={setCurrentPage} bookings={bookings} onCreateBooking={handleCreateBooking} onSetReminder={handleSetReminder} />;
            case 'profile':
                return <ProfilePage user={currentUser} onUserUpdate={handleUserUpdate} />;
            case 'about':
                return <AboutPage />;
            case 'instructions':
                return <InstructionsPage />;
            case 'privacy-policy':
                return <PrivacyPolicyPage onNavigate={setCurrentPage} isInsideApp={true} />;
            case 'terms-of-service':
                return <TermsOfServicePage onNavigate={setCurrentPage} isInsideApp={true} />;
            default:
                return <HomePage user={currentUser} lessons={lessons} posts={posts} trips={trips} onNavigate={setCurrentPage} bookings={bookings} onCreateBooking={handleCreateBooking} onSetReminder={handleSetReminder} />;
        }
    };

    const headerTitle = currentPage === 'educational-platform' ? 'منصه جوجل التعليمية' : 'Google Center';

    return (
        <div className="min-h-screen bg-[hsl(var(--color-background))]">
            <NotificationContainer toasts={toasts} onDismiss={removeToast} />
            {currentUser && <AiChatModal isOpen={isAiChatOpen} onClose={() => setIsAiChatOpen(false)} user={currentUser} />}
            <div className="lg:flex">
                <Sidebar
                    isOpen={isSidebarOpen}
                    user={currentUser}
                    currentPage={currentPage}
                    onClose={() => setSidebarOpen(false)}
                    onNavigate={setCurrentPage}
                    onLogout={handleLogout}
                    theme={theme}
                    setTheme={setTheme}
                />
                <div className="relative flex min-w-0 flex-1 flex-col">
                    <Header
                        user={currentUser}
                        title={headerTitle}
                        onMenuClick={() => setSidebarOpen(!isSidebarOpen)}
                        notifications={notifications}
                        onNavigate={(page) => { setCurrentPage(page); setSidebarOpen(false); }}
                        onMarkAsRead={handleMarkNotificationAsRead}
                        onMarkAllAsRead={handleMarkAllAsRead}
                        onDismiss={handleDismissNotification}
                        onAiChatClick={() => setIsAiChatOpen(true)}
                    />
                     <main className="flex-grow pt-20">
                        <div className='p-4 md:p-6'>
                            {renderPageContent()}
                        </div>
                    </main>
                    <Footer onNavigate={setCurrentPage} insideApp={true} siteSettings={siteSettings} />
                </div>
            </div>
        </div>
    );
};

export default App;