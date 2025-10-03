import React, { useState, useCallback, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { User, Theme, Page, Teacher, Lesson, Notification, Post, Center } from './types.ts';
import Header from './components/layout/Header.tsx';
import Sidebar from './components/layout/Sidebar.tsx';
import HomePage from './pages/HomePage.tsx';
import FullSchedulePage from './pages/FullSchedulePage.tsx';
import TeachersPage from './pages/TeachersPage.tsx';
import AdminDashboardPage from './pages/AdminDashboardPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.tsx';
import TermsOfServicePage from './pages/TermsOfServicePage.tsx';
import NewsBoardPage from './pages/NewsBoardPage.tsx';
import AppControlPage from './pages/AppControlPage.tsx';
import IconControlPage from './pages/IconControlPage.tsx';
import ExternalPlatformPage from './pages/ExternalPlatformPage.tsx';
import { supabase } from './services/supabaseClient.ts';
import { IconProvider } from './contexts/IconContext.tsx';
import { ThemeModal } from './components/common/Card3D.tsx';
import DigitalRain from './components/common/DigitalRain.tsx';
import { BookOpenIcon } from './components/common/Icons.tsx';

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
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

    const [centers, setCenters] = useState<Center[]>([]);
    const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
    const [students, setStudents] = useState<User[]>([]);

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
    
    const fetchData = useCallback(async () => {
        if (!selectedCenterId || !currentUser) {
            setLessons([]);
            setTeachers([]);
            setPosts([]);
            setStudents([]);
            return;
        }

        setLoading(true);
        try {
            const centerId = selectedCenterId;

            const checkError = (response: { error: any; data: any; }, tableName: string) => {
                if (response.error) {
                    console.error(`Supabase error fetching ${tableName}:`, response.error.message, response.error);
                    throw new Error(`Failed to fetch data for ${tableName}. Details: ${response.error.message}`);
                }
                return response.data || [];
            };

            let lessonsRes: any = { data: [], error: null };
            let teachersRes: any = { data: [], error: null };
            let postsRes: any = { data: [], error: null };
            let studentsRes: any = { data: [], error: null };

            if (currentUser.role === 'teacher') {
                const { data: teacherProfile, error: teacherError } = await supabase
                    .from('teachers')
                    .select('grades')
                    .eq('email', currentUser.email)
                    .eq('center_id', centerId)
                    .single();

                if (teacherError) console.error('Error fetching teacher profile:', teacherError);

                const teacherGrades = teacherProfile?.grades;

                if (teacherGrades && teacherGrades.length > 0) {
                    [lessonsRes, studentsRes, teachersRes, postsRes] = await Promise.all([
                        supabase.from('lessons').select('*, teachers(name)').eq('center_id', centerId).in('grade', teacherGrades),
                        supabase.from('users').select('*').eq('center_id', centerId).eq('role', 'student').in('grade', teacherGrades),
                        supabase.from('teachers').select('id, name, subject, email, phone, bio, grades, imageUrl:image_url, center_id').eq('center_id', centerId),
                        supabase.from('posts').select('id, title, content, author:author_id(name), timestamp:created_at, imageUrls:image_urls, center_id').eq('center_id', centerId)
                    ]);
                }
            } else { // Admin or Student
                const requests: any[] = [
                    supabase.from('lessons').select('*, teachers(name)').eq('center_id', centerId),
                    supabase.from('teachers').select('id, name, subject, email, phone, bio, grades, imageUrl:image_url, center_id').eq('center_id', centerId),
                    supabase.from('posts').select('id, title, content, author:author_id(name), timestamp:created_at, imageUrls:image_urls, center_id').eq('center_id', centerId),
                ];
                
                if (currentUser.role === 'admin') {
                    requests.push(supabase.from('users').select('*').eq('center_id', centerId).eq('role', 'student'));
                } else {
                    requests.push(Promise.resolve({ data: [], error: null }));
                }

                [lessonsRes, teachersRes, postsRes, studentsRes] = await Promise.all(requests);
            }
            
            const rawLessons = checkError(lessonsRes, 'lessons');
            const formattedLessons = rawLessons.map((lesson: any) => ({
                ...lesson,
                teacher: lesson.teachers?.name || 'مدرس غير محدد',
            }));
            setLessons(formattedLessons);
            setTeachers(checkError(teachersRes, 'teachers'));
            setStudents(checkError(studentsRes, 'users'));
            
            const rawPosts = checkError(postsRes, 'posts');
            const formattedPosts = rawPosts.map((post: any) => ({
                ...post,
                author: post.author?.name || 'مسؤول النظام',
            }));
            setPosts(formattedPosts);

        } catch (error) {
            console.error('Error fetching app data:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCenterId, currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        let isMounted = true;
    
        const userProfileQuery = 'id, role, name, email, phone, guardianPhone, school, grade, profilePicture, dob, gender, section, xpPoints, lastScheduleEdit, center_id, center:centers(id, name)';
        
        const fetchProfileWithRetry = async (user: Session['user']): Promise<User | null> => {
            if (!user) return null;
            const userId = user.id;

            const maxAttempts = 10;
            const delay = 1000; // Poll every second for up to 10 seconds

            for (let i = 0; i < maxAttempts; i++) {
                const { data, error } = await supabase.from('users').select(userProfileQuery).eq('id', userId).single();
                
                if (data) {
                    const correctedData = { ...data, center: Array.isArray(data.center) ? data.center[0] : data.center };
                    return correctedData as User;
                }

                if (error && error.code !== 'PGRST116') { // PGRST116 means "not found", which is retryable
                    console.error(`Profile fetch attempt ${i + 1} failed with a non-retryable error`, error);
                    throw error; // This will be caught by the outer catch block in processSession
                }

                // If error is PGRST116 or there is no data, we retry.
                if (isMounted) {
                    console.warn(`Profile not found for user ${userId} on attempt ${i + 1}/${maxAttempts}. Retrying...`);
                    if (i < maxAttempts - 1) {
                        await new Promise(res => setTimeout(res, delay));
                    }
                } else {
                    // Component unmounted, stop retrying.
                    return null;
                }
            }

            console.error(`Failed to find profile for user ${userId} after ${maxAttempts} attempts.`);
            return null;
        };

        const processSession = async (session: Session | null) => {
            if (!session?.user) {
                if (isMounted) {
                    setCurrentUser(null);
                    setSelectedCenterId(null);
                    setCenters([]);
                }
                return;
            }

            try {
                let profile = await fetchProfileWithRetry(session.user);
                
                if (!profile) {
                    console.warn(`Profile for user ${session.user.id} not found. Attempting to create a default admin profile.`);
                    
                    const newAdminProfileData = {
                        id: session.user.id,
                        email: session.user.email,
                        role: 'admin' as const,
                        name: session.user.email?.split('@')[0] || 'Admin',
                        center_id: null,
                        phone: '',
                        guardianPhone: '',
                        school: '',
                        grade: 'إدارة',
                    };

                    const { data: insertedProfile, error: insertError } = await supabase
                        .from('users')
                        .insert(newAdminProfileData)
                        .select(userProfileQuery)
                        .single();

                    if (insertError) {
                        console.error('Failed to create default admin profile, signing out:', insertError);
                        await supabase.auth.signOut();
                        setCurrentUser(null);
                        return;
                    }
                    console.log('Default admin profile created successfully.');
                    profile = insertedProfile as User;
                }

                if (isMounted) {
                    setCurrentUser(profile);
                    if (profile.role === 'admin' || profile.role === 'teacher') {
                        const { data, error } = await supabase.from('centers').select('id, name');
                        if (error) {
                            console.error("Could not fetch centers for admin/teacher:", error);
                        } else if (data && data.length > 0) {
                            setCenters(data);
                            if (profile.center_id && data.some(c => c.id === profile.center_id)) {
                                setSelectedCenterId(profile.center_id);
                            } else {
                                setSelectedCenterId(data[0].id);
                            }
                        }
                    } else {
                        setSelectedCenterId(profile.center_id);
                        if (profile.center) {
                            setCenters([profile.center]);
                        }
                    }
                }
            } catch (error: any) {
                if (isMounted) {
                    console.error('Failed to process session due to a database error. Signing out.', error.message, error);
                    await supabase.auth.signOut();
                    setCurrentUser(null);
                }
            }
        };

        const initializeSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error("Error getting session on initial load:", error.message, error);
                }
                await processSession(session);
            } catch (e: any) {
                console.error("Critical error during session initialization:", e.message, e);
                if (isMounted) {
                    setCurrentUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        
        initializeSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            processSession(session);
            if (_event === 'SIGNED_OUT') {
                setCurrentPage('home');
                setCurrentUser(null);
                setSelectedCenterId(null);
                setCenters([]);
                setLessons([]);
                setTeachers([]);
                setPosts([]);
                setStudents([]);
            }
        });

        return () => {
            isMounted = false;
            subscription?.unsubscribe();
        };
    }, []);
    
    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            return;
        }

        let isMounted = true;
        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });
            
            if (isMounted) {
                if (error) {
                    console.error('Error fetching notifications:', error);
                } else {
                    setNotifications(data || []);
                }
            }
        };

        fetchNotifications();
        
        const channel = supabase.channel(`notifications:${currentUser.id}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'notifications',
                filter: `user_id=eq.${currentUser.id}`
            }, (payload) => {
                if (isMounted) {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                }
            })
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };

    }, [currentUser]);

    const handleLogout = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error logging out:', error.message, error);
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        if (!currentUser) return;
        
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .in('id', unreadIds);

        if (error) {
            console.error('Error marking notifications as read:', error);
            // Revert optimistic update on error
            setNotifications(prev => prev.map(n => unreadIds.includes(n.id) ? { ...n, read: false } : n));
        }
    }, [currentUser, notifications]);

    if (loading && !currentUser) {
        return (
            <div className="loader-container">
                <div className="pulsing-logo">
                    <BookOpenIcon />
                </div>
            </div>
        );
    }

    if (!currentUser) {
        switch (currentPage) {
            case 'privacy-policy':
                return (
                    <div className="bg-[hsl(var(--color-background))] min-h-screen">
                        <main className="p-4 md:p-6">
                            <PrivacyPolicyPage onNavigate={setCurrentPage} isInsideApp={false} />
                        </main>
                    </div>
                );
            case 'terms-of-service':
                 return (
                    <div className="bg-[hsl(var(--color-background))] min-h-screen">
                        <main className="p-4 md:p-6">
                            <TermsOfServicePage onNavigate={setCurrentPage} isInsideApp={false} />
                        </main>
                    </div>
                );
            default:
                return <LoginPage onNavigate={setCurrentPage} />;
        }
    }

    const renderPageContent = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage user={currentUser} lessons={lessons} onNavigate={setCurrentPage} />;
            case 'full-schedule':
                return <FullSchedulePage user={currentUser} lessons={lessons}/>;
            case 'teachers':
                return <TeachersPage teachers={teachers} />;
            case 'admin-dashboard':
                return (currentUser.role === 'admin' || currentUser.role === 'teacher')
                    ? <AdminDashboardPage 
                        user={currentUser}
                        centers={centers}
                        selectedCenterId={selectedCenterId}
                        onSelectCenter={setSelectedCenterId}
                        students={students}
                        teachers={teachers}
                        lessons={lessons}
                        posts={posts}
                        onDataChange={fetchData}
                        loading={loading}
                      /> 
                    : <HomePage user={currentUser} lessons={lessons} onNavigate={setCurrentPage} />;
            case 'profile':
                return <ProfilePage 
                    user={currentUser} 
                    onUserUpdate={setCurrentUser}
                    selectedCenterId={currentUser.role === 'admin' ? selectedCenterId : undefined}
                />;
            case 'about':
                return <AboutPage />;
            case 'privacy-policy':
                return <PrivacyPolicyPage onNavigate={setCurrentPage} isInsideApp={true} />;
            case 'terms-of-service':
                return <TermsOfServicePage onNavigate={setCurrentPage} isInsideApp={true} />;
            case 'news':
                return <NewsBoardPage posts={posts} />;
            case 'app-control':
                return currentUser.email === 'jytt0jewellery@gmail.com' ? <AppControlPage /> : <HomePage user={currentUser} lessons={lessons} onNavigate={setCurrentPage} />;
            case 'icon-control':
                return currentUser.email === 'jytt0jewellery@gmail.com' ? <IconControlPage /> : <HomePage user={currentUser} lessons={lessons} onNavigate={setCurrentPage} />;
            case 'educational-platform':
                return <ExternalPlatformPage />;
            default:
                return <HomePage user={currentUser} lessons={lessons} onNavigate={setCurrentPage} />;
        }
    };

    return (
        <IconProvider>
            <DigitalRain />
            <div className="h-full bg-[hsl(var(--color-background))]">
                <Header
                    user={currentUser}
                    onMenuClick={() => setSidebarOpen(!isSidebarOpen)}
                    onNavigate={(page) => { setCurrentPage(page); setSidebarOpen(false); }}
                    notifications={notifications}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onLogout={handleLogout}
                />
                <Sidebar
                    isOpen={isSidebarOpen}
                    user={currentUser}
                    currentPage={currentPage}
                    onClose={() => setSidebarOpen(false)}
                    onNavigate={setCurrentPage}
                    onLogout={handleLogout}
                    onOpenThemeModal={() => setIsThemeModalOpen(true)}
                />
                <ThemeModal
                    isOpen={isThemeModalOpen}
                    onClose={() => setIsThemeModalOpen(false)}
                    currentTheme={theme}
                    onChangeTheme={(newTheme) => {
                        setTheme(newTheme);
                        setIsThemeModalOpen(false);
                    }}
                />
                <div className={`flex flex-col h-full lg:pr-60`}>
                    <main className={`flex-grow pt-20 overflow-y-auto`}>
                         <div key={currentPage} className={`animate-page-fade-in ${currentPage === 'educational-platform' ? 'h-full' : 'p-4 md:p-6'}`}>
                            {renderPageContent()}
                        </div>
                    </main>
                </div>
            </div>
        </IconProvider>
    );
};

export default App;