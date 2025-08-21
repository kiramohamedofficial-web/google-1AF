import React, { useState, useEffect, useCallback } from 'react';
import { MOCK_SUBJECTS } from '../constants';
import { Question, ExamResult, User } from '../types';
import { gradeExamWithNeoAI, generateExamQuestions } from '../services/geminiService';
import Card3D from '../components/common/Card3D';

type ExamStatus = 'not_started' | 'generating_questions' | 'in_progress' | 'loading' | 'finished';
const TOTAL_QUESTIONS_IN_EXAM = 10;

interface AiExamPageProps {
    user: User;
}

const AiExamPage: React.FC<AiExamPageProps> = ({ user }) => {
    const [duration, setDuration] = useState(30);
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [status, setStatus] = useState<ExamStatus>('not_started');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ questionId: string, answerIndex: number }[]>([]);
    const [result, setResult] = useState<ExamResult | null>(null);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    const finishExam = useCallback(async () => {
        setStatus('loading');
        const examResult = await gradeExamWithNeoAI(questions, answers);
        setResult(examResult);
        setStatus('finished');
    }, [answers, questions]);
    
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (status === 'in_progress' && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (status === 'in_progress' && timeLeft === 0) {
            finishExam();
        }
        return () => clearTimeout(timer);
    }, [status, timeLeft, finishExam]);
    
    const startExam = async () => {
        setStatus('generating_questions');
        setAnswers([]);
        setCurrentQuestionIndex(0);
        setResult(null);

        try {
            const generatedQuestions = await generateExamQuestions(
                selectedSubjects,
                TOTAL_QUESTIONS_IN_EXAM,
                user.grade
            );
            
            if (generatedQuestions.length === 0) {
                throw new Error("لم يتم إنشاء أي أسئلة.");
            }

            setQuestions(generatedQuestions);
            setTimeLeft(duration * 60);
            setStatus('in_progress');
        } catch (error) {
            console.error(error);
            alert('حدث خطأ أثناء إعداد الاختبار. الرجاء المحاولة مرة أخرى.');
            setStatus('not_started');
        }
    };


    const handleAnswer = (questionId: string, answerIndex: number) => {
        setAnswers(prev => {
            const otherAnswers = prev.filter(a => a.questionId !== questionId);
            return [...otherAnswers, { questionId, answerIndex }];
        });
    };
    
    const restartExam = () => {
        setStatus('not_started');
        setSelectedSubjects([]);
    };

    const goToNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finishExam();
        }
    };

    const goToPrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };
    
    const toggleSubject = (subject: string) => {
        setSelectedSubjects(prev => 
            prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
        );
    };

    const selectAllSubjects = () => {
        if (selectedSubjects.length === MOCK_SUBJECTS.length) {
            setSelectedSubjects([]);
        } else {
            setSelectedSubjects(MOCK_SUBJECTS);
        }
    };
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    if (status === 'generating_questions') {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))] min-h-[400px]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[hsl(var(--color-primary))] mb-6"></div>
                <h2 className="text-2xl font-bold text-[hsl(var(--color-text-primary))]">يقوم Neo 🤖 بتوليد أسئلة مخصصة لك...</h2>
                <p className="text-[hsl(var(--color-text-secondary))] mt-2">نحن نعد امتحانًا فريدًا يناسب اختيارك ومستواك الدراسي. لحظات من فضلك.</p>
            </div>
        );
    }


    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))] min-h-[400px]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[hsl(var(--color-primary))] mb-6"></div>
                <h2 className="text-2xl font-bold text-[hsl(var(--color-text-primary))]">يقوم Neo 🤖 بتصحيح إجاباتك...</h2>
                <p className="text-[hsl(var(--color-text-secondary))] mt-2">لحظات قليلة وستظهر نتيجتك المفصلة.</p>
            </div>
        );
    }
    
    if (status === 'finished' && result) {
         return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg p-6 text-center border border-[hsl(var(--color-border))]">
                    <h2 className="text-3xl font-bold">النتيجة النهائية</h2>
                    <p className="text-6xl font-extrabold my-4 text-[hsl(var(--color-primary))]">{result.totalScore}<span className="text-3xl text-[hsl(var(--color-text-secondary))]"> / {result.totalQuestions}</span></p>
                    <div className="bg-[hsl(var(--color-background))] p-4 rounded-lg">
                        <p className="font-semibold">رسالة من Neo 🤖:</p>
                        <p className="italic whitespace-pre-line">{result.neoMessage}</p>
                    </div>
                </div>
                
                {Object.keys(result.subjectScores).length > 1 && (
                     <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg p-6 border border-[hsl(var(--color-border))]">
                        <h3 className="text-2xl font-bold mb-4">تقرير المواد</h3>
                        <div className="space-y-3">
                            {Object.entries(result.subjectScores).map(([subject, scores]) => (
                                <div key={subject} className="flex justify-between items-center bg-[hsl(var(--color-background))] p-3 rounded-lg">
                                    <span className="font-bold">{subject}</span>
                                    <div className="flex items-center gap-4">
                                        <div className="w-40 bg-black/10 dark:bg-white/10 rounded-full h-2.5">
                                            <div className="bg-[hsl(var(--color-primary))] h-2.5 rounded-full" style={{ width: `${(scores.score / scores.total) * 100}%` }}></div>
                                        </div>
                                        <span className="font-bold text-[hsl(var(--color-primary))] w-16 text-left">{scores.score} / {scores.total}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg p-6 border border-[hsl(var(--color-border))]">
                     <h3 className="text-2xl font-bold mb-4">مراجعة الإجابات</h3>
                     <div className="space-y-4">
                        {result.feedback.map((item, index) => (
                            <div key={index} className={`p-4 rounded-lg border-l-4 ${item.isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                                <p className="font-bold">{index + 1}. {item.question} <span className="text-xs font-normal bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">{item.subject}</span></p>
                                <p>إجابتك: <span className={`${!item.isCorrect ? 'text-red-600 dark:text-red-400 line-through' : 'text-green-700 dark:text-green-400'}`}>{item.studentAnswer}</span></p>
                                {!item.isCorrect && <p>الإجابة الصحيحة: <span className="text-green-700 dark:text-green-400 font-semibold">{item.correctAnswer}</span></p>}
                            </div>
                        ))}
                     </div>
                </div>
                <button onClick={restartExam} className="w-full bg-[hsl(var(--color-primary))] hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all shadow-[0_4px_14px_0_hsla(var(--color-primary),0.25)]">
                    خوض اختبار جديد
                </button>
            </div>
        );
    }

    if (status === 'in_progress' && questions.length > 0) {
        const currentQuestion = questions[currentQuestionIndex];
        return (
             <div className="animate-fade-in-up">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h2 className="text-xl font-bold">السؤال {currentQuestionIndex + 1} من {questions.length}</h2>
                    <div className="text-2xl font-bold bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] px-4 py-2 rounded-lg shadow-sm">{formatTime(timeLeft)}</div>
                </div>
                <Card3D className="bg-[hsl(var(--color-surface))] p-6 md:p-8 rounded-2xl border border-[hsl(var(--color-border))]">
                    <div className="mb-8 min-h-[80px]">
                         <p className="text-sm text-[hsl(var(--color-text-secondary))] mb-2 font-semibold bg-[hsl(var(--color-background))] px-2 py-1 rounded-md inline-block">{currentQuestion.subject}</p>
                        <p className="text-xl font-semibold">{currentQuestion.text}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => (
                            <button 
                                key={index} 
                                onClick={() => handleAnswer(currentQuestion.id, index)}
                                className={`p-4 rounded-lg text-right border-2 transition-all duration-200 text-base font-medium ${answers.find(a => a.questionId === currentQuestion.id && a.answerIndex === index) 
                                    ? 'bg-[hsl(var(--color-primary))] border-[hsl(var(--color-primary))] text-white scale-105 shadow-lg' 
                                    : 'bg-[hsl(var(--color-background))] border-transparent hover:border-[hsl(var(--color-primary))]'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </Card3D>
                 <div className="mt-8 flex gap-4 justify-between">
                    <button onClick={goToPrevious} disabled={currentQuestionIndex === 0} className="bg-[hsl(var(--color-surface))] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-[hsl(var(--color-text-primary))] font-bold py-3 px-8 rounded-lg text-lg transition-all border border-[hsl(var(--color-border))]">
                        السابق
                    </button>
                    <button onClick={goToNext} className="bg-[hsl(var(--color-primary))] hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all shadow-[0_4px_14px_0_hsla(var(--color-primary),0.25)]">
                        {currentQuestionIndex < questions.length - 1 ? 'التالي' : 'إنهاء الاختبار'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg p-8 text-center border border-[hsl(var(--color-border))] animate-fade-in-up">
            <h1 className="text-3xl font-extrabold mb-4">🤖 نظام Neo للاختبارات</h1>
            <p className="text-[hsl(var(--color-text-secondary))] mb-8 max-w-lg mx-auto">اختر مدة ومواد الاختبار لمحاكاة تجربة امتحانية حقيقية والحصول على تقرير أداء مفصل.</p>
            
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold mb-3 text-[hsl(var(--color-text-primary))]">1. اختر مدة الاختبار</h2>
                    <div className="flex justify-center gap-3 bg-[hsl(var(--color-background))] p-2 rounded-xl">
                        {[15, 30, 45, 60].map(d => (
                            <button 
                                key={d}
                                onClick={() => setDuration(d)}
                                className={`w-full px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${duration === d ? 'bg-[hsl(var(--color-primary))] text-white shadow-md scale-105' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                {d} دقيقة
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-3 text-[hsl(var(--color-text-primary))]">2. اختر المواد</h2>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {MOCK_SUBJECTS.map(subject => (
                            <button 
                                key={subject} 
                                onClick={() => toggleSubject(subject)}
                                className={`p-3 rounded-lg font-semibold transition-all duration-300 border-2 ${selectedSubjects.includes(subject) ? 'bg-[hsl(var(--color-primary))] text-white border-transparent scale-105 shadow-md' : 'bg-[hsl(var(--color-background))] border-transparent hover:border-[hsl(var(--color-primary))]'}`}
                            >
                                {subject}
                            </button>
                        ))}
                        <button 
                            onClick={selectAllSubjects}
                            className={`p-3 rounded-lg font-semibold transition-all duration-300 border-2 md:col-span-3 ${selectedSubjects.length === MOCK_SUBJECTS.length ? 'bg-[hsl(var(--color-primary))] text-white border-transparent scale-105 shadow-md' : 'bg-[hsl(var(--color-background))] border-transparent hover:border-[hsl(var(--color-primary))]'}`}
                        >
                            اختبار شامل (جميع المواد)
                        </button>
                    </div>
                </div>
            </div>

            <button onClick={startExam} disabled={selectedSubjects.length === 0} className="mt-8 w-full bg-[hsl(var(--color-primary))] hover:opacity-90 disabled:bg-gray-400 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-xl transition-all transform hover:scale-105 shadow-[0_4px_14px_0_hsla(var(--color-primary),0.3)]">
                ابدأ الاختبار ({selectedSubjects.length} {selectedSubjects.length === 1 ? 'مادة' : 'مواد'})
            </button>
        </div>
    );
};

export default AiExamPage;