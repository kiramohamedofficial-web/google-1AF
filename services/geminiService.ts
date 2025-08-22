import { GoogleGenAI, Type } from "@google/genai";
import { Question, ExamResult, SubjectScore, PerformanceBreakdown, AnswerReview } from '../types.ts';

const MODEL_NAME = 'gemini-2.5-flash';
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface Answer {
    questionId: string;
    answerIndex: number;
}

type ExamSystem = 'عام' | 'لغات' | 'ازهري';

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

const getGradeSpecificInstructions = (gradeLevel: string): string => {
    switch (gradeLevel) {
        case 'الصف الأول الثانوي':
            return `
                **CRITICAL INSTRUCTIONS FOR: "الصف الأول الثانوي" (1st Secondary Grade)**
                - **Overall Goal:** Design a transitional exam that helps students adapt from preparatory to secondary level thinking.
                - **Difficulty Distribution:**
                    - 60% Medium (M2)
                    - 30% Hard (M3)
                    - 10% Easy (M1)
                - **Bloom's Taxonomy Distribution:**
                    - 40% Apply
                    - 30% Understand
                    - 20% Analyze
                    - 10% Evaluate/Create
                - **Question Style:**
                    - Use simple scenarios.
                    - Questions can be based on short texts, simple graphs, or small data tables.
                    - Focus on clear comprehension and direct application of concepts.
            `;
        case 'الصف الثاني الثانوي':
            return `
                **CRITICAL INSTRUCTIONS FOR: "الصف الثاني الثانوي" (2nd Secondary Grade)**
                - **Overall Goal:** Design a deeper exam that tests the integration of multiple skills and concepts.
                - **Difficulty Distribution:**
                    - 50% Hard (M3)
                    - 40% Medium (M2)
                    - 10% Easy (M1)
                - **Bloom's Taxonomy Distribution:**
                    - 40% Analyze
                    - 30% Apply
                    - 30% Evaluate/Create
                - **Question Style:**
                    - Create multi-step problems.
                    - Include questions comparing two different states or scenarios (e.g., "before" and "after" a change).
                    - Focus on analysis and problem-solving.
            `;
        case 'الصف الثالث الثانوي':
            return `
                **CRITICAL INSTRUCTIONS FOR: "الصف الثالث الثانوي" (3rd Secondary Grade - Thanaweya Amma)**
                - **Overall Goal:** Generate a highly challenging exam that mirrors the modern Egyptian Thanaweya Amma system. The focus is entirely on critical thinking, inference, and deep contextual understanding, not rote memorization.
                - **Difficulty Distribution (Strict):**
                    - **80% Advanced (M3):** Very Hard questions requiring multi-step reasoning or synthesis of information.
                    - **20% Medium (M2):** Challenging but more straightforward application questions.
                    - **Strictly 0% Easy (M1).** Easy, direct-recall questions are forbidden.
                - **Bloom's Taxonomy Distribution (Strict):**
                    - **35% Analyze:** Break down information into component parts to explore relationships.
                    - **35% Evaluate:** Justify a stand or decision; appraise, argue, defend.
                    - **30% Create:** Generate new ideas, products, or ways of viewing things.
                    - **Avoid 'Remember' and 'Understand' levels.** Questions must test higher-order thinking.
                - **Question Style & Content:**
                    - **Context is Key:** Many questions should be based on a provided context (passage, data table, graph description, case study). The context should be rich and may contain extraneous information to test analytical skills.
                    - **Question Types:** Focus on application-based scenarios, data analysis, case studies, and problems that require multiple logical steps to solve.
                - **Distractor (Incorrect Options) Generation Rules (VERY IMPORTANT):**
                    - **Plausible & Close:** All distractors MUST be highly plausible and conceptually close to the correct answer. Avoid obviously wrong options.
                    - **Common Misconceptions:** One distractor should represent a common student error or misconception related to the topic.
                    - **Calculation Errors:** For numerical problems, distractors should be the result of a single logical or calculation error (e.g., sign error, using the wrong formula).
                    - **Similar Phrasing:** Options should have similar grammatical structure and length to avoid giving away the answer.
            `;
        default:
            return `
                **GENERAL INSTRUCTIONS (For other grades):**
                - **Difficulty Distribution:** 50% Medium (M2), 30% Easy (M1), 20% Hard (M3).
                - **Bloom's Taxonomy Distribution:** 40% Apply, 30% Understand, 20% Analyze, 10% Remember.
                - **Question Style:** Create clear, standard, grade-appropriate questions.
            `;
    }
};

