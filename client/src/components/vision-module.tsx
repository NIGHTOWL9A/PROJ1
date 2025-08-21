import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/use-camera";
import { apiRequest } from "@/lib/queryClient";
import { Camera, CameraOff } from "lucide-react";

interface DetectedObject {
  name: string;
  description: string;
  distance: string;
  position: string;
  confidence: number;
}

interface VisionModuleProps {
  sessionId: string | null;
  onAnalysis: (data: any) => void;
}

export function VisionModule({ sessionId, onAnalysis }: VisionModuleProps) {
  const { videoRef, isActive, error, startCamera, stopCamera, captureImage } = useCamera();
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Auto-start camera when component mounts
    startCamera();
    
    // Set up automatic analysis every 3 seconds when camera is active
    let intervalId: NodeJS.Timeout;
    
    if (isActive && sessionId) {
      intervalId = setInterval(() => {
        analyzeCurrentFrame();
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      stopCamera();
    };
  }, [isActive, sessionId]);

  const analyzeCurrentFrame = async () => {
    if (!isActive || !sessionId || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      const imageBlob = await captureImage();
      
      if (imageBlob) {
        const formData = new FormData();
        formData.append('image', imageBlob);
        formData.append('sessionId', sessionId);

        const response = await apiRequest('POST', '/api/vision/analyze', formData);
        const data = await response.json();
        
        // Combine objects and obstacles
        const allObjects = [...(data.objects || []), ...(data.obstacles || [])];
        setDetectedObjects(allObjects);
        onAnalysis(data);
      }
    } catch (error) {
      console.error('Vision analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="p-6 bg-white border-b-2 border-gray-200" role="region" aria-labelledby="vision-section">
      <h2 id="vision-section" className="text-large-accessible font-bold mb-4 text-nav-primary">Vision Analysis</h2>
      
      {/* Camera Feed Status */}
      <Card className="bg-gray-100 mb-4">
        <CardContent className="pt-6 text-center min-h-[200px] flex flex-col justify-center">
          {/* Hidden video element for camera feed */}
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            className="hidden"
            aria-hidden="true"
          />
          
          <div className="text-5xl mb-3">
            {isActive ? (
              <Camera className="mx-auto text-nav-primary" size={64} />
            ) : (
              <CameraOff className="mx-auto text-gray-400" size={64} />
            )}
          </div>
          
          <p className="text-accessible font-medium mb-2">
            {isActive ? 'Camera Active' : 'Camera Inactive'}
          </p>
          
          {isActive && (
            <div className="bg-nav-secondary text-white px-3 py-1 rounded-full text-sm inline-block">
              {detectedObjects.length} objects detected
            </div>
          )}
          
          {error && (
            <p className="text-sm text-red-600 mt-2" role="alert">
              {error}
            </p>
          )}

          {isAnalyzing && (
            <p className="text-sm text-blue-600 mt-2">
              Analyzing image...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Detection Results */}
      <div className="space-y-3">
        {detectedObjects.map((object, index) => (
          <Card 
            key={index}
            className={`border-l-4 ${
              object.name.toLowerCase().includes('obstacle') || 
              object.name.toLowerCase().includes('hazard')
                ? 'border-nav-warning bg-orange-50' 
                : 'border-nav-primary bg-blue-50'
            }`}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-accessible">{object.name}</span>
                <span className="text-sm text-gray-600">{object.distance}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{object.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                Position: {object.position} | Confidence: {object.confidence}%
              </p>
            </CardContent>
          </Card>
        ))}
        
        {!isActive && (
          <Card className="border-gray-200">
            <CardContent className="p-4 text-center">
              <p className="text-gray-600">Camera not active. Enable camera to start object detection.</p>
              <Button 
                onClick={startCamera}
                className="mt-2 bg-nav-primary hover:bg-blue-700 text-white"
              >
                Enable Camera
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
