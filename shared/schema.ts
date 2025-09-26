import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  real,
  serial,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Gamification fields
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  ecoCredits: integer("eco_credits").default(0),
  guildId: varchar("guild_id"),
  // Blockchain fields
  walletAddress: varchar("wallet_address"),
  polygonCredits: real("polygon_credits").default(0), // Real EcoCredits on Polygon
});

export const trackEnum = pgEnum("track_type", ["EcoExplorer", "ClimateChampion", "WasteWarrior", "GreenInnovator"]);
export const difficultyEnum = pgEnum("difficulty", ["beginner", "intermediate", "advanced"]);
export const missionStatusEnum = pgEnum("mission_status", ["not_started", "in_progress", "completed"]);
export const achievementTypeEnum = pgEnum("achievement_type", ["first_lesson", "track_complete", "mission_complete", "level_up", "guild_challenge", "eco_action"]);
export const blockchainTransactionStatusEnum = pgEnum("transaction_status", ["pending", "confirmed", "failed"]);
export const nftTypeEnum = pgEnum("nft_type", ["achievement", "milestone", "special_recognition"]);

export const guilds = pgTable("guilds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  memberCount: integer("member_count").default(0),
  totalXP: integer("total_xp").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  currentChallenge: text("current_challenge"),
  challengeProgress: integer("challenge_progress").default(0),
  challengeTarget: integer("challenge_target").default(100),
  challengeDeadline: timestamp("challenge_deadline"),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  track: trackEnum("track").notNull(),
  difficulty: difficultyEnum("difficulty").default("beginner"),
  xpReward: integer("xp_reward").default(100),
  creditReward: integer("credit_reward").default(25),
  duration: integer("duration").default(15), // minutes
  imageUrl: varchar("image_url"),
  content: jsonb("content"), // lesson content structure
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
}, (table) => ({
  userLessonUnique: uniqueIndex("user_lesson_unique").on(table.userId, table.lessonId),
}));

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: achievementTypeEnum("type").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  iconClass: varchar("icon_class").default("fas fa-trophy"),
  xpReward: integer("xp_reward").default(100),
  creditReward: integer("credit_reward").default(50),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // daily, weekly, special
  track: trackEnum("track"),
  xpReward: integer("xp_reward").default(250),
  creditReward: integer("credit_reward").default(50),
  requirements: jsonb("requirements"), // mission requirements structure
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const userMissions = pgTable("user_missions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  missionId: integer("mission_id").notNull(),
  status: missionStatusEnum("status").default("not_started"),
  progress: integer("progress").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  period: varchar("period").notNull(), // weekly, monthly, all_time
  xp: integer("xp").default(0),
  rank: integer("rank"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ecoActions = pgTable("eco_actions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // ar_scan, simulation_action, real_world_action
  description: text("description"),
  imageUrl: varchar("image_url"),
  verified: boolean("verified").default(false),
  xpEarned: integer("xp_earned").default(0),
  creditsEarned: integer("credits_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blockchain-related tables
export const blockchainTransactions = pgTable("blockchain_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  transactionHash: varchar("transaction_hash").notNull(),
  blockchainNetwork: varchar("blockchain_network").default("polygon"),
  transactionType: varchar("transaction_type").notNull(), // mint_credits, burn_credits, mint_nft
  amount: real("amount").default(0),
  status: blockchainTransactionStatusEnum("status").default("pending"),
  gasUsed: varchar("gas_used"),
  gasPrice: varchar("gas_price"),
  blockNumber: integer("block_number"),
  toAddress: varchar("to_address"),
  fromAddress: varchar("from_address"),
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export const nftCertificates = pgTable("nft_certificates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  tokenId: varchar("token_id").notNull(),
  contractAddress: varchar("contract_address").notNull(),
  nftType: nftTypeEnum("nft_type").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"), // NFT metadata JSON
  imageUrl: varchar("image_url"),
  blockchainNetwork: varchar("blockchain_network").default("polygon"),
  transactionHash: varchar("transaction_hash"),
  mintedAt: timestamp("minted_at").defaultNow(),
  achievementId: integer("achievement_id"), // Link to achievement if applicable
});

export const blockchainPools = pgTable("blockchain_pools", {
  id: serial("id").primaryKey(),
  poolName: varchar("pool_name").notNull(),
  contractAddress: varchar("contract_address").notNull(),
  totalCredits: real("total_credits").default(0),
  totalUsers: integer("total_users").default(0),
  rewardRate: real("reward_rate").default(0.1), // Daily reward rate
  stakingEnabled: boolean("staking_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  guild: one(guilds, {
    fields: [users.guildId],
    references: [guilds.id],
  }),
  progress: many(userProgress),
  achievements: many(achievements),
  missions: many(userMissions),
  leaderboardEntries: many(leaderboardEntries),
  ecoActions: many(ecoActions),
  blockchainTransactions: many(blockchainTransactions),
  nftCertificates: many(nftCertificates),
}));

export const guildsRelations = relations(guilds, ({ many }) => ({
  members: many(users),
}));

export const lessonsRelations = relations(lessons, ({ many }) => ({
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

export const missionsRelations = relations(missions, ({ many }) => ({
  userMissions: many(userMissions),
}));

export const userMissionsRelations = relations(userMissions, ({ one }) => ({
  user: one(users, {
    fields: [userMissions.userId],
    references: [users.id],
  }),
  mission: one(missions, {
    fields: [userMissions.missionId],
    references: [missions.id],
  }),
}));

export const leaderboardEntriesRelations = relations(leaderboardEntries, ({ one }) => ({
  user: one(users, {
    fields: [leaderboardEntries.userId],
    references: [users.id],
  }),
}));

export const ecoActionsRelations = relations(ecoActions, ({ one }) => ({
  user: one(users, {
    fields: [ecoActions.userId],
    references: [users.id],
  }),
}));

// Blockchain relations
export const blockchainTransactionsRelations = relations(blockchainTransactions, ({ one }) => ({
  user: one(users, {
    fields: [blockchainTransactions.userId],
    references: [users.id],
  }),
}));

export const nftCertificatesRelations = relations(nftCertificates, ({ one }) => ({
  user: one(users, {
    fields: [nftCertificates.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [nftCertificates.achievementId],
    references: [achievements.id],
  }),
}));

// Insert schemas
export const upsertUserSchema = createInsertSchema(users);
export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true, createdAt: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, unlockedAt: true });
export const insertMissionSchema = createInsertSchema(missions).omit({ id: true, createdAt: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export const insertUserMissionSchema = createInsertSchema(userMissions).omit({ id: true });
export const insertEcoActionSchema = createInsertSchema(ecoActions).omit({ id: true, createdAt: true });
export const insertGuildSchema = createInsertSchema(guilds).omit({ createdAt: true });
export const insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactions).omit({ id: true, createdAt: true });
export const insertNftCertificateSchema = createInsertSchema(nftCertificates).omit({ id: true, mintedAt: true });
export const insertBlockchainPoolSchema = createInsertSchema(blockchainPools).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Guild = typeof guilds.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type Mission = typeof missions.$inferSelect;
export type UserMission = typeof userMissions.$inferSelect;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type EcoAction = typeof ecoActions.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertUserMission = z.infer<typeof insertUserMissionSchema>;
export type InsertEcoAction = z.infer<typeof insertEcoActionSchema>;
export type InsertGuild = z.infer<typeof insertGuildSchema>;
export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect;
export type NftCertificate = typeof nftCertificates.$inferSelect;
export type BlockchainPool = typeof blockchainPools.$inferSelect;
export type InsertBlockchainTransaction = z.infer<typeof insertBlockchainTransactionSchema>;
export type InsertNftCertificate = z.infer<typeof insertNftCertificateSchema>;
export type InsertBlockchainPool = z.infer<typeof insertBlockchainPoolSchema>;
