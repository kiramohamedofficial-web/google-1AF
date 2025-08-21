
import React from 'react';
import { Post } from '../types';

interface NewsBoardPageProps {
    posts: Post[];
}

const NewsBoardPage: React.FC<NewsBoardPageProps> = ({ posts }) => {
    const publishedPosts = posts.filter(p => p.status === 'published');

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6 text-[hsl(var(--color-text-primary))]">📰 لوحة الأخبار والإعلانات</h1>
            <div className="space-y-8">
                {publishedPosts.length > 0 ? publishedPosts.map(post => (
                    <div key={post.id} className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg overflow-hidden border border-[hsl(var(--color-border))]">
                        {post.imageUrls && post.imageUrls.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                                {post.imageUrls.map((url, index) => (
                                    <img key={index} src={url} alt={`${post.title} image ${index + 1}`} className="w-full h-56 object-cover"/>
                                ))}
                            </div>
                        )}
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-[hsl(var(--color-text-primary))]">{post.title}</h2>
                            <p className="text-sm text-[hsl(var(--color-text-secondary))] my-2">{post.author} - {post.timestamp}</p>
                            <p className="text-lg text-[hsl(var(--color-text-secondary))] whitespace-pre-line">{post.content}</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-16 bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))]">
                        <p className="text-2xl font-bold">لا توجد إعلانات جديدة حاليًا.</p>
                        <p className="text-[hsl(var(--color-text-secondary))] mt-2">ترقبوا آخر أخبار السنتر قريبًا!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsBoardPage;
