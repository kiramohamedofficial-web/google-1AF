
import { Question, ExamResult, SubjectScore } from '../types';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Answer {
    questionId: string;
    answerIndex: number;
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);
// Using a model compatible with the older SDK version
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Helper function to extract JSON from the model's text response
const extractJson = (text: string) => {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
        return match[1].trim();
    }
    // Fallback for cases where markdown is not used
    return text.trim();
};

export const generateExamQuestions = async (subjects: string[], questionCount: number, gradeLevel: string): Promise<Question[]> => {
    const systemInstruction = `أنت مساعد ذكاء اصطناعي خبير في إنشاء أسئلة امتحانات تعليمية عالية الجودة ومتنوعة باللغة العربية لطلاب المدارس الثانوية.
    - يجب أن تكون الأسئلة مناسبة تمامًا لمستوى طالب في "${gradeLevel}" وتتبع المنهج التعليمي المصري.
    - يجب أن تكون جميع الأسئلة من نوع الاختيار من متعدد (MCQ) مع أربعة خيارات بالضبط لكل سؤال، وإجابة واحدة صحيحة فقط.
    - نوّع الأسئلة لتشمل الفهم والتحليل وحل المشكلات بدلاً من الأسئلة المباشرة.
    - وزّع عدد الأسئلة بالتساوي على المواد المحددة قدر الإمكان.`;
    
    const prompt = `أنشئ امتحانًا مكونًا من ${questionCount} سؤالًا في المواد التالية: ${subjects.join('، ')}.
    
    الرجاء إرجاع الإجابة داخل كتلة JSON markdown. يجب أن يكون كائن JSON عبارة عن مصفوفة من الأسئلة بالصيغة التالية: 
    \`\`\`json
    [
        { 
            "subject": "string", 
            "text": "string", 
            "options": ["string", "string", "string", "string"], 
            "correctOptionIndex": integer 
        }
    ]
    \`\`\`
    لا تقم بتضمين أي نص إضافي خارج كتلة JSON.`;

    try {
        console.log("Generating exam questions with @google/generative-ai...");
        const result = await model.generateContent(systemInstruction + "\n\n" + prompt);
        const response = await result.response;
        const rawText = response.text();
        const jsonStr = extractJson(rawText);
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
        const prompt = `طالب أنهى اختبارًا وهذه هي نتيجته: ${JSON.stringify(promptData, null, 2)}.
        
        الرجاء إرجاع الإجابة داخل كتلة JSON markdown. يجب أن يكون كائن JSON صالحًا بالصيغة التالية: 
        \`\`\`json
        { 
            "neoMessage": "string (رسالة تشجيعية عامة للطالب بناءً على أدائه)", 
            "explanations": [
                { 
                    "question": "string (نص السؤال الخاطئ)", 
                    "explanation": "string (شرح موجز وواضح لماذا كانت الإجابة خاطئة والصواب هو الصحيح)" 
                }
            ]
        }
        \`\`\`
        لا تقم بتضمين أي نص إضافي خارج كتلة JSON.`;
        
        try {
            console.log("Generating exam feedback with @google/generative-ai...");
            const result = await model.generateContent(systemInstruction + "\n\n" + prompt);
            const response = await result.response;
            const rawText = response.text();
            const jsonStr = extractJson(rawText);
            aiGeneratedFeedback = JSON.parse(jsonStr);

        } catch(error) {
            console.error("Error generating exam feedback with Gemini:", error);
            // Fallback to a simpler message if AI fails
            aiGeneratedFeedback.neoMessage = "تم تصحيح اختبارك. راجع إجاباتك جيدًا لتحديد نقاط القوة والضعف.";
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