const getSystemSpecificInstructions = (system: ExamSystem): string => {
    switch (system) {
        case 'لغات':
            return `
                **System Constraint: "لغات" (Language Schools System)**
                - Questions for scientific subjects (Physics, Chemistry, Biology, Math, etc.) MUST be generated in ENGLISH.
                - The terminology and context must align with the Egyptian language school curriculum.
                - For literature/humanities subjects (Arabic, History, etc.), questions should remain in Arabic but might test more advanced language skills or different curriculum points.
            `;
        case 'ازهري':
            return `
                **System Constraint: "ازهري" (Al-Azhar System)**
                - The exam MUST align with the Al-Azhar curriculum, which differs from the general curriculum.
                - Incorporate the specific "Al-Azhar" style of questioning, which may be more direct, text-based, or have a different focus.
                - If religious subjects ("Tafsir", "Hadith", "Fiqh", "Tawhid") are selected, questions must be strictly based on the Azhari syllabus for the specified grade level. The tone must be formal and respectful.
                - For scientific and literary subjects, adhere to the Azhari curriculum's scope, which might include additional or different topics compared to the general system.
            `;
        case 'عام':
        default:
            return `
                **System Constraint: "عام" (General / Thanaweya Amma System)**
                - This is the standard Egyptian national curriculum. Follow the grade-specific instructions for this system precisely.
            `;
    }
};


