import React from 'react';
import { User, Theme, Page } from '../../types';
import ThemeSwitcher from '../common/ThemeSwitcher';
import { 
    HomeIcon, CalendarIcon, UsersIcon, TruckIcon, BookOpenIcon, 
    AcademicCapIcon, UserCircleIcon, InformationCircleIcon, 
    Cog6ToothIcon, ArrowLeftOnRectangleIcon, PhotoIcon, 
    NewspaperIcon, ClipboardListIcon 
} from '../common/Icons';

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
        className={`w-full flex items-center gap-4 px-4 py-3 text-base rounded-xl transition-all duration-200 relative ${
            isActive 
                ? 'bg-[hsl(var(--color-primary))] text-white shadow-lg' 
                : 'text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[hsl(var(--color-text-primary))]'
        }`}
    >
        {icon}
        <span className="font-medium">{label}</span>
        {isActive && <div className="absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-[hsl(var(--color-primary))] rounded-r-full"></div>}
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, user, currentPage, onClose, onNavigate, onLogout, theme, setTheme }) => {
    const handleNavigation = (page: Page) => {
        onNavigate(page);
        onClose();
    };

    const studentLinks = [
        { page: 'home', label: 'الرئيسية', icon: <HomeIcon /> },
        { page: 'full-schedule', label: 'جدول الحصص', icon: <CalendarIcon /> },
        { page: 'my-bookings', label: 'حجوزاتي', icon: <ClipboardListIcon /> },
        { page: 'teachers', label: 'المدرسين', icon: <UsersIcon /> },
        { page: 'news-board', label: 'لوحة الأخبار', icon: <NewspaperIcon /> },
        { page: 'trips', label: 'الرحلات', icon: <TruckIcon /> },
        { page: 'books', label: 'الكتب', icon: <BookOpenIcon /> },
        { page: 'gallery', label: 'معرض الصور', icon: <PhotoIcon /> },
        { page: 'ai-exam', label: 'الاختبارات الذكية', icon: <AcademicCapIcon /> },
        { page: 'profile', label: 'الملف الشخصي', icon: <UserCircleIcon /> },
        { page: 'about', label: 'من نحن', icon: <InformationCircleIcon /> },
    ];

    const adminLinks = [
        ...studentLinks.slice(0, 9),
        { page: 'admin-dashboard', label: 'لوحة التحكم', icon: <Cog6ToothIcon /> },
        ...studentLinks.slice(9)
    ];

    const links = user.role === 'admin' ? adminLinks : studentLinks;

    return (
        <>
            <div className={`fixed top-0 right-0 h-full w-72 bg-[hsl(var(--color-surface))] shadow-2xl z-50 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 border-l border-[hsl(var(--color-border))]`}>
                <div className="flex flex-col h-full">
                    {/* Logo Header */}
                    <div className="p-4 border-b border-[hsl(var(--color-border))] flex flex-col items-center h-20 justify-center">
                         <div className="flex items-center gap-3 text-2xl font-bold text-[hsl(var(--color-primary))]">
                            <BookOpenIcon />
                            <span className="font-extrabold">سنتر جوجل</span>
                        </div>
                    </div>

                    {/* User Profile Section */}
                    <div className="p-4 flex flex-col items-center text-center border-b border-[hsl(var(--color-border))]">
                        <img src={user.profilePicture} alt="Profile" className="w-20 h-20 rounded-full border-4 border-[hsl(var(--color-primary))] object-cover shadow-lg mb-3"/>
                        <p className="font-bold text-xl text-[hsl(var(--color-text-primary))]">
                            {user.role === 'admin' ? '⚙️ إدارة النظام' : user.name}
                        </p>
                        {user.role === 'student' && (
                           <p className="text-sm text-[hsl(var(--color-text-secondary))]">{user.grade}</p>
                        )}
                    </div>

                    <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
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
                    <div className="p-4 border-t border-[hsl(var(--color-border))]">
                        <ThemeSwitcher currentTheme={theme} onChangeTheme={setTheme} />
                        <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-3 text-lg rounded-xl text-[hsl(var(--color-text-secondary))] hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200">
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
