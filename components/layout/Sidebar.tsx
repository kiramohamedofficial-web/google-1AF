
import React from 'react';
import { User, Page } from '../../types.ts';
import { 
    HomeIcon, CalendarIcon, UsersIcon, 
    AcademicCapIcon, UserCircleIcon, InformationCircleIcon, 
    Cog6ToothIcon, ArrowLeftOnRectangleIcon, 
    PrivacyIcon, TermsIcon, BookOpenIcon,
    NewsIcon, PhotoIcon, SparklesIcon, PaintBrushIcon
} from '../common/Icons.tsx';
import { useIcons } from '../../contexts/IconContext.tsx';
import IconDisplay from '../common/IconDisplay.tsx';

interface SidebarProps {
    isOpen: boolean;
    user: User;
    currentPage: Page;
    onClose: () => void;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
    onOpenThemeModal: () => void;
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

const NavSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h3 className="px-3 pt-4 pb-2 text-xs font-bold uppercase text-[hsl(var(--color-text-secondary))] tracking-wider">{title}</h3>
        <div className="space-y-1.5">{children}</div>
    </div>
)

const Sidebar: React.FC<SidebarProps> = ({ isOpen, user, currentPage, onClose, onNavigate, onLogout, onOpenThemeModal }) => {
    const { iconSettings } = useIcons();
    
    const handleNavigation = (page: Page) => {
        onNavigate(page);
        onClose();
    };

    const mainLinks = [
        { page: 'home', label: 'الرئيسية', icon: <HomeIcon />, key: 'nav_home' },
        { page: 'full-schedule', label: 'جدول الحصص', icon: <CalendarIcon />, key: 'nav_full-schedule' },
    ];
    
    const learnLinks = [
        { page: 'teachers', label: 'المدرسين', icon: <UsersIcon />, key: 'nav_teachers' },
    ];

    const centerLinks = [
        { page: 'news', label: 'الأخبار', icon: <NewsIcon />, key: 'nav_news' },
    ];
    
    const helpLinks = [
        { page: 'about', label: 'من نحن', icon: <InformationCircleIcon />, key: 'nav_about' },
        { page: 'privacy-policy', label: 'سياسة الخصوصية', icon: <PrivacyIcon />, key: 'nav_privacy-policy' },
        { page: 'terms-of-service', label: 'شروط الاستخدام', icon: <TermsIcon />, key: 'nav_terms-of-service' },
    ];
    
    const adminDashboardLink = { page: 'admin-dashboard', label: 'لوحة التحكم', icon: <Cog6ToothIcon />, key: 'nav_admin-dashboard' };
    const appControlLink = { page: 'app-control', label: 'صور البروفايل', icon: <PhotoIcon />, key: 'nav_app-control' };
    const iconControlLink = { page: 'icon-control', label: 'التحكم بالأيقونات', icon: <SparklesIcon />, key: 'nav_icon-control' };

    // FIX: Replaced JSX.Element with React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
    const renderNavLink = (link: { page: string, label: string, icon: React.ReactNode, key: string }) => {
        const icon = <IconDisplay value={iconSettings[link.key]} fallback={link.icon} className="w-6 h-6" />;
        return <NavLink key={link.page} icon={icon} label={link.label} onClick={() => handleNavigation(link.page as Page)} isActive={currentPage === link.page} />;
    };

    return (
        <>
            <div className={`fixed top-0 right-0 h-full w-60 bg-[hsl(var(--color-surface))] shadow-2xl z-50 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 border-l border-[hsl(var(--color-border))] rounded-l-2xl overflow-hidden`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-[hsl(var(--color-border))] flex flex-col items-center h-16 justify-center">
                         <div className="flex items-center gap-2 text-lg font-bold text-[hsl(var(--color-primary))]">
                            <BookOpenIcon />
                            <span className="font-extrabold">{user.center?.name || 'سنتر جوجل'}</span>
                        </div>
                    </div>

                    <div className="p-3 flex flex-col items-center text-center border-b border-[hsl(var(--color-border))]">
                        <img src={user.profilePicture} alt="Profile" className="w-16 h-16 rounded-full border-2 border-[hsl(var(--color-primary))] object-cover shadow-lg mb-2"/>
                        <p className="font-bold text-lg text-[hsl(var(--color-text-primary))] truncate w-full">
                            {user.role === 'admin' ? '⚙️ إدارة النظام' : user.name}
                        </p>
                        {user.role === 'student' && (
                           <p className="text-xs text-[hsl(var(--color-text-secondary))] mb-2">{user.grade}</p>
                        )}
                        <button
                            onClick={() => handleNavigation('profile')}
                            className={`w-full max-w-[150px] mt-2 flex items-center justify-center gap-2 px-3 py-1.5 text-xs rounded-full transition-all duration-200 ${
                                currentPage === 'profile'
                                    ? 'bg-[hsl(var(--color-primary))] text-white shadow-md'
                                    : 'bg-[hsl(var(--color-background))] text-[hsl(var(--color-text-secondary))] hover:bg-black/10 dark:hover:bg-white/10 hover:text-[hsl(var(--color-text-primary))] border border-transparent hover:border-[hsl(var(--color-border))]'
                            }`}
                        >
                            <UserCircleIcon />
                            <span className="font-medium">الملف الشخصي</span>
                        </button>
                    </div>

                    <nav className="flex-grow p-3 overflow-y-auto">
                        <NavSection title="الرئيسية">
                             {mainLinks.map(renderNavLink)}
                        </NavSection>
                        <NavSection title="تعلم">
                             {learnLinks.map(renderNavLink)}
                        </NavSection>
                        <NavSection title="المركز">
                             {centerLinks.map(renderNavLink)}
                        </NavSection>
                         {user.role === 'admin' && (
                             <NavSection title="تحكم التطبيق">
                                {renderNavLink(adminDashboardLink)}
                                {renderNavLink(appControlLink)}
                                {user.email === 'jytt0jewellery@gmail.com' && renderNavLink(iconControlLink)}
                            </NavSection>
                        )}
                        <NavSection title="مساعدة">
                             {helpLinks.map(renderNavLink)}
                        </NavSection>
                    </nav>

                    <div className="p-2 border-t border-[hsl(var(--color-border))]">
                        <button onClick={onOpenThemeModal} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[hsl(var(--color-text-primary))] transition-colors duration-200">
                           <IconDisplay value={iconSettings['nav_themes']} fallback={<PaintBrushIcon />} className="w-6 h-6" />
                           <span className="font-medium">تغيير الثيم</span>
                        </button>
                        <button onClick={onLogout} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-[hsl(var(--color-text-secondary))] hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200 mt-1">
                           <IconDisplay value={iconSettings['nav_logout']} fallback={<ArrowLeftOnRectangleIcon />} className="w-6 h-6" />
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
