import {
  users,
  guilds,
  lessons,
  userProgress,
  achievements,
  missions,
  userMissions,
  leaderboardEntries,
  ecoActions,
  // Blockchain tables
  blockchainTransactions,
  nftCertificates,
  blockchainPools,
  // Types
  type User,
  type UpsertUser,
  type Guild,
  type Lesson,
  type UserProgress,
  type Achievement,
  type Mission,
  type UserMission,
  type LeaderboardEntry,
  type EcoAction,
  type BlockchainTransaction,
  type NftCertificate,
  type BlockchainPool,
  type InsertLesson,
  type InsertAchievement,
  type InsertMission,
  type InsertUserProgress,
  type InsertUserMission,
  type InsertEcoAction,
  type InsertGuild,
  type InsertBlockchainTransaction,
  type InsertNftCertificate,
  type InsertBlockchainPool,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserXP(userId: string, xp: number): Promise<void>;
  updateUserCredits(userId: string, credits: number): Promise<void>;
  levelUpUser(userId: string): Promise<void>;
  
  // Guild operations
  getGuild(id: string): Promise<Guild | undefined>;
  createGuild(guild: InsertGuild): Promise<Guild>;
  joinGuild(userId: string, guildId: string): Promise<void>;
  getGuildMembers(guildId: string): Promise<User[]>;
  
  // Lesson operations
  getAllLessons(): Promise<Lesson[]>;
  getLessonsByTrack(track: string): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  
  // Progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  updateProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getTrackProgress(userId: string, track: string): Promise<{ completed: number; total: number }>;
  
  // Achievement operations
  getUserAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // Mission operations
  getActiveMissions(): Promise<Mission[]>;
  getUserMissions(userId: string): Promise<UserMission[]>;
  startMission(userMission: InsertUserMission): Promise<UserMission>;
  updateMissionProgress(userId: string, missionId: number, progress: number): Promise<void>;
  completeMission(userId: string, missionId: number): Promise<void>;
  
  // Leaderboard operations
  getLeaderboard(period: string, limit?: number): Promise<LeaderboardEntry[]>;
  updateLeaderboard(userId: string, period: string): Promise<void>;
  
  // Eco Actions
  createEcoAction(action: InsertEcoAction): Promise<EcoAction>;
  getUserEcoActions(userId: string): Promise<EcoAction[]>;
  
  // Blockchain operations
  createBlockchainTransaction(transaction: InsertBlockchainTransaction): Promise<BlockchainTransaction>;
  updateTransactionStatus(txHash: string, status: string, receipt?: any): Promise<void>;
  getUserTransactions(userId: string): Promise<BlockchainTransaction[]>;
  updateUserWallet(userId: string, walletAddress: string): Promise<void>;
  updatePolygonCredits(userId: string, credits: number): Promise<void>;
  
  // NFT operations
  createNftCertificate(nft: InsertNftCertificate): Promise<NftCertificate>;
  getUserNfts(userId: string): Promise<NftCertificate[]>;
  updateNftTokenId(transactionHash: string, tokenId: string): Promise<void>;
  
  // Blockchain pools
  getBlockchainPools(): Promise<BlockchainPool[]>;
  createBlockchainPool(pool: InsertBlockchainPool): Promise<BlockchainPool>;
  updatePoolStats(poolId: number, totalCredits: number, totalUsers: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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

  async updateUserXP(userId: string, xp: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        xp: sql`${users.xp} + ${xp}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUserCredits(userId: string, credits: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        ecoCredits: sql`${users.ecoCredits} + ${credits}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async levelUpUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        level: sql`${users.level} + 1`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Guild operations
  async getGuild(id: string): Promise<Guild | undefined> {
    const [guild] = await db.select().from(guilds).where(eq(guilds.id, id));
    return guild;
  }

  async createGuild(guild: InsertGuild): Promise<Guild> {
    const [newGuild] = await db.insert(guilds).values(guild).returning();
    return newGuild;
  }

  async joinGuild(userId: string, guildId: string): Promise<void> {
    await db.update(users).set({ guildId }).where(eq(users.id, userId));
    await db
      .update(guilds)
      .set({ memberCount: sql`${guilds.memberCount} + 1` })
      .where(eq(guilds.id, guildId));
  }

  async getGuildMembers(guildId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.guildId, guildId));
  }

  // Lesson operations
  async getAllLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons).orderBy(lessons.id);
  }

  async getLessonsByTrack(track: string): Promise<Lesson[]> {
    return await db.select().from(lessons).where(eq(lessons.track, track as any));
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }

  // Progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async updateProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const [updatedProgress] = await db
      .insert(userProgress)
      .values(progress)
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.lessonId],
        set: progress,
      })
      .returning();
    return updatedProgress;
  }

  async getTrackProgress(userId: string, track: string): Promise<{ completed: number; total: number }> {
    const trackLessons = await this.getLessonsByTrack(track);
    const userProg = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.completed, true)
        )
      );
    
    const completedLessonIds = new Set(userProg.map(p => p.lessonId));
    const completed = trackLessons.filter(l => completedLessonIds.has(l.id)).length;
    
    return { completed, total: trackLessons.length };
  }

  // Achievement operations
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
    return newAchievement;
  }

  // Mission operations
  async getActiveMissions(): Promise<Mission[]> {
    return await db
      .select()
      .from(missions)
      .where(eq(missions.isActive, true))
      .orderBy(missions.createdAt);
  }

  async getUserMissions(userId: string): Promise<UserMission[]> {
    return await db.select().from(userMissions).where(eq(userMissions.userId, userId));
  }

  async startMission(userMission: InsertUserMission): Promise<UserMission> {
    const [newUserMission] = await db.insert(userMissions).values({
      ...userMission,
      status: "in_progress",
      startedAt: new Date(),
    }).returning();
    return newUserMission;
  }

  async updateMissionProgress(userId: string, missionId: number, progress: number): Promise<void> {
    await db
      .update(userMissions)
      .set({ progress })
      .where(
        and(
          eq(userMissions.userId, userId),
          eq(userMissions.missionId, missionId)
        )
      );
  }

  async completeMission(userId: string, missionId: number): Promise<void> {
    await db
      .update(userMissions)
      .set({ 
        status: "completed",
        progress: 100,
        completedAt: new Date()
      })
      .where(
        and(
          eq(userMissions.userId, userId),
          eq(userMissions.missionId, missionId)
        )
      );
  }

  // Leaderboard operations
  async getLeaderboard(period: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    return await db
      .select()
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.period, period))
      .orderBy(leaderboardEntries.rank)
      .limit(limit);
  }

  async updateLeaderboard(userId: string, period: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    await db
      .insert(leaderboardEntries)
      .values({
        userId,
        period,
        xp: user.xp,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [leaderboardEntries.userId, leaderboardEntries.period],
        set: {
          xp: user.xp,
          updatedAt: new Date(),
        },
      });

    // Update ranks for this period
    await db.execute(sql`
      UPDATE leaderboard_entries 
      SET rank = ranking.rank 
      FROM (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY xp DESC) as rank
        FROM leaderboard_entries 
        WHERE period = ${period}
      ) ranking 
      WHERE leaderboard_entries.user_id = ranking.user_id 
      AND leaderboard_entries.period = ${period}
    `);
  }

  // Eco Actions
  async createEcoAction(action: InsertEcoAction): Promise<EcoAction> {
    const [newAction] = await db.insert(ecoActions).values(action).returning();
    return newAction;
  }

  async getUserEcoActions(userId: string): Promise<EcoAction[]> {
    return await db
      .select()
      .from(ecoActions)
      .where(eq(ecoActions.userId, userId))
      .orderBy(desc(ecoActions.createdAt));
  }

  // Blockchain operations
  async createBlockchainTransaction(transaction: InsertBlockchainTransaction): Promise<BlockchainTransaction> {
    const [newTransaction] = await db.insert(blockchainTransactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransactionStatus(txHash: string, status: string, receipt?: any): Promise<void> {
    const updateData: any = { 
      status: status as "pending" | "confirmed" | "failed",
    };
    
    if (receipt) {
      updateData.blockNumber = receipt.blockNumber;
      updateData.gasUsed = receipt.gasUsed?.toString();
      updateData.confirmedAt = new Date();
    }

    await db
      .update(blockchainTransactions)
      .set(updateData)
      .where(eq(blockchainTransactions.transactionHash, txHash));
  }

  async getUserTransactions(userId: string): Promise<BlockchainTransaction[]> {
    return await db
      .select()
      .from(blockchainTransactions)
      .where(eq(blockchainTransactions.userId, userId))
      .orderBy(desc(blockchainTransactions.createdAt));
  }

  async updateUserWallet(userId: string, walletAddress: string): Promise<void> {
    await db
      .update(users)
      .set({ walletAddress })
      .where(eq(users.id, userId));
  }

  async updatePolygonCredits(userId: string, credits: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        polygonCredits: sql`polygon_credits + ${credits}`
      })
      .where(eq(users.id, userId));
  }

  // NFT operations
  async createNftCertificate(nft: InsertNftCertificate): Promise<NftCertificate> {
    const [newNft] = await db.insert(nftCertificates).values(nft).returning();
    return newNft;
  }

  async getUserNfts(userId: string): Promise<NftCertificate[]> {
    return await db
      .select()
      .from(nftCertificates)
      .where(eq(nftCertificates.userId, userId))
      .orderBy(desc(nftCertificates.mintedAt));
  }

  async updateNftTokenId(transactionHash: string, tokenId: string): Promise<void> {
    await db
      .update(nftCertificates)
      .set({ tokenId })
      .where(eq(nftCertificates.transactionHash, transactionHash));
  }

  // Blockchain pools
  async getBlockchainPools(): Promise<BlockchainPool[]> {
    return await db
      .select()
      .from(blockchainPools)
      .orderBy(desc(blockchainPools.createdAt));
  }

  async createBlockchainPool(pool: InsertBlockchainPool): Promise<BlockchainPool> {
    const [newPool] = await db.insert(blockchainPools).values(pool).returning();
    return newPool;
  }

  async updatePoolStats(poolId: number, totalCredits: number, totalUsers: number): Promise<void> {
    await db
      .update(blockchainPools)
      .set({ totalCredits, totalUsers })
      .where(eq(blockchainPools.id, poolId));
  }
}

export const storage = new DatabaseStorage();
