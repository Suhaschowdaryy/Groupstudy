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

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
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
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdPods: many(studyPods),
  memberships: many(podMemberships),
  sessionAttendance: many(sessionAttendance),
  userBadges: many(userBadges),
  chatMessages: many(chatMessages),
  aiInteractions: many(aiInteractions),
}));

export const studyPodsRelations = relations(studyPods, ({ one, many }) => ({
  creator: one(users, {
    fields: [studyPods.creatorId],
    references: [users.id],
  }),
  memberships: many(podMemberships),
  sessions: many(studySessions),
  chatMessages: many(chatMessages),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
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
