import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Guilds() {
  const { user } = useAuth();

  const { data: userGuild, isLoading: isGuildLoading } = useQuery({
    queryKey: ["/api/guild", (user as any)?.guildId],
    enabled: !!(user as any)?.guildId,
  });

  // Fetch available guilds from API
  const { data: availableGuilds = [], isLoading: isGuildsLoading } = useQuery({
    queryKey: ["/api/guilds"],
    enabled: !(user as any)?.guildId, // Only fetch if user doesn't have a guild
  });

  const { toast } = useToast();

  const joinGuildMutation = useMutation({
    mutationFn: async (guildId: string) => {
      const response = await apiRequest("POST", `/api/guild/${guildId}/join`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Guild Joined!",
        description: "Welcome to your new guild! Start collaborating on environmental challenges.",
      });
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guild"] });
    },
    onError: (error) => {
      console.error("Failed to join guild:", error);
      toast({
        title: "Failed to Join Guild",
        description: "There was an error joining the guild. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isGuildLoading || isGuildsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Environmental Guilds</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join a community of like-minded environmental champions. Collaborate on missions, 
          share knowledge, and make a greater impact together.
        </p>
      </div>

      {/* Current Guild Section */}
      {(user as any)?.guildId && userGuild ? (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Your Guild</h2>
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2" data-testid="text-current-guild-name">
                    {(userGuild as any)?.name}
                  </h3>
                  <p className="opacity-90">{(userGuild as any)?.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" data-testid="text-current-guild-members">
                    {(userGuild as any)?.memberCount}
                  </div>
                  <div className="text-sm opacity-90">Members</div>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              {(userGuild as any)?.currentChallenge && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Current Guild Challenge</h4>
                  <p className="text-muted-foreground" data-testid="text-current-guild-challenge">
                    {(userGuild as any)?.currentChallenge}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span data-testid="text-current-guild-progress">
                        {(userGuild as any)?.challengeProgress}/{(userGuild as any)?.challengeTarget}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${Math.round(((userGuild as any)?.challengeProgress / (userGuild as any)?.challengeTarget) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      ) : (
        /* Available Guilds Section */
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Available Guilds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableGuilds.map((guild) => (
              <Card key={guild.id} className="hover:shadow-md transition-shadow" data-testid={`card-guild-${guild.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg" data-testid={`text-guild-name-${guild.id}`}>
                      {guild.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-users text-muted-foreground"></i>
                      <span className="text-sm text-muted-foreground" data-testid={`text-guild-members-${guild.id}`}>
                        {guild.memberCount}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm" data-testid={`text-guild-description-${guild.id}`}>
                    {guild.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Guild XP</span>
                      <span data-testid={`text-guild-xp-${guild.id}`}>
                        {guild.totalXP.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {guild.currentChallenge && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Current Challenge</h5>
                      <p className="text-xs text-muted-foreground" data-testid={`text-guild-challenge-${guild.id}`}>
                        {guild.currentChallenge}
                      </p>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${Math.round((guild.challengeProgress / guild.challengeTarget) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {guild.challengeProgress}/{guild.challengeTarget} completed
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    data-testid={`button-join-guild-${guild.id}`}
                    onClick={() => joinGuildMutation.mutate(guild.id)}
                    disabled={joinGuildMutation.isPending}
                  >
                    {joinGuildMutation.isPending ? "Joining..." : "Join Guild"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Guild Benefits */}
      <section className="bg-muted/50 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Guild Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-users text-primary text-xl"></i>
            </div>
            <h4 className="font-semibold mb-2">Collaborative Learning</h4>
            <p className="text-sm text-muted-foreground">
              Work together on environmental challenges and share knowledge with fellow members.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-trophy text-secondary text-xl"></i>
            </div>
            <h4 className="font-semibold mb-2">Exclusive Challenges</h4>
            <p className="text-sm text-muted-foreground">
              Access guild-only missions and competitions with greater rewards and impact.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-chart-line text-accent text-xl"></i>
            </div>
            <h4 className="font-semibold mb-2">Amplified Impact</h4>
            <p className="text-sm text-muted-foreground">
              Multiply your environmental impact through coordinated guild activities and projects.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
