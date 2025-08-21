
import React from 'react';
import { User, Theme, Page } from '../../types';
import ThemeSwitcher from '../common/ThemeSwitcher';

const iconProps = {
  className: "w-6 h-6",
  strokeWidth: 1.5,
};

const HomeIcon = () => (<svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>);
const CalendarIcon = () => (<svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const UsersIcon = () => (<svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a6 6 0 00-9-5.197" /></svg>);
const TruckIcon = () => (<svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16l2 2h3.5a1 1 0 001-1V9a1 1 0 00-1-1h-3.5l-2-2" /></svg>);
const BookOpenIcon = () => (<svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6-2.292m0 0v14.25" /></svg>);
const AcademicCapIcon = () => (<svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7m-4-4l-4 2" /></svg>);
const UserCircleIcon = () => (<svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const InformationCircleIcon = () => (<svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const Cog6ToothIcon = () => (<svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const ArrowLeftOnRectangleIcon = () => (<svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>);
const PhotoIcon = () => (<svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>);
const NewspaperIcon = () => (<svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"></path></svg>);
const ClipboardListIcon = () => (<svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>);


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
