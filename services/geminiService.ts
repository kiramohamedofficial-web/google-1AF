import { GoogleGenAI, Type } from "@google/genai";
import { Question, ExamResult, SubjectScore, PerformanceBreakdown, AnswerReview } from '../types.ts';

const MODEL_NAME = 'gemini-2.5-flash';
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface Answer {
    questionId: string;
    answerIndex: number;
}

// Schema for generating questions
const questionSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "A unique identifier for the question." },
        subject: { type: Type.STRING, description: "The subject of the question." },
        grade: { type: Type.STRING, description: "The grade level for the question." },
        cognitive_level: { type: Type.STRING, enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'], description: "Bloom's Taxonomy level." },
        difficulty: { type: Type.STRING, enum: ['M1', 'M2', 'M3'], description: "Difficulty level: M1=Easy, M2=Medium, M3=Advanced." },
        stem: { type: Type.STRING, description: "The main text of the question." },
        context: { type: Type.STRING, description: "Optional context (e.g., a paragraph or data) for the question." },
        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 4 possible answers." },
        correctOptionIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the options array." },
        rationale: { type: Type.STRING, description: "A brief explanation of why the correct answer is correct." },
        skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific skills tested by the question." },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords or tags for categorization." },
        time_suggestion_sec: { type: Type.INTEGER, description: "Suggested time in seconds to answer the question." },
    },
    required: ["id", "subject", "grade", "cognitive_level", "difficulty", "stem", "options", "correctOptionIndex", "rationale"]
};

const examQuestionsSchema = {
    type: Type.ARRAY,
    items: questionSchema
};

