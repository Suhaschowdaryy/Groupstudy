import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export interface StudyRecommendation {
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number; // in minutes
  resources: string[];
  tips: string[];
}

export interface PodMatchScore {
  score: number; // 0-100
  reasons: string[];
  compatibility: {
    scheduleMatch: number;
    paceMatch: number;
    subjectMatch: number;
    goalAlignment: number;
  };
}

export async function generateStudyPlan(
  subject: string,
  learningPace: string,
  goals: string[],
  timeAvailable: number
): Promise<StudyRecommendation[]> {
  try {
    const prompt = `Generate a personalized study plan for a ${learningPace} level student studying ${subject}. 
    Goals: ${goals.join(", ")}
    Available time: ${timeAvailable} hours per week
    
    Provide a structured study plan with topics, difficulty levels, estimated time, resources, and practical tips.
    
    Respond with JSON format containing an array of study recommendations with fields: 
    - topic (string)
    - difficulty (beginner/intermediate/advanced) 
    - estimatedTime (number in minutes)
    - resources (array of strings)
    - tips (array of strings)
    
    Format: {"recommendations": [{"topic": "...", "difficulty": "...", "estimatedTime": 60, "resources": ["..."], "tips": ["..."]}]}`;

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    const parsed = JSON.parse(text || "{}");
    return parsed.recommendations || [];
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw new Error("Failed to generate study plan");
  }
}

export async function calculatePodMatch(
  userProfile: {
    subjects: string[];
    learningPace: string;
    availability: any;
    goals: string[];
  },
  podProfile: {
    subject: string;
    learningPace: string;
    schedule: any;
    goal: string;
  }
): Promise<PodMatchScore> {
  try {
    const prompt = `Calculate compatibility score between a student and study pod:
    
    Student Profile:
    - Subjects: ${userProfile.subjects.join(", ")}
    - Learning Pace: ${userProfile.learningPace}
    - Availability: ${JSON.stringify(userProfile.availability)}
    - Goals: ${userProfile.goals.join(", ")}
    
    Pod Profile:
    - Subject: ${podProfile.subject}
    - Learning Pace: ${podProfile.learningPace}
    - Schedule: ${JSON.stringify(podProfile.schedule)}
    - Goal: ${podProfile.goal}
    
    Calculate detailed compatibility scores and provide an overall match score (0-100).
    Include specific reasons for the score and breakdown by category.
    
    Respond with JSON format containing:
    - score (number 0-100)
    - reasons (array of strings)
    - compatibility (object with scheduleMatch, paceMatch, subjectMatch, goalAlignment scores 0-100)
    
    Format: {"score": 85, "reasons": ["..."], "compatibility": {"scheduleMatch": 80, "paceMatch": 90, "subjectMatch": 85, "goalAlignment": 88}}`;

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    const parsed = JSON.parse(text || "{}");
    return {
      score: Math.max(0, Math.min(100, parsed.score || 0)),
      reasons: parsed.reasons || [],
      compatibility: {
        scheduleMatch: Math.max(0, Math.min(100, parsed.compatibility?.scheduleMatch || 0)),
        paceMatch: Math.max(0, Math.min(100, parsed.compatibility?.paceMatch || 0)),
        subjectMatch: Math.max(0, Math.min(100, parsed.compatibility?.subjectMatch || 0)),
        goalAlignment: Math.max(0, Math.min(100, parsed.compatibility?.goalAlignment || 0)),
      }
    };
  } catch (error) {
    console.error("Error calculating pod match:", error);
    return {
      score: 0,
      reasons: ["Error calculating compatibility"],
      compatibility: {
        scheduleMatch: 0,
        paceMatch: 0,
        subjectMatch: 0,
        goalAlignment: 0,
      }
    };
  }
}

export async function answerStudyQuestion(
  question: string,
  subject?: string,
  context?: string
): Promise<string> {
  try {
    const systemPrompt = `You are an expert AI tutor that helps students with academic questions. 
    Provide clear, educational answers that help students understand concepts rather than just giving answers.
    ${subject ? `Focus on ${subject} topics.` : ""}
    ${context ? `Additional context: ${context}` : ""}
    
    Question: ${question}`;

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt
    });

    const text = response.text;
    return text || "I'm sorry, I couldn't generate a response to your question.";
  } catch (error) {
    console.error("Error answering study question:", error);
    throw new Error("Failed to generate AI response");
  }
}

export async function generateStudyTip(
  subject: string,
  learningPace: string,
  recentTopics: string[]
): Promise<string> {
  try {
    const prompt = `Generate a helpful study tip for a ${learningPace} level student studying ${subject}.
    Recent topics they've been working on: ${recentTopics.join(", ")}
    
    Make the tip practical, actionable, and relevant to their current studies.
    Keep the response under 100 words and focus on actionable advice.`;

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const text = response.text;
    return text || "Keep practicing regularly and don't hesitate to ask questions when you need help!";
  } catch (error) {
    console.error("Error generating study tip:", error);
    return "Stay consistent with your studies and break complex topics into smaller, manageable parts.";
  }
}

export async function moderateChatMessage(message: string): Promise<{
  isAppropriate: boolean;
  reason?: string;
  suggestedEdit?: string;
}> {
  try {
    const prompt = `Analyze this chat message for harmful content in a study group chat:
    
    Message: "${message}"
    
    ONLY mark as inappropriate if the message contains:
    - Explicit hate speech or slurs
    - Serious harassment or threats  
    - Explicit sexual content
    - Spam or dangerous links
    - Bullying or personal attacks
    
    Allow:
    - Casual conversation and friendly chat
    - Study-related discussions  
    - Mild frustration or casual language
    - Off-topic but harmless conversations
    - Questions and general comments
    
    Be very lenient - only block truly harmful content.
    
    Respond with JSON format:
    {"isAppropriate": true, "reason": "", "suggestedEdit": ""}`;

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    const parsed = JSON.parse(text || "{}");
    return {
      isAppropriate: parsed.isAppropriate !== false, // Default to true if undefined
      reason: parsed.reason,
      suggestedEdit: parsed.suggestedEdit,
    };
  } catch (error) {
    console.error("Error moderating chat message:", error);
    return { isAppropriate: true }; // Default to allowing message if AI fails
  }
}