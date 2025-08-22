
import { Question, ExamResult, SubjectScore } from '../types';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Answer {
    questionId: string;
    answerIndex: number;
}

// Per user request, switching to @google/generative-ai
const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);

// A helper to extract JSON from a string that might contain markdown backticks
function extractJson(text: string): any {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
             console.error("Failed to parse extracted JSON, content was:", match[1]);
        }
    }
    // Fallback for cases where there are no backticks
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON directly, text was:", text);
        throw new Error("Invalid JSON response from AI");
    }
}


export const generateExamQuestions = async (subjects: string[], questionCount: number, gradeLevel: string): Promise<Question[]> => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = `أنت مساعد ذكاء اصطناعي خبير في إنشاء أسئلة امتحانات تعليمية عالية الجودة ومتنوعة باللغة العربية لطلاب المدارس الثانوية.
    - يجب أن تكون الأسئلة مناسبة تمامًا لمستوى طالب في "${gradeLevel}" وتتبع المنهج التعليمي المصري.
    - يجب أن تكون جميع الأسئلة من نوع الاختيار من متعدد (MCQ) مع أربعة خيارات بالضبط لكل سؤال، وإجابة واحدة صحيحة فقط.
    - نوّع الأسئلة لتشمل الفهم والتحليل وحل المشكلات بدلاً من الأسئلة المباشرة.
    - وزّع عدد الأسئلة بالتساوي على المواد المحددة قدر الإمكان.
    - يجب أن يكون الرد الخاص بك بتنسيق JSON فقط، بدون أي نص إضافي أو علامات markdown. يجب أن يكون الرد عبارة عن مصفوفة (array) من كائنات الأسئلة.
    - كل كائن سؤال يجب أن يحتوي على المفاتيح التالية: "subject" (string), "text" (string), "options" (array of 4 strings), and "correctOptionIndex" (number from 0 to 3).`;
    
    const prompt = `أنشئ امتحانًا مكونًا من ${questionCount} سؤالًا في المواد التالية: ${subjects.join('، ')}. ${systemInstruction}`;

    try {
        console.log("Generating exam questions with @google/generative-ai...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const generatedQuestions = extractJson(text);

        if (!Array.isArray(generatedQuestions)) {
            throw new Error("API did not return a valid array of questions.");
        }
        
        const isValid = generatedQuestions.every(q => 
            q.subject && q.text && Array.isArray(q.options) && q.options.length === 4 && typeof q.correctOptionIndex === 'number'
        );

        if (!isValid) {
             throw new Error("The generated questions do not match the required format.");
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

        const prompt = `أنت مساعد تعليمي ذكي ومتخصص في تقديم ملاحظات بناءة ومشجعة للطلاب باللغة العربية بعد انتهائهم من الاختبار. اسمك Neo.
        طالب أنهى اختبارًا وهذه هي نتيجته: ${JSON.stringify(promptData, null, 2)}\n\n
        مهمتك هي الرد بتنسيق JSON فقط، بدون أي نص إضافي أو علامات markdown. يجب أن يكون الرد كائنًا يحتوي على مفتاحين:
        1. "neoMessage": سلسلة نصية (string) تحتوي على رسالة تشجيعية عامة للطالب بناءً على أدائه العام وأدائه في المواد المختلفة. كن إيجابيًا وداعماً، وركز على الخطوات التالية للتحسين.
        2. "explanations": مصفوفة (array) من الكائنات. كل كائن يمثل شرحًا لسؤال خاطئ ويجب أن يحتوي على مفتاحين: "question" (نص السؤال الخاطئ) و "explanation" (شرح موجز وواضح لماذا كانت إجابته خاطئة ولماذا الإجابة الصحيحة هي الصواب).`;
        

        try {
            console.log("Generating exam feedback with @google/generative-ai...");
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            aiGeneratedFeedback = extractJson(text);
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