
import React, { useMemo, useState } from 'react';
import { Post } from '../types.ts';

interface NewsBoardPageProps {
    posts: Post[];
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongContent = post.content.length > 150;

    const displayedContent = isLongContent && !isExpanded 
        ? `${post.content.substring(0, 150)}...` 
        : post.content;

    return (
        <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg overflow-hidden border border-[hsl(var(--color-border))] transition-all">
            {post.imageUrls && post.imageUrls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                    {post.imageUrls.map((url, index) => (
                        <img loading="lazy" key={index} src={url} alt={`${post.title} image ${index + 1}`} className="w-full h-56 object-cover"/>
                    ))}
                </div>
            )}
            <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                    <h2 className="text-2xl font-bold text-[hsl(var(--color-text-primary))]">{post.title}</h2>
                </div>
                <p className="text-sm text-[hsl(var(--color-text-secondary))] my-2">{post.author} - {new Date(post.timestamp).toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' })}</p>
                <p className="text-lg text-[hsl(var(--color-text-secondary))] whitespace-pre-line">{displayedContent}</p>
                {isLongContent && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)} 
                        className="text-[hsl(var(--color-primary))] font-semibold mt-2 hover:underline"
                    >
                        {isExpanded ? 'عرض أقل' : 'عرض المزيد'}
                    </button>
                )}
            </div>
        </div>
    );
};

const NewsBoardPage: React.FC<NewsBoardPageProps> = ({ posts }) => {

    const sortedPosts = useMemo(() => {
        return [...posts].sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
    }, [posts]);

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6 text-[hsl(var(--color-text-primary))]">📰 لوحة الأخبار والإعلانات</h1>
            <div className="space-y-8">
                {sortedPosts.length > 0 ? sortedPosts.map(post => (
                    <PostCard key={post.id} post={post} />
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
