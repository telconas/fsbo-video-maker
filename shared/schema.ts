import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Schema for property videos
export const propertyVideos = pgTable("property_videos", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(), // Full address (legacy field)
  streetAddress: text("street_address"), // Street address only
  city: text("city"), // City
  state: text("state"), // State
  zipCode: text("zip_code"), // Zip code
  price: text("price").notNull(),
  description: text("description"),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  photoOrder: jsonb("photo_order").notNull(), // Array of photo file names in order
  musicTrack: text("music_track").notNull(),
  slideDuration: integer("slide_duration").notNull(),
  transitionType: text("transition_type").notNull(),
  showPrice: boolean("show_price").notNull().default(true),
  status: text("status").notNull().default("pending"), // pending, processing, completed, error
  videoUrl: text("video_url"), // URL to the generated video
  narrationUrl: text("narration_url"), // URL to the narration audio file
  aiDescription: text("ai_description"), // AI-generated property description
  voiceId: text("voice_id").default("alloy"), // Voice ID for TTS
  createdAt: integer("created_at").notNull(),
});

export const insertPropertyVideoSchema = createInsertSchema(propertyVideos).omit({
  id: true, 
  status: true,
  videoUrl: true,
  narrationUrl: true,
  aiDescription: true,
  createdAt: true,
});

export type InsertPropertyVideo = z.infer<typeof insertPropertyVideoSchema>;
export type PropertyVideo = typeof propertyVideos.$inferSelect;

// Schema for property photos
export const propertyPhotos = pgTable("property_photos", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull(), // Reference to propertyVideos
  originalName: text("original_name").notNull(),
  storedName: text("stored_name").notNull(), // Filename on server
  order: integer("order").notNull(), // Order in the slide show
  isCover: boolean("is_cover").notNull().default(false),
});

export const insertPropertyPhotoSchema = createInsertSchema(propertyPhotos).omit({
  id: true,
});

export type InsertPropertyPhoto = z.infer<typeof insertPropertyPhotoSchema>;
export type PropertyPhoto = typeof propertyPhotos.$inferSelect;
