interface ProgressCardProps {
  track: string;
  completed: number;
  total: number;
  index: number;
}

const trackIcons = {
  EcoExplorer: "fas fa-seedling",
  ClimateChampion: "fas fa-cloud",
  WasteWarrior: "fas fa-recycle",
  GreenInnovator: "fas fa-lightbulb",
};

const trackColors = [
  "text-primary bg-primary/10",
  "text-secondary bg-secondary/10", 
  "text-accent bg-accent/10",
  "text-primary bg-primary/10",
];

export default function ProgressCard({ track, completed, total, index }: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const colorClass = trackColors[index % trackColors.length];
  const iconClass = trackIcons[track as keyof typeof trackIcons] || "fas fa-leaf";

  return (
    <div className="bg-card rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow" data-testid={`card-progress-${track}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
          <i className={`${iconClass} text-xl`}></i>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary" data-testid={`text-progress-${track}`}>
            {percentage}%
          </div>
          <div className="text-sm text-muted-foreground">Complete</div>
        </div>
      </div>
      <h3 className="font-semibold mb-2">{track}</h3>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-muted-foreground mt-2" data-testid={`text-lessons-${track}`}>
        {completed}/{total} lessons complete
      </p>
    </div>
  );
}
