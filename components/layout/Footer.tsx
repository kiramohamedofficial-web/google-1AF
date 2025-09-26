
import React from 'react';
import { Page } from '../../types.ts';

interface FooterProps {
    onNavigate: (page: Page) => void;
    insideApp: boolean;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, insideApp }) => {
    // Fixed positioning for all scenarios as requested.
    // It has a smaller text size and is fixed to the bottom.
    const baseClass = "fixed bottom-0 left-0 right-0 w-full text-center p-2 text-[11px] z-30";
    // Style for inside the authenticated app. It respects the sidebar and has a theme-aware background.
    const appClass = "bg-[hsl(var(--color-background))] text-[hsl(var(--color-text-secondary))] lg:pr-64 border-t border-[hsl(var(--color-border))]";
    // Style for public pages (Login, Privacy, Terms). It has a blurred dark background to look good on the animated login page and also be legible on themed legal pages.
    const publicClass = "bg-slate-900/75 backdrop-blur-xl text-slate-400 border-t border-slate-700";
    
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
