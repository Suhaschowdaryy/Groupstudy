import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // nullable for Google OAuth users
  googleId: varchar("google_id").unique(), // nullable for email/password users
  authProvider: varchar("auth_provider").notNull().default("email"), // email, google
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  linkedInId: varchar("linkedin_id"), // LinkedIn profile URL or username
  githubId: varchar("github_id"), // GitHub username
  role: varchar("role").default("student"), // student, admin
  studyGoals: text("study_goals").array(),
  preferredSubjects: text("preferred_subjects").array(),
  learningPace: varchar("learning_pace"), // beginner, intermediate, advanced
  availability: jsonb("availability"), // {"monday": ["9:00", "17:00"], ...}
  studyStreak: integer("study_streak").default(0),
  totalPoints: integer("total_points").default(0),
  globalRank: integer("global_rank"),
  totalStudyTime: integer("total_study_time").default(0), // in minutes
  completedPods: integer("completed_pods").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const studyPods = pgTable("study_pods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  subject: varchar("subject").notNull(),
  goal: text("goal"),
  learningPace: varchar("learning_pace"), // beginner, intermediate, advanced
  schedule: jsonb("schedule"), // {"days": ["monday", "wednesday"], "time": "19:00", "duration": 120}
  maxMembers: integer("max_members").default(8),
  currentMembers: integer("current_members").default(0),
  creatorId: varchar("creator_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const podMemberships = pgTable("pod_memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  podId: varchar("pod_id").references(() => studyPods.id),
  role: varchar("role").default("member"), // member, moderator, creator
  joinedAt: timestamp("joined_at").defaultNow(),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0"),
  streak: integer("streak").default(0),
  rank: integer("rank"),
});

export const studySessions = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  podId: varchar("pod_id").references(() => studyPods.id),
  title: varchar("title").notNull(),
  description: text("description"),
  topic: varchar("topic"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").notNull(), // in minutes
  isCompleted: boolean("is_completed").default(false),
  attendeeCount: integer("attendee_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessionAttendance = pgTable("session_attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => studySessions.id),
  userId: varchar("user_id").references(() => users.id),
  attendedAt: timestamp("attended_at").defaultNow(),
  studyTimeMinutes: integer("study_time_minutes").default(0),
});

export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon").notNull(),
  category: varchar("category"), // streak, contribution, achievement, learning
  requirements: jsonb("requirements"), // criteria for earning the badge
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  badgeId: varchar("badge_id").references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  progress: jsonb("progress"), // progress towards badge requirements
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  podId: varchar("pod_id").references(() => studyPods.id),
  userId: varchar("user_id").references(() => users.id),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // text, file, ai_response
  metadata: jsonb("metadata"), // for file attachments, AI context, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiInteractions = pgTable("ai_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  question: text("question").notNull(),
  response: text("response").notNull(),
  context: varchar("context"), // subject, topic, pod_id
  rating: integer("rating"), // user feedback 1-5
  createdAt: timestamp("created_at").defaultNow(),
});

export const podFiles = pgTable("pod_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  podId: varchar("pod_id").references(() => studyPods.id),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(), // pdf, doc, txt, image, etc.
  fileSize: integer("file_size"), // in bytes
  fileUrl: varchar("file_url").notNull(), // storage URL
  description: text("description"),
  isPublic: boolean("is_public").default(true), // visible to all pod members
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videoCallSessions = pgTable("video_call_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  podId: varchar("pod_id").references(() => studyPods.id),
  hostId: varchar("host_id").references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  meetingUrl: varchar("meeting_url"), // external video call URL (Jitsi, Zoom, etc.)
  isActive: boolean("is_active").default(false),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  participantCount: integer("participant_count").default(0),
  maxParticipants: integer("max_participants").default(8),
  recordingUrl: varchar("recording_url"), // if call is recorded
  createdAt: timestamp("created_at").defaultNow(),
});

export const videoCallParticipants = pgTable("video_call_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => videoCallSessions.id),
  userId: varchar("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  duration: integer("duration"), // in minutes
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdPods: many(studyPods),
  memberships: many(podMemberships),
  sessionAttendance: many(sessionAttendance),
  userBadges: many(userBadges),
  chatMessages: many(chatMessages),
  aiInteractions: many(aiInteractions),
  uploadedFiles: many(podFiles),
  hostedVideoCalls: many(videoCallSessions),
  videoCallParticipation: many(videoCallParticipants),
}));

