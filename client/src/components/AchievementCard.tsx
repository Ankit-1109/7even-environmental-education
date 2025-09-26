interface AchievementCardProps {
  achievement: {
    id: number;
    title: string;
    description: string;
    iconClass?: string;
    creditReward: number;
    unlockedAt: string;
  };
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const iconClass = achievement.iconClass || "fas fa-trophy";
  
  return (
    <div className="bg-card rounded-lg border border-border p-4 text-center hover:shadow-md transition-shadow" data-testid={`card-achievement-${achievement.id}`}>
      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 floating-animation">
        <i className={`${iconClass} text-2xl text-accent-foreground`}></i>
      </div>
      <h4 className="font-semibold" data-testid={`text-achievement-title-${achievement.id}`}>
        {achievement.title}
      </h4>
      <p className="text-sm text-muted-foreground mt-1" data-testid={`text-achievement-description-${achievement.id}`}>
        {achievement.description}
      </p>
      <div className="text-xs text-accent mt-2" data-testid={`text-achievement-reward-${achievement.id}`}>
        +{achievement.creditReward} EcoCredits
      </div>
    </div>
  );
}
