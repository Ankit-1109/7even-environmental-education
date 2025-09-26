import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MissionCardProps {
  mission: {
    id: number;
    title: string;
    description: string;
    type: string;
    track?: string;
    xpReward: number;
    creditReward: number;
    status?: string;
    progress?: number;
  };
  isFeatured?: boolean;
}

export default function MissionCard({ mission, isFeatured = false }: MissionCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startMissionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/missions/${mission.id}/start`);
    },
    onSuccess: () => {
      toast({
        title: "Mission Started!",
        description: `You've started: ${mission.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start mission",
        variant: "destructive",
      });
    },
  });

  const isCompleted = mission.status === "completed";
  const isInProgress = mission.status === "in_progress";
  const canStart = !isCompleted && !isInProgress;

  if (isFeatured) {
    return (
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Today's Mission</h3>
          <i className="fas fa-flag text-2xl"></i>
        </div>
        <h4 className="text-lg font-semibold mb-2" data-testid="text-featured-mission-title">
          {mission.title}
        </h4>
        <p className="mb-4 opacity-90" data-testid="text-featured-mission-description">
          {mission.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
              <i className="fas fa-star mr-1"></i>
              +{mission.xpReward} XP
            </div>
            <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
              <i className="fas fa-coins mr-1"></i>
              +{mission.creditReward} EcoCredits
            </div>
          </div>
          <Button
            onClick={() => startMissionMutation.mutate()}
            disabled={!canStart || startMissionMutation.isPending}
            className="bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            data-testid="button-start-featured-mission"
          >
            {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Start Mission"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              mission.type === "daily" ? "bg-primary/10 text-primary" :
              mission.type === "weekly" ? "bg-secondary/10 text-secondary" :
              "bg-accent/10 text-accent"
            }`}>
              {mission.type}
            </span>
            {mission.track && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                {mission.track}
              </span>
            )}
          </div>
          <h4 className="text-lg font-semibold mb-2" data-testid={`text-mission-title-${mission.id}`}>
            {mission.title}
          </h4>
          <p className="text-muted-foreground text-sm mb-4" data-testid={`text-mission-description-${mission.id}`}>
            {mission.description}
          </p>
        </div>
      </div>

      {isInProgress && mission.progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{mission.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500" 
              style={{ width: `${mission.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span><i className="fas fa-star mr-1"></i>+{mission.xpReward} XP</span>
          <span><i className="fas fa-coins mr-1"></i>+{mission.creditReward} Credits</span>
        </div>
        <Button
          onClick={() => startMissionMutation.mutate()}
          disabled={!canStart || startMissionMutation.isPending}
          size="sm"
          data-testid={`button-mission-action-${mission.id}`}
        >
          {isCompleted ? "Completed" : isInProgress ? "Continue" : "Start"}
        </Button>
      </div>
    </div>
  );
}