export const studyPodsRelations = relations(studyPods, ({ one, many }) => ({
  creator: one(users, {
    fields: [studyPods.creatorId],
    references: [users.id],
  }),
  memberships: many(podMemberships),
  sessions: many(studySessions),
  chatMessages: many(chatMessages),
  files: many(podFiles),
  videoCallSessions: many(videoCallSessions),
}));

export const podMembershipsRelations = relations(podMemberships, ({ one }) => ({
  user: one(users, {
    fields: [podMemberships.userId],
    references: [users.id],
  }),
  pod: one(studyPods, {
    fields: [podMemberships.podId],
    references: [studyPods.id],
  }),
}));

export const studySessionsRelations = relations(studySessions, ({ one, many }) => ({
  pod: one(studyPods, {
    fields: [studySessions.podId],
    references: [studyPods.id],
  }),
  attendance: many(sessionAttendance),
}));

export const sessionAttendanceRelations = relations(sessionAttendance, ({ one }) => ({
  session: one(studySessions, {
    fields: [sessionAttendance.sessionId],
    references: [studySessions.id],
  }),
  user: one(users, {
    fields: [sessionAttendance.userId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  pod: one(studyPods, {
    fields: [chatMessages.podId],
    references: [studyPods.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const aiInteractionsRelations = relations(aiInteractions, ({ one }) => ({
  user: one(users, {
    fields: [aiInteractions.userId],
    references: [users.id],
  }),
}));

export const podFilesRelations = relations(podFiles, ({ one }) => ({
  pod: one(studyPods, {
    fields: [podFiles.podId],
    references: [studyPods.id],
  }),
  uploader: one(users, {
    fields: [podFiles.uploadedBy],
    references: [users.id],
  }),
}));

export const videoCallSessionsRelations = relations(videoCallSessions, ({ one, many }) => ({
  pod: one(studyPods, {
    fields: [videoCallSessions.podId],
    references: [studyPods.id],
  }),
  host: one(users, {
    fields: [videoCallSessions.hostId],
    references: [users.id],
  }),
  participants: many(videoCallParticipants),
}));

export const videoCallParticipantsRelations = relations(videoCallParticipants, ({ one }) => ({
  session: one(videoCallSessions, {
    fields: [videoCallParticipants.sessionId],
    references: [videoCallSessions.id],
  }),
  user: one(users, {
    fields: [videoCallParticipants.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Authentication schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const googleUserSchema = createInsertSchema(users).pick({
  email: true,
  googleId: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
}).extend({
  authProvider: z.literal("google"),
});

export const insertStudyPodSchema = createInsertSchema(studyPods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentMembers: true,
});

export const insertPodMembershipSchema = createInsertSchema(podMemberships).omit({
  id: true,
  joinedAt: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
  createdAt: true,
  isCompleted: true,
  attendeeCount: true,
});

export const insertSessionAttendanceSchema = createInsertSchema(sessionAttendance).omit({
  id: true,
  attendedAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertAiInteractionSchema = createInsertSchema(aiInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertPodFileSchema = createInsertSchema(podFiles).omit({
  id: true,
  createdAt: true,
  downloadCount: true,
});

export const insertVideoCallSessionSchema = createInsertSchema(videoCallSessions).omit({
  id: true,
  createdAt: true,
  participantCount: true,
  isActive: true,
  startedAt: true,
  endedAt: true,
});

export const insertVideoCallParticipantSchema = createInsertSchema(videoCallParticipants).omit({
  id: true,
  joinedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type RegisterUser = z.infer<typeof registerSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type GoogleUser = z.infer<typeof googleUserSchema>;
export type InsertStudyPod = z.infer<typeof insertStudyPodSchema>;
export type StudyPod = typeof studyPods.$inferSelect;
export type InsertPodMembership = z.infer<typeof insertPodMembershipSchema>;
export type PodMembership = typeof podMemberships.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertSessionAttendance = z.infer<typeof insertSessionAttendanceSchema>;
export type SessionAttendance = typeof sessionAttendance.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;
export type AiInteraction = typeof aiInteractions.$inferSelect;
export type InsertPodFile = z.infer<typeof insertPodFileSchema>;
export type PodFile = typeof podFiles.$inferSelect;
export type InsertVideoCallSession = z.infer<typeof insertVideoCallSessionSchema>;
export type VideoCallSession = typeof videoCallSessions.$inferSelect;
export type InsertVideoCallParticipant = z.infer<typeof insertVideoCallParticipantSchema>;
export type VideoCallParticipant = typeof videoCallParticipants.$inferSelect;
