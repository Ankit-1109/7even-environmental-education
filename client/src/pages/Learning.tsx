import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import LessonCard from "@/components/LessonCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tracks = [
  {
    name: "EcoExplorer",
    description: "Discover biodiversity and ecosystem fundamentals",
    icon: "fas fa-seedling",
    color: "text-primary bg-primary/10",
  },
  {
    name: "ClimateChampion", 
    description: "Master climate science and solutions",
    icon: "fas fa-cloud",
    color: "text-secondary bg-secondary/10",
  },
  {
    name: "WasteWarrior",
    description: "Learn waste management and circular economy",
    icon: "fas fa-recycle", 
    color: "text-accent bg-accent/10",
  },
  {
    name: "GreenInnovator",
    description: "Explore sustainable technology and innovation",
    icon: "fas fa-lightbulb",
    color: "text-primary bg-primary/10",
  },
];

export default function Learning() {
  const [selectedTrack, setSelectedTrack] = useState("all");

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["/api/lessons", selectedTrack === "all" ? undefined : selectedTrack],
    queryFn: async ({ queryKey }) => {
      const track = queryKey[1];
      const url = track ? `/api/lessons?track=${track}` : "/api/lessons";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch lessons");
      return response.json();
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
  });

  const progressMap = new Map((progress as any[])?.map((p: any) => [p.lessonId, p]) || []);

  if (isLoading) {
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
        <h1 className="text-3xl font-bold">Environmental Learning Tracks</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose your path to environmental mastery. Each track offers comprehensive lessons 
          designed to build your knowledge and earn valuable EcoCredits.
        </p>
      </div>

      {/* Track Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tracks.map((track) => (
          <div 
            key={track.name}
            className="bg-card rounded-lg border border-border p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedTrack(track.name)}
            data-testid={`card-track-${track.name}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${track.color}`}>
              <i className={`${track.icon} text-2xl`}></i>
            </div>
            <h3 className="font-semibold mb-2">{track.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{track.description}</p>
            <Button 
              variant={selectedTrack === track.name ? "default" : "outline"} 
              size="sm"
              data-testid={`button-select-track-${track.name}`}
            >
              {selectedTrack === track.name ? "Selected" : "Explore"}
            </Button>
          </div>
        ))}
      </div>

      {/* Lesson Filter Tabs */}
      <Tabs value={selectedTrack} onValueChange={setSelectedTrack} className="w-full">
        <TabsList className="grid w-full grid-cols-5" data-testid="tabs-lesson-filter">
          <TabsTrigger value="all" data-testid="tab-all-lessons">All Lessons</TabsTrigger>
          <TabsTrigger value="EcoExplorer" data-testid="tab-ecoexplorer">EcoExplorer</TabsTrigger>
          <TabsTrigger value="ClimateChampion" data-testid="tab-climatechampion">ClimateChampion</TabsTrigger>
          <TabsTrigger value="WasteWarrior" data-testid="tab-wastewarrior">WasteWarrior</TabsTrigger>
          <TabsTrigger value="GreenInnovator" data-testid="tab-greeninnovator">GreenInnovator</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTrack} className="mt-8">
          {lessons && lessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson: any) => (
                <LessonCard 
                  key={lesson.id} 
                  lesson={lesson} 
                  progress={progressMap.get(lesson.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-book-open text-4xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-semibold mb-2">No Lessons Available</h3>
              <p className="text-muted-foreground">
                {selectedTrack === "all" 
                  ? "No lessons have been created yet." 
                  : `No lessons available for ${selectedTrack} track.`
                }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
