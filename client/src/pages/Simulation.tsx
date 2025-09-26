import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import SimulationInterface from "@/components/SimulationInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Simulation() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);

  const saveScenarioMutation = useMutation({
    mutationFn: async (scenarioData: any) => {
      const response = await apiRequest("POST", "/api/eco-actions", scenarioData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Scenario Saved!",
        description: `You earned ${data.xpEarned || 75} XP and ${data.creditsEarned || 15} EcoCredits for creating an environmental scenario.`,
      });
    },
    onError: (error) => {
      console.error("Failed to save scenario:", error);
      toast({
        title: "Failed to Save Scenario",
        description: "There was an error saving your simulation scenario. Please try again.",
        variant: "destructive",
      });
    },
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSimulationComplete = (results: any) => {
    setSimulationResults(results);
    setIsSimulationRunning(false);
  };

  const handleSaveScenario = () => {
    const scenarioData = {
      type: "simulation_action",
      description: "Created and saved an environmental simulation scenario",
      xpEarned: 75,
      creditsEarned: 15,
    };
    saveScenarioMutation.mutate(scenarioData);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Ecosystem Simulation</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore the complex relationships within ecosystems. Make changes to environmental 
          factors and observe their real-time impact on biodiversity, climate, and sustainability.
        </p>
      </div>

      {/* Simulation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => setIsSimulationRunning(true)}
                disabled={isSimulationRunning}
                className="w-full"
                data-testid="button-start-simulation"
              >
                <i className="fas fa-play mr-2"></i>
                {isSimulationRunning ? "Running..." : "Start Simulation"}
              </Button>
              
              <Button variant="outline" className="w-full" data-testid="button-reset-simulation">
                <i className="fas fa-refresh mr-2"></i>
                Reset Environment
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                data-testid="button-save-scenario"
                onClick={handleSaveScenario}
                disabled={saveScenarioMutation.isPending}
              >
                <i className="fas fa-save mr-2"></i>
                {saveScenarioMutation.isPending ? "Saving..." : "Save Scenario"}
              </Button>
            </CardContent>
          </Card>

          {/* Simulation Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scenarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start" data-testid="button-scenario-deforestation">
                🌳 Deforestation Impact
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" data-testid="button-scenario-climate">
                🌡️ Climate Change
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" data-testid="button-scenario-renewable">
                ⚡ Renewable Energy
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" data-testid="button-scenario-conservation">
                🦋 Conservation Efforts
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Simulation Interface */}
        <div className="lg:col-span-3">
          <SimulationInterface 
            isRunning={isSimulationRunning}
            onComplete={handleSimulationComplete}
            onStop={() => setIsSimulationRunning(false)}
          />
        </div>
      </div>

      {/* Simulation Results */}
      {simulationResults && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Environmental Impact */}
              <div className="space-y-4">
                <h4 className="font-semibold">Environmental Impact</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Biodiversity Change</span>
                    <Badge 
                      className={simulationResults.biodiversityChange >= 0 ? 
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }
                      data-testid="badge-biodiversity-change"
                    >
                      {simulationResults.biodiversityChange >= 0 ? "+" : ""}
                      {simulationResults.biodiversityChange}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Carbon Emissions</span>
                    <Badge 
                      className={simulationResults.carbonChange <= 0 ? 
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }
                      data-testid="badge-carbon-change"
                    >
                      {simulationResults.carbonChange >= 0 ? "+" : ""}
                      {simulationResults.carbonChange}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Temperature Change</span>
                    <Badge 
                      className={simulationResults.temperatureChange <= 0 ? 
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }
                      data-testid="badge-temperature-change"
                    >
                      {simulationResults.temperatureChange >= 0 ? "+" : ""}
                      {simulationResults.temperatureChange}°C
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Economic Impact */}
              <div className="space-y-4">
                <h4 className="font-semibold">Economic Impact</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Sustainability Index</span>
                    <span className="font-medium" data-testid="text-sustainability-index">
                      {simulationResults.sustainabilityIndex}/100
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Economic Value</span>
                    <span className="font-medium" data-testid="text-economic-value">
                      ${simulationResults.economicValue?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rewards */}
              <div className="space-y-4">
                <h4 className="font-semibold">Your Rewards</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">XP Earned</span>
                    <span className="font-medium text-primary" data-testid="text-rewards-xp">
                      +{simulationResults.xpEarned || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">EcoCredits</span>
                    <span className="font-medium text-accent" data-testid="text-rewards-credits">
                      +{simulationResults.creditsEarned || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Content */}
      <Card>
        <CardHeader>
          <CardTitle>Learn More</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-seedling text-primary text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">Ecosystem Dynamics</h4>
              <p className="text-sm text-muted-foreground">
                Understand how species interact and depend on each other in complex ecosystems.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-thermometer-half text-secondary text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">Climate Impact</h4>
              <p className="text-sm text-muted-foreground">
                Explore how temperature and weather changes affect biodiversity and habitats.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-industry text-accent text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">Human Activities</h4>
              <p className="text-sm text-muted-foreground">
                See the real impact of deforestation, pollution, and urban development.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-leaf text-primary text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">Conservation</h4>
              <p className="text-sm text-muted-foreground">
                Discover how conservation efforts can restore and protect ecosystems.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
