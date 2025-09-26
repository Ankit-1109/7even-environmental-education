import OpenAI from 'openai';
import { DatabaseStorage } from './storage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UserLearningProfile {
  userId: string;
  level: number;
  totalXP: number;
  ecoCredits: number;
  completedLessons: number;
  averageScore: number;
  preferredTracks: string[];
  recentActivity: any[];
  strengths: string[];
  improvementAreas: string[];
}

interface PersonalizedRecommendation {
  type: 'lesson' | 'track' | 'action' | 'challenge';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  expectedRewards: {
    xp: number;
    credits: number;
  };
  reasoning: string;
}

export class AIRecommendationEngine {
  private storage: DatabaseStorage;

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  async generateUserLearningProfile(userId: string): Promise<UserLearningProfile> {
    try {
      // Gather user data
      const user = await this.storage.getUser(userId);
      const userProgress = await this.storage.getUserProgress(userId);
      const recentActions = await this.storage.getUserEcoActions(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Analyze completion patterns
      const completedLessons = userProgress.filter(p => p.completed);
      const averageScore = completedLessons.length > 0 
        ? completedLessons.reduce((sum, p) => sum + (p.score || 0), 0) / completedLessons.length
        : 0;

      // Determine preferred tracks based on completion rates
      const trackStats: Record<string, { completed: number; total: number }> = {};
      for (const progress of userProgress) {
        const lesson = await this.storage.getLesson(progress.lessonId);
        if (lesson) {
          if (!trackStats[lesson.track]) {
            trackStats[lesson.track] = { completed: 0, total: 0 };
          }
          trackStats[lesson.track].total++;
          if (progress.completed) {
            trackStats[lesson.track].completed++;
          }
        }
      }

      const preferredTracks = Object.entries(trackStats)
        .filter(([_, stats]) => stats.completed > 0)
        .sort(([_, a], [__, b]) => (b.completed / b.total) - (a.completed / a.total))
        .map(([track, _]) => track);

      // Analyze strengths and improvement areas
      const strengths: string[] = [];
      const improvementAreas: string[] = [];

      // High performers (score >= 90)
      const highScoreTracks = new Set(
        completedLessons
          .filter(p => (p.score || 0) >= 90)
          .map(p => trackStats[Object.keys(trackStats).find(track => {
            // This is simplified - in real implementation, would need lesson->track mapping
            return true;
          }) || ''])
      );

      // Identify patterns from recent activity
      const recentActivity = recentActions
        .filter(a => a.createdAt) // Filter out items with null createdAt
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
        .slice(0, 10);

      return {
        userId,
        level: user.level || 1,
        totalXP: user.xp || 0,
        ecoCredits: user.ecoCredits || 0,
        completedLessons: completedLessons.length,
        averageScore,
        preferredTracks,
        recentActivity,
        strengths: this.determineStrengths(completedLessons, recentActivity),
        improvementAreas: this.determineImprovementAreas(userProgress, averageScore)
      };
    } catch (error) {
      console.error('Error generating user learning profile:', error);
      throw error;
    }
  }

  async generatePersonalizedRecommendations(userId: string): Promise<PersonalizedRecommendation[]> {
    try {
      const profile = await this.generateUserLearningProfile(userId);
      
      // Create AI prompt based on user profile
      const prompt = this.buildRecommendationPrompt(profile);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI tutor specializing in environmental education. Generate 5-7 personalized learning recommendations for users based on their learning profile. Focus on sustainability, conservation, climate change, and environmental action.

Response format should be a JSON array of recommendations with these fields:
- type: "lesson" | "track" | "action" | "challenge"
- title: Clear, engaging title
- description: 2-3 sentence description
- priority: "high" | "medium" | "low"
- difficulty: "beginner" | "intermediate" | "advanced"
- estimatedTime: e.g., "15 minutes", "30 minutes", "1 hour"
- expectedRewards: { xp: number, credits: number }
- reasoning: Why this recommendation fits the user

Make recommendations progressive, engaging, and aligned with user's current level and interests.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Parse AI response
      try {
        const recommendations = JSON.parse(aiResponse) as PersonalizedRecommendation[];
        return this.validateAndEnhanceRecommendations(recommendations, profile);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback to rule-based recommendations
        return this.generateFallbackRecommendations(profile);
      }
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      // Fallback to rule-based recommendations
      const profile = await this.generateUserLearningProfile(userId);
      return this.generateFallbackRecommendations(profile);
    }
  }

  private buildRecommendationPrompt(profile: UserLearningProfile): string {
    return `User Learning Profile:
- Level: ${profile.level}
- Total XP: ${profile.totalXP}
- EcoCredits: ${profile.ecoCredits}
- Completed Lessons: ${profile.completedLessons}
- Average Score: ${profile.averageScore.toFixed(1)}%
- Preferred Tracks: ${profile.preferredTracks.join(', ') || 'None yet'}
- Strengths: ${profile.strengths.join(', ') || 'Developing'}
- Areas for Improvement: ${profile.improvementAreas.join(', ') || 'None identified'}
- Recent Activity: ${profile.recentActivity.length} actions in the last week

Available learning tracks: Climate Change, Renewable Energy, Waste Management, Conservation, Sustainable Living, Biodiversity

Please generate personalized recommendations that:
1. Match the user's current level and experience
2. Build on their strengths while addressing improvement areas
3. Introduce new concepts progressively
4. Include a mix of theoretical learning and practical actions
5. Encourage continued engagement with appropriate challenges

Consider their preferred tracks but also suggest branching into related areas for well-rounded environmental education.`;
  }

  private validateAndEnhanceRecommendations(
    recommendations: PersonalizedRecommendation[], 
    profile: UserLearningProfile
  ): PersonalizedRecommendation[] {
    return recommendations.map(rec => ({
      ...rec,
      // Adjust rewards based on user level
      expectedRewards: {
        xp: Math.max(25, rec.expectedRewards.xp * (1 + profile.level * 0.1)),
        credits: Math.max(10, rec.expectedRewards.credits * (1 + profile.level * 0.1))
      }
    })).filter(rec => 
      // Basic validation
      rec.title && rec.description && rec.type && rec.priority && rec.difficulty
    );
  }

  private generateFallbackRecommendations(profile: UserLearningProfile): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    // Beginner recommendations
    if (profile.level <= 2) {
      recommendations.push({
        type: 'lesson',
        title: 'Climate Change Basics',
        description: 'Learn fundamental concepts about global warming, greenhouse gases, and climate science.',
        priority: 'high',
        difficulty: 'beginner',
        estimatedTime: '20 minutes',
        expectedRewards: { xp: 50, credits: 15 },
        reasoning: 'Essential foundation knowledge for environmental understanding'
      });
    }

    // Progressive recommendations based on completed lessons
    if (profile.completedLessons >= 3) {
      recommendations.push({
        type: 'action',
        title: 'Start a Home Energy Audit',
        description: 'Use our AR scanner to identify energy inefficiencies in your home and track improvements.',
        priority: 'medium',
        difficulty: 'intermediate',
        estimatedTime: '45 minutes',
        expectedRewards: { xp: 75, credits: 25 },
        reasoning: 'Practical application of energy conservation knowledge'
      });
    }

    // High-level challenge for advanced users
    if (profile.level >= 5) {
      recommendations.push({
        type: 'challenge',
        title: 'Community Carbon Footprint Challenge',
        description: 'Lead a week-long carbon reduction challenge in your community using our tracking tools.',
        priority: 'high',
        difficulty: 'advanced',
        estimatedTime: '1 week',
        expectedRewards: { xp: 200, credits: 75 },
        reasoning: 'Leadership opportunity to multiply environmental impact'
      });
    }

    return recommendations;
  }

