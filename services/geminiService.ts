
import { Question, ExamResult, SubjectScore } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface Answer {
    questionId: string;
    answerIndex: number;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        subject: { type: Type.STRING, description: "The subject of the question in Arabic" },
        text: { type: Type.STRING, description: "The question text in Arabic" },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of exactly 4 possible string answers in Arabic"
        },
        correctOptionIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the options array" }
    },
    required: ["subject", "text", "options", "correctOptionIndex"]
};


export const generateExamQuestions = async (subjects: string[], questionCount: number, gradeLevel: string): Promise<Question[]> => {
    
    const prompt = `
        System instruction: أنت مساعد ذكاء اصطناعي خبير في إنشاء أسئلة امتحانات تعليمية عالية الجودة ومتنوعة باللغة العربية لطلاب المدارس الثانوية.
        
        Task: أنشئ امتحانًا مكونًا من ${questionCount} سؤالًا في المواد التالية: ${subjects.join('، ')}.
        - يجب أن تكون الأسئلة مناسبة تمامًا لمستوى طالب في "${gradeLevel}" وتتبع المنهج التعليمي المصري.
        - يجب أن تكون جميع الأسئلة من نوع الاختيار من متعدد (MCQ) مع أربعة خيارات لكل سؤال، وإجابة واحدة صحيحة فقط.
        - نوّع الأسئلة لتشمل الفهم والتحليل وحل المشكلات بدلاً من الأسئلة المباشرة.
        - وزّع عدد الأسئلة بالتساوي على المواد المحددة قدر الإمكان.
    `;

    try {
        console.log("Generating exam questions with @google/genai...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: questionSchema
                }
            }
        });

        const generatedQuestions = JSON.parse(response.text);

        if (!Array.isArray(generatedQuestions)) {
            throw new Error("API did not return a valid array of questions.");
        }
        
        return generatedQuestions.map((q, index) => ({ ...q, id: `gen_q_${index + 1}` }));

    } catch (error) {
        console.error("Error generating exam questions with Gemini:", error);
        throw new Error("فشل إنشاء الأسئلة. الرجاء المحاولة مرة أخرى.");
    }
};

// This is a MOCK service. It simulates a call to the Gemini API for grading.
export const gradeExamWithNeoAI = async (questions: Question[], answers: Answer[]): Promise<ExamResult> => {
    console.log("Simulating Gemini API call with:", { questions, answers });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

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
            explanation: isCorrect ? undefined : "تذكر أن تراجع الفصل الخاص بهذا المفهوم.",
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

    // Generate Neo Message
    let neoMessage = "";
    const percentage = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
    
    if (percentage >= 85) {
        neoMessage = "🌟 عمل رائع ومستوى ممتاز! أنت تتقن المواد جيدًا. استمر في هذا الأداء المتميز.";
    } else if (percentage >= 65) {
        neoMessage = "👍 مجهود جيد جدًا! نتيجتك تظهر فهمًا جيدًا للمواد. هناك بعض النقاط التي يمكنك تحسينها لتصل إلى القمة.";
    } else if (percentage >= 50) {
        neoMessage = "مجهود جيد! لديك أساس لا بأس به. كل خطأ هو فرصة للتعلم. ركز على مراجعة النقاط التي أخطأت فيها.";
    } else {
        neoMessage = "لا بأس، البدايات دائمًا تحتاج إلى مجهود. استخدم هذا الاختبار لتحديد نقاط ضعفك والعمل على تقويتها. أنا هنا لمساعدتك!";
    }

    // Add subject-specific feedback
    const subjects = Object.keys(subjectScores);
    if (subjects.length > 1) {
        const worstSubject = subjects.reduce((a, b) => (subjectScores[a].score / subjectScores[a].total) < (subjectScores[b].score / subjectScores[b].total) ? a : b);
        const bestSubject = subjects.reduce((a, b) => (subjectScores[a].score / subjectScores[a].total) > (subjectScores[b].score / subjectScores[b].total) ? a : b);
        
        const bestScore = subjectScores[bestSubject];
        const worstScore = subjectScores[worstSubject];

        if ((bestScore.score / bestScore.total) >= 0.8 && (worstScore.score / worstScore.total) < 0.6 && bestSubject !== worstSubject) {
             neoMessage += `\n\nأداؤك كان استثنائيًا في ${bestSubject}، لكن يبدو أن مادة ${worstSubject} تحتاج المزيد من التركيز. ما رأيك في مراجعة دروسها؟`;
        }
    }


    const result: ExamResult = {
        totalScore,
        totalQuestions,
        subjectScores,
        feedback,
        neoMessage
    };

    return result;
};