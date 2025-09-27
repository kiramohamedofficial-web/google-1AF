import React from 'react';

interface IconDisplayProps {
    value: string | undefined;
    fallback: React.ReactNode;
    className?: string;
}

export const IconDisplay: React.FC<IconDisplayProps> = ({ value, fallback, className = "w-6 h-6" }) => {
    const isHttpUrl = (str: string = '') => str.startsWith('http://') || str.startsWith('https://');

    if (value && isHttpUrl(value)) {
        return <img src={value} alt="icon" className={`${className} object-contain`} />;
    }
    if (typeof value === 'string' && value.startsWith('<svg')) {
        const svgClass = className.split(' ').filter(c => c.startsWith('w-') || c.startsWith('h-')).join(' ');
        return <span className={`${className} flex items-center justify-center`} dangerouslySetInnerHTML={{ __html: value.replace(/<svg/g, `<svg class="${svgClass}"`) }} />;
    }
    if (typeof value === 'string' && value) {
        // Use a consistent font-size and line-height for emojis to prevent layout shifts
        return <span className={`flex items-center justify-center text-2xl ${className}`} style={{fontSize: '1.5em', lineHeight: 1}}>{value}</span>;
    }
    return <span className={`${className} flex items-center justify-center`}>{fallback}</span>;
};

export default IconDisplay;
