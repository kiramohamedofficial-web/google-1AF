
import { GoogleGenAI, Type, GenerateContentResponse, Content } from "@google/genai";
import { Question, ExamResult, SubjectScore, PerformanceBreakdown, AnswerReview, ScheduleItem, Lesson, User } from '../types.ts';

const MODEL_NAME_GEMINI = 'gemini-2.5-flash';

let ai: GoogleGenAI | null = null;

// Lazy initialization of the AI client to prevent startup crash
const getAi = (): GoogleGenAI => {
    if (!ai) {
        const apiKey = (window as any).process?.env?.API_KEY || '';
        if (!apiKey) {
            console.error("Gemini API Key is missing. AI features will not work. Check environment configuration in index.html.");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};


interface Answer {
    questionId: string;
    answerIndex: number;
}

type ExamSystem = 'عام' | 'لغات' | 'ازهري';

// --- AI Chat Service ---

const NEO_SYSTEM_PROMPT = `You are Neo 🤖, the friendly and knowledgeable AI assistant for the 'Google Educational Center' platform.
- Your Persona: You are quirky, encouraging, and use emojis to make interactions fun. You are an expert on everything related to the center.
- Your Knowledge Base: You know about the center's schedule, all teachers and their subjects, available trips, platform features (like the Smart Schedule and AI Exams), and the subscription system.
- Your Goal: Help students find information, understand features, and answer their questions about the platform. You can also answer general knowledge questions, but always maintain your persona.
- Interaction Style: Keep answers concise and helpful. Start your first message with a friendly welcome.
- IMPORTANT: All your responses must be in ARABIC.`;

export const getNeoChatResponseStream = async (history: Content[]) => {
    const responseStream = await getAi().models.generateContentStream({
        model: MODEL_NAME_GEMINI,
        contents: history,
        config: {
            systemInstruction: NEO_SYSTEM_PROMPT,
        },
    });
    return responseStream;
};


// --- AI Exam Service ---

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
    if (gradeLevel.includes('الإعدادي')) {
        return `
            **CRITICAL INSTRUCTIONS FOR: "المرحلة الإعدادية" (Preparatory Stage)**
            - **Overall Goal:** Design a foundational exam that solidifies concepts learned and prepares students for the secondary level.
            - **Difficulty Distribution:**
                - 50% Easy (M1)
                - 40% Medium (M2)
                - 10% Hard (M3)
            - **Bloom's Taxonomy Distribution:**
                - 40% Remember
                - 30% Understand
                - 20% Apply
                - 10% Analyze
            - **Question Style:**
                - Focus on direct questions, definitions, and simple problem-solving.
                - Questions should be clear and based on core curriculum concepts.
        `;
    }
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
                - For literature/humanities subjects (Arabic, History, etc.), questions must remain in ARBIC.
            `;
        case 'ازهري':
            return `
                **System Constraint: "ازهري" (Al-Azhar System)**
                - Questions must align with the Al-Azhar curriculum. This may include a stronger emphasis on religious sciences alongside standard subjects.
                - The phrasing and context should be appropriate for the Al-Azhar educational context.
            `;
        case 'عام':
        default:
            return `
                **System Constraint: "عام" (General System)**
                - All questions must be in ARABIC, except for foreign language subjects themselves (e.g., English, French).
                - Adhere to the standard Egyptian national curriculum.
            `;
    }
};

export const generateExamQuestions = async (
    subjects: string[],
    questionCount: number,
    gradeLevel: string,
    system: ExamSystem,
    model: 'A1' | 'A2'
): Promise<Question[]> => {
    const persona_prompt = model === 'A1' 
        ? "You are Neo 🤖, a super-intelligent, slightly quirky AI assistant specializing in the Egyptian curriculum. Your task is to generate creative and high-quality multiple-choice questions (MCQs)."
        : "You are the 'Smart Assistant', a highly precise and academic expert in pedagogy and exam creation, specializing in the Egyptian curriculum. Your task is to generate rigorous, high-quality multiple-choice questions (MCQs) that strictly adhere to formal standards.";

    const common_rules = `
    ALWAYS FOLLOW THESE CORE RULES:
    1.  **Output Format:** You MUST output a valid JSON. Do not wrap it in markdown backticks or any other text.
    2.  **Language:** The question language (stem, options, rationale) must be Arabic unless the subject is a foreign language (e.g., English, French) or the system is 'لغات' for scientific subjects.
    3.  **Question Count:** Generate exactly the number of questions requested by the user.
    4.  **Schema Adherence:** Each question object must strictly adhere to the provided schema.
    
    ${getGradeSpecificInstructions(gradeLevel)}
    
    ${getSystemSpecificInstructions(system)}
    `;

    const system_prompt = `${persona_prompt}\n${common_rules}`;
    const user_prompt = `Please generate exactly ${questionCount} questions for the grade "${gradeLevel}" covering the following subjects: ${subjects.join(', ')}. The exam system is "${system}". Ensure the questions meet all the instructions provided in the system prompt.`;

    try {
        const response = await getAi().models.generateContent({
            model: MODEL_NAME_GEMINI,
            contents: user_prompt,
            config: {
                systemInstruction: system_prompt,
                responseMimeType: "application/json",
                responseSchema: examQuestionsSchema,
            },
        });

        const questions = JSON.parse(response.text);
        if (!Array.isArray(questions)) {
            console.error(`Gemini (${model}) response is not a valid question array:`, questions);
            return [];
        }
        return questions;

    } catch (error) {
        console.error(`Error generating exam questions with Model ${model} (Gemini):`, error);
        throw error;
    }
};


const calculatePerformance = (questions: Question[], answers: Answer[]): { totalScore: number, performanceBreakdown: PerformanceBreakdown, review: AnswerReview[] } => {
    let totalScore = 0;
    const performanceBreakdown: PerformanceBreakdown = { bySubject: {}, byCognitiveLevel: {}, byDifficulty: {} };
    const review: AnswerReview[] = [];

    const initializeScore = (obj: Record<string, SubjectScore>, key: string) => {
        if (!obj[key]) {
            obj[key] = { score: 0, total: 0 };
        }
    };

    questions.forEach(q => {
        const studentAnswer = answers.find(a => a.questionId === q.id);
        const isCorrect = studentAnswer?.answerIndex === q.correct_option_index;

        initializeScore(performanceBreakdown.bySubject, q.subject);
        initializeScore(performanceBreakdown.byCognitiveLevel, q.cognitive_level);
        initializeScore(performanceBreakdown.byDifficulty, q.difficulty);

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
            studentAnswer: studentAnswer !== undefined ? q.options[studentAnswer.answerIndex] : 'لم تتم الإجابة',
            correctAnswer: q.options[q.correct_option_index],
            isCorrect: isCorrect,
            rationale: q.rationale,
        });
    });

    return { totalScore, performanceBreakdown, review };
};


export const gradeExamAndGetFeedbackAI = async (
    questions: Question[],
    answers: Answer[],
    gradeLevel: string,
    system: ExamSystem,
    model: 'A1' | 'A2'
): Promise<ExamResult> => {
    const { totalScore, performanceBreakdown, review } = calculatePerformance(questions, answers);
    const totalQuestions = questions.length;
    
    const persona = model === 'A1'
        ? "You are Neo 🤖, a super-intelligent, slightly quirky AI assistant with a knack for playful yet insightful feedback. You love using emojis to make your points. Your goal is to make learning fun and motivating."
        : "You are a smart, encouraging, and professional educational assistant. Your feedback should be clear, constructive, and motivating. Avoid overly casual language and focus on providing actionable advice.";

    const system_prompt = `${persona}
    You are an AI expert in analyzing student exam performance. Your task is to provide a personalized and insightful report based on the JSON data provided by the user.
    The report MUST be in ARABIC.
    You MUST output a valid JSON object adhering to the specified schema. Do not add any extra text or markdown formatting.`;

    const user_prompt = `
    Please analyze the following exam results for a student in grade "${gradeLevel}" under the "${system}" system and provide feedback.

    Exam Data:
    {
      "totalScore": ${totalScore},
      "totalQuestions": ${totalQuestions},
      "performanceBreakdown": ${JSON.stringify(performanceBreakdown, null, 2)}
    }
    
    Based on this data, please generate a JSON response with three keys:
    1.  "aiMessage": A personalized, encouraging message for the student (1-2 sentences).
    2.  "performanceAnalysis": A brief paragraph analyzing their performance, highlighting strengths and weaknesses based on the breakdown data.
    3.  "improvementTips": An array of 3-5 specific, actionable tips for improvement.
    `;

    const examResultSchema = {
        type: Type.OBJECT,
        properties: {
            aiMessage: { type: Type.STRING, description: "A personalized, encouraging message for the student based on their performance, written in the persona defined in the system prompt." },
            performanceAnalysis: { type: Type.STRING, description: "A detailed textual analysis of the student's performance, highlighting strengths and areas for improvement based on the breakdown data." },
            improvementTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 specific, actionable tips for the student to improve." }
        },
        required: ["aiMessage", "performanceAnalysis", "improvementTips"]
    };

    try {
        const result = await getAi().models.generateContent({
            model: MODEL_NAME_GEMINI,
            contents: user_prompt,
            config: {
                systemInstruction: system_prompt,
                responseMimeType: "application/json",
                responseSchema: examResultSchema,
            },
        });
        
        const aiResult = JSON.parse(result.text);

        return {
            totalScore,
            totalQuestions,
            performanceBreakdown,
            review,
            aiMessage: aiResult.aiMessage,
            performanceAnalysis: aiResult.performanceAnalysis,
            improvementTips: aiResult.improvementTips,
        };

    } catch (error) {
        console.error("Error generating AI feedback:", error);
        // Fallback in case of AI error
        return {
            totalScore,
            totalQuestions,
            performanceBreakdown,
            review,
            aiMessage: "لقد أكملت الاختبار بنجاح! يتم حاليًا تحليل نتائجك. أحسنت على مجهودك.",
            performanceAnalysis: "تم حساب درجاتك بنجاح. يرجى مراجعة الإجابات الفردية للحصول على تفاصيل حول أدائك.",
            improvementTips: ["مراجعة الأسئلة التي أخطأت فيها.", "التركيز على المواد ذات الأداء المنخفض.", "التدرب على المزيد من الأسئلة المماثلة."]
        };
    }
};

// --- Smart Schedule Generation ---

// Mock schedule based on the user-provided image
const MOCK_SCHEDULE: ScheduleItem[] = [
    { id: 'mock-1', start: '07:00', end: '07:30', title: 'استيقاظ وصلاة الفجر', type: 'personal', is_completed: true },
    { id: 'mock-2', start: '07:30', end: '08:00', title: 'إفطار', type: 'personal', is_completed: true },
    { id: 'mock-3', start: '08:00', end: '09:30', title: 'دراسة', type: 'study', subject: 'كيمياء', is_completed: true },
    { id: 'mock-4', start: '09:30', end: '09:45', title: 'استراحة قصيرة', type: 'break', is_completed: false },
    { id: 'mock-5', start: '09:45', end: '11:15', title: 'دراسة', type: 'study', subject: 'أحياء', is_completed: false },
    { id: 'mock-6', start: '11:15', end: '11:30', title: 'استراحة قصيرة', type: 'break', is_completed: false },
    { id: 'mock-7', start: '11:30', end: '12:30', title: 'وقت شخصي', type: 'personal', is_completed: false },
    { id: 'mock-8', start: '12:30', end: '13:00', title: 'صلاة الظهر', type: 'personal', is_completed: false },
    { id: 'mock-9', start: '13:00', end: '14:00', title: 'غداء', type: 'personal', is_completed: false },
    { id: 'mock-10', start: '14:00', end: '15:00', title: 'وقت شخصي / استرخاء', type: 'personal', is_completed: false },
    { id: 'mock-11', start: '15:00', end: '16:00', title: 'تحضير للدروس المسائية', type: 'personal', is_completed: false },
    { id: 'mock-12', start: '16:00', end: '18:00', title: 'درس فيزياء', type: 'lesson', subject: 'فيزياء', is_locked: true, is_completed: false },
    { id: 'mock-13', start: '18:00', end: '19:00', title: 'عشاء', type: 'personal', is_completed: false },
    { id: 'mock-14', start: '19:00', end: '20:30', title: 'مراجعة واجب الفيزياء', type: 'study', subject: 'فيزياء', is_completed: false },
    { id: 'mock-15', start: '20:30', end: '22:00', title: 'وقت عائلي/ترفيه', type: 'personal', is_completed: false },
    { id: 'mock-16', start: '22:00', end: '07:00', title: 'نوم', type: 'sleep', is_completed: false },
];

const timeTo24Hour = (timeStr: string | undefined | null): string => {
    if (!timeStr) {
        return "00:00";
    }

    // Normalize the string: remove spaces, use standard markers for AM/PM in Arabic
    const normalizedTime = timeStr.trim().toLowerCase()
        .replace(/\s/g, '')
        .replace('ص', 'am')
        .replace('م', 'pm');

    // Regex to capture hours, optional minutes, and optional am/pm modifier
    const match = normalizedTime.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);

    if (!match) {
        // Fallback for just a number, assuming it's an hour (e.g., "4pm", "7am")
        const simpleHourMatch = normalizedTime.match(/^(\d{1,2})(am|pm)?$/);
        if(simpleHourMatch) {
            let hours = parseInt(simpleHourMatch[1], 10);
            const modifier = simpleHourMatch[2];
            if (!isNaN(hours)) {
                 if (modifier === 'pm' && hours < 12) hours += 12;
                 if (modifier === 'am' && hours === 12) hours = 0; // Midnight case
                 return `${String(hours).padStart(2, '0')}:00`;
            }
        }
        console.warn(`Could not parse time: "${timeStr}"`);
        return "00:00";
    }

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10) || 0;
    const modifier = match[3];

    if (isNaN(hours) || isNaN(minutes)) {
         console.warn(`Invalid number parsing for time: "${timeStr}"`);
         return "00:00";
    }

    if (modifier === 'pm' && hours < 12) {
        hours += 12;
    }
    if (modifier === 'am' && hours === 12) { // Handle 12 AM (midnight)
        hours = 0;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const generateSmartSchedule = async (
    user: User,
    lessonsForToday: Lesson[],
    studySubjects: string[],
    preferences: { sleepTime: string; wakeTime: string; studyHours: number; }
): Promise<ScheduleItem[]> => {

    const scheduleItemSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "Unique ID for the schedule item (e.g., 'item-1')." },
            start: { type: Type.STRING, description: "Start time in HH:mm format (24-hour)." },
            end: { type: Type.STRING, description: "End time in HH:mm format (24-hour)." },
            title: { type: Type.STRING, description: "A brief, clear title for the activity in Arabic." },
            type: { type: Type.STRING, enum: ['study', 'break', 'lesson', 'sleep', 'personal'] },
            subject: { type: Type.STRING, description: "The subject name in Arabic, if the type is 'study' or 'lesson'." },
            is_locked: { type: Type.BOOLEAN, description: "Set to true only for pre-scheduled lessons." }
        },
        required: ["id", "start", "end", "title", "type"]
    };
    
    const scheduleSchema = {
        type: Type.ARRAY,
        items: scheduleItemSchema
    };
    
    const lockedLessonsPrompt = lessonsForToday
        .map(l => {
            if (typeof l.time !== 'string' || !l.time.includes(' - ')) {
                return null;
            }
            const parts = l.time.split(' - ');
            if (parts.length !== 2) {
                return null;
            }
            const [startTime, endTime] = parts;
            if (!startTime || !endTime) {
                return null;
            }
            return `- ${l.subject} class from ${timeTo24Hour(startTime)} to ${timeTo24Hour(endTime)}. This is a fixed event.`;
        })
        .filter(Boolean)
        .join('\n');

    const system_prompt = `You are an AI expert in creating optimal daily schedules for Egyptian high school students. Your task is to generate a full day's schedule as a JSON array based on the user's requirements.
    
    CRITICAL RULES:
    1.  **Output Format:** You MUST output a valid JSON array of schedule items. Do not wrap it in markdown or any other text.
    2.  **Continuity**: The schedule must be continuous without any gaps. The 'end' time of one item must be the 'start' time of the next. The entire day should be filled.
    3.  **Full Day**: The schedule must cover the entire 24-hour period, starting from the user's wake-up time and ending with the 'sleep' activity that continues until the next day's wake-up time.
    4.  **Language**: All textual content in the output ('title', 'subject') must be in ARABIC.
    5.  **Smart Breaks**: After each study session (which should last 60-120 minutes), schedule a short 'break' of 10-20 minutes. Also include a longer break of about 60-90 minutes for lunch and prayer around midday (e.g., between 13:00-15:00).
    6.  **Priority Management**: The student's mind is sharpest in the morning. Schedule the most mentally demanding subjects (e.g., Physics, Chemistry, Math) during morning or early afternoon slots. Schedule subjects that rely more on memorization or are less demanding (e.g., History, languages, Geology) for later in the afternoon or evening.
    7.  **IDs**: Generate unique string IDs for each item (e.g., "item-1", "item-2").
    `;

    const user_prompt = `
        Please generate a daily schedule for a student with the following details:
        - Grade: ${user.grade}
        - Desired wake-up time: ${preferences.wakeTime}
        - Desired sleep time: ${preferences.sleepTime}
        - Total study hours needed: ${preferences.studyHours} hours
        - Subjects to study today: ${studySubjects.join(', ')}

        Fixed appointments for today (must be included exactly as specified with 'is_locked' set to true):
        ${lockedLessonsPrompt.length > 0 ? lockedLessonsPrompt : "None"}

        Also, include reasonably timed 'personal' activities for meals (breakfast, lunch, dinner), prayer, and relaxation.
    `;
    
    try {
        const response = await getAi().models.generateContent({
            model: MODEL_NAME_GEMINI,
            contents: user_prompt,
            config: {
                systemInstruction: system_prompt,
                responseMimeType: "application/json",
                responseSchema: scheduleSchema,
            },
        });

        const schedule = JSON.parse(response.text);
        if (!Array.isArray(schedule)) {
             console.error("Gemini response is not a valid schedule array:", schedule);
             return MOCK_SCHEDULE;
        }
        return schedule;
    } catch (error) {
        console.error("Error generating schedule with Gemini:", error);
        alert("فشل توليد الجدول. سنستخدم جدولًا افتراضيًا.");
        return MOCK_SCHEDULE;
    }
};
