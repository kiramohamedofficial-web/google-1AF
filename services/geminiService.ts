
import { Question, ExamResult, SubjectScore } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface Answer {
    questionId: string;
    answerIndex: number;
}

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const questionSchema = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    text: { type: Type.STRING },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    correctOptionIndex: { type: Type.INTEGER },
  },
  required: ['subject', 'text', 'options', 'correctOptionIndex'],
};

const examSchema = {
    type: Type.ARRAY,
    items: questionSchema
};

export const generateExamQuestions = async (subjects: string[], questionCount: number, gradeLevel: string): Promise<Question[]> => {
    const systemInstruction = `أنت مساعد ذكاء اصطناعي خبير في إنشاء أسئلة امتحانات تعليمية عالية الجودة ومتنوعة باللغة العربية لطلاب المدارس الثانوية.
    - يجب أن تكون الأسئلة مناسبة تمامًا لمستوى طالب في "${gradeLevel}" وتتبع المنهج التعليمي المصري.
    - يجب أن تكون جميع الأسئلة من نوع الاختيار من متعدد (MCQ) مع أربعة خيارات بالضبط لكل سؤال، وإجابة واحدة صحيحة فقط.
    - نوّع الأسئلة لتشمل الفهم والتحليل وحل المشكلات بدلاً من الأسئلة المباشرة.
    - وزّع عدد الأسئلة بالتساوي على المواد المحددة قدر الإمكان.`;
    
    const prompt = `أنشئ امتحانًا مكونًا من ${questionCount} سؤالًا في المواد التالية: ${subjects.join('، ')}.`;

    try {
        console.log("Generating exam questions with @google/genai...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: examSchema,
            },
        });

        const jsonStr = response.text.trim();
        const generatedQuestions = JSON.parse(jsonStr);

        if (!Array.isArray(generatedQuestions)) {
            throw new Error("API did not return a valid array of questions.");
        }
        
        return generatedQuestions.map((q, index) => ({ ...q, id: `gen_q_${index + 1}` }));

    } catch (error) {
        console.error("Error generating exam questions with Gemini:", error);
        throw new Error("فشل إنشاء الأسئلة. الرجاء المحاولة مرة أخرى.");
    }
};

const explanationSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING },
        explanation: { type: Type.STRING },
    },
    required: ['question', 'explanation'],
};

const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
        neoMessage: { type: Type.STRING },
        explanations: {
            type: Type.ARRAY,
            items: explanationSchema,
        },
    },
    required: ['neoMessage', 'explanations'],
};

export const gradeExamWithNeoAI = async (questions: Question[], answers: Answer[]): Promise<ExamResult> => {
    // Perform local grading first
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

    // Now, call Gemini for AI-powered feedback and explanations
    const incorrectAnswers = feedback.filter(f => !f.isCorrect);
    let aiGeneratedFeedback = { neoMessage: '', explanations: [] as {question: string, explanation: string}[] };

    if (incorrectAnswers.length > 0 || totalQuestions > 0) {
        if (incorrectAnswers.length === 0) {
            aiGeneratedFeedback.neoMessage = "رائع! لقد أجبت على جميع الأسئلة بشكل صحيح. عمل ممتاز!";
        } else {
            const promptData = {
                totalScore,
                totalQuestions,
                subjectScores,
                incorrectAnswers: incorrectAnswers.map(f => ({
                    question: f.question,
                    subject: f.subject,
                    studentAnswer: f.studentAnswer,
                    correctAnswer: f.correctAnswer
                }))
            };

            const systemInstruction = `أنت مساعد تعليمي ذكي ومتخصص في تقديم ملاحظات بناءة ومشجعة للطلاب باللغة العربية بعد انتهائهم من الاختبار. اسمك Neo. كن إيجابيًا وداعماً، وركز على الخطوات التالية للتحسين.`;
            const prompt = `طالب أنهى اختبارًا وهذه هي نتيجته: ${JSON.stringify(promptData, null, 2)}.`;
            
            try {
                console.log("Generating exam feedback with @google/genai...");
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        systemInstruction: systemInstruction,
                        responseMimeType: "application/json",
                        responseSchema: feedbackSchema,
                    },
                });
                const jsonStr = response.text.trim();
                aiGeneratedFeedback = JSON.parse(jsonStr);

            } catch(error) {
                console.error("Error generating exam feedback with Gemini:", error);
                // Fallback to a simpler message if AI fails
                aiGeneratedFeedback.neoMessage = "تم تصحيح اختبارك. راجع إجاباتك جيدًا لتحديد نقاط القوة والضعف.";
            }
        }
    }

    const finalFeedback = feedback.map(f => {
        if (f.isCorrect) return { ...f, explanation: undefined };
        const explanationObj = aiGeneratedFeedback.explanations?.find(e => e.question === f.question);
        return {
            ...f,
            explanation: explanationObj ? explanationObj.explanation : "تذكر أن تراجع الفصل الخاص بهذا المفهوم."
        };
    });

    const result: ExamResult = {
        totalScore,
        totalQuestions,
        subjectScores,
        feedback: finalFeedback,
        neoMessage: aiGeneratedFeedback.neoMessage || "أنهيت الاختبار بنجاح! تفقد تقريرك المفصل."
    };

    return result;
};
