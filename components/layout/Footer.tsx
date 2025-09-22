import React from 'react';
import { Page } from '../../types.ts';

interface FooterProps {
    onNavigate: (page: Page) => void;
    insideApp: boolean;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, insideApp }) => {
    const baseClass = "w-full text-center p-4 text-sm";
    const appClass = "text-[hsl(var(--color-text-secondary))]";
    const publicClass = "bg-transparent text-slate-400";
    
    return (
        <footer className={`${baseClass} ${insideApp ? appClass : publicClass}`}>
            <div className="flex justify-center items-center gap-4 mb-2">
                <button onClick={() => onNavigate('privacy-policy')} className="hover:underline">سياسة الخصوصية</button>
                <span>|</span>
                <button onClick={() => onNavigate('terms-of-service')} className="hover:underline">شروط الاستخدام</button>
            </div>
            <p>&copy; 2025 Google Educational Center. جميع الحقوق محفوظة.</p>
        </footer>
    );
};

export default Footer;