interface LeaderboardCardProps {
  leaderboard: Array<{
    userId: string;
    xp: number;
    rank: number;
    user?: {
      firstName?: string;
      lastName?: string;
      level: number;
    };
  }>;
  currentUserId: string;
}

export default function LeaderboardCard({ leaderboard, currentUserId }: LeaderboardCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Leaderboard</h3>
        <select className="bg-muted rounded px-3 py-1 text-sm border border-border" data-testid="select-leaderboard-period">
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="all_time">All Time</option>
        </select>
      </div>

      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <i className="fas fa-chart-line text-4xl mb-4 opacity-50"></i>
            <p>No leaderboard data available</p>
          </div>
        ) : (
          leaderboard.slice(0, 4).map((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId;
            const rankColor = index === 0 ? "bg-accent" : index === 1 ? "bg-secondary" : index === 2 ? "bg-primary/70" : "bg-muted";
            
            return (
              <div 
                key={entry.userId}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isCurrentUser ? "bg-secondary/10 border border-secondary/20" : "bg-muted/30"
                }`}
                data-testid={`leaderboard-entry-${index + 1}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${rankColor} rounded-full flex items-center justify-center text-sm font-bold ${
                    index < 3 ? "text-white" : "text-foreground"
                  }`}>
                    {entry.rank || index + 1}
                  </div>
                  <div>
                    <div className="font-medium" data-testid={`text-leaderboard-name-${index + 1}`}>
                      {entry.user?.firstName || "Anonymous"} {isCurrentUser ? "(You)" : ""}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Level {entry.user?.level || 1}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold" data-testid={`text-leaderboard-xp-${index + 1}`}>
                    {entry.xp.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">XP</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