export const generateExamQuestions = async (subjects: string[], questionCount: number, gradeLevel: string): Promise<Question[]> => {
    console.log(`Generating exam questions with ${MODEL_NAME}...`);
    
    const prompt = `
        You are an expert AI named "Neo 🤖" specializing in creating high-quality educational exams for an Egyptian educational center, following modern pedagogical standards like Bloom's Taxonomy and PISA.

        Your task is to generate a complete exam based on these specifications:
        - Grade Level: "${gradeLevel}"
        - Subjects: ${subjects.join(', ')}
        - Total Number of Questions: ${questionCount}

        IMPORTANT INSTRUCTIONS:
        1.  **Unique IDs**: Each question must have a unique ID, like "q_physics_1", "q_chem_1", etc.
        2.  **Diverse Questions**: Distribute questions across the specified subjects. Ensure a mix of cognitive levels (Remember, Understand, Apply, Analyze) and difficulties (M1, M2, M3).
        3.  **Four Options**: Every question MUST have exactly four multiple-choice options.
        4.  **Clear Rationale**: Provide a concise and clear explanation (rationale) for why the correct answer is correct.
        5.  **Context**: Use the 'context' field for questions that require a preceding text, scenario, or data description. Otherwise, it can be omitted.
        6.  **Egyptian Context**: Questions should be relevant to the Egyptian curriculum where applicable.
        7.  **Output Format**: Strictly adhere to the provided JSON schema.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: examQuestionsSchema,
            },
        });

        const jsonStr = response.text.trim();
        const questions = JSON.parse(jsonStr) as Question[];
        return questions;

    } catch (error) {
        console.error("Error generating exam questions with Gemini:", error);
        throw new Error("Failed to generate exam questions. " + (error instanceof Error ? error.message : String(error)));
    }
};


// Schema for AI-generated feedback
const aiFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        neoMessage: { type: Type.STRING, description: "A friendly, encouraging, and personalized message (2-3 sentences) to the student from Neo the AI assistant, in Arabic." },
        performanceAnalysis: { type: Type.STRING, description: "A detailed textual analysis (2-4 paragraphs) of the student's performance based on the provided data, in Arabic. Highlight strengths and areas for improvement." },
        improvementTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 actionable tips for improvement based on the analysis, in Arabic." },
    },
    required: ["neoMessage", "performanceAnalysis", "improvementTips"]
};

export const gradeExamAndGetFeedbackAI = async (
    questions: Question[],
    answers: Answer[],
    gradeLevel: string
): Promise<ExamResult> => {
    
    const locallyCalculateResults = () => {
        let totalScore = 0;
        const totalQuestions = questions.length;
        const review: AnswerReview[] = [];

        const performanceBreakdown: PerformanceBreakdown = {
            bySubject: {},
            byCognitiveLevel: {},
            byDifficulty: {},
        };
        
        const initScore = (obj: Record<string, SubjectScore>, key: string) => {
            if (!obj[key]) {
                obj[key] = { score: 0, total: 0 };
            }
        };

        questions.forEach(q => {
            const studentAnswerObj = answers.find(a => a.questionId === q.id);
            const studentAnswerIndex = studentAnswerObj ? studentAnswerObj.answerIndex : -1;
            const isCorrect = studentAnswerIndex === q.correctOptionIndex;
            
            // Init breakdowns
            initScore(performanceBreakdown.bySubject, q.subject);
            initScore(performanceBreakdown.byCognitiveLevel, q.cognitive_level);
            initScore(performanceBreakdown.byDifficulty, q.difficulty);
            
            // Update totals
            performanceBreakdown.bySubject[q.subject].total++;
            performanceBreakdown.byCognitiveLevel[q.cognitive_level].total++;
            performanceBreakdown.byDifficulty[q.difficulty].total++;

            if (isCorrect) {
                totalScore++;
                performanceBreakdown.bySubject[q.subject].score++;
                performanceBreakdown.byCognitiveLevel[q.cognitive_level].score++;
                performanceBreakdown.byDifficulty[q.difficulty].score++;
            }
            
            review.push({
                questionStem: q.stem,
                subject: q.subject,
                studentAnswer: studentAnswerIndex > -1 ? q.options[studentAnswerIndex] : 'لم تتم الإجابة',
                correctAnswer: q.options[q.correctOptionIndex],
                isCorrect,
                rationale: q.rationale,
            });
        });

        return {
            totalScore,
            totalQuestions,
            performanceBreakdown,
            review,
        };
    };

    const { totalScore, totalQuestions, performanceBreakdown, review } = locallyCalculateResults();

    const prompt = `
        You are an expert AI named "Neo 🤖", acting as an encouraging and insightful AI tutor for a student in an Egyptian educational center.
        Your task is to analyze the student's exam performance and provide a personalized, helpful, and motivational feedback report in ARABIC.

        Here is the student's exam performance data:
        - Grade Level: "${gradeLevel}"
        - Total Score: ${totalScore} out of ${totalQuestions}
        - Performance Breakdown by Subject: ${JSON.stringify(performanceBreakdown.bySubject)}
        - Performance Breakdown by Cognitive Skill (Bloom's Taxonomy): ${JSON.stringify(performanceBreakdown.byCognitiveLevel)}
        - Performance Breakdown by Difficulty: ${JSON.stringify(performanceBreakdown.byDifficulty)}
        - Review of Incorrect Answers: ${JSON.stringify(review.filter(r => !r.isCorrect).map(r => ({ question: r.questionStem, yourAnswer: r.studentAnswer, correctAnswer: r.correctAnswer, subject: r.subject })))}

        Based on this data, generate the following fields in ARABIC:
        1.  **neoMessage**: A short, friendly, and personalized message to the student. Start by congratulating them on their effort.
        2.  **performanceAnalysis**: A detailed analysis. Start with their strengths (subjects or skills where they did well). Then, gently point out the areas needing improvement, referencing specific subjects or skills where their score was low. Be constructive.
        3.  **improvementTips**: A list of 3 to 5 clear, actionable tips. The tips should be directly related to the weaknesses identified in the analysis. For example, if they struggled with 'Analyze' questions, suggest ways to practice that skill.
        
        Strictly adhere to the provided JSON schema for your response.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: aiFeedbackSchema,
            },
        });
        
        const jsonStr = response.text.trim();
        const aiFeedback = JSON.parse(jsonStr) as {
            neoMessage: string;
            performanceAnalysis: string;
            improvementTips: string[];
        };

        return {
            totalScore,
            totalQuestions,
            performanceBreakdown,
            review,
            ...aiFeedback
        };
    } catch (error) {
        console.error("Error generating exam feedback with Gemini:", error);
        throw new Error("Failed to get feedback from AI. " + (error instanceof Error ? error.message : String(error)));
    }
};
