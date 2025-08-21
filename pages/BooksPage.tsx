
import React from 'react';
import { MOCK_BOOKS } from '../constants';

const BooksPage: React.FC = () => {
    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6 text-[hsl(var(--color-text-primary))]">الكتب والملازم</h1>
            <div className="space-y-6">
                {MOCK_BOOKS.map(book => (
                    <div key={book.id} className="bg-[hsl(var(--color-surface))] rounded-xl shadow-lg p-6 flex items-center justify-between border border-[hsl(var(--color-border))]">
                        <div className="flex items-center gap-6">
                            <div className="text-4xl">📚</div>
                            <div>
                                <h2 className="text-xl font-bold text-[hsl(var(--color-text-primary))]">{book.title}</h2>
                                <p className="text-[hsl(var(--color-text-secondary))]">{book.description}</p>
                            </div>
                        </div>
                        <a 
                            href={book.pdfUrl} 
                            download
                            className="bg-[hsl(var(--color-primary))] hover:opacity-90 text-white font-bold py-2 px-5 rounded-lg transition-colors"
                        >
                            تحميل
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BooksPage;
