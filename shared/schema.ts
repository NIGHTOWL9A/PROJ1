import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const navigationSessions = pgTable("navigation_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  currentInstruction: text("current_instruction"),
  progress: integer("progress").default(0),
  totalSteps: integer("total_steps").default(0),
  isActive: boolean("is_active").default(true),
});

export const detectedObjects = pgTable("detected_objects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => navigationSessions.id),
  name: text("name").notNull(),
  description: text("description"),
  distance: text("distance"),
  position: text("position"),
  confidence: integer("confidence"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const audioEvents = pgTable("audio_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => navigationSessions.id),
  type: text("type").notNull(),
  content: text("content"),
  audioLevel: integer("audio_level"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const recognizedTexts = pgTable("recognized_texts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => navigationSessions.id),
  type: text("type").notNull(),
  content: text("content").notNull(),
  confidence: integer("confidence"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertNavigationSessionSchema = createInsertSchema(navigationSessions).omit({
  id: true,
  startTime: true,
});

export const insertDetectedObjectSchema = createInsertSchema(detectedObjects).omit({
  id: true,
  timestamp: true,
});

export const insertAudioEventSchema = createInsertSchema(audioEvents).omit({
  id: true,
  timestamp: true,
});

export const insertRecognizedTextSchema = createInsertSchema(recognizedTexts).omit({
  id: true,
  timestamp: true,
});

export type NavigationSession = typeof navigationSessions.$inferSelect;
export type InsertNavigationSession = z.infer<typeof insertNavigationSessionSchema>;
export type DetectedObject = typeof detectedObjects.$inferSelect;
export type InsertDetectedObject = z.infer<typeof insertDetectedObjectSchema>;
export type AudioEvent = typeof audioEvents.$inferSelect;
export type InsertAudioEvent = z.infer<typeof insertAudioEventSchema>;
export type RecognizedText = typeof recognizedTexts.$inferSelect;
export type InsertRecognizedText = z.infer<typeof insertRecognizedTextSchema>;
