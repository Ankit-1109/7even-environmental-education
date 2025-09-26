import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import ProgressCard from "@/components/ProgressCard";
import AchievementCard from "@/components/AchievementCard";
import LeaderboardCard from "@/components/LeaderboardCard";
import GuildCard from "@/components/GuildCard";
import MissionCard from "@/components/MissionCard";
import TensorflowARScanner from "@/components/TensorflowARScanner";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const response = await fetch("/api/leaderboard?period=weekly");
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
    enabled: isAuthenticated && !isLoading,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || isDashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const { trackProgress = [], achievements = [], missions = [] } = (dashboardData as any) || {};

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-welcome">
              Welcome back, {(user as any)?.firstName || "Explorer"}! 🌱
            </h1>
            <p className="text-muted-foreground">Ready to make an impact today?</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-user-level">
                Level {(user as any)?.level || 1}
              </div>
              <div className="text-sm text-muted-foreground">EcoChampion</div>
            </div>
          </div>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trackProgress.map((track: any, index: number) => (
            <ProgressCard
              key={track.track}
              track={track.track}
              completed={track.completed}
              total={track.total}
              index={index}
            />
          ))}
        </div>

        {/* Quick Actions & Today's Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Mission */}
          {missions.length > 0 && (
            <div className="lg:col-span-2">
              <MissionCard mission={missions[0]} isFeatured />
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/ar-scanner" data-testid="link-ar-scanner-quick">
                <a className="w-full flex items-center justify-between p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-camera text-white"></i>
                    <span>TensorFlow AR Scanner</span>
                  </div>
                  <i className="fas fa-chevron-right text-gray-300"></i>
                </a>
              </Link>
              
              <Link href="/simulation" data-testid="link-simulation-quick">
                <a className="w-full flex items-center justify-between p-3 bg-secondary/5 rounded-lg hover:bg-secondary/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-play text-secondary"></i>
                    <span>Eco Simulation</span>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground"></i>
                </a>
              </Link>
              
              <Link href="/guilds" data-testid="link-guilds-quick">
                <a className="w-full flex items-center justify-between p-3 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-users text-accent"></i>
                    <span>Join Guild</span>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground"></i>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements & Progress */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Achievements</h2>
          <Link href="/profile#achievements" data-testid="link-view-all-achievements">
            <a className="text-primary hover:text-primary/80 font-medium">View All</a>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.slice(0, 4).map((achievement: any) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
          
          {achievements.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <i className="fas fa-trophy text-4xl mb-4 opacity-50"></i>
              <p>Complete lessons and missions to unlock achievements!</p>
            </div>
          )}
        </div>
      </section>

      {/* Guild & Leaderboard */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GuildCard user={user} />
        <LeaderboardCard leaderboard={leaderboard || []} currentUserId={(user as any)?.id || ''} />
      </section>
    </div>
  );
}
