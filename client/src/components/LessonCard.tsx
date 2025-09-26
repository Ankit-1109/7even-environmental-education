import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LessonCardProps {
  lesson: {
    id: number;
    title: string;
    description: string;
    track: string;
    difficulty: string;
    xpReward: number;
    creditReward: number;
    duration: number;
    imageUrl?: string;
  };
  progress?: {
    completed: boolean;
    score?: number;
  };
}

const trackColors = {
  EcoExplorer: "bg-primary/10 text-primary",
  ClimateChampion: "bg-secondary/10 text-secondary", 
  WasteWarrior: "bg-accent/10 text-accent",
  GreenInnovator: "bg-primary/10 text-primary",
};

const difficultyColors = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function LessonCard({ lesson, progress }: LessonCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const completeLesson = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/progress", {
        lessonId: lesson.id,
        completed: true,
        score: 85 + Math.floor(Math.random() * 15), // Simulate random score 85-100
      });
    },
    onSuccess: () => {
      toast({
        title: "Lesson Completed!",
        description: `You earned ${lesson.xpReward} XP and ${lesson.creditReward} EcoCredits`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete lesson",
        variant: "destructive",
      });
    },
  });

  const trackColor = trackColors[lesson.track as keyof typeof trackColors] || "bg-gray-100 text-gray-800";
  const difficultyColor = difficultyColors[lesson.difficulty as keyof typeof difficultyColors] || difficultyColors.beginner;
  const isCompleted = progress?.completed;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow">
      {lesson.imageUrl && (
        <img 
          src={lesson.imageUrl} 
          alt={lesson.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge className={trackColor} data-testid={`badge-track-${lesson.id}`}>
            {lesson.track}
          </Badge>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={difficultyColor} data-testid={`badge-difficulty-${lesson.id}`}>
              {lesson.difficulty}
            </Badge>
            {isCompleted && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" data-testid={`badge-completed-${lesson.id}`}>
                <i className="fas fa-check mr-1"></i>
                Completed
              </Badge>
            )}
          </div>
        </div>
        
        <h4 className="text-lg font-semibold mb-2" data-testid={`text-lesson-title-${lesson.id}`}>
          {lesson.title}
        </h4>
        
        <p className="text-muted-foreground text-sm mb-4" data-testid={`text-lesson-description-${lesson.id}`}>
          {lesson.description}
        </p>
        
        {progress?.score && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Your Score</span>
              <span className="font-semibold">{progress.score}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${progress.score}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span data-testid={`text-lesson-duration-${lesson.id}`}>
              <i className="fas fa-clock mr-1"></i>{lesson.duration} min
            </span>
            <span data-testid={`text-lesson-xp-${lesson.id}`}>
              <i className="fas fa-certificate mr-1"></i>+{lesson.xpReward} XP
            </span>
            <span data-testid={`text-lesson-credits-${lesson.id}`}>
              <i className="fas fa-coins mr-1"></i>+{lesson.creditReward}
            </span>
          </div>
          
          <Button
            onClick={() => completeLesson.mutate()}
            disabled={isCompleted || completeLesson.isPending}
            size="sm"
            data-testid={`button-lesson-action-${lesson.id}`}
          >
            {isCompleted ? "Completed" : completeLesson.isPending ? "Starting..." : "Start Lesson"}
          </Button>
        </div>
      </div>
    </div>
  );
}