  private determineStrengths(completedLessons: any[], recentActivity: any[]): string[] {
    const strengths: string[] = [];
    
    // Analyze high-scoring areas
    const highScoreCount = completedLessons.filter(l => (l.score || 0) >= 90).length;
    if (highScoreCount >= 3) {
      strengths.push('Consistent High Performance');
    }

    // Analyze activity patterns
    const arScans = recentActivity.filter(a => a.type === 'ar_scan').length;
    if (arScans >= 3) {
      strengths.push('Practical Application');
    }

    const simulations = recentActivity.filter(a => a.type === 'simulation_action').length;
    if (simulations >= 2) {
      strengths.push('Systems Thinking');
    }

    return strengths.length > 0 ? strengths : ['Building Foundation'];
  }

  private determineImprovementAreas(userProgress: any[], averageScore: number): string[] {
    const improvementAreas: string[] = [];
    
    if (averageScore < 80) {
      improvementAreas.push('Concept Mastery');
    }

    const incompleteCount = userProgress.filter(p => !p.completed).length;
    if (incompleteCount > 3) {
      improvementAreas.push('Lesson Completion');
    }

    return improvementAreas;
  }

  async getAdaptiveDifficulty(userId: string, contentType: string): Promise<'beginner' | 'intermediate' | 'advanced'> {
    const profile = await this.generateUserLearningProfile(userId);
    
    // Base difficulty on level and average score
    if (profile.level <= 2 || profile.averageScore < 70) {
      return 'beginner';
    } else if (profile.level <= 5 || profile.averageScore < 85) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }
}