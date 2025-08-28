import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../../types.ts';
import { getNeoChatResponseStream } from '../../services/geminiService.ts';
import { SparklesIcon } from './Icons.tsx';

// A simple markdown parser for bold text (**text**)
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <>
            {parts.map((part, i) =>
                part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={i}>{part.slice(2, -2)}</strong>
                ) : (
                    part
                )
            )}
        </>
    );
};

export const AiChatModal: React.FC<{ isOpen: boolean; onClose: () => void; user: User; }> = ({ isOpen, onClose, user }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (isOpen) {
            setMessages([
                {
                    role: 'model',
                    parts: [{ text: `أهلاً بك يا ${user.name.split(' ')[0]}! 👋 أنا Neo 🤖، مساعدك الذكي في منصة جوجل التعليمية. كيف يمكنني مساعدتك اليوم؟` }],
                },
            ]);
            setInput('');
        }
    }, [isOpen, user.name]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const history = newMessages.map(msg => ({
                role: msg.role,
                parts: msg.parts,
            }));

            const stream = await getNeoChatResponseStream(history);
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    const updatedLastMessage = { ...lastMessage, parts: [{ text: modelResponse }] };
                    return [...prev.slice(0, -1), updatedLastMessage];
                });
            }
        } catch (error) {
            console.error('Gemini API error:', error);
            setMessages(prev => [
                ...prev,
                { role: 'model', parts: [{ text: 'عذراً، حدث خطأ ما. 🤖💦 يرجى المحاولة مرة أخرى.' }] },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] border border-[hsl(var(--color-border))] flex flex-col animate-fade-in-up" 
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-[hsl(var(--color-border))] flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-[hsl(var(--color-primary))]" />
                        <h2 className="text-xl font-bold text-[hsl(var(--color-text-primary))]">دردشة مع Neo 셔</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="إغلاق">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-[hsl(var(--color-primary))] flex items-center justify-center text-lg flex-shrink-0">🤖</div>}
                            <div className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-line ${
                                msg.role === 'user'
                                    ? 'bg-[hsl(var(--color-primary))] text-white rounded-br-none'
                                    : 'bg-[hsl(var(--color-background))] rounded-bl-none'
                            }`}>
                                <SimpleMarkdown text={msg.parts[0].text} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-[hsl(var(--color-primary))] flex items-center justify-center text-lg flex-shrink-0">🤖</div>
                            <div className="max-w-[80%] p-3 rounded-2xl bg-[hsl(var(--color-background))] rounded-bl-none flex items-center gap-2">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <footer className="p-4 border-t border-[hsl(var(--color-border))] flex-shrink-0">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="اسأل Neo أي شيء..."
                            className="w-full p-3 rounded-xl bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="p-3 rounded-xl bg-[hsl(var(--color-primary))] text-white disabled:bg-gray-400 disabled:cursor-not-allowed">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" transform="rotate(90 12 12)" /></svg>
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};
