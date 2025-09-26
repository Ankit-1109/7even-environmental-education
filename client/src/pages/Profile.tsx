import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AchievementCard from "@/components/AchievementCard";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/achievements"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  const { data: ecoActions } = useQuery({
    queryKey: ["/api/eco-actions"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  const { data: userGuild } = useQuery({
    queryKey: ["/api/guild", (user as any)?.guildId],
    enabled: isAuthenticated && !isLoading && !!(user as any)?.guildId,
    retry: false,
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

  if (isLoading || achievementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile data</p>
      </div>
    );
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const completedLessons = (progress as any[])?.filter((p: any) => p.completed).length || 0;
  const totalActions = (ecoActions as any[])?.length || 0;
  const totalAchievements = (achievements as any[])?.length || 0;

  // Calculate level progress (1000 XP per level)
  const currentLevelXP = ((user as any)?.xp || 0) % 1000;
  const levelProgress = (currentLevelXP / 1000) * 100;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                {(user as any)?.profileImageUrl ? (
                  <img 
                    src={(user as any).profileImageUrl} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                    data-testid="img-profile-avatar"
                  />
                ) : (
                  <i className="fas fa-user text-4xl text-primary-foreground"></i>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-2 border-background">
                <span className="text-sm font-bold text-accent-foreground" data-testid="text-user-level-badge">
                  {(user as any)?.level || 1}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2" data-testid="text-user-name">
                {(user as any)?.firstName} {(user as any)?.lastName}
              </h1>
              {(user as any)?.email && (
                <p className="text-muted-foreground mb-4" data-testid="text-user-email">
                  {(user as any)?.email}
                </p>
              )}
              
              {/* Level Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Level {(user as any)?.level || 1} Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {currentLevelXP}/1000 XP
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="text-stat-xp">
                    {((user as any)?.xp || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent" data-testid="text-stat-credits">
                    {((user as any)?.ecoCredits || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">EcoCredits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary" data-testid="text-stat-lessons">
                    {completedLessons}
                  </div>
                  <div className="text-sm text-muted-foreground">Lessons</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="text-stat-actions">
                    {totalActions}
                  </div>
                  <div className="text-sm text-muted-foreground">Eco Actions</div>
                </div>
              </div>

              {/* Guild Information */}
              {(user as any)?.guildId && userGuild && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Guild Membership</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <i className="fas fa-users text-white"></i>
                      </div>
                      <div>
                        <div className="font-semibold" data-testid="text-profile-guild">
                          {(userGuild as any)?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(userGuild as any)?.memberCount} members
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" data-testid="button-edit-profile">
                  <i className="fas fa-edit mr-2"></i>
                  Edit Profile
                </Button>
                <Button variant="destructive" onClick={handleLogout} data-testid="button-logout">
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-3" data-testid="tabs-profile">
          <TabsTrigger value="achievements" data-testid="tab-achievements">Achievements</TabsTrigger>
          <TabsTrigger value="progress" data-testid="tab-progress">Progress</TabsTrigger>
          <TabsTrigger value="eco-actions" data-testid="tab-eco-actions">Eco Actions</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="mt-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Achievements</h2>
              <Badge variant="outline" className="text-lg px-3 py-1" data-testid="badge-achievement-count">
                {totalAchievements} Unlocked
              </Badge>
            </div>

            {achievements && (achievements as any[]).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(achievements as any[]).map((achievement: any) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-trophy text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
                <p className="text-muted-foreground">
                  Complete lessons and missions to unlock your first achievement!
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="mt-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Learning Progress</h2>
            
            {progress && (progress as any[]).length > 0 ? (
              <div className="space-y-4">
                {(progress as any[])
                  .filter((p: any) => p.completed)
                  .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                  .map((p: any) => (
                    <Card key={`${p.userId}-${p.lessonId}`} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold" data-testid={`text-progress-lesson-${p.lessonId}`}>
                            Lesson #{p.lessonId}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Completed {new Date(p.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          {p.score && (
                            <Badge 
                              className={
                                p.score >= 90 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                                p.score >= 80 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }
                              data-testid={`badge-score-${p.lessonId}`}
                            >
                              {p.score}%
                            </Badge>
                          )}
                          <i className="fas fa-check text-green-600"></i>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-book-open text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">No Completed Lessons</h3>
                <p className="text-muted-foreground">
                  Start learning to see your progress here!
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Eco Actions Tab */}
        <TabsContent value="eco-actions" className="mt-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your Eco Actions</h2>
            
            {ecoActions && (ecoActions as any[]).length > 0 ? (
              <div className="space-y-4">
                {(ecoActions as any[]).map((action: any) => (
                  <Card key={action.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className={
                            action.type === "ar_scan" ? "bg-primary/10 text-primary" :
                            action.type === "simulation_action" ? "bg-secondary/10 text-secondary" :
                            "bg-accent/10 text-accent"
                          }>
                            {action.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {action.verified && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <i className="fas fa-check mr-1"></i>
                              Verified
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold mb-1" data-testid={`text-action-description-${action.id}`}>
                          {action.description}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(action.createdAt).toLocaleDateString()} at{' '}
                          {new Date(action.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Rewards</div>
                        <div className="flex flex-col space-y-1">
                          {action.xpEarned > 0 && (
                            <span className="text-sm font-medium" data-testid={`text-action-xp-${action.id}`}>
                              +{action.xpEarned} XP
                            </span>
                          )}
                          {action.creditsEarned > 0 && (
                            <span className="text-sm font-medium text-accent" data-testid={`text-action-credits-${action.id}`}>
                              +{action.creditsEarned} Credits
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-leaf text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">No Eco Actions Yet</h3>
                <p className="text-muted-foreground">
                  Use the AR scanner or participate in simulations to track your environmental impact!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
