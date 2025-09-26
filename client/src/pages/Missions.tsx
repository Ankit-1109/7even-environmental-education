import { useQuery } from "@tanstack/react-query";
import MissionCard from "@/components/MissionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Missions() {
  const { data: missions, isLoading } = useQuery({
    queryKey: ["/api/missions"],
  });

  const { data: userMissions } = useQuery({
    queryKey: ["/api/dashboard"],
    select: (data) => (data as any)?.missions || [],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Create mission map with user progress
  const userMissionMap = new Map((userMissions as any[])?.map((um: any) => [um.missionId, um]) || []);
  const enhancedMissions = (missions as any[])?.map((mission: any) => ({
    ...mission,
    ...userMissionMap.get(mission.id),
  })) || [];

  const dailyMissions = enhancedMissions.filter((m: any) => m.type === "daily");
  const weeklyMissions = enhancedMissions.filter((m: any) => m.type === "weekly");
  const specialMissions = enhancedMissions.filter((m: any) => m.type === "special");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Environmental Missions</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Take on challenges that make a real difference. Complete missions to earn XP, 
          EcoCredits, and contribute to environmental conservation efforts.
        </p>
      </div>

      {/* Mission Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary/5 rounded-lg p-6 text-center border border-primary/10">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-calendar-day text-primary-foreground"></i>
          </div>
          <h3 className="font-semibold mb-1">Daily Missions</h3>
          <p className="text-2xl font-bold text-primary" data-testid="text-daily-missions-count">
            {dailyMissions.length}
          </p>
          <p className="text-sm text-muted-foreground">Active today</p>
        </div>

        <div className="bg-secondary/5 rounded-lg p-6 text-center border border-secondary/10">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-calendar-week text-secondary-foreground"></i>
          </div>
          <h3 className="font-semibold mb-1">Weekly Challenges</h3>
          <p className="text-2xl font-bold text-secondary" data-testid="text-weekly-missions-count">
            {weeklyMissions.length}
          </p>
          <p className="text-sm text-muted-foreground">This week</p>
        </div>

        <div className="bg-accent/5 rounded-lg p-6 text-center border border-accent/10">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-star text-accent-foreground"></i>
          </div>
          <h3 className="font-semibold mb-1">Special Events</h3>
          <p className="text-2xl font-bold text-accent" data-testid="text-special-missions-count">
            {specialMissions.length}
          </p>
          <p className="text-sm text-muted-foreground">Limited time</p>
        </div>
      </div>

      {/* Mission Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4" data-testid="tabs-mission-filter">
          <TabsTrigger value="all" data-testid="tab-all-missions">All Missions</TabsTrigger>
          <TabsTrigger value="daily" data-testid="tab-daily-missions">Daily</TabsTrigger>
          <TabsTrigger value="weekly" data-testid="tab-weekly-missions">Weekly</TabsTrigger>
          <TabsTrigger value="special" data-testid="tab-special-missions">Special</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-8">
          <div className="space-y-6">
            {enhancedMissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enhancedMissions.map((mission: any) => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-flag text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">No Missions Available</h3>
                <p className="text-muted-foreground">Check back later for new environmental challenges!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="daily" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dailyMissions.length > 0 ? (
              dailyMissions.map((mission: any) => (
                <MissionCard key={mission.id} mission={mission} />
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <i className="fas fa-calendar-day text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">No Daily Missions</h3>
                <p className="text-muted-foreground">New daily missions are added regularly!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weeklyMissions.length > 0 ? (
              weeklyMissions.map((mission: any) => (
                <MissionCard key={mission.id} mission={mission} />
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <i className="fas fa-calendar-week text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">No Weekly Challenges</h3>
                <p className="text-muted-foreground">Weekly challenges refresh every Monday!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="special" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {specialMissions.length > 0 ? (
              specialMissions.map((mission: any) => (
                <MissionCard key={mission.id} mission={mission} />
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <i className="fas fa-star text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">No Special Events</h3>
                <p className="text-muted-foreground">Keep an eye out for limited-time special missions!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
