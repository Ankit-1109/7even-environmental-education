import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertLessonSchema, insertMissionSchema, insertEcoActionSchema } from "@shared/schema";
import { AIRecommendationEngine } from "./ai-recommendations";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard API
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const achievements = await storage.getUserAchievements(userId);
      const missions = await storage.getUserMissions(userId);
      const progress = await storage.getUserProgress(userId);
      
      // Get track progress
      const tracks = ["EcoExplorer", "ClimateChampion", "WasteWarrior", "GreenInnovator"];
      const trackProgress = await Promise.all(
        tracks.map(async (track) => {
          const prog = await storage.getTrackProgress(userId, track);
          return { track, ...prog };
        })
      );

      res.json({
        user,
        achievements: achievements.slice(0, 4), // Recent achievements
        missions,
        trackProgress,
        recentProgress: progress.slice(-5),
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Lessons API
  app.get('/api/lessons', async (req, res) => {
    try {
      const { track } = req.query;
      const lessons = track 
        ? await storage.getLessonsByTrack(track as string)
        : await storage.getAllLessons();
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.get('/api/lessons/:id', async (req, res) => {
    try {
      const lesson = await storage.getLesson(parseInt(req.params.id));
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // Progress API
  app.post('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { lessonId, completed, score } = req.body;
      
      const progress = await storage.updateProgress({
        userId,
        lessonId: parseInt(lessonId),
        completed,
        score,
        completedAt: completed ? new Date() : undefined,
      });

      if (completed) {
        const lesson = await storage.getLesson(parseInt(lessonId));
        if (lesson) {
          // Award XP and credits
          await storage.updateUserXP(userId, lesson.xpReward || 0);
          await storage.updateUserCredits(userId, lesson.creditReward || 0);
          
          // Check for achievements
          await checkLessonAchievements(userId, lesson.track);
        }
      }

      res.json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Achievements API
  app.get('/api/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Missions API
  app.get('/api/missions', async (req, res) => {
    try {
      const missions = await storage.getActiveMissions();
      res.json(missions);
    } catch (error) {
      console.error("Error fetching missions:", error);
      res.status(500).json({ message: "Failed to fetch missions" });
    }
  });

  app.post('/api/missions/:id/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const missionId = parseInt(req.params.id);
      
      const userMission = await storage.startMission({
        userId,
        missionId,
        status: "in_progress",
      });

      res.json(userMission);
    } catch (error) {
      console.error("Error starting mission:", error);
      res.status(500).json({ message: "Failed to start mission" });
    }
  });

  app.put('/api/missions/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const missionId = parseInt(req.params.id);
      const { progress } = req.body;
      
      await storage.updateMissionProgress(userId, missionId, progress);
      
      if (progress >= 100) {
        await storage.completeMission(userId, missionId);
        const mission = await storage.getActiveMissions().then(missions => 
          missions.find(m => m.id === missionId)
        );
        if (mission) {
          await storage.updateUserXP(userId, mission.xpReward || 0);
          await storage.updateUserCredits(userId, mission.creditReward || 0);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating mission progress:", error);
      res.status(500).json({ message: "Failed to update mission progress" });
    }
  });

  // Leaderboard API
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const { period = 'weekly' } = req.query;
      const leaderboard = await storage.getLeaderboard(period as string);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Guild API
  app.get('/api/guilds', async (req, res) => {
    try {
      // For now, return all guilds from database
      // In a real app, you might want to filter or paginate
      const { guilds } = await import('@shared/schema');
      const { db } = await import('./db');
      const allGuilds = await db.select().from(guilds);
      res.json(allGuilds);
    } catch (error) {
      console.error("Error fetching guilds:", error);
      res.status(500).json({ message: "Failed to fetch guilds" });
    }
  });

  app.get('/api/guild/:id', async (req, res) => {
    try {
      const guild = await storage.getGuild(req.params.id);
      if (!guild) {
        return res.status(404).json({ message: "Guild not found" });
      }
      
      const members = await storage.getGuildMembers(req.params.id);
      res.json({ ...guild, members });
    } catch (error) {
      console.error("Error fetching guild:", error);
      res.status(500).json({ message: "Failed to fetch guild" });
    }
  });

  app.post('/api/guild/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const guildId = req.params.id;
      
      await storage.joinGuild(userId, guildId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error joining guild:", error);
      res.status(500).json({ message: "Failed to join guild" });
    }
  });

  // Eco Actions API
  app.post('/api/eco-actions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let actionData = { ...req.body, userId };
      
      // Server-side reward calculation for AR scans
      if (actionData.type === 'ar_scan' && actionData.confidence) {
        const confidence = Math.max(0, Math.min(1, actionData.confidence)); // Clamp 0-1
        actionData.xpEarned = Math.max(25, Math.round(confidence * 50));
        actionData.creditsEarned = Math.max(10, Math.round(confidence * 25));
      }
      
      // Set default rewards for other action types if not specified
      if (!actionData.xpEarned) {
        actionData.xpEarned = actionData.type === 'simulation_action' ? 75 : 25;
      }
      if (!actionData.creditsEarned) {
        actionData.creditsEarned = actionData.type === 'simulation_action' ? 15 : 10;
      }
      
      const validatedData = insertEcoActionSchema.parse(actionData);
      const action = await storage.createEcoAction(validatedData);
      
      // Award XP and credits for eco actions
      if ((action.xpEarned || 0) > 0) {
        await storage.updateUserXP(userId, action.xpEarned || 0);
      }
      if ((action.creditsEarned || 0) > 0) {
        await storage.updateUserCredits(userId, action.creditsEarned || 0);
      }

      res.json(action);
    } catch (error) {
      console.error("Error creating eco action:", error);
      res.status(500).json({ message: "Failed to create eco action" });
    }
  });

  app.get('/api/eco-actions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const actions = await storage.getUserEcoActions(userId);
      res.json(actions);
    } catch (error) {
      console.error("Error fetching eco actions:", error);
      res.status(500).json({ message: "Failed to fetch eco actions" });
    }
  });

  // Simulation API
  app.post('/api/simulation/action', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { actionType, impact } = req.body;
      
      // Create eco action for simulation
      const action = await storage.createEcoAction({
        userId,
        type: "simulation_action",
        description: `Simulation: ${actionType}`,
        xpEarned: impact * 10,
        creditsEarned: impact * 2,
      });

      await storage.updateUserXP(userId, action.xpEarned || 0);
      await storage.updateUserCredits(userId, action.creditsEarned || 0);

      res.json({ action, xpEarned: action.xpEarned, creditsEarned: action.creditsEarned });
    } catch (error) {
      console.error("Error processing simulation action:", error);
      res.status(500).json({ message: "Failed to process simulation action" });
    }
  });

  // Blockchain API Routes
  app.post('/api/blockchain/connect-wallet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletAddress } = req.body;
      
      // Validate wallet address format
      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ message: "Invalid wallet address" });
      }

      await storage.updateUserWallet(userId, walletAddress);
      res.json({ success: true, walletAddress });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      res.status(500).json({ message: "Failed to connect wallet" });
    }
  });

  app.post('/api/blockchain/mint-credits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, transactionHash, toAddress } = req.body;
      
      // Create blockchain transaction record
      const transaction = await storage.createBlockchainTransaction({
        userId,
        transactionHash,
        blockchainNetwork: 'polygon',
        transactionType: 'mint_credits',
        amount: parseFloat(amount),
        status: 'pending',
        toAddress,
        fromAddress: toAddress, // For minting, from and to are same
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error recording credit mint:", error);
      res.status(500).json({ message: "Failed to record credit mint" });
    }
  });

  app.post('/api/blockchain/mint-nft', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { transactionHash, metadata, contractAddress, achievementId } = req.body;
      
      // Create blockchain transaction record
      const transaction = await storage.createBlockchainTransaction({
        userId,
        transactionHash,
        blockchainNetwork: 'polygon',
        transactionType: 'mint_nft',
        amount: 0,
        status: 'pending',
        toAddress: contractAddress,
        fromAddress: metadata.recipientAddress,
      });

      // Create NFT certificate record
      const nft = await storage.createNftCertificate({
        userId,
        tokenId: '', // Will be updated when transaction confirms
        contractAddress,
        nftType: metadata.type || 'achievement',
        title: metadata.title,
        description: metadata.description,
        metadata,
        imageUrl: metadata.image,
        blockchainNetwork: 'polygon',
        transactionHash,
        achievementId: achievementId ? parseInt(achievementId) : undefined,
      });

      res.json({ transaction, nft });
    } catch (error) {
      console.error("Error recording NFT mint:", error);
      res.status(500).json({ message: "Failed to record NFT mint" });
    }
  });

  app.post('/api/blockchain/confirm-transaction', isAuthenticated, async (req: any, res) => {
    try {
      const { transactionHash, receipt } = req.body;
      
      const status = receipt.status === 1 ? 'confirmed' : 'failed';
      await storage.updateTransactionStatus(transactionHash, status, receipt);
      
      // If it was an NFT mint and successful, update tokenId
      if (status === 'confirmed' && receipt.logs && receipt.logs.length > 0) {
        // Parse logs to extract tokenId (simplified - in reality you'd parse the Transfer event)
        const tokenId = receipt.logs[0].topics[3]; // This is simplified
        if (tokenId) {
          await storage.updateNftTokenId(transactionHash, tokenId);
        }
      }

      res.json({ success: true, status });
    } catch (error) {
      console.error("Error confirming transaction:", error);
      res.status(500).json({ message: "Failed to confirm transaction" });
    }
  });

  app.get('/api/blockchain/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get('/api/blockchain/nfts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const nfts = await storage.getUserNfts(userId);
      res.json(nfts);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      res.status(500).json({ message: "Failed to fetch NFTs" });
    }
  });

  app.get('/api/blockchain/pools', async (req, res) => {
    try {
      const pools = await storage.getBlockchainPools();
      res.json(pools);
    } catch (error) {
      console.error("Error fetching blockchain pools:", error);
      res.status(500).json({ message: "Failed to fetch blockchain pools" });
    }
  });

  app.post('/api/blockchain/stake', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { poolId, amount, transactionHash } = req.body;
      
      const transaction = await storage.createBlockchainTransaction({
        userId,
        transactionHash,
        blockchainNetwork: 'polygon',
        transactionType: 'stake_credits',
        amount: parseFloat(amount),
        status: 'pending',
        toAddress: '', // Pool contract address would be set here
        fromAddress: '', // User wallet would be set here
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error recording stake:", error);
      res.status(500).json({ message: "Failed to record stake" });
    }
  });

  // Initialize AI Recommendation Engine
  const aiEngine = new AIRecommendationEngine(storage);

  // AI Recommendations API
  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await aiEngine.generatePersonalizedRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  app.get('/api/learning-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await aiEngine.generateUserLearningProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error generating learning profile:", error);
      res.status(500).json({ message: "Failed to generate learning profile" });
    }
  });

  app.get('/api/adaptive-difficulty/:contentType', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contentType } = req.params;
      const difficulty = await aiEngine.getAdaptiveDifficulty(userId, contentType);
      res.json({ difficulty });
    } catch (error) {
      console.error("Error determining adaptive difficulty:", error);
      res.status(500).json({ message: "Failed to determine difficulty" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to check for lesson-based achievements
async function checkLessonAchievements(userId: string, track: string) {
  const userProgress = await storage.getUserProgress(userId);
  const completedCount = userProgress.filter(p => p.completed).length;

  // First lesson achievement
  if (completedCount === 1) {
    await storage.createAchievement({
      userId,
      type: "first_lesson",
      title: "First Steps",
      description: "Completed your first lesson",
      xpReward: 100,
      creditReward: 25,
    });
  }

  // Track completion achievements
  const trackProgress = await storage.getTrackProgress(userId, track);
  if (trackProgress.completed === trackProgress.total && trackProgress.total > 0) {
    await storage.createAchievement({
      userId,
      type: "track_complete",
      title: `${track} Master`,
      description: `Completed all lessons in ${track} track`,
      xpReward: 500,
      creditReward: 100,
    });
  }

  // Level up check
  const user = await storage.getUser(userId);
  if (user) {
    const newLevel = Math.floor((user.xp || 0) / 1000) + 1;
    if (newLevel > (user.level || 1)) {
      await storage.levelUpUser(userId);
      await storage.createAchievement({
        userId,
        type: "level_up",
        title: `Level ${newLevel}`,
        description: `Reached level ${newLevel}`,
        xpReward: 200,
        creditReward: 50,
      });
    }
  }
}
