import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdvancedEcosystemCanvas from "./AdvancedEcosystemCanvas";

interface SimulationInterfaceProps {
  isRunning: boolean;
  onComplete: (results: any) => void;
  onStop: () => void;
}

interface SimulationState {
  co2Levels: number;
  forestCover: number;
  temperature: number;
  renewableEnergy: number;
  population: number;
  industryLevel: number;
}

interface SimulationMetrics {
  speciesCount: number;
  airQuality: string;
  carbonStorage: number;
  biodiversityIndex: number;
  sustainabilityScore: number;
}

export default function SimulationInterface({ isRunning, onComplete, onStop }: SimulationInterfaceProps) {
  const { toast } = useToast();
  const [simulationState, setSimulationState] = useState<SimulationState>({
    co2Levels: 410,
    forestCover: 65,
    temperature: 1.2,
    renewableEnergy: 25,
    population: 50,
    industryLevel: 60,
  });

  const [metrics, setMetrics] = useState<SimulationMetrics>({
    speciesCount: 1247,
    airQuality: "Good",
    carbonStorage: 2.3,
    biodiversityIndex: 75,
    sustainabilityScore: 68,
  });

  const [timeElapsed, setTimeElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const simulationAction = useMutation({
    mutationFn: async (actionData: any) => {
      const response = await apiRequest("POST", "/api/eco-actions", {
        type: "simulation_action",
        description: `${actionData.actionType}: Applied ${actionData.impact} unit impact in ecosystem simulation`,
        xpEarned: Math.max(25, actionData.impact * 5),
        creditsEarned: Math.max(5, actionData.impact * 2),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Action Recorded!",
        description: `You earned ${(data as any).xpEarned} XP and ${(data as any).creditsEarned} EcoCredits`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record simulation action",
        variant: "destructive",
      });
    },
  });

  // Calculate metrics based on simulation state
  useEffect(() => {
    const calculateMetrics = () => {
      const { co2Levels, forestCover, temperature, renewableEnergy, population, industryLevel } = simulationState;
      
      // Species count decreases with higher CO2, temperature, and industry; increases with forest cover
      const speciesCountBase = 1500;
      const co2Impact = (co2Levels - 350) * -2;
      const forestImpact = (forestCover - 50) * 4;
      const tempImpact = temperature * -100;
      const speciesCount = Math.max(100, Math.round(speciesCountBase + co2Impact + forestImpact + tempImpact));

      // Air quality based on CO2 levels and renewable energy
      let airQuality = "Excellent";
      const adjustedCo2 = co2Levels - (renewableEnergy * 2);
      if (adjustedCo2 > 450) airQuality = "Poor";
      else if (adjustedCo2 > 420) airQuality = "Moderate";
      else if (adjustedCo2 > 380) airQuality = "Good";

      // Carbon storage increases with forest cover, decreases with industry
      const carbonStorage = Math.max(0, ((forestCover / 100) * 3.5) - ((industryLevel / 100) * 1.2));

      // Biodiversity index
      const biodiversityIndex = Math.max(0, Math.min(100, 
        (forestCover * 0.6) + 
        ((100 - co2Levels + 300) / 10) + 
        (renewableEnergy * 0.3) - 
        (temperature * 5) - 
        (industryLevel * 0.2)
      ));

      // Sustainability score
      const sustainabilityScore = Math.max(0, Math.min(100,
        (renewableEnergy * 0.4) + 
        (forestCover * 0.3) + 
        ((100 - industryLevel + 50) * 0.2) + 
        ((450 - co2Levels) / 10) - 
        (temperature * 3)
      ));

      setMetrics({
        speciesCount: Math.round(speciesCount),
        airQuality,
        carbonStorage: Math.round(carbonStorage * 10) / 10,
        biodiversityIndex: Math.round(biodiversityIndex),
        sustainabilityScore: Math.round(sustainabilityScore),
      });
    };

    calculateMetrics();
  }, [simulationState]);

  // Simulation timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleParameterChange = (parameter: keyof SimulationState, value: number[]) => {
    setSimulationState(prev => ({
      ...prev,
      [parameter]: value[0]
    }));
  };

  const handleActionClick = async (actionType: string, impact: number) => {
    // Record the action
    await simulationAction.mutateAsync({
      actionType,
      impact,
    });

    // Apply the action to simulation state
    switch (actionType) {
      case "Plant Trees":
        setSimulationState(prev => ({
          ...prev,
          forestCover: Math.min(100, prev.forestCover + impact)
        }));
        break;
      case "Add Solar":
        setSimulationState(prev => ({
          ...prev,
          renewableEnergy: Math.min(100, prev.renewableEnergy + impact)
        }));
        break;
      case "Wind Power":
        setSimulationState(prev => ({
          ...prev,
          renewableEnergy: Math.min(100, prev.renewableEnergy + impact),
          co2Levels: Math.max(350, prev.co2Levels - impact * 2)
        }));
        break;
    }
  };

  const handleStopSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const results = {
      timeElapsed,
      finalMetrics: metrics,
      biodiversityChange: metrics.biodiversityIndex - 75, // Assuming 75 was baseline
      carbonChange: (simulationState.co2Levels - 410) / 4.1, // Percentage change from baseline
      temperatureChange: simulationState.temperature - 1.2, // Change from baseline
      sustainabilityIndex: metrics.sustainabilityScore,
      economicValue: metrics.sustainabilityScore * 1000,
      xpEarned: Math.max(50, Math.round(metrics.sustainabilityScore * 2)),
      creditsEarned: Math.max(10, Math.round(metrics.biodiversityIndex / 2)),
    };

    onComplete(results);
    onStop();
    setTimeElapsed(0);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-globe-americas text-primary"></i>
            <span>Ecosystem Simulation</span>
          </CardTitle>
          {isRunning && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground" data-testid="text-simulation-time">
                Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </span>
              <Button variant="destructive" size="sm" onClick={handleStopSimulation} data-testid="button-stop-simulation">
                <i className="fas fa-stop mr-2"></i>
                Stop
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Advanced Canvas Simulation Visualization */}
        <div className="min-h-96">
          <AdvancedEcosystemCanvas
            simulationState={simulationState}
            metrics={metrics}
            isRunning={isRunning}
          />
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Environmental Controls */}
          <div className="space-y-4">
            <h4 className="font-semibold">Environmental Factors</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">CO₂ Levels (ppm)</label>
                <span className="text-sm font-medium" data-testid="text-co2-value">{simulationState.co2Levels}</span>
              </div>
              <Slider
                value={[simulationState.co2Levels]}
                onValueChange={(value) => handleParameterChange('co2Levels', value)}
                min={350}
                max={500}
                step={5}
                disabled={isRunning}
                data-testid="slider-co2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Forest Cover (%)</label>
                <span className="text-sm font-medium" data-testid="text-forest-value">{simulationState.forestCover}</span>
              </div>
              <Slider
                value={[simulationState.forestCover]}
                onValueChange={(value) => handleParameterChange('forestCover', value)}
                min={0}
                max={100}
                step={1}
                disabled={isRunning}
                data-testid="slider-forest"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Temperature (+°C)</label>
                <span className="text-sm font-medium" data-testid="text-temperature-value">{simulationState.temperature}</span>
              </div>
              <Slider
                value={[simulationState.temperature]}
                onValueChange={(value) => handleParameterChange('temperature', value)}
                min={-2}
                max={5}
                step={0.1}
                disabled={isRunning}
                data-testid="slider-temperature"
              />
            </div>
          </div>

          {/* Human Impact Controls */}
          <div className="space-y-4">
            <h4 className="font-semibold">Human Activities</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Renewable Energy (%)</label>
                <span className="text-sm font-medium" data-testid="text-renewable-value">{simulationState.renewableEnergy}</span>
              </div>
              <Slider
                value={[simulationState.renewableEnergy]}
                onValueChange={(value) => handleParameterChange('renewableEnergy', value)}
                min={0}
                max={100}
                step={1}
                disabled={isRunning}
                data-testid="slider-renewable"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Industry Level (%)</label>
                <span className="text-sm font-medium" data-testid="text-industry-value">{simulationState.industryLevel}</span>
              </div>
              <Slider
                value={[simulationState.industryLevel]}
                onValueChange={(value) => handleParameterChange('industryLevel', value)}
                min={0}
                max={100}
                step={1}
                disabled={isRunning}
                data-testid="slider-industry"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Population Density (%)</label>
                <span className="text-sm font-medium" data-testid="text-population-value">{simulationState.population}</span>
              </div>
              <Slider
                value={[simulationState.population]}
                onValueChange={(value) => handleParameterChange('population', value)}
                min={0}
                max={100}
                step={1}
                disabled={isRunning}
                data-testid="slider-population"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <h4 className="font-semibold">Conservation Actions</h4>
            
            <Button
              onClick={() => handleActionClick("Plant Trees", 5)}
              disabled={!isRunning || simulationAction.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-plant-trees"
            >
              <i className="fas fa-seedling mr-2"></i>
              Plant Trees (+5% Forest)
            </Button>

            <Button
              onClick={() => handleActionClick("Add Solar", 10)}
              disabled={!isRunning || simulationAction.isPending}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              data-testid="button-add-solar"
            >
              <i className="fas fa-solar-panel mr-2"></i>
              Add Solar (+10% Renewable)
            </Button>

            <Button
              onClick={() => handleActionClick("Wind Power", 8)}
              disabled={!isRunning || simulationAction.isPending}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              data-testid="button-wind-power"
            >
              <i className="fas fa-wind mr-2"></i>
              Wind Power (+8% Renewable)
            </Button>

            {/* Impact Summary */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <h5 className="font-medium text-sm mb-2">Current Impact</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Carbon Storage:</span>
                  <span className="font-medium" data-testid="text-carbon-storage">{metrics.carbonStorage} GT</span>
                </div>
                <div className="flex justify-between">
                  <span>Biodiversity:</span>
                  <span className="font-medium" data-testid="text-biodiversity-summary">{metrics.biodiversityIndex}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Sustainability:</span>
                  <span className="font-medium" data-testid="text-sustainability-summary">{metrics.sustainabilityScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
