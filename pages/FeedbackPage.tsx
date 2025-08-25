import React, { useState } from 'react';

const FeedbackPage: React.FC = () => {
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (feedback.trim()) {
            console.log('Feedback submitted:', feedback);
            setSubmitted(true);
            setFeedback('');
            setTimeout(() => setSubmitted(false), 3000);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6">التعليقات والاقتراحات</h1>
            <div className="bg-[hsl(var(--color-surface))] rounded-xl shadow-lg p-8 border border-[hsl(var(--color-border))] max-w-2xl mx-auto">
                {submitted ? (
                    <div className="text-center text-green-600 font-bold text-lg">
                        ✅ شكرًا لك! تم إرسال رأيك بنجاح.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <p className="text-[hsl(var(--color-text-secondary))]">نحن نقدر رأيك! شاركنا بأفكارك أو اقتراحاتك أو أي مشكلة تواجهك لمساعدتنا على تحسين المنصة.</p>
                        <div>
                            <label htmlFor="feedback" className="block text-sm font-medium mb-1">رسالتك</label>
                            <textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={8}
                                required
                                placeholder="اكتب تعليقك هنا..."
                                className="mt-1 block w-full rounded-md border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] shadow-sm p-3 focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[hsl(var(--color-primary))] hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all"
                        >
                            إرسال
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackPage;
