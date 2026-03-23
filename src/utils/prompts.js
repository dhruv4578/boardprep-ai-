// Master Prompts for BoardPrep AI features

export const generateStudyNotesPrompt = (subject, topic, board, grade) => {
  return {
    system: `You are an expert ${subject} tutor for ${board} Class ${grade}. Your goal is to explain concepts clearly, concisely, and effectively for board exam preparation. Format your response in clean Markdown. Use headings, bullet points, and bold text for emphasis. Do not include conversational filler.`,
    user: `Generate comprehensive but concise revision notes for the topic "${topic}" in ${subject} for ${board} Class ${grade}. 
Please structure the response EXACTLY as follows:

## 📝 1. Quick Summary
(Provide a 3-4 sentence easy-to-understand overview of what this topic is about)

## 🔑 2. Key Concepts & Definitions
(List 4-6 main concepts with simple definitions)

## 🧮 3. Important Formulas / Equations / Rules
(List all crucial formulas or rules. If not applicable to this subject, list key dates/events or core principles instead)

## ⚠️ 4. Common Mistakes to Avoid
(List 2-3 mistakes students often make in the board exam regarding this topic and how to avoid them)

## 🎯 5. Previous Year Trends
(Briefly mention what types of questions usually come from this topic in the board exam)`
  };
};

export const generateQuizPrompt = (subject, topic, count = 10) => {
  return {
    system: `You are an expert examiner creating multiple-choice questions for board exam students. Return ONLY a valid JSON array of objects. Do not include markdown formatting like \`\`\`json. Your response must be parseable by JSON.parse().`,
    user: `Generate ${count} board-exam level multiple-choice questions for the topic "${topic}" in ${subject}. 
Return EXACTLY this JSON format:
[
  {
    "question": "The question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0, // index of correct option (0-3)
    "explanation": "Short reasoning why this is the correct answer."
  }
]`
  };
};

export const generateDoubtPrompt = (subject, context, isEli5 = false) => {
  return {
    system: `You are a friendly, encouraging ${subject} AI tutor. Your student is preparing for board exams. 
    ${isEli5 ? 'CRITICAL INSTRUCTION: The student selected "Explain Like I am 5". You MUST explain the concept using extremely simple language, everyday analogies, and avoid complex jargon entirely.' : 'Explain concepts clearly at a high school level.'} 
    Keep responses concise (under 200 words if possible) unless a detailed step-by-step math/physics derivation is requested. Use markdown formatting.`,
    user: context
  };
};

export const generateRevisionPrompt = (subject, topic) => {
  return {
    system: `You are an AI generating "1-Day Before Exam" flashcard-style notes. Keep everything extremely brief. Bullet points only. No paragraphs.`,
    user: `Generate ultra-short, last-minute revision points for "${topic}" in ${subject}. 
Structure exactly as:
## 🚀 Fast Facts
(3-4 rapid-fire facts)
## 🔢 Must-Know Formulas/Keywords
(3-4 item list)
## 💡 Pro-Tip
(1 sentence exam tip for this topic)`
  };
};

export const generatePlannerPrompt = (subjects, daysLeft) => {
  return {
    system: `You are an expert academic planner. Create a realistic, balanced study schedule. Return ONLY a valid JSON array. Do not use markdown blocks.`,
    user: `I have ${daysLeft} days left until my board exams. My subjects are: ${subjects}. 
Create a daily study plan.
Return EXACTLY this JSON format:
[
  {
    "day": 1,
    "focus": "Subject Name",
    "tasks": ["Task 1 description", "Task 2 description"]
  }
]`
  };
};
export const generateFlashcardsPrompt = (subject, topic, count = 10) => {
  return {
    system: `You are an expert AI tutor. Generate high-quality study flashcards. Return ONLY a valid JSON array of objects. Do not use markdown blocks.`,
    user: `Generate ${count} study flashcards for the topic "${topic}" in ${subject}. 
Each flashcard should test a key concept, definition, or formula.
Return EXACTLY this JSON format:
[
  {
    "front": "The question or concept name?",
    "back": "The answer or detailed explanation."
  }
]`
  };
};

