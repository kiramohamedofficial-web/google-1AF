import React from 'react';
import { Page, SiteSettings } from '../../types.ts';

const TwitterIcon = () => <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733a4.67 4.67 0 002.048-2.578a9.3 9.3 0 01-2.958 1.13a4.66 4.66 0 00-7.938 4.25a13.229 13.229 0 01-9.602-4.868c-.337.58-.53 1.25-.53 1.968a4.658 4.658 0 002.065 3.877a4.66 4.66 0 01-2.105-.579v.06a4.66 4.66 0 003.738 4.566a4.678 4.678 0 01-2.1.08a4.66 4.66 0 004.352 3.234a9.348 9.348 0 01-5.786 1.995a9.5 9.5 0 01-1.112-.065a13.175 13.175 0 007.14 2.094c8.57 0 13.255-7.098 13.255-13.254c0-.202-.005-.403-.014-.602a9.454 9.454 0 002.323-2.41z"></path></svg>;
const FacebookIcon = () => <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5.52 4.5 10.02 10 10.02c5.5 0 10-4.5 10-10.02c0-5.53-4.5-10.02-10-10.02zm3.5 10.32l-.89 3.49h-2.5v-6.32H9.3v-2.8h2.81v-1.93c0-2.31 1.15-3.7 3.59-3.7h2.05v2.8h-1.44c-1.22 0-1.28.6-1.28 1.25v1.59h2.78l-.34 2.8z"></path></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 2c2.717 0 3.056.01 4.122.06c1.065.05 1.79.217 2.428.465c.66.254 1.216.598 1.772 1.153c.556.556.9 1.112 1.153 1.772c.248.637.415 1.363.465 2.428c.047 1.066.06 1.405.06 4.122c0 2.717-.01 3.056-.06 4.122c-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772a4.927 4.927 0 01-1.772 1.153c-.637.248-1.363.415-2.428.465c-1.066.047-1.405.06-4.122.06s-3.056-.01-4.122-.06c-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153a4.927 4.927 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12s.01-3.056.06-4.122c.05-1.065.218-1.79.465-2.428a4.883 4.883 0 011.153-1.772A4.89 4.89 0 017.398 2.52c.637-.248 1.363.415 2.428.465C10.944 2.013 11.283 2 12 2zm0 1.802c-2.67 0-2.987.01-4.043.058c-.975.045-1.505.207-1.854.344a2.973 2.973 0 00-1.088.791a2.994 2.994 0 00-.79 1.088c-.137.349-.3.88-.344 1.854c-.048 1.056-.058 1.373-.058 4.043s.01 2.987.058 4.043c.045.975.207 1.505.344 1.854a2.973 2.973 0 00.791 1.088a2.994 2.994 0 001.088.79c.349.137.88.3 1.854.344c1.056.048 1.373.058 4.043.058s2.987-.01 4.043-.058c.975-.045 1.505-.207 1.854-.344a2.973 2.973 0 001.088-.79a2.994 2.994 0 00.79-1.088c.137-.349.3-.88.344-1.854c.048-1.056.058-1.373.058-4.043s-.01-2.987-.058-4.043c-.045-.975-.207-1.505-.344-1.854a2.973 2.973 0 00-.79-1.088a2.994 2.994 0 00-1.088-.79c-.349-.137-.88-.3-1.854-.344C15.013 3.812 14.67 3.802 12 3.802zM12 6.865a5.135 5.135 0 100 10.27a5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666a3.333 3.333 0 010 6.666zm5.338-9.87a1.2 1.2 0 100 2.4a1.2 1.2 0 000-2.4z"></path></svg>;
const YoutubeIcon = () => <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M21.582 7.042c-.225-1.545-1.52-2.73-3.07-2.91C16.52 4 12 4 12 4s-4.52 0-6.512.132c-1.55.18-2.845 1.365-3.07 2.91C2.19 8.528 2 10.16 2 12s.19 3.472.418 4.958c.225 1.545 1.52 2.73 3.07 2.91C7.48 20 12 20 12 20s4.52 0 6.512-.132c1.55-.18 2.845-1.365 3.07-2.91C21.81 15.472 22 13.84 22 12s-.19-3.472-.418-4.958zM9.75 15.5V8.5l6 3.5-6 3.5z"></path></svg>;

interface FooterProps {
    onNavigate: (page: Page) => void;
    insideApp: boolean;
    siteSettings: SiteSettings | null;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, insideApp, siteSettings }) => {
    const baseClass = "w-full text-center p-4 text-sm";
    const appClass = "text-[hsl(var(--color-text-secondary))]";
    const publicClass = "bg-transparent text-slate-400";

    const socialLinks = siteSettings?.social_links;
    const hasSocialLinks = socialLinks && Object.values(socialLinks).some(link => link);

    const iconMap: { [key: string]: React.ReactNode } = {
        twitter: <TwitterIcon />,
        facebook: <FacebookIcon />,
        instagram: <InstagramIcon />,
        youtube: <YoutubeIcon />,
    };
    
    return (
        <footer className={`${baseClass} ${insideApp ? appClass : publicClass}`}>
            {hasSocialLinks && (
                <div className="flex justify-center items-center gap-6 mb-4">
                    {Object.entries(socialLinks).map(([platform, url]) => (
                        url && iconMap[platform] ? (
                            <a 
                                key={platform} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label={`Follow us on ${platform}`} 
                                className="text-current hover:text-[hsl(var(--color-primary))] transition-colors duration-300"
                            >
                                {iconMap[platform]}
                            </a>
                        ) : null
                    ))}
                </div>
            )}
            <div className="flex justify-center items-center gap-4 mb-2">
                <button onClick={() => onNavigate('privacy-policy')} className="hover:underline">سياسة الخصوصية</button>
                <span>|</span>
                <button onClick={() => onNavigate('terms-of-service')} className="hover:underline">شروط الاستخدام</button>
            </div>
            <p>&copy; {new Date().getFullYear()} {siteSettings?.site_name || 'Google Educational Center'}. جميع الحقوق محفوظة.</p>
        </footer>
    );
};

export default Footer;