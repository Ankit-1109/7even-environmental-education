import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { queryClient } from '@/lib/queryClient';

interface DetectionResult {
  className: string;
  confidence: number;
  category: 'plant' | 'recyclable' | 'other';
}

export default function TensorflowARScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<any>(null);
  const cocoModelRef = useRef<any>(null);
  const { toast } = useToast();

  const scanMutation = useMutation({
    mutationFn: async (detectionData: { type: string; confidence: number; details: string }) => {
      const response = await apiRequest("POST", "/api/eco-actions", {
        type: "ar_scan",
        description: `TensorFlow AR Scan: ${detectionData.type} (${Math.round(detectionData.confidence * 100)}% confidence) - ${detectionData.details}`,
        // Let server compute rewards based on confidence
        confidence: detectionData.confidence,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI Detection Successful!",
        description: `You earned ${data.xpEarned} XP and ${data.creditsEarned} EcoCredits`,
      });
      // Invalidate cache to refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      stopCamera();
    },
    onError: () => {
      toast({
        title: "Scan Failed",
        description: "Please try again",
        variant: "destructive",
      });
      stopCamera();
    },
  });

  // Load TensorFlow.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true);
        
        // Set WebGL backend for better performance
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('TensorFlow.js is ready with WebGL backend!');
        
        // Load MobileNet for general image classification (lighter model)
        modelRef.current = await mobilenet.load({ version: 2, alpha: 0.5 });
        console.log('MobileNet model loaded');
        
        // Load COCO-SSD for object detection
        cocoModelRef.current = await cocoSsd.load();
        console.log('COCO-SSD model loaded');
        
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
        setIsModelLoading(false);
        toast({
          title: "Model Loading Failed",
          description: "AI models couldn't be loaded. Using fallback detection.",
          variant: "destructive",
        });
      }
    };

    loadModels();
  }, [toast]);

  const startCamera = async () => {
    try {
      // First check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setIsScanning(true);
        setHasSubmitted(false);
        setIsVideoReady(false);
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setIsVideoReady(true);
          toast({
            title: "Camera Ready!",
            description: "Point your camera at plants or recyclable objects to scan",
          });
        };
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      let errorMessage = "Please allow camera access to use AR scanning";
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = "Camera permission denied. Please enable camera access in your browser settings.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = "No camera found. Please ensure your device has a working camera.";
      } else if (error.name === 'NotSupportedError' || error.name === 'ConstraintNotSatisfiedError') {
        errorMessage = "Camera not supported or constraints not satisfied.";
      }
      
      toast({
        title: "Camera Access Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
    setDetectionResults([]);
    setHasSubmitted(false);
    setIsVideoReady(false);
  };

  const classifyEnvironmentalObject = (predictions: any[]): DetectionResult[] => {
    const environmentalKeywords = {
      plant: ['plant', 'flower', 'tree', 'leaf', 'grass', 'fern', 'succulent', 'mushroom', 'moss', 'vine', 'herb', 'shrub', 'weed', 'daisy', 'rose', 'tulip', 'sunflower'],
      recyclable: ['bottle', 'can', 'plastic', 'glass', 'paper', 'cardboard', 'aluminum', 'metal', 'container', 'bag', 'cup', 'box', 'carton', 'tin']
    };

    return predictions.map(pred => {
      const className = pred.className || pred.class;
      const confidence = pred.probability || pred.score;
      const lowerClassName = className.toLowerCase();
      
      let category: 'plant' | 'recyclable' | 'other' = 'other';
      
      if (environmentalKeywords.plant.some(keyword => lowerClassName.includes(keyword))) {
        category = 'plant';
      } else if (environmentalKeywords.recyclable.some(keyword => lowerClassName.includes(keyword))) {
        category = 'recyclable';
      }
      
      return {
        className,
        confidence,
        category
      };
    });
  };

  const performDetection = async () => {
    if (!videoRef.current || !canvasRef.current || !modelRef.current || !cocoModelRef.current || 
        !isVideoReady || hasSubmitted || scanMutation.isPending) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Run both models
      const [mobileNetPredictions, cocoDetections] = await Promise.all([
        modelRef.current.classify(canvas),
        cocoModelRef.current.detect(canvas)
      ]);

      // Classify predictions
      const mobileNetResults = classifyEnvironmentalObject(mobileNetPredictions.slice(0, 3));
      const cocoResults = classifyEnvironmentalObject(cocoDetections.slice(0, 3));

      // Combine and deduplicate results
      const allResults = [...mobileNetResults, ...cocoResults];
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.className === result.className)
      );

      // Sort by confidence and take top results
      const topResults = uniqueResults
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);

      setDetectionResults(topResults);

      // If we found environmental objects with good confidence, complete the scan
      const environmentalDetections = topResults.filter(r => 
        (r.category === 'plant' || r.category === 'recyclable') && r.confidence > 0.3
      );

      if (environmentalDetections.length > 0 && !hasSubmitted) {
        setHasSubmitted(true);
        const bestDetection = environmentalDetections[0];
        const details = topResults.map(r => `${r.className} (${Math.round(r.confidence * 100)}%)`).join(', ');
        
        scanMutation.mutate({
          type: bestDetection.category === 'plant' ? 'Plant Species' : 'Recyclable Material',
          confidence: bestDetection.confidence,
          details: details
        });
      }
    } catch (error) {
      console.error('Error during detection:', error);
    }
  };

  const handleScan = () => {
    if (isModelLoading) {
      toast({
        title: "Models Loading",
        description: "Please wait for AI models to finish loading",
        variant: "destructive",
      });
      return;
    }
    startCamera();
  };

  // Perform detection every 3 seconds when video is ready and scanning
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning && isCameraActive && isVideoReady) {
      interval = setInterval(performDetection, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, isCameraActive, isVideoReady, hasSubmitted]);

  return (
    <div className="space-y-4">
      <Button
        onClick={handleScan}
        disabled={isScanning || scanMutation.isPending || isModelLoading}
        className="w-full flex items-center justify-between p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
        data-testid="button-tensorflow-ar-scanner"
      >
        <div className="flex items-center space-x-3">
          <i className="fas fa-camera text-primary"></i>
          <span className="text-black">
            {isModelLoading ? "Loading AI Models..." : 
             isScanning ? "AI Scanning..." : "TensorFlow AR Scanner"}
          </span>
        </div>
        <i className="fas fa-chevron-right text-muted-foreground"></i>
      </Button>

      {isCameraActive && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-80 object-cover"
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Overlay with detection results */}
          <div className="absolute top-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg">
            <h4 className="font-semibold mb-2">AI Detection Results:</h4>
            {detectionResults.length > 0 ? (
              <div className="space-y-1 text-sm">
                {detectionResults.map((result, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className={result.category !== 'other' ? 'text-green-300' : 'text-gray-300'}>
                      {result.className}
                    </span>
                    <span className="text-xs">
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-300">Analyzing image...</p>
            )}
          </div>

          {/* Scanning crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 border-2 border-white border-dashed rounded-lg animate-pulse">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>
            </div>
          </div>

          {/* Stop button */}
          <Button
            onClick={stopCamera}
            variant="destructive"
            size="sm"
            className="absolute bottom-4 right-4"
            data-testid="button-stop-scan"
          >
            <i className="fas fa-stop mr-2"></i>
            Stop Scan
          </Button>
        </div>
      )}

      {/* Model Loading State */}
      {((isScanning && !isCameraActive) || isModelLoading) && (
        <div className="bg-gradient-to-b from-blue-500 to-purple-600 rounded-lg p-8 text-center text-white">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-brain text-2xl animate-spin"></i>
            </div>
            <p className="text-sm font-medium">
              {isModelLoading ? "Loading TensorFlow.js AI models..." : "Initializing camera..."}
            </p>
            <div className="mt-3 text-xs opacity-80">
              MobileNet & COCO-SSD models loading...
            </div>
          </div>
        </div>
      )}

      {/* Camera Permission Instructions */}
      {!isScanning && !isModelLoading && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-info text-green-600 dark:text-green-300"></i>
            </div>
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              Ready to Scan!
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              Click the scanner button above to start AI-powered environmental object detection.
              Make sure to allow camera access when prompted.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs text-green-600 dark:text-green-400">
              <div className="flex items-center gap-2">
                <i className="fas fa-leaf"></i>
                <span>Detects Plants</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-recycle"></i>
                <span>Finds Recyclables</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-trophy"></i>
                <span>Earns XP & Credits</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-brain"></i>
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}