import React, { useState, useEffect, useCallback } from 'react';
import { MOCK_SUBJECTS, getSubjectStyle, MOCK_QUESTIONS } from '../constants.ts';
import { Question, ExamResult, User, SubjectScore } from '../types.ts';
import { gradeExamAndGetFeedbackAI, generateExamQuestions } from '../services/geminiService.ts';
import Card3D from '../components/common/Card3D.tsx';
import { FlagIcon } from '../components/common/Icons.tsx';

type ExamStatus = 'not_started' | 'generating_questions' | 'in_progress' | 'loading' | 'finished';
type ExamSystem = 'عام' | 'لغات' | 'ازهري';
type AiModel = 'A1' | 'A2';
type ResultTab = 'summary' | 'analysis' | 'review';

const difficultyMap = { M1: 'سهل', M2: 'متوسط', M3: 'متقدم' };
const cognitiveLevelMap = {
    Remember: 'تذكر',
    Understand: 'فهم',
    Apply: 'تطبيق',
    Analyze: 'تحليل',
    Evaluate: 'تقييم',
    Create: 'إبداع'
};

const getLoadingMessages = (model: AiModel) => model === 'A1' ? [
    "يقوم Neo 🤖 باستشارة قاعدة بياناته المعرفية...",
    "صياغة أسئلة تتحدى تفكيرك...",
    "تحضير مشتتات ذكية ومضللة...",
    "لحظات ويصبح اختبارك الفريد جاهزًا...",
] : [
    "يقوم المساعد الذكي باستشارة قاعدة بياناته المعرفية...",
    "صياغة أسئلة تتحدى تفكيرك...",
    "تحضير مشتتات ذكية ومضللة...",
    "لحظات ويصبح اختبارك الفريد جاهزًا...",
];

const getGradingMessages = (model: AiModel) => model === 'A1' ? [
    "يقوم Neo 🤖 بتحليل إجاباتك العبقرية...",
    "حساب نقاط القوة والضعف لديك...",
    "إعداد تقرير مفصل ونصائح مخصصة...",
    "النتائج على وشك الظهور!",
] : [
    "يقوم المساعد الذكي بتحليل إجاباتك العبقرية...",
    "حساب نقاط القوة والضعف لديك...",
    "إعداد تقرير مفصل ونصائح مخصصة...",
    "النتائج على وشك الظهور!",
];

