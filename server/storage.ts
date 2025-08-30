import {
  users,
  studyPods,
  podMemberships,
  studySessions,
  sessionAttendance,
  badges,
  userBadges,
  chatMessages,
  aiInteractions,
  type User,
  type UpsertUser,
  type StudyPod,
  type InsertStudyPod,
  type PodMembership,
  type InsertPodMembership,
  type StudySession,
  type InsertStudySession,
  type SessionAttendance,
  type InsertSessionAttendance,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type InsertUserBadge,
  type ChatMessage,
  type InsertChatMessage,
  type AiInteraction,
  type InsertAiInteraction,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, inArray, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  updateUserProfile(userId: string, data: Partial<User>): Promise<User>;
  
  // Study Pod operations
  createStudyPod(pod: InsertStudyPod): Promise<StudyPod>;
  getStudyPod(id: string): Promise<StudyPod | undefined>;
  getStudyPods(filters?: { subject?: string; learningPace?: string }): Promise<StudyPod[]>;
  joinPod(membership: InsertPodMembership): Promise<PodMembership>;
  getPodMembers(podId: string): Promise<(PodMembership & { user: User })[]>;
  getUserPods(userId: string): Promise<(PodMembership & { pod: StudyPod })[]>;
  
  // AI Matching
  getRecommendedPods(userId: string, limit?: number): Promise<StudyPod[]>;
  
  // Session operations
  createSession(session: InsertStudySession): Promise<StudySession>;
  getUpcomingSessions(userId: string): Promise<(StudySession & { pod: StudyPod })[]>;
  markAttendance(attendance: InsertSessionAttendance): Promise<SessionAttendance>;
  
  // Badge operations
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userBadge: InsertUserBadge): Promise<UserBadge>;
  
  // Chat operations
  getPodMessages(podId: string, limit?: number): Promise<(ChatMessage & { user: User })[]>;
  createMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // AI operations
  createAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction>;
  getUserAiHistory(userId: string, limit?: number): Promise<AiInteraction[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Study Pod operations
  async createStudyPod(podData: InsertStudyPod): Promise<StudyPod> {
    const [pod] = await db
      .insert(studyPods)
      .values(podData)
      .returning();
    return pod;
  }

  async getStudyPod(id: string): Promise<StudyPod | undefined> {
    const [pod] = await db
      .select()
      .from(studyPods)
      .where(eq(studyPods.id, id));
    return pod;
  }

  async getStudyPods(filters?: { subject?: string; learningPace?: string }): Promise<StudyPod[]> {
    const conditions = [eq(studyPods.isActive, true)];
    
    if (filters?.subject) {
      conditions.push(eq(studyPods.subject, filters.subject));
    }
    
    if (filters?.learningPace) {
      conditions.push(eq(studyPods.learningPace, filters.learningPace));
    }
    
    return await db
      .select()
      .from(studyPods)
      .where(and(...conditions))
      .orderBy(desc(studyPods.createdAt));
  }

  async joinPod(membershipData: InsertPodMembership): Promise<PodMembership> {
    const [membership] = await db
      .insert(podMemberships)
      .values(membershipData)
      .returning();
    
    // Update pod member count
    await db
      .update(studyPods)
      .set({
        currentMembers: sql`${studyPods.currentMembers} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(studyPods.id, membershipData.podId!));
    
    return membership;
  }

  async getPodMembers(podId: string): Promise<(PodMembership & { user: User })[]> {
    const results = await db
      .select()
      .from(podMemberships)
      .innerJoin(users, eq(podMemberships.userId, users.id))
      .where(eq(podMemberships.podId, podId));
    
    return results.map(result => ({
      ...result.pod_memberships,
      user: result.users
    }));
  }

  async getUserPods(userId: string): Promise<(PodMembership & { pod: StudyPod })[]> {
    const results = await db
      .select()
      .from(podMemberships)
      .innerJoin(studyPods, eq(podMemberships.podId, studyPods.id))
      .where(eq(podMemberships.userId, userId))
      .orderBy(desc(podMemberships.joinedAt));
    
    return results.map(result => ({
      ...result.pod_memberships,
      pod: result.study_pods
    }));
  }

  async getRecommendedPods(userId: string, limit = 5): Promise<StudyPod[]> {
    // Get user's preferences
    const user = await this.getUser(userId);
    if (!user) return [];

    // Simple AI matching based on subject and learning pace
    let query = db
      .select()
      .from(studyPods)
      .where(and(
        eq(studyPods.isActive, true),
        sql`${studyPods.currentMembers} < ${studyPods.maxMembers}`
      ));

    const conditions = [
      eq(studyPods.isActive, true),
      sql`${studyPods.currentMembers} < ${studyPods.maxMembers}`
    ];
    
    if (user.preferredSubjects && user.preferredSubjects.length > 0) {
      conditions.push(inArray(studyPods.subject, user.preferredSubjects));
    }

    if (user.learningPace) {
      conditions.push(eq(studyPods.learningPace, user.learningPace));
    }

    return await db
      .select()
      .from(studyPods)
      .where(and(...conditions))
      .orderBy(desc(studyPods.createdAt))
      .limit(limit);
  }

  // Session operations
  async createSession(sessionData: InsertStudySession): Promise<StudySession> {
    const [session] = await db
      .insert(studySessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getUpcomingSessions(userId: string): Promise<(StudySession & { pod: StudyPod })[]> {
    // Get pods user is a member of
    const userPods = await db
      .select({ podId: podMemberships.podId })
      .from(podMemberships)
      .where(eq(podMemberships.userId, userId));

    if (userPods.length === 0) return [];

    const podIds = userPods.map(p => p.podId!);

    const results = await db
      .select()
      .from(studySessions)
      .innerJoin(studyPods, eq(studySessions.podId, studyPods.id))
      .where(and(
        inArray(studySessions.podId, podIds),
        sql`${studySessions.scheduledAt} > NOW()`
      ))
      .orderBy(asc(studySessions.scheduledAt))
      .limit(10);
      
    return results.map(result => ({
      ...result.study_sessions,
      pod: result.study_pods
    }));
  }

  async markAttendance(attendanceData: InsertSessionAttendance): Promise<SessionAttendance> {
    const [attendance] = await db
      .insert(sessionAttendance)
      .values(attendanceData)
      .returning();

    // Update session attendee count
    await db
      .update(studySessions)
      .set({
        attendeeCount: sql`${studySessions.attendeeCount} + 1`,
      })
      .where(eq(studySessions.id, attendanceData.sessionId!));

    return attendance;
  }

  // Badge operations
  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    const results = await db
      .select()
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
      
    return results.map(result => ({
      ...result.user_badges,
      badge: result.badges
    }));
  }

  async awardBadge(userBadgeData: InsertUserBadge): Promise<UserBadge> {
    const [userBadge] = await db
      .insert(userBadges)
      .values(userBadgeData)
      .returning();
    return userBadge;
  }

  // Chat operations
  async getPodMessages(podId: string, limit = 50): Promise<(ChatMessage & { user: User })[]> {
    const results = await db
      .select()
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.podId, podId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
      
    return results.map(result => ({
      ...result.chat_messages,
      user: result.users
    }));
  }

  async createMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();
    return message;
  }

  // AI operations
  async createAiInteraction(interactionData: InsertAiInteraction): Promise<AiInteraction> {
    const [interaction] = await db
      .insert(aiInteractions)
      .values(interactionData)
      .returning();
    return interaction;
  }

  async getUserAiHistory(userId: string, limit = 20): Promise<AiInteraction[]> {
    return await db
      .select()
      .from(aiInteractions)
      .where(eq(aiInteractions.userId, userId))
      .orderBy(desc(aiInteractions.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
