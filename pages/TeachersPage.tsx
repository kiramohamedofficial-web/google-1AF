
import React from 'react';
import { Teacher } from '../types.ts';

const TeachersPage: React.FC<{ teachers: Teacher[] }> = ({ teachers }) => {
    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6 text-[hsl(var(--color-text-primary))]">أساتذتنا الكرام</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teachers.map(teacher => (
                    <div key={teacher.id} className="bg-[hsl(var(--color-surface))] rounded-xl shadow-lg text-center p-6 transform hover:-translate-y-2 transition-transform duration-300 border border-[hsl(var(--color-border))] flex flex-col">
                        <img 
                            src={teacher.image_url} 
                            alt={teacher.name} 
                            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-[hsl(var(--color-primary))] object-cover"
                        />
                        <h2 className="text-2xl font-bold text-[hsl(var(--color-text-primary))]">{teacher.name}</h2>
                        <p className="text-md text-[hsl(var(--color-primary))] font-semibold mb-3">{teacher.subject}</p>
                        
                        {(teacher.grades || teacher.phone) && (
                            <div className="mb-4 flex flex-col items-center space-y-2">
                                {teacher.grades && (
                                    <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--color-background))] px-3 py-1 text-sm font-medium text-[hsl(var(--color-text-secondary))]">
                                        <span role="img" aria-label="Grades" className="text-lg">📚</span>
                                        <span>{teacher.grades}</span>
                                    </div>
                                )}
                                {teacher.phone && (
                                    <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--color-background))] px-3 py-1 text-sm font-medium text-[hsl(var(--color-text-secondary))]">
                                        <span role="img" aria-label="Phone" className="text-lg">📞</span>
                                        <a href={`tel:${teacher.phone}`} className="hover:underline" dir="ltr">{teacher.phone}</a>
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="text-[hsl(var(--color-text-secondary))] flex-grow">{teacher.bio}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeachersPage;