const QuestionNavigator: React.FC<{
    count: number;
    currentIndex: number;
    answers: { questionId: string; answerIndex: number; }[];
    questionIds: string[];
    markedQuestions: string[];
    onJump: (index: number) => void;
}> = ({ count, currentIndex, answers, questionIds, markedQuestions, onJump }) => {
    return (
        <div className="bg-[hsl(var(--color-surface))] p-4 rounded-2xl border border-[hsl(var(--color-border))]">
            <h3 className="font-bold mb-3 text-center text-[hsl(var(--color-text-primary))]">خريطة الأسئلة</h3>
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
                {Array.from({ length: count }).map((_, index) => {
                    const questionId = questionIds[index];
                    const isAnswered = answers.some(a => a.questionId === questionId);
                    const isMarked = markedQuestions.includes(questionId);
                    const isCurrent = index === currentIndex;

                    let statusClass = 'bg-[hsl(var(--color-background))] hover:border-[hsl(var(--color-primary))] border-transparent';
                    if (isCurrent) {
                        statusClass = 'bg-[hsl(var(--color-primary))] text-white border-[hsl(var(--color-primary))] ring-2 ring-offset-2 ring-[hsl(var(--color-primary))] ring-offset-[hsl(var(--color-surface))]';
                    } else if (isAnswered) {
                        statusClass = 'bg-green-500/20 border-green-500 text-green-800 dark:text-green-300';
                    }
                    if (isMarked && !isCurrent) {
                        statusClass = 'bg-yellow-400/20 border-yellow-500 text-yellow-800 dark:text-yellow-300';
                    }


                    return (
                        <button
                            key={index}
                            onClick={() => onJump(index)}
                            className={`w-full aspect-square rounded-md font-bold text-lg flex items-center justify-center transition-all border-2 relative ${statusClass}`}
                            aria-label={`Go to question ${index + 1}`}
                        >
                            {isMarked && <div className="absolute top-0.5 right-0.5 text-yellow-500"><FlagIcon/></div>}
                            {index + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};


const ScoreCircle: React.FC<{ score: number; total: number }> = ({ score, total }) => {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    let colorClass = 'text-red-500';
    if (percentage >= 80) colorClass = 'text-green-500';
    else if (percentage >= 50) colorClass = 'text-yellow-500';
    
    return (
        <div className="relative inline-flex items-center justify-center my-4">
            <svg height={radius * 2} width={radius * 2} className="-rotate-90">
                <circle
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth={stroke} stroke="currentColor" fill="transparent"
                    r={normalizedRadius} cx={radius} cy={radius}
                />
                <circle
                    className={`transition-[stroke-dashoffset] duration-1000 ease-out ${colorClass}`}
                    strokeWidth={stroke} strokeDasharray={circumference}
                    style={{ strokeDashoffset }} stroke="currentColor" strokeLinecap="round"
                    fill="transparent" r={normalizedRadius} cx={radius} cy={radius}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-extrabold text-[hsl(var(--color-text-primary))]">{percentage}%</span>
                <span className="text-xl font-bold text-[hsl(var(--color-text-secondary))]">{score} / {total}</span>
            </div>
        </div>
    );
};


const BreakdownSection: React.FC<{ title: string; data: Record<string, SubjectScore>, labelMap?: Record<string, string> }> = ({ title, data, labelMap }) => {
    if (!data || Object.keys(data).length === 0) return null;
    return (
        <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg p-6 border border-[hsl(var(--color-border))]">
            <h3 className="text-2xl font-bold mb-4">{title}</h3>
            <div className="space-y-4">
                {(Object.entries(data) as [string, SubjectScore][]).sort(([, a],[, b]) => b.total - a.total).map(([key, scores]) => {
                    const percentage = scores.total > 0 ? (scores.score / scores.total) * 100 : 0;
                    const style = getSubjectStyle(key);
                    const colorClass = title.includes("المادة") ? style.progressBarClass : 'bg-[hsl(var(--color-primary))]';
                    
                    return (
                         <div key={key}>
                            <div className="flex justify-between items-center mb-1 text-base font-semibold">
                                <span>{labelMap ? labelMap[key] || key : key}</span>
                                <span className="text-[hsl(var(--color-text-secondary))]">{scores.score} / {scores.total}</span>
                            </div>
                            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-3">
                                <div className={`${colorClass} h-3 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const StepHeader: React.FC<{ step: number, title: string }> = ({ step, title }) => (
    <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[hsl(var(--color-primary))] text-white font-bold text-xl">{step}</div>
        <h2 className="text-2xl font-bold">{title}</h2>
    </div>
);


interface AiExamPageProps {
    user: User;
}

const AiExamPage: React.FC<AiExamPageProps> = ({ user }) => {
    const [questionCount, setQuestionCount] = useState(10);
    const [duration, setDuration] = useState(30);
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [status, setStatus] = useState<ExamStatus>('not_started');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ questionId: string, answerIndex: number }[]>([]);
    const [result, setResult] = useState<ExamResult | null>(null);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [markedQuestions, setMarkedQuestions] = useState<string[]>([]);
    const [examSystem, setExamSystem] = useState<ExamSystem>('عام');
    const [aiModel, setAiModel] = useState<AiModel>('A1');
    const [activeResultTab, setActiveResultTab] = useState<ResultTab>('summary');

    const finishExam = useCallback(async () => {
        setStatus('loading');
        const examResult = await gradeExamAndGetFeedbackAI(questions, answers, user.grade, examSystem, aiModel);
        setResult(examResult);
        setStatus('finished');
    }, [answers, questions, user.grade, examSystem, aiModel]);
    
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (status === 'in_progress' && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (status === 'in_progress' && timeLeft === 0) {
            finishExam();
        }
        return () => clearTimeout(timer);
    }, [status, timeLeft, finishExam]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (status === 'generating_questions') {
            const messages = getLoadingMessages(aiModel);
            let i = 0;
            setLoadingMessage(messages[0]);
            interval = setInterval(() => {
                i = (i + 1) % messages.length;
                setLoadingMessage(messages[i]);
            }, 2500);
        } else if (status === 'loading') {
            const messages = getGradingMessages(aiModel);
            let i = 0;
            setLoadingMessage(messages[0]);
            interval = setInterval(() => {
                i = (i + 1) % messages.length;
                setLoadingMessage(messages[i]);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [status, aiModel]);
    
    const startExam = async () => {
        setStatus('generating_questions');
        setAnswers([]);
        setMarkedQuestions([]);
        setCurrentQuestionIndex(0);
        setResult(null);

        try {
            const generatedQuestions = await generateExamQuestions(selectedSubjects, questionCount, user.grade, examSystem, aiModel);
            if (generatedQuestions.length === 0) throw new Error("AI did not generate any questions.");

            setQuestions(generatedQuestions);
            setTimeLeft(duration * 60);
            setStatus('in_progress');
        } catch (error) {
            console.error(error);
            const fallbackMessage = aiModel === 'A1'
                ? "عذرًا، واجه Neo 🤖 صعوبة في إعداد اختبارك المخصص. هل تود تجربة اختبار جاهز بدلاً من ذلك؟"
                : "عذرًا، واجه المساعد الذكي صعوبة في إعداد اختبارك المخصص. هل تود تجربة اختبار جاهز بدلاً من ذلك؟";

            if (confirm(fallbackMessage)) {
                const mockForSubjects = MOCK_QUESTIONS.filter(q => selectedSubjects.includes(q.subject));
                
                if (mockForSubjects.length > 0) {
                     const selectedMocks = mockForSubjects.sort(() => 0.5 - Math.random()).slice(0, questionCount);
                     setQuestions(selectedMocks);
                     setTimeLeft(duration * 60);
                     setStatus('in_progress');
                } else {
                    alert("للأسف، لا تتوفر أسئلة جاهزة للمواد التي اخترتها. يرجى المحاولة مرة أخرى أو اختيار مواد مختلفة.");
                    setStatus('not_started');
                }
            } else {
                setStatus('not_started');
            }
        }
    };

    const handleAnswer = (questionId: string, answerIndex: number) => {
        setAnswers(prev => [...prev.filter(a => a.questionId !== questionId), { questionId, answerIndex }]);
    };

    const handleMarkForReview = (questionId: string) => {
        setMarkedQuestions(prev => 
            prev.includes(questionId) 
                ? prev.filter(id => id !== questionId) 
                : [...prev, questionId]
        );
    };
    
    const restartExam = () => { setStatus('not_started'); setSelectedSubjects([]); };
    const goToNext = () => { currentQuestionIndex < questions.length - 1 ? setCurrentQuestionIndex(prev => prev + 1) : finishExam(); };
    const goToPrevious = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1); };
    const toggleSubject = (subject: string) => setSelectedSubjects(prev => prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]);
    const selectAllSubjects = () => setSelectedSubjects(prev => prev.length === MOCK_SUBJECTS.length ? [] : MOCK_SUBJECTS);
    const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    
    const LoadingScreen: React.FC<{message: string}> = ({message}) => (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg border border-[hsl(var(--color-border))] min-h-[50vh] transition-all duration-500">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[hsl(var(--color-primary))] mb-6"></div>
            <h2 className="text-2xl font-bold text-[hsl(var(--color-text-primary))]">{message}</h2>
        </div>
    );
    
    if (status === 'generating_questions') return <LoadingScreen message={loadingMessage} />;
    if (status === 'loading') return <LoadingScreen message={loadingMessage} />;
    
    if (status === 'finished' && result) {
         return (
            <div className="space-y-8 animate-fade-in-up">
                <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg p-6 text-center border border-[hsl(var(--color-border))]">
                    <h2 className="text-3xl font-bold">النتيجة النهائية</h2>
                    <ScoreCircle score={result.totalScore} total={result.totalQuestions} />
                    <div className="max-w-2xl mx-auto bg-[hsl(var(--color-background))] p-4 rounded-xl relative">
                        <div className="absolute -top-3 -right-3 text-4xl">{aiModel === 'A1' ? '🤖' : '🧠'}</div>
                        <p className="font-semibold text-lg text-[hsl(var(--color-text-primary))]">{result.aiMessage}</p>
                    </div>
                </div>

                <div className="bg-[hsl(var(--color-surface))] rounded-xl shadow-lg p-2 border border-[hsl(var(--color-border))] flex items-center justify-center gap-2">
                    {(Object.entries({summary: 'ملخص الأداء', analysis: 'تحليل AI', review: 'مراجعة الإجابات'}) as [ResultTab, string][]).map(([tabKey, tabName]) => (
                         <button 
                            key={tabKey}
                            onClick={() => setActiveResultTab(tabKey)}
                            className={`w-full text-center py-2 px-4 font-semibold rounded-lg transition-all duration-300 ${activeResultTab === tabKey ? 'bg-[hsl(var(--color-primary))] text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            {tabName}
                        </button>
                    ))}
                </div>
                
                <div>
                    {activeResultTab === 'summary' && (
                        <div className="space-y-6 animate-fade-in-up">
                             <BreakdownSection title="📈 الأداء حسب المادة" data={result.performanceBreakdown.bySubject} />
                             <BreakdownSection title="🧠 الأداء حسب المهارة المعرفية" data={result.performanceBreakdown.byCognitiveLevel} labelMap={cognitiveLevelMap} />
                             <BreakdownSection title="🏋️ الأداء حسب مستوى الصعوبة" data={result.performanceBreakdown.byDifficulty} labelMap={difficultyMap} />
                        </div>
                    )}
                    {activeResultTab === 'analysis' && result.performanceAnalysis && (
                         <div className="space-y-6 animate-fade-in-up">
                            <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg p-6 border border-[hsl(var(--color-border))]">
                                <h3 className="text-2xl font-bold mb-4">📊 تحليل المستوى</h3>
                                <p className="text-[hsl(var(--color-text-primary))] whitespace-pre-line text-lg">{result.performanceAnalysis}</p>
                            </div>
                            {result.improvementTips && result.improvementTips.length > 0 && (
                                <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg p-6 border border-[hsl(var(--color-border))]">
                                    <h3 className="text-2xl font-bold mb-4">{aiModel === 'A1' ? '💡 نصائح ذكية من Neo' : '💡 نصائح للتحسين'}</h3>
                                    <ul className="space-y-3">
                                        {result.improvementTips.map((tip, index) => (
                                            <li key={index} className="flex items-start gap-3 text-lg"><span className="text-xl">💡</span><span>{tip}</span></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    {activeResultTab === 'review' && (
                         <div className="bg-[hsl(var(--color-surface))] rounded-2xl shadow-lg p-6 border border-[hsl(var(--color-border))] animate-fade-in-up">
                             <h3 className="text-2xl font-bold mb-4">مراجعة الإجابات</h3>
                             <div className="space-y-4">
                                {result.review.map((item, index) => (
                                    <div key={index} className={`p-4 rounded-lg border-l-4 ${item.isCorrect ? 'bg-green-500/5 border-green-500' : 'bg-red-500/5 border-red-500'}`}>
                                        <p className="font-bold text-lg flex items-center gap-2">{item.isCorrect ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌</span>} سؤال {index + 1}: {item.questionStem}</p>
                                        <div className="pr-8 mt-2 space-y-1">
                                            <p>إجابتك: <span className={`${!item.isCorrect ? 'text-red-600 dark:text-red-400 line-through' : 'text-green-700 dark:text-green-400'}`}>{item.studentAnswer}</span></p>
                                            {!item.isCorrect && <p>الإجابة الصحيحة: <span className="text-green-700 dark:text-green-400 font-semibold">{item.correctAnswer}</span></p>}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-[hsl(var(--color-border))] pr-8">
                                            <p className="text-sm font-bold text-blue-700 dark:text-blue-400">💡 التفسير:</p>
                                            <p className="text-sm text-[hsl(var(--color-text-secondary))]">{item.rationale}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>

                <button onClick={restartExam} className="w-full bg-[hsl(var(--color-primary))] hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all shadow-[0_4px_14px_0_hsla(var(--color-primary),0.25)]">
                    خوض اختبار جديد
                </button>
            </div>
        );
    }

    if (status === 'in_progress' && questions.length > 0) {
        const currentQuestion = questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        const optionPrefixes = ['أ', 'ب', 'ج', 'د'];

        const timerProgress = (timeLeft / (duration * 60)) * 100;
        let timerColorClass = 'bg-green-500';
        if (timerProgress < 50) timerColorClass = 'bg-yellow-500';
        if (timerProgress < 25) timerColorClass = 'bg-red-500';

        return (
             <div className="lg:grid lg:grid-cols-3 lg:gap-8 animate-fade-in-up">
                {/* Main Content Column */}
                <div className="lg:col-span-2">
                    <Card3D className="bg-[hsl(var(--color-surface))] p-6 md:p-8 rounded-2xl border border-[hsl(var(--color-border))]">
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[hsl(var(--color-border))]">
                                <h3 className="text-xl font-bold text-[hsl(var(--color-text-primary))]">
                                    السؤال {currentQuestionIndex + 1} من {questions.length}
                                </h3>
                                <button 
                                    onClick={() => handleMarkForReview(currentQuestion.id)}
                                    className={`inline-flex items-center gap-2 font-semibold py-1 px-3 rounded-lg transition-colors border-2 ${
                                        markedQuestions.includes(currentQuestion.id)
                                        ? 'bg-yellow-400/10 border-yellow-500 text-yellow-600 dark:text-yellow-400'
                                        : 'bg-transparent border-transparent text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <FlagIcon />
                                    {markedQuestions.includes(currentQuestion.id) ? 'إلغاء التأشير' : 'تأشير للمراجعة'}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4 text-sm font-semibold">
                                <span className="bg-blue-500/10 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">{currentQuestion.subject}</span>
                                <span className="bg-purple-500/10 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">{cognitiveLevelMap[currentQuestion.cognitive_level] || currentQuestion.cognitive_level}</span>
                                <span className="bg-green-500/10 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">{difficultyMap[currentQuestion.difficulty] || currentQuestion.difficulty}</span>
                            </div>
                            {currentQuestion.context && <p className="text-lg text-[hsl(var(--color-text-secondary))] mb-4 bg-[hsl(var(--color-background))] p-4 rounded-lg border-r-4 border-[hsl(var(--color-primary))]">{currentQuestion.context}</p>}
                            <p className="text-2xl font-bold">{currentQuestion.stem}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQuestion.options.map((option, index) => (
                                <button 
                                    key={index} onClick={() => handleAnswer(currentQuestion.id, index)}
                                    className={`p-4 rounded-lg text-right border-2 transition-all duration-200 text-lg font-medium flex items-center gap-4 ${answers.find(a => a.questionId === currentQuestion.id && a.answerIndex === index) 
                                        ? 'bg-[hsl(var(--color-primary))] border-[hsl(var(--color-primary))] text-white scale-105 shadow-lg' 
                                        : 'bg-[hsl(var(--color-background))] border-transparent hover:border-[hsl(var(--color-primary))]'}`}
                                >
                                    <span className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-bold ${answers.find(a => a.questionId === currentQuestion.id && a.answerIndex === index) ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'}`}>{optionPrefixes[index]}</span>
                                    <span>{option}</span>
                                </button>
                            ))}
                        </div>
                    </Card3D>
                    <div className="mt-8 flex gap-4 justify-between">
                        <button onClick={goToPrevious} disabled={currentQuestionIndex === 0} className="bg-[hsl(var(--color-surface))] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-[hsl(var(--color-text-secondary))] font-bold py-3 px-8 rounded-lg transition-all">
                            السابق
                        </button>
                        <button onClick={goToNext} className="bg-[hsl(var(--color-primary))] hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-[0_4px_14px_0_hsla(var(--color-primary),0.25)]">
                            {currentQuestionIndex === questions.length - 1 ? 'إنهاء الاختبار' : 'التالي'}
                        </button>
                    </div>
                </div>
                {/* Sidebar Column */}
                 <div className="lg:col-span-1 mt-8 lg:mt-0">
                     <div className="sticky top-24 space-y-6">
                         <div className="bg-[hsl(var(--color-surface))] p-4 rounded-2xl border border-[hsl(var(--color-border))]">
                            <div className="flex justify-between items-center mb-1 font-semibold text-lg">
                                <span>الوقت المتبقي</span>
                                <div className="font-mono bg-[hsl(var(--color-background))] px-3 py-1 rounded-md">{formatTime(timeLeft)}</div>
                            </div>
                            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 mb-3">
                                <div className={`${timerColorClass} h-1.5 rounded-full transition-[width] duration-1000 linear`} style={{width: `${timerProgress}%`}}></div>
                            </div>

                            <div className="flex justify-between items-center mb-1 font-semibold">
                                <span>التقدم</span>
                                <span>{currentQuestionIndex + 1} / {questions.length}</span>
                            </div>
                            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5"><div className="bg-[hsl(var(--color-primary))] h-2.5 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div></div>
                         </div>
                        
                         <QuestionNavigator 
                            count={questions.length}
                            currentIndex={currentQuestionIndex}
                            answers={answers}
                            questionIds={questions.map(q => q.id)}
                            markedQuestions={markedQuestions}
                            onJump={setCurrentQuestionIndex}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="bg-[hsl(var(--color-surface))] rounded-3xl shadow-2xl p-6 md:p-8 border border-[hsl(var(--color-border))]">
                 <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-[hsl(var(--color-text-primary))] relative">
                        🧠 الاختبارات الذكية
                    </h1>
                    <p className="text-lg text-[hsl(var(--color-text-secondary))] mt-4 max-w-2xl mx-auto relative">
                        قم بتوليد اختبارات فريدة في المواد التي تختارها لتقييم مستواك والاستعداد بشكل أفضل.
                    </p>
                </div>
                
                <div className="space-y-8">
                    <div className="space-y-4">
                        <StepHeader step={1} title="اختر المواد" />
                        <div className="flex flex-wrap gap-3">
                            <button onClick={selectAllSubjects} className={`font-semibold py-2 px-4 rounded-lg transition-colors border-2 ${selectedSubjects.length === MOCK_SUBJECTS.length ? 'bg-[hsl(var(--color-primary))] text-white border-transparent' : 'bg-transparent border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))]'}`}>
                                {selectedSubjects.length === MOCK_SUBJECTS.length ? 'إلغاء الكل' : 'تحديد الكل'}
                            </button>
                            {MOCK_SUBJECTS.map(subject => {
                                const style = getSubjectStyle(subject);
                                return(
                                <button key={subject} onClick={() => toggleSubject(subject)}
                                    className={`font-semibold py-2 px-4 rounded-lg transition-all duration-200 border-2 flex items-center gap-2 ${selectedSubjects.includes(subject) ? 'bg-[hsl(var(--color-primary))] text-white border-transparent shadow-md scale-105' : 'bg-transparent border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))]'}`}>
                                    <span className="text-xl">{style.icon}</span> {subject}
                                </button>
                            )})}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                         <StepHeader step={2} title="اختر نموذج الأسئلة" />
                        <p className="text-sm text-[hsl(var(--color-text-secondary))] -mt-3">
                            نماذج مختلفة من الذكاء الاصطناعي لتوليد أسئلة متنوعة.
                        </p>
                        <div className="flex bg-[hsl(var(--color-background))] p-1 rounded-xl gap-1">
                            <button onClick={() => setAiModel('A1')} className={`w-full text-center py-2 px-4 font-bold rounded-lg transition-all duration-300 ${aiModel === 'A1' ? 'bg-[hsl(var(--color-primary))] text-white shadow' : 'text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                نموذج A1 (Neo 🤖)
                            </button>
                            <button onClick={() => setAiModel('A2')} className={`w-full text-center py-2 px-4 font-bold rounded-lg transition-all duration-300 ${aiModel === 'A2' ? 'bg-[hsl(var(--color-primary))] text-white shadow' : 'text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                نموذج A2 (المساعد الذكي)
                            </button>
                        </div>
                        <div className="mt-4 text-sm text-[hsl(var(--color-text-secondary))] space-y-2">
                            <p><strong className="text-[hsl(var(--color-text-primary))]">نموذج A1 (Neo 🤖):</strong> يتميز بأسئلة إبداعية ومتنوعة، ويركز على التفكير النقدي بأسلوب شيق.</p>
                            <p><strong className="text-[hsl(var(--color-text-primary))]">نموذج A2 (المساعد الذكي):</strong> يتميز بأسئلة أكاديمية دقيقة وصارمة، ويركز على محاكاة الاختبارات القياسية.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <StepHeader step={3} title="اختر نظام الأسئلة" />
                        <div className="flex bg-[hsl(var(--color-background))] p-1 rounded-xl gap-1">
                            {(['عام', 'لغات', 'ازهري'] as ExamSystem[]).map(system => (
                                <button key={system} onClick={() => setExamSystem(system)} className={`w-full text-center py-2 px-4 font-bold rounded-lg transition-all duration-300 ${examSystem === system ? 'bg-[hsl(var(--color-primary))] text-white shadow' : 'text-[hsl(var(--color-text-secondary))] hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                    {system.charAt(0).toUpperCase() + system.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <StepHeader step={4} title="عدد الأسئلة" />
                             <div className="flex items-center gap-4">
                                <input type="range" min="10" max="30" step="5" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} className="w-full h-2 bg-[hsl(var(--color-background))] rounded-lg appearance-none cursor-pointer"/>
                                <span className="font-bold text-lg bg-[hsl(var(--color-background))] px-4 py-2 rounded-md w-28 text-center">{questionCount} سؤال</span>
                            </div>
                        </div>

                         <div className="space-y-4">
                            <StepHeader step={5} title="مدة الاختبار" />
                            <div className="flex items-center gap-4">
                                 <input type="range" min="10" max="60" step="5" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full h-2 bg-[hsl(var(--color-background))] rounded-lg appearance-none cursor-pointer"/>
                                <span className="font-bold text-lg bg-[hsl(var(--color-background))] px-4 py-2 rounded-md w-28 text-center">{duration} دقيقة</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={startExam} disabled={selectedSubjects.length === 0}
                    className="w-full mt-10 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg text-xl transition-all shadow-[0_4px_14px_0_rgba(34,197,94,0.35)] transform hover:scale-[1.02]">
                    🚀 ابدأ الاختبار الآن
                </button>
            </div>
        </div>
    );
};

export default AiExamPage;