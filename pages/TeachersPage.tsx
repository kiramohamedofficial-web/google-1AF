
import React from 'react';
import { Teacher } from '../types.ts';
import { generateAvatar } from '../constants.ts';

const PhoneIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);


const TeachersPage: React.FC<{ teachers: Teacher[] }> = ({ teachers }) => {
    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6 text-[hsl(var(--color-text-primary))]">أساتذتنا الكرام</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teachers.map(teacher => (
                    <div key={teacher.id} className="bg-[hsl(var(--color-surface))] rounded-xl shadow-lg text-center p-6 card-hover-lift border border-[hsl(var(--color-border))]">
                        <img 
                            loading="lazy"
                            src={teacher.imageUrl || generateAvatar(teacher.name)} 
                            alt={teacher.name} 
                            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-[hsl(var(--color-primary))] object-cover"
                        />
                        <h2 className="text-2xl font-bold text-[hsl(var(--color-text-primary))]">{teacher.name}</h2>
                        <p className="text-md text-[hsl(var(--color-primary))] font-semibold">{teacher.subject}</p>
                        
                        {teacher.phone && (
                            <a href={`tel:${teacher.phone}`} className="inline-flex items-center justify-center gap-2 mt-2 text-sm text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-primary))] transition-colors group">
                                <PhoneIcon />
                                <span className="font-semibold tracking-wider">{teacher.phone}</span>
                            </a>
                        )}

                        <p className="text-[hsl(var(--color-text-secondary))] mt-3">{teacher.bio}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeachersPage;