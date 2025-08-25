
import { ScheduleItem, Lesson, User } from '../types.ts';

const API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "z-ai/glm-4.5-air:free";

// Simple mock for fallback
const MOCK_SCHEDULE: ScheduleItem[] = [
    { id: 'mock-1', start: '07:00', end: '07:30', title: 'الاستيقاظ والصلاة', type: 'personal' },
    { id: 'mock-2', start: '07:30', end: '08:00', title: 'فطور', type: 'personal' },
    { id: 'mock-3', start: '08:00', end: '09:30', title: 'مذاكرة فيزياء', type: 'study', subject: 'فيزياء' },
    { id: 'mock-4', start: '09:30', end: '09:45', title: 'بريك', type: 'break' },
    { id: 'mock-5', start: '09:45', end: '11:15', title: 'مذاكرة كيمياء', type: 'study', subject: 'كيمياء' },
    { id: 'mock-6', start: '11:15', end: '12:30', title: 'وقت شخصي', type: 'personal' },
    { id: 'mock-7', start: '12:30', end: '13:30', title: 'غداء وصلاة', type: 'personal' },
    { id: 'mock-8', start: '16:00', end: '18:00', title: 'درس فيزياء', type: 'lesson', subject: 'فيزياء', isLocked: true },
    { id: 'mock-9', start: '18:00', end: '19:30', title: 'مراجعة واجب الفيزياء', type: 'study', subject: 'فيزياء' },
    { id: 'mock-10', start: '19:30', end: '20:00', title: 'عشاء', type: 'personal' },
    { id: 'mock-11', start: '20:00', end: '22:00', title: 'وقت عائلي/ترفيه', type: 'personal' },
    { id: 'mock-12', start: '22:00', end: '07:00', title: 'نوم', type: 'sleep' },
];

const timeTo24Hour = (timeStr: string): string => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'م') {
        hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
};

export const generateSmartSchedule = async (
    user: User,
    lessonsForToday: Lesson[],
    studySubjects: string[],
    preferences: { sleepTime: string; wakeTime: string; studyHours: number; }
): Promise<ScheduleItem[]> => {

    const scheduleSchema = {
        type: "array",
        items: {
            type: "object",
            properties: {
                id: { type: "string", description: "Unique ID for the schedule item." },
                start: { type: "string", description: "Start time in HH:mm format (24-hour)." },
                end: { type: "string", description: "End time in HH:mm format (24-hour)." },
                title: { type: "string", description: "A brief, clear title for the activity in Arabic." },
                type: { type: "string", enum: ['study', 'break', 'lesson', 'sleep', 'personal'], description: "The category of the activity." },
                subject: { type: "string", description: "The subject name, if the type is 'study' or 'lesson'." },
                isLocked: { type: "boolean", description: "Set to true only for pre-scheduled lessons provided in the input." }
            },
            required: ["id", "start", "end", "title", "type"]
        }
    };
    
    const lockedLessonsPrompt = lessonsForToday.map(l => {
        const [startTime, endTime] = l.time.split(' - ');
        return `- ${l.subject} class from ${timeTo24Hour(startTime)} to ${timeTo24Hour(endTime)}. This is a fixed event.`;
    }).join('\n');

    const prompt = `
        You are an AI assistant that creates an optimal daily schedule for an Egyptian high school student.
        Your output MUST be a valid JSON array that adheres to this schema: ${JSON.stringify(scheduleSchema)}. Do not add any other text, comments, or markdown formatting. The output must start with '[' and end with ']'.

        Here is the student's data:
        - Student Grade: ${user.grade}
        - Today's Fixed Lessons (These are locked and cannot be changed):
        ${lockedLessonsPrompt.length > 0 ? lockedLessonsPrompt : "No fixed lessons today."}
        - Subjects to study today: ${studySubjects.join(', ')}
        - Desired total study hours: ${preferences.studyHours} hours
        - Desired wake-up time: ${preferences.wakeTime}
        - Desired sleep time: ${preferences.sleepTime}

        Your task is to create a full day schedule from wake-up to sleep time. Follow these rules strictly:
        1.  **Prioritization**: Schedule cognitively demanding subjects like Physics and Math earlier in the day when the student's mind is fresh. Schedule subjects that require memorization, like History or literature, in the afternoon or evening.
        2.  **Time Management**: The schedule must start at \`${preferences.wakeTime}\` and end the next day based on the \`${preferences.sleepTime}\` with a 'sleep' type activity. The sleep activity should bridge the gap between the sleep time and the next day's wake time.
        3.  **Fixed Events**: Include all the fixed lessons exactly at their specified times. For these items, set \`isLocked\` to \`true\`.
        4.  **Study Sessions**: Distribute the total study hours among the requested subjects. Study sessions should be between 60 and 90 minutes.
        5.  **Smart Breaks**: After each 'study' session, schedule a 15-20 minute 'break' activity.
        6.  **Personal Time**: Include 'personal' time for meals (breakfast, lunch, dinner), prayer, and relaxation. Make these activities reasonably timed (e.g., 30 mins for breakfast/dinner, 60 mins for lunch).
        7.  **Continuity**: Ensure there are no overlapping time slots. The \`end\` time of one item must be the \`start\` time of the next. The entire day should be filled.
        8.  **IDs and Language**: Generate unique IDs for each schedule item (e.g., "item-1"). All text (\`title\`, \`subject\`) must be in Arabic.
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': 'https://google-educational-center.com', // Required by OpenRouter
                'X-Title': 'Google Educational Center' // Required by OpenRouter
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!response.ok) {
            console.error("API Error:", response.status, await response.text());
            alert("حدث خطأ أثناء توليد الجدول. سنستخدم جدولًا افتراضيًا.");
            return MOCK_SCHEDULE;
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Find the start and end of the JSON array
        const startIndex = content.indexOf('[');
        const endIndex = content.lastIndexOf(']');
        if (startIndex === -1 || endIndex === -1) {
             throw new Error("API response does not contain a valid JSON array.");
        }
        const jsonString = content.substring(startIndex, endIndex + 1);

        const schedule = JSON.parse(jsonString);
        if (!Array.isArray(schedule)) throw new Error("Invalid schedule format from API");

        return schedule;

    } catch (error) {
        console.error("Failed to generate schedule with OpenRouter AI:", error);
        alert("فشل توليد الجدول. سنستخدم جدولًا افتراضيًا.");
        return MOCK_SCHEDULE;
    }
};