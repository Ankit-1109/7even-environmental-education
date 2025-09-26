import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ARScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const scanMutation = useMutation({
    mutationFn: async (scanType: string) => {
      // Simulate AR scanning process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create eco action for the scan
      return apiRequest("POST", "/api/eco-actions", {
        type: "ar_scan",
        description: `AR Scan: ${scanType}`,
        xpEarned: 25,
        creditsEarned: 10,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Great Scan!",
        description: `You earned ${(data as any).xpEarned} XP and ${(data as any).creditsEarned} EcoCredits`,
      });
      setIsScanning(false);
    },
    onError: () => {
      toast({
        title: "Scan Failed",
        description: "Please try again",
        variant: "destructive",
      });
      setIsScanning(false);
    },
  });

  const handleScan = () => {
    setIsScanning(true);
    // Simulate different scan types
    const scanTypes = ["Plant Species", "Recyclable Material", "Air Quality"];
    const randomType = scanTypes[Math.floor(Math.random() * scanTypes.length)];
    scanMutation.mutate(randomType);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleScan}
        disabled={isScanning || scanMutation.isPending}
        className="w-full flex items-center justify-between p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        data-testid="button-ar-scanner"
      >
        <div className="flex items-center space-x-3">
          <i className="fas fa-camera text-white"></i>
          <span>{isScanning ? "Scanning..." : "AR Scanner"}</span>
        </div>
        <i className="fas fa-chevron-right text-gray-300"></i>
      </Button>

      {isScanning && (
        <div className="bg-gradient-to-b from-sky-400 to-green-400 rounded-lg p-8 text-center text-white">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-crosshairs text-2xl animate-spin"></i>
            </div>
            <p className="text-sm">Analyzing environmental data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
