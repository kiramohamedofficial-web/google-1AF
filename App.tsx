
import React, { useState, useCallback, useEffect } from 'react';
import { User, Theme, Page, Teacher, Lesson, Trip, Post, Booking, Notification } from './types.ts';
import { MOCK_USER_STUDENT, MOCK_USER_ADMIN, MOCK_TEACHERS, MOCK_LESSONS, MOCK_TRIPS, MOCK_POSTS, MOCK_BOOKINGS, MOCK_NOTIFICATIONS, MOCK_STUDENTS } from './constants.ts';
import Header from './components/layout/Header.tsx';
import Sidebar from './components/layout/Sidebar.tsx';
import Footer from './components/layout/Footer.tsx';
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
import FeedbackPage from './pages/FeedbackPage.tsx';
import InstructionsPage from './pages/InstructionsPage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.tsx';
import TermsOfServicePage from './pages/TermsOfServicePage.tsx';

const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        try {
            const savedTheme = localStorage.getItem('theme') as Theme;
            const validThemes: Theme[] = ['light', 'dark', 'pink', 'cocktail', 'ocean', 'forest', 'sunset', 'matrix', 'wave', 'royal', 'paper'];
            if (savedTheme && validThemes.includes(savedTheme)) {
                return savedTheme;
            }
        } catch (error) {
            console.error("Could not read theme from localStorage", error);
        }
        return 'light';
    });
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [teachers, setTeachers] = useState<Teacher[]>(MOCK_TEACHERS);
    const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
    const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
    const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
    const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

    useEffect(() => {
        try {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark', 'pink', 'cocktail', 'ocean', 'forest', 'sunset', 'matrix', 'wave', 'royal', 'paper');
            root.classList.add(theme);
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.error("Could not save theme to localStorage", error);
        }
    }, [theme]);
    
    const handleLogin = (userType: 'student' | 'admin') => {
        setCurrentUser(userType === 'student' ? MOCK_USER_STUDENT : MOCK_USER_ADMIN);
        setCurrentPage('home');
    };

    const handleLogout = useCallback(() => {
        setCurrentUser(null);
        setCurrentPage('home');
    }, []);

    // --- Notification Handlers ---
    const handleMarkNotificationAsRead = useCallback((notificationId: string) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    }, []);

    const handleMarkAllAsRead = useCallback((userId: string) => {
        setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
    }, []);

    const handleDismissNotification = useCallback((notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, []);

    // --- Data Manipulation Handlers ---
    const handleCreateBooking = useCallback((service: Lesson | Trip, type: 'حصة' | 'رحلة') => {
        if (!currentUser) return;

        const existingBooking = bookings.find(b => b.studentId === currentUser.id && b.serviceId === service.id);
        if (existingBooking) {
            alert('لقد حجزت هذا الموعد بالفعل!');
            return;
        }
        
        const isLesson = 'subject' in service;

        const newBooking: Booking = {
            id: `BKG-${Date.now()}`,
            studentId: currentUser.id,
            studentName: currentUser.name,
            serviceType: type,
            serviceId: service.id,
            serviceName: isLesson ? service.subject : service.title,
            date: isLesson ? service.day : service.date,
            time: service.time,
            location: isLesson ? service.hall : service.meetingPoint,
            status: 'قيد المراجعة',
            createdAt: Date.now(),
        };
        
        setBookings(prev => [newBooking, ...prev]);
        
        if (isLesson) {
            setLessons(prev => prev.map(l => l.id === service.id ? {...l, bookedCount: (l.bookedCount || 0) + 1} : l));
        } else {
            setTrips(prev => prev.map(t => t.id === service.id ? {...t, bookedCount: t.bookedCount + 1} : t));
        }

        // Create notification for admin
        const adminNotification: Notification = {
            id: `N-${Date.now()}-admin`,
            userId: 'admin001',
            title: 'طلب حجز جديد',
            message: `قام ${currentUser.name} بطلب حجز ${newBooking.serviceType} "${newBooking.serviceName}".`,
            timestamp: Date.now(),
            read: false,
            link: 'admin-dashboard',
        };
        setNotifications(prev => [adminNotification, ...prev]);

        alert('تم إرسال طلب الحجز بنجاح! سيتم مراجعته من قبل الإدارة.');

    }, [currentUser, bookings]);

    const handleUpdateBookingStatus = useCallback((bookingId: string, newStatus: Booking['status']) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking && (newStatus === 'مؤكد' || newStatus === 'ملغي')) {
            const studentNotification: Notification = {
                id: `N-${Date.now()}-${booking.studentId}`,
                userId: booking.studentId,
                title: `تحديث حالة الحجز`,
                message: `تم ${newStatus === 'مؤكد' ? 'تأكيد' : 'إلغاء'} حجزك لـ "${booking.serviceName}".`,
                timestamp: Date.now(),
                read: false,
                link: 'my-bookings'
            };
            setNotifications(prev => [studentNotification, ...prev]);
        }
        setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: newStatus} : b));
    }, [bookings]);

    const handleSavePost = (post: Post, isNew: boolean) => {
        setPosts(prev => isNew ? [post, ...prev] : prev.map(p => p.id === post.id ? post : p));

        if (isNew && post.status === 'published') {
            const newNotifications: Notification[] = MOCK_STUDENTS.map(student => ({
                id: `N-${Date.now()}-${student.id}`,
                userId: student.id,
                title: '📢 إعلان جديد!',
                message: `تم نشر: "${post.title}"`,
                timestamp: Date.now(),
                read: false,
                link: 'news-board'
            }));
            setNotifications(prev => [...newNotifications, ...prev]);
        }
    };

    const handleDeletePost = (postId: string) => {
        if (confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
            setPosts(prev => prev.filter(p => p.id !== postId));
        }
    };

    // --- RENDER LOGIC ---

    if (!currentUser) {
        // --- Logged-out views ---
        switch (currentPage) {
            case 'privacy-policy':
                return (
                    <div className="min-h-screen bg-[hsl(var(--color-background))] flex flex-col">
                        <main className="flex-grow p-4 md:p-6">
                            <PrivacyPolicyPage onNavigate={setCurrentPage} isInsideApp={false} />
                        </main>
                        <Footer onNavigate={setCurrentPage} insideApp={false} />
                    </div>
                );
            case 'terms-of-service':
                 return (
                    <div className="min-h-screen bg-[hsl(var(--color-background))] flex flex-col">
                        <main className="flex-grow p-4 md:p-6">
                            <TermsOfServicePage onNavigate={setCurrentPage} isInsideApp={false} />
                        </main>
                        <Footer onNavigate={setCurrentPage} insideApp={false} />
                    </div>
                );
            default:
                // For 'home' or any other page, show the login page.
                // LoginPage is a full-page component with its own footer.
                return <LoginPage onLogin={handleLogin} onNavigate={setCurrentPage} />;
        }
    }

    // --- Logged-in view ---
    const renderPageContent = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage user={currentUser} lessons={lessons} posts={posts} trips={trips} onNavigate={setCurrentPage} bookings={bookings} onCreateBooking={handleCreateBooking} />;
            case 'full-schedule':
                return <FullSchedulePage user={currentUser} lessons={lessons}/>;
            case 'smart-schedule':
                return <SmartSchedulePage user={currentUser} onUserUpdate={setCurrentUser} lessons={lessons} />;
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
            case 'admin-dashboard':
                return currentUser.role === 'admin' ? <AdminDashboardPage 
                    teachers={teachers} setTeachers={setTeachers} 
                    lessons={lessons} setLessons={setLessons}
                    trips={trips} setTrips={setTrips}
                    posts={posts} onSavePost={handleSavePost} onDeletePost={handleDeletePost}
                    bookings={bookings} onUpdateBookingStatus={handleUpdateBookingStatus}
                /> : <HomePage user={currentUser} lessons={lessons} posts={posts} trips={trips} onNavigate={setCurrentPage} bookings={bookings} onCreateBooking={handleCreateBooking} />;
            case 'profile':
                return <ProfilePage user={currentUser} onUserUpdate={setCurrentUser} />;
            case 'about':
                return <AboutPage />;
            case 'feedback':
                return <FeedbackPage />;
            case 'instructions':
                return <InstructionsPage />;
            case 'privacy-policy':
                return <PrivacyPolicyPage onNavigate={setCurrentPage} isInsideApp={true} />;
            case 'terms-of-service':
                return <TermsOfServicePage onNavigate={setCurrentPage} isInsideApp={true} />;
            default:
                return <HomePage user={currentUser} lessons={lessons} posts={posts} trips={trips} onNavigate={setCurrentPage} bookings={bookings} onCreateBooking={handleCreateBooking} />;
        }
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--color-background))]">
            <Header
                user={currentUser}
                onMenuClick={() => setSidebarOpen(!isSidebarOpen)}
                notifications={notifications}
                onNavigate={(page) => { setCurrentPage(page); setSidebarOpen(false); }}
                onMarkAsRead={handleMarkNotificationAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDismiss={handleDismissNotification}
            />
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
            <div className={`flex flex-col lg:pr-64`} style={{ minHeight: '100vh' }}>
                <main className={`flex-grow pt-20`}>
                    <div className='p-4 md:p-6'>
                        {renderPageContent()}
                    </div>
                </main>
                <Footer onNavigate={setCurrentPage} insideApp={true} />
            </div>
        </div>
    );
};

export default App;
