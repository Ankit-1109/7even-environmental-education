import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface GuildCardProps {
  user: {
    guildId?: string;
  };
}

export default function GuildCard({ user }: GuildCardProps) {
  const { data: guild, isLoading } = useQuery({
    queryKey: ["/api/guild", user.guildId],
    enabled: !!user.guildId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!user.guildId || !guild) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Join a Guild</h3>
          <i className="fas fa-users text-primary text-xl"></i>
        </div>
        
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
            <i className="fas fa-users text-3xl text-muted-foreground"></i>
          </div>
          <div>
            <h4 className="font-semibold mb-2">No Guild Yet</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Join a guild to collaborate with other eco champions and participate in team challenges.
            </p>
          </div>
          <Link href="/guilds" data-testid="link-join-guild">
            <Button>
              <i className="fas fa-plus mr-2"></i>
              Find Guild
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const challengeProgress = (guild as any)?.challengeProgress || 0;
  const challengeTarget = (guild as any)?.challengeTarget || 100;
  const progressPercentage = Math.round((challengeProgress / challengeTarget) * 100);

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Your Guild</h3>
        <i className="fas fa-users text-primary text-xl"></i>
      </div>
      
      <div className="text-center mb-6">
        <div className="w-20 h-20 eco-gradient rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="fas fa-tree text-3xl text-white"></i>
        </div>
        <h4 className="text-lg font-bold" data-testid="text-guild-name">
          {(guild as any)?.name}
        </h4>
        <p className="text-muted-foreground" data-testid="text-guild-members">
          {(guild as any)?.memberCount} members
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Guild Progress</span>
          <span className="text-sm text-muted-foreground" data-testid="text-guild-progress">
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {(guild as any)?.currentChallenge && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h5 className="font-semibold mb-2">Current Challenge</h5>
            <p className="text-sm text-muted-foreground" data-testid="text-guild-challenge">
              {(guild as any)?.currentChallenge} - {challengeProgress}/{challengeTarget} completed
            </p>
            {(guild as any)?.challengeDeadline && (
              <div className="mt-2 flex items-center space-x-2">
                <i className="fas fa-clock text-accent"></i>
                <span className="text-sm">
                  {new Date((guild as any).challengeDeadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
        
        <Link href="/guilds" data-testid="link-guild-details">
          <Button variant="outline" className="w-full">
            View Guild Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
