
import React, { useState, useCallback, useEffect } from 'react';
import { User, Theme, Page, Teacher, Lesson, Trip, Post, Booking } from './types';
import { MOCK_USER_STUDENT, MOCK_USER_ADMIN, MOCK_TEACHERS, MOCK_LESSONS, MOCK_TRIPS, MOCK_POSTS, MOCK_BOOKINGS } from './constants';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import HomePage from './pages/HomePage';
import FullSchedulePage from './pages/FullSchedulePage';
import TeachersPage from './pages/TeachersPage';
import TripsPage from './pages/TripsPage';
import BooksPage from './pages/BooksPage';
import AiExamPage from './pages/AiExamPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import GalleryPage from './pages/GalleryPage';
import NewsBoardPage from './pages/NewsBoardPage';
import MyBookingsPage from './pages/MyBookingsPage';

const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>('light');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [teachers, setTeachers] = useState<Teacher[]>(MOCK_TEACHERS);
    const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
    const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
    const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
    const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'pink');
        root.classList.add(theme);
    }, [theme]);
    
    const handleLogin = (userType: 'student' | 'admin') => {
        setCurrentUser(userType === 'student' ? MOCK_USER_STUDENT : MOCK_USER_ADMIN);
        setCurrentPage('home');
    };

    const handleLogout = useCallback(() => {
        setCurrentUser(null);
        setCurrentPage('home');
    }, []);

    const handleCreateBooking = useCallback((service: Lesson | Trip, type: 'حصة' | 'رحلة') => {
        if (!currentUser) return;

        const existingBooking = bookings.find(b => b.studentId === currentUser.id && b.serviceId === service.id);
        if (existingBooking) {
            alert('لقد حجزت هذا الموعد بالفعل!');
            return;
        }

        const newBooking: Booking = {
            id: `BKG-${Date.now()}`,
            studentId: currentUser.id,
            studentName: currentUser.name,
            serviceType: type,
            serviceId: service.id,
            serviceName: (service as any).subject || (service as any).title,
            date: (service as any).day || (service as any).date,
            time: service.time,
            location: (service as any).hall || (service as any).meetingPoint,
            status: 'قيد المراجعة',
            createdAt: Date.now(),
        };
        
        setBookings(prev => [newBooking, ...prev]);
        
        if (type === 'حصة') {
            setLessons(prev => prev.map(l => l.id === service.id ? {...l, bookedCount: (l.bookedCount || 0) + 1} : l));
        } else if (type === 'رحلة') {
            setTrips(prev => prev.map(t => t.id === service.id ? {...t, bookedCount: t.bookedCount + 1} : t));
        }

        alert('تم إرسال طلب الحجز بنجاح! سيتم مراجعته من قبل الإدارة.');

    }, [currentUser, bookings]);

    const handleUpdateBookingStatus = useCallback((bookingId: string, newStatus: Booking['status']) => {
        setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: newStatus} : b));
    }, []);


    const renderPage = () => {
        if (!currentUser) {
            return <LoginPage onLogin={handleLogin} />;
        }
        switch (currentPage) {
            case 'home':
                return <HomePage user={currentUser} lessons={lessons} posts={posts} trips={trips} onNavigate={setCurrentPage} bookings={bookings} onCreateBooking={handleCreateBooking} />;
            case 'full-schedule':
                return <FullSchedulePage user={currentUser} lessons={lessons}/>;
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
                    posts={posts} setPosts={setPosts}
                    bookings={bookings} onUpdateBookingStatus={handleUpdateBookingStatus}
                /> : <HomePage user={currentUser} lessons={lessons} posts={posts} trips={trips} onNavigate={setCurrentPage} bookings={bookings} onCreateBooking={handleCreateBooking} />;
            case 'profile':
                return <ProfilePage user={currentUser} onUserUpdate={setCurrentUser} />;
            case 'about':
                return <AboutPage />;
            default:
                return <HomePage user={currentUser} lessons={lessons} posts={posts} trips={trips} onNavigate={setCurrentPage} bookings={bookings} onCreateBooking={handleCreateBooking} />;
        }
    };

    return (
        <div className="min-h-screen">
            {currentUser && (
                <>
                    <Header onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
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
                </>
            )}
            <main className={`${currentUser ? 'pt-20 lg:pr-72' : ''} transition-all duration-300`}>
                <div className={!currentUser ? '' : 'p-6'}>
                    {renderPage()}
                </div>
            </main>
        </div>
    );
};

export default App;
