import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
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
    Format the response as JSON with an array of study recommendations.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert educational AI that creates personalized study plans. Respond with JSON format containing an array of study recommendations with fields: topic, difficulty, estimatedTime, resources, tips."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.recommendations || [];
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
    Include specific reasons for the score and breakdown by category.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an AI matching algorithm that calculates compatibility between students and study pods. Respond with JSON format containing: score (0-100), reasons (array), compatibility (object with scheduleMatch, paceMatch, subjectMatch, goalAlignment scores 0-100)."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      score: Math.max(0, Math.min(100, result.score || 0)),
      reasons: result.reasons || [],
      compatibility: {
        scheduleMatch: Math.max(0, Math.min(100, result.compatibility?.scheduleMatch || 0)),
        paceMatch: Math.max(0, Math.min(100, result.compatibility?.paceMatch || 0)),
        subjectMatch: Math.max(0, Math.min(100, result.compatibility?.subjectMatch || 0)),
        goalAlignment: Math.max(0, Math.min(100, result.compatibility?.goalAlignment || 0)),
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
    ${context ? `Additional context: ${context}` : ""}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: question,
        },
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response to your question.";
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
    
    Make the tip practical, actionable, and relevant to their current studies.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an educational expert that provides concise, practical study tips. Keep responses under 100 words and focus on actionable advice."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
    });

    return response.choices[0].message.content || "Keep practicing regularly and don't hesitate to ask questions when you need help!";
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
    const prompt = `Analyze this chat message for appropriateness in an educational study group setting:
    
    Message: "${message}"
    
    Check for:
    - Academic appropriateness
    - Respectful language
    - Relevant to educational context
    - No harassment or inappropriate content
    
    If inappropriate, suggest a better version.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a content moderator for educational platforms. Respond with JSON format containing: isAppropriate (boolean), reason (string if inappropriate), suggestedEdit (string if needed)."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      isAppropriate: result.isAppropriate !== false, // Default to true if undefined
      reason: result.reason,
      suggestedEdit: result.suggestedEdit,
    };
  } catch (error) {
    console.error("Error moderating chat message:", error);
    return { isAppropriate: true }; // Default to allowing message if AI fails
  }
}
