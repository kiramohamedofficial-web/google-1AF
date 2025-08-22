
import { GoogleGenAI, Type } from '@google/genai';
import { Question, ExamResult, SubjectScore } from '../types';
import { MOCK_QUESTIONS } from '../constants';

// The API key is handled securely by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface Answer {
    questionId: string;
    answerIndex: number;
}

const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const generateExamQuestions = async (subjects: string[], questionCount: number, gradeLevel: string): Promise<Question[]> => {
    console.log("Generating exam questions with Gemini AI...");

    const questionSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: 'معرف فريد للسؤال، مثال: "q1"' },
            text: { type: Type.STRING, description: 'نص السؤال.' },
            options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'مصفوفة من 4 إجابات محتملة.'
            },
            correctOptionIndex: { type: Type.INTEGER, description: 'الفهرس الرقمي (يبدأ من 0) للإجابة الصحيحة في مصفوفة الخيارات.' },
            subject: { type: Type.STRING, description: 'المادة الدراسية للسؤال.' }
        },
        required: ['id', 'text', 'options', 'correctOptionIndex', 'subject']
    };

    const examSchema = {
        type: Type.OBJECT,
        properties: {
            questions: {
                type: Type.ARRAY,
                description: `مصفوفة تحتوي بالضبط على ${questionCount} سؤال.`,
                items: questionSchema
            }
        },
        required: ['questions']
    };

    const prompt = `
        أنت خبير في إنشاء الاختبارات التعليمية لمركز تعليمي في مصر.
        مهمتك هي إنشاء اختبار عالي الجودة وصعب.

        التعليمات:
        1. قم بإنشاء ${questionCount} سؤال اختيار من متعدد بالضبط.
        2. يجب أن تكون الأسئلة مناسبة لطالب في المرحلة الدراسية: "${gradeLevel}".
        3. يجب توزيع الأسئلة على المواد التالية: ${subjects.join('، ')}.
        4. كل سؤال يجب أن يحتوي على 4 خيارات بالضبط.
        5. لغة الأسئلة والإجابات يجب أن تكون العربية.
        6. قدم الفهرس الرقمي (يبدأ من 0) للإجابة الصحيحة.
        7. تأكد من أن إخراج JSON يتبع بدقة المخطط المقدم. لا تضف أي نصوص أو توضيحات خارج بنية JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: examSchema,
                temperature: 0.8,
            },
        });

        const jsonResponse = JSON.parse(response.text);
        
        if (jsonResponse.questions && Array.isArray(jsonResponse.questions) && jsonResponse.questions.length > 0) {
            return jsonResponse.questions as Question[];
        }
        
        throw new Error("AI response did not contain a valid questions array.");

    } catch (error) {
        console.error("Error generating questions with Gemini AI:", error);
        console.log("Falling back to local mock questions.");
        // Fallback to mock questions on error
        const relevantQuestions = MOCK_QUESTIONS.filter(q => subjects.includes(q.subject));
        const shuffledQuestions = shuffleArray(relevantQuestions);
        const examQuestions = shuffledQuestions.slice(0, questionCount);
        if (examQuestions.length === 0 && MOCK_QUESTIONS.length > 0) {
            return shuffleArray(MOCK_QUESTIONS).slice(0, questionCount);
        }
        return examQuestions;
    }
};


export const gradeExamWithNeoAI = async (questions: Question[], answers: Answer[]): Promise<ExamResult> => {
    console.log("Grading exam locally...");

    const feedback = questions.map(q => {
        const studentAnswerObj = answers.find(a => a.questionId === q.id);
        const studentAnswerIndex = studentAnswerObj ? studentAnswerObj.answerIndex : -1;
        const isCorrect = studentAnswerIndex === q.correctOptionIndex;

        return {
            question: q.text,
            subject: q.subject,
            studentAnswer: studentAnswerIndex > -1 ? q.options[studentAnswerIndex] : "لم تتم الإجابة",
            correctAnswer: q.options[q.correctOptionIndex],
            isCorrect: isCorrect,
            explanation: isCorrect ? undefined : "راجع الدرس المتعلق بهذا السؤال لتحسين فهمك.",
        };
    });

    const subjectScores: Record<string, SubjectScore> = {};
    feedback.forEach(f => {
        if (!subjectScores[f.subject]) {
            subjectScores[f.subject] = { score: 0, total: 0 };
        }
        subjectScores[f.subject].total++;
        if (f.isCorrect) {
            subjectScores[f.subject].score++;
        }
    });

    const totalScore = feedback.filter(f => f.isCorrect).length;
    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

    let neoMessage = "أنهيت الاختبار بنجاح! تفقد تقريرك المفصل.";
    if (totalQuestions > 0) {
        if (percentage === 100) {
            neoMessage = "رائع! لقد أجبت على جميع الأسئلة بشكل صحيح. عمل ممتاز واستمر على هذا المنوال!";
        } else if (percentage >= 80) {
            neoMessage = "نتيجة ممتازة! أنت تظهر فهمًا قويًا للمادة. استمر في العمل الجيد.";
        } else if (percentage >= 60) {
            neoMessage = "نتيجة جيدة. هناك بعض النقاط التي تحتاج إلى مراجعة بسيطة لتحقيق التميز.";
        } else {
            neoMessage = "لا بأس، كل اختبار هو فرصة للتعلم. راجع إجاباتك الخاطئة وحاول مرة أخرى. يمكنك تحقيق الأفضل!";
        }
    }

    const result: ExamResult = {
        totalScore,
        totalQuestions,
        subjectScores,
        feedback: feedback,
        neoMessage: neoMessage
    };

    return Promise.resolve(result);
};