export const generateExamQuestions = async (subjects: string[], questionCount: number, gradeLevel: string, examSystem: ExamSystem, aiModel: 'A1' | 'A2'): Promise<Question[]> => {
    console.log(`Generating exam questions using model ${aiModel} for ${gradeLevel} (${examSystem} system)...`);
    
    const gradeInstructions = getGradeSpecificInstructions(gradeLevel);
    const systemInstructions = getSystemSpecificInstructions(examSystem);

    if (aiModel === 'A1') {
        const prompt = `
            You are an expert AI named "Neo 🤖" specializing in creating high-quality educational exams for an Egyptian educational center. Your primary goal is to generate an exam that precisely follows the grade-specific and system-specific instructions provided below.

            **Primary Task: Generate an exam with these core specifications:**
            - **Grade Level:** "${gradeLevel}"
            - **Exam System:** "${examSystem}"
            - **Subjects:** ${subjects.join(', ')}
            - **Total Number of Questions:** ${questionCount}

            ${systemInstructions}

            ${gradeInstructions}

            **General Requirements (Must be followed for ALL questions):**
            1.  **Unique IDs**: Each question must have a unique ID, like "q_physics_1", "q_chem_1", etc.
            2.  **Subject Distribution**: Distribute questions across the specified subjects as evenly as possible.
            3.  **Four Options**: Every question MUST have exactly four multiple-choice options.
            4.  **Clear Rationale**: Provide a concise and clear explanation (rationale) for why the correct answer is correct.
            5.  **Context Field**: Use the 'context' field for questions that require a preceding text, scenario, or data description. Otherwise, it can be omitted.
            6.  **Egyptian Curriculum**: Ensure questions are relevant to the specified Egyptian curriculum (General, Languages, or Azhari).
            7.  **Output Format**: Strictly adhere to the provided JSON schema. Your entire response must be a single valid JSON array of question objects.
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
            console.error("Error generating exam questions with Gemini (A1):", error);
            throw new Error("Failed to generate exam questions. " + (error instanceof Error ? error.message : String(error)));
        }
    } else { // aiModel === 'A2'
        const MODEL_A2_API_KEY = "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";
        const MODEL_A2_API_URL = "https://openrouter.ai/api/v1/chat/completions";

        const systemPrompt = `You are an expert AI specializing in creating high-quality educational exams for an Egyptian educational center. Your entire response MUST be a single, valid JSON object. This JSON object should contain a single key named "questions", and its value must be an array of question objects. Do not include any other text, explanations, or markdown formatting like \`\`\`json.

        Each question object in the "questions" array must have the following structure (TypeScript interface):
        {
            id: string; // A unique identifier for the question (e.g., "q_physics_1").
            subject: string;
            grade: string;
            cognitive_level: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create'; // Bloom's Taxonomy level.
            difficulty: 'M1' | 'M2' | 'M3'; // M1=Easy, M2=Medium, M3=Advanced.
            stem: string; // The main text of the question.
            context?: string; // Optional context for the question.
            options: string[]; // An array of EXACTLY 4 possible string answers.
            correctOptionIndex: number; // The 0-based index of the correct answer.
            rationale: string; // A brief explanation of why the correct answer is correct.
            skills?: string[];
            tags?: string[];
            time_suggestion_sec?: number;
        }
        
        Strictly adhere to this JSON format.`;

        const userPrompt = `
            **Primary Task: Generate an exam with these core specifications:**
            - **Grade Level:** "${gradeLevel}"
            - **Exam System:** "${examSystem}"
            - **Subjects:** ${subjects.join(', ')}
            - **Total Number of Questions:** ${questionCount}

            ${systemInstructions}

            ${gradeInstructions}

            **General Requirements (Must be followed for ALL questions):**
            1.  **Unique IDs**: Each question must have a unique ID, like "q_physics_1", "q_chem_1", etc.
            2.  **Subject Distribution**: Distribute questions across the specified subjects as evenly as possible.
            3.  **Four Options**: Every question MUST have exactly four multiple-choice options.
            4.  **Clear Rationale**: Provide a concise and clear explanation (rationale).
            5.  **Egyptian Curriculum**: Ensure questions are relevant to the specified Egyptian curriculum.
        `;

        try {
            const response = await fetch(MODEL_A2_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MODEL_A2_API_KEY}`,
                    'HTTP-Referer': 'https://google-educational-center.ai',
                    'X-Title': 'Google Educational Center',
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-r1-0528:free',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    response_format: { type: 'json_object' }
                }),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Model A2 API error: ${response.status} ${response.statusText} - ${errorBody}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            const parsedJson = JSON.parse(content);

            if (parsedJson && parsedJson.questions && Array.isArray(parsedJson.questions)) {
                return parsedJson.questions as Question[];
            } else if (Array.isArray(parsedJson)) {
                return parsedJson as Question[];
            } else {
                throw new Error("Model A2 API returned an unexpected JSON structure.");
            }
        } catch (error) {
            console.error("Error generating exam questions with Model A2:", error);
            throw new Error("Failed to generate exam questions from Model A2. " + (error instanceof Error ? error.message : String(error)));
        }
    }
};


// Schema for AI-generated feedback
const aiFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        neoMessage: { type: Type.STRING, description: "A friendly, encouraging, and personalized message (2-3 sentences) to the student from the AI assistant, in Arabic." },
        performanceAnalysis: { type: Type.STRING, description: "A detailed textual analysis (2-4 paragraphs) of the student's performance based on the provided data, in Arabic. Highlight strengths and areas for improvement." },
        improvementTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 actionable tips for improvement based on the analysis, in Arabic." },
    },
    required: ["neoMessage", "performanceAnalysis", "improvementTips"]
};

export const gradeExamAndGetFeedbackAI = async (
    questions: Question[],
    answers: Answer[],
    gradeLevel: string,
    examSystem: ExamSystem,
    aiModel: 'A1' | 'A2'
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

    const aiPersona = aiModel === 'A1' ? 'named "Neo 🤖"' : '';

    const prompt = `
        You are an expert AI ${aiPersona}, acting as an encouraging and insightful AI tutor for a student in an Egyptian educational center.
        Your task is to analyze the student's exam performance and provide a personalized, helpful, and motivational feedback report in ARABIC.

        Here is the student's exam performance data:
        - Grade Level: "${gradeLevel}"
        - Exam System: "${examSystem}"
        - Total Score: ${totalScore} out of ${totalQuestions}
        - Performance Breakdown by Subject: ${JSON.stringify(performanceBreakdown.bySubject)}
        - Performance Breakdown by Cognitive Skill (Bloom's Taxonomy): ${JSON.stringify(performanceBreakdown.byCognitiveLevel)}
        - Performance Breakdown by Difficulty: ${JSON.stringify(performanceBreakdown.byDifficulty)}
        - Review of Incorrect Answers: ${JSON.stringify(review.filter(r => !r.isCorrect).map(r => ({ question: r.questionStem, yourAnswer: r.studentAnswer, correctAnswer: r.correctAnswer, subject: r.subject })))}

        Based on this data, generate the following fields in ARABIC:
        1.  **neoMessage**: A short, friendly, and personalized message to the student. Start by congratulating them on their effort.
        2.  **performanceAnalysis**: A detailed analysis. Start with their strengths (subjects or skills where they did well). Then, gently point out the areas needing improvement, referencing specific subjects or skills where their score was low. Be constructive.
        3.  **improvementTips**: A list of 3 to 5 clear, actionable tips. The tips should be directly related to the weaknesses identified in the analysis.
        
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