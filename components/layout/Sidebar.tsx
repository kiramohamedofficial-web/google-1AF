
import React from 'react';
import { User, Theme, Page } from '../../types.ts';
import ThemeSwitcher from '../common/ThemeSwitcher.tsx';
import { 
    HomeIcon, CalendarIcon, UsersIcon, TruckIcon, BookOpenIcon, 
    AcademicCapIcon, UserCircleIcon, InformationCircleIcon, 
    Cog6ToothIcon, ArrowLeftOnRectangleIcon, PhotoIcon, 
    NewspaperIcon, ClipboardListIcon, SmartScheduleIcon,
    FeedbackIcon, InstructionsIcon, PrivacyIcon, TermsIcon
} from '../common/Icons.tsx';

interface SidebarProps {
    isOpen: boolean;
    user: User;
    currentPage: Page;
    onClose: () => void;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const NavLink: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; isActive: boolean }> = ({ icon, label, onClick, isActive }) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 relative ${
            isActive 
                ? 'bg-[hsl(var(--color-primary))] text-white shadow-md' 
                : 'text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[hsl(var(--color-text-primary))]'
        }`}
    >
        {icon}
        <span className="font-medium">{label}</span>
        {isActive && <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-1 bg-[hsl(var(--color-primary))] rounded-r-full"></div>}
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, user, currentPage, onClose, onNavigate, onLogout, theme, setTheme }) => {
    const handleNavigation = (page: Page) => {
        onNavigate(page);
        onClose();
    };

    // --- Reordered Links for Better UX ---

    // Core, high-frequency actions
    const coreLinks = [
        { page: 'home', label: 'الرئيسية', icon: <HomeIcon /> },
        { page: 'profile', label: 'الملف الشخصي', icon: <UserCircleIcon /> },
        { page: 'smart-schedule', label: 'الجدول الذكي', icon: <SmartScheduleIcon /> },
        { page: 'full-schedule', label: 'جدول الحصص', icon: <CalendarIcon /> },
        { page: 'my-bookings', label: 'حجوزاتي', icon: <ClipboardListIcon /> },
        { page: 'ai-exam', label: 'الاختبارات الذكية', icon: <AcademicCapIcon /> },
    ];
    
    // Content and community sections
    const contentLinks = [
        { page: 'news-board', label: 'لوحة الأخبار', icon: <NewspaperIcon /> },
        { page: 'teachers', label: 'المدرسين', icon: <UsersIcon /> },
        { page: 'trips', label: 'الرحلات', icon: <TruckIcon /> },
        { page: 'books', label: 'الكتب', icon: <BookOpenIcon /> },
        { page: 'gallery', label: 'معرض الصور', icon: <PhotoIcon /> },
    ];

    // Personal, settings, and help sections
    const helpLinks = [
        { page: 'feedback', label: 'التعليقات', icon: <FeedbackIcon /> },
        { page: 'instructions', label: 'تعليمات الاستخدام', icon: <InstructionsIcon /> },
        { page: 'about', label: 'من نحن', icon: <InformationCircleIcon /> },
        { page: 'privacy-policy', label: 'سياسة الخصوصية', icon: <PrivacyIcon /> },
        { page: 'terms-of-service', label: 'شروط الاستخدام', icon: <TermsIcon /> },
    ];

    const studentLinks = [...coreLinks, ...contentLinks, ...helpLinks];
    
    // For admin, add dashboard after core features for high visibility.
    const adminLinks = [
        ...coreLinks,
        { page: 'admin-dashboard', label: 'لوحة التحكم', icon: <Cog6ToothIcon /> },
        ...contentLinks,
        ...helpLinks
    ];

    const links = user.role === 'admin' ? adminLinks : studentLinks;

    return (
        <>
            <div className={`fixed top-0 right-0 h-full w-64 bg-[hsl(var(--color-surface))] shadow-2xl z-50 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 border-l border-[hsl(var(--color-border))]`}>
                <div className="flex flex-col h-full">
                    {/* Logo Header */}
                    <div className="p-4 border-b border-[hsl(var(--color-border))] flex flex-col items-center h-16 justify-center">
                         <div className="flex items-center gap-2 text-xl font-bold text-[hsl(var(--color-primary))]">
                            <BookOpenIcon />
                            <span className="font-extrabold">سنتر جوجل</span>
                        </div>
                    </div>

                    {/* User Profile Section */}
                    <div className="p-3 flex flex-col items-center text-center border-b border-[hsl(var(--color-border))]">
                        <img src={user.profilePicture} alt="Profile" className="w-16 h-16 rounded-full border-2 border-[hsl(var(--color-primary))] object-cover shadow-lg mb-2"/>
                        <p className="font-bold text-lg text-[hsl(var(--color-text-primary))] truncate w-full">
                            {user.role === 'admin' ? '⚙️ إدارة النظام' : user.name}
                        </p>
                        {user.role === 'student' && (
                           <p className="text-xs text-[hsl(var(--color-text-secondary))]">{user.grade}</p>
                        )}
                    </div>

                    <nav className="flex-grow p-3 space-y-1.5 overflow-y-auto">
                        {links.map(link => (
                            <NavLink 
                                key={link.page} 
                                icon={link.icon} 
                                label={link.label} 
                                onClick={() => handleNavigation(link.page as Page)}
                                isActive={currentPage === link.page}
                            />
                        ))}
                    </nav>
                    <div className="p-3 border-t border-[hsl(var(--color-border))]">
                        <div className="bg-[hsl(var(--color-background))] p-2 rounded-xl">
                            <p className="text-xs font-bold text-center mb-2 text-[hsl(var(--color-text-secondary))]">اختر الثيم</p>
                            <ThemeSwitcher currentTheme={theme} onChangeTheme={setTheme} />
                        </div>
                        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-[hsl(var(--color-text-secondary))] hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200 mt-2">
                           <ArrowLeftOnRectangleIcon/>
                           <span className="font-medium">تسجيل الخروج</span>
                        </button>
                    </div>
                </div>
            </div>
            {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"></div>}
        </>
    );
};

export default Sidebar;
