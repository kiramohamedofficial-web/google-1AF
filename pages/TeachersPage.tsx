
import React from 'react';
import { Teacher } from '../types';

const TeachersPage: React.FC<{ teachers: Teacher[] }> = ({ teachers }) => {
    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6 text-[hsl(var(--color-text-primary))]">أساتذتنا الكرام</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teachers.map(teacher => (
                    <div key={teacher.id} className="bg-[hsl(var(--color-surface))] rounded-xl shadow-lg text-center p-6 transform hover:-translate-y-2 transition-transform duration-300 border border-[hsl(var(--color-border))]">
                        <img 
                            src={teacher.imageUrl} 
                            alt={teacher.name} 
                            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-[hsl(var(--color-primary))] object-cover"
                        />
                        <h2 className="text-2xl font-bold text-[hsl(var(--color-text-primary))]">{teacher.name}</h2>
                        <p className="text-md text-[hsl(var(--color-primary))] font-semibold mb-3">{teacher.subject}</p>
                        <p className="text-[hsl(var(--color-text-secondary))]">{teacher.bio}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeachersPage;
