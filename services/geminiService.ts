import { Question, ExamResult, SubjectScore } from '../types.ts';
import { MOCK_QUESTIONS } from '../constants.ts';

const OPENROUTER_API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_NAME = "moonshotai/kimi-k2:free";
const API_KEY = process.env.API_KEY;

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

const callOpenRouterAPI = async (prompt: string) => {
    if (!API_KEY) {
        throw new Error("OpenRouter API key is not set in environment variables (API_KEY).");
    }

    const response = await fetch(OPENROUTER_API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://google-edu-center.netlify.app',
            'X-Title': 'Google Educational Center',
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            messages: [
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.8,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
        throw new Error("Invalid response structure from OpenRouter API.");
    }
    return JSON.parse(data.choices[0].message.content);
};

export const generateExamQuestions = async (subjects: string[], questionCount: number, gradeLevel: string): Promise<Question[]> => {
    console.log(`Generating exam questions with OpenRouter (${MODEL_NAME})...`);

    const jsonStructure = `{
        "questions": [
            {
                "id": "q1",
                "text": "نص السؤال هنا",
                "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
                "correctOptionIndex": 0,
                "subject": "المادة الدراسية"
            }
        ]
    }`;

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
        7. يجب أن يكون الإخراج بتنسيق JSON صالحًا تمامًا. لا تضف أي نص أو تعليقات خارج كائن JSON.
        8. يجب أن يتبع الإخراج البنية التالية بدقة:
        ${jsonStructure}
    `;

    try {
        const jsonResponse = await callOpenRouterAPI(prompt);
        
        if (jsonResponse.questions && Array.isArray(jsonResponse.questions) && jsonResponse.questions.length > 0) {
            return jsonResponse.questions.map((q: any, index: number) => ({ ...q, id: `q${index + 1}`})) as Question[];
        }
        
        throw new Error("AI response did not contain a valid questions array.");

    } catch (error) {
        console.error("Error generating questions with OpenRouter AI:", error);
        console.log("Falling back to local mock questions.");
        const relevantQuestions = MOCK_QUESTIONS.filter(q => subjects.includes(q.subject));
        const shuffledQuestions = shuffleArray(relevantQuestions);
        const examQuestions = shuffledQuestions.slice(0, questionCount);
        if (examQuestions.length === 0 && MOCK_QUESTIONS.length > 0) {
            return shuffleArray(MOCK_QUESTIONS).slice(0, questionCount);
        }
        return examQuestions;
    }
};

export const gradeExamAndGetFeedbackAI = async (questions: Question[], answers: Answer[], gradeLevel: string): Promise<ExamResult> => {
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
    
    const baseResult: ExamResult = {
        totalScore,
        totalQuestions,
        subjectScores,
        feedback,
        neoMessage: "تم التصحيح بنجاح!",
    };

    try {
        const jsonStructure = `{
            "neoMessage": "رسالة تشجيعية ومحفزة للطالب.",
            "performanceAnalysis": "تحليل أداء الطالب، مع ذكر نقاط القوة والضعف حسب المواد.",
            "improvementTips": [
                "نصيحة 1",
                "نصيحة 2",
                "نصيحة 3"
            ]
        }`;

        const prompt = `
            أنت مساعد تعليمي ذكي ومشجع اسمه "Neo 🤖".
            مهمتك هي تحليل نتائج اختبار طالب وتقديم ملاحظات بناءة.

            بيانات الاختبار:
            - المستوى الدراسي للطالب: ${gradeLevel}
            - النتيجة: ${totalScore} من ${totalQuestions}
            - تفاصيل الإجابات: ${JSON.stringify(feedback.map(f => ({ subject: f.subject, correct: f.isCorrect })))}

            التعليمات:
            1.  اكتب رسالة تشجيعية ("neoMessage") للطالب بناءً على نتيجته. يجب أن تكون الرسالة إيجابية ومحفزة، حتى لو كانت النتيجة منخفضة.
            2.  قدم تحليلاً للأداء ("performanceAnalysis") يوضح نقاط القوة والضعف. إذا كان الاختبار يحتوي على مواد متعددة، قارن بين الأداء في كل مادة.
            3.  قدم 3 نصائح قابلة للتنفيذ ("improvementTips") لمساعدة الطالب على التحسن في المرات القادمة. يجب أن تكون النصائح محددة ومركزة على نقاط الضعف التي لاحظتها.
            4.  يجب أن يكون الإخراج بتنسيق JSON صالحًا تمامًا. لا تضف أي نص أو تعليقات خارج كائن JSON.
            5.  يجب أن يتبع الإخراج البنية التالية بدقة:
            ${jsonStructure}
        `;

        const aiFeedback = await callOpenRouterAPI(prompt);

        return {
            ...baseResult,
            neoMessage: aiFeedback.neoMessage,
            performanceAnalysis: aiFeedback.performanceAnalysis,
            improvementTips: aiFeedback.improvementTips,
        };

    } catch (error) {
        console.error("Error getting AI feedback from OpenRouter:", error);
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
        return { 
            ...baseResult,
            neoMessage: neoMessage,
            performanceAnalysis: "لم نتمكن من إنشاء تحليل مفصل هذه المرة. يرجى مراجعة إجاباتك أدناه.",
            improvementTips: ["حاول مرة أخرى لاحقًا للحصول على نصائح مخصصة."]
        };
    }
};
