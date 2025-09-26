import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import TensorflowARScanner from "@/components/TensorflowARScanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ARScanner() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">AI-Powered AR Scanner</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Use advanced TensorFlow.js AI models to identify plants, recyclable materials, and environmental objects. 
          Earn XP and EcoCredits based on detection accuracy!
        </p>
      </div>

      {/* Features Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <i className="fas fa-leaf text-green-500"></i>
              Plant Recognition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Identify various plant species, flowers, trees, and vegetation using MobileNet AI.
            </p>
            <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              +25-50 XP per detection
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <i className="fas fa-recycle text-blue-500"></i>
              Recycling Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Detect recyclable materials like bottles, cans, paper, and plastic items.
            </p>
            <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              +20-40 XP per detection
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <i className="fas fa-brain text-purple-500"></i>
              AI Technology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Powered by TensorFlow.js with MobileNet and COCO-SSD models for accurate detection.
            </p>
            <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Real-time AI
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* AR Scanner Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Start Scanning</CardTitle>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Point your camera at plants or recyclable objects</p>
            <p>• Keep the object in the scanning frame for best results</p>
            <p>• Allow camera permissions when prompted</p>
            <p>• AI detection happens automatically every 3 seconds</p>
          </div>
        </CardHeader>
        <CardContent>
          <TensorflowARScanner />
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-camera text-primary text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">1. Activate Camera</h4>
              <p className="text-sm text-muted-foreground">
                Click the scanner button and grant camera permissions
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-crosshairs text-secondary text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">2. Point & Focus</h4>
              <p className="text-sm text-muted-foreground">
                Aim at environmental objects within the scanning frame
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-brain text-accent text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">3. AI Analysis</h4>
              <p className="text-sm text-muted-foreground">
                TensorFlow.js models analyze and classify objects
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-trophy text-primary text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">4. Earn Rewards</h4>
              <p className="text-sm text-muted-foreground">
                Get XP and EcoCredits based on detection accuracy
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">AI Models Used</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>MobileNet v2 (α=0.5)</span>
                  <Badge variant="outline">Image Classification</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>COCO-SSD</span>
                  <Badge variant="outline">Object Detection</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>WebGL Backend</span>
                  <Badge variant="outline">Hardware Acceleration</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Detection Categories</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Plants & Vegetation</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    16+ types
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Recyclable Materials</span>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    14+ types
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Confidence Threshold</span>
                  <Badge variant="outline">30%+</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}