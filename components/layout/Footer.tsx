
import React from 'react';
import { Page } from '../../types.ts';

interface FooterProps {
    onNavigate: (page: Page) => void;
    insideApp: boolean;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, insideApp }) => {
    // Changed from 'fixed' to a static footer that's part of the flex layout.
    const baseClass = "w-full text-center p-2 text-[11px] flex-shrink-0";
    // Style for inside the authenticated app. It respects the sidebar.
    const appClass = "bg-[hsl(var(--color-background))] text-[hsl(var(--color-text-secondary))] lg:pr-60 border-t border-[hsl(var(--color-border))]";
    // Style for public pages (Login, Privacy, Terms). It has a blurred dark background.
    const publicClass = "relative z-10 bg-slate-900/75 backdrop-blur-xl text-slate-400 border-t border-slate-700";
    
    return (
        <footer className={`${baseClass} ${insideApp ? appClass : publicClass}`}>
            <div className="flex justify-center items-center gap-2 mb-0.5">
                <button onClick={() => onNavigate('privacy-policy')} className="hover:underline">سياسة الخصوصية</button>
                <span>|</span>
                <button onClick={() => onNavigate('terms-of-service')} className="hover:underline">شروط الاستخدام</button>
            </div>
            <p>&copy; 2025 Google Educational Center. جميع الحقوق محفوظة.</p>
        </footer>
    );
};

export default Footer;