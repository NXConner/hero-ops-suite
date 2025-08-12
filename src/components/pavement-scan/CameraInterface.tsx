import { useEffect, useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  Crosshair,
  Focus,
  Zap,
  AlertCircle,
  CheckCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { DefectData } from "@/pages/PavementScanPro";

interface CameraInterfaceProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isScanning: boolean;
  scanningMode: "perimeter" | "interior" | "complete";
  onFrameCapture: (frame: string) => void;
  onDefectDetected: (defect: DefectData) => void;
}

interface DetectionOverlay {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  confidence: number;
  timestamp: number;
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({
  videoRef,
  canvasRef,
  isScanning,
  scanningMode,
  onFrameCapture,
  onDefectDetected,
}) => {
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [frameRate, setFrameRate] = useState(0);
  const [detectionOverlays, setDetectionOverlays] = useState<DetectionOverlay[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [exposureOptimal, setExposureOptimal] = useState(true);
  const [focusLocked, setFocusLocked] = useState(false);
  const [scanGuidance, setScanGuidance] = useState<string>("");

  const webcamRef = useRef<Webcam>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number>();

  // Mock AI detection function - in production this would use TensorFlow.js or similar
  const detectDefects = useCallback(
    (imageData: ImageData) => {
      // Simulate defect detection with random results
      if (Math.random() > 0.95) {
        // 5% chance of detecting something per frame
        const defectTypes = [
          "crack",
          "pothole",
          "alligator",
          "water_pooling",
          "gatoring",
          "broken_area",
        ] as const;
        const severities = ["low", "medium", "high", "critical"] as const;

        const x = Math.random() * imageData.width;
        const y = Math.random() * imageData.height;
        const type = defectTypes[Math.floor(Math.random() * defectTypes.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];

        const defect: DefectData = {
          id: `defect_${Date.now()}_${Math.random()}`,
          type,
          location: { x, y },
          measurements: {
            length: Math.random() * 10 + 1,
            width: Math.random() * 5 + 0.5,
            area: Math.random() * 50 + 5,
          },
          severity,
          confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
          timestamp: new Date(),
        };

        // Add visual overlay
        const overlay: DetectionOverlay = {
          id: defect.id,
          x: x - 25,
          y: y - 25,
          width: 50,
          height: 50,
          type: defect.type,
          confidence: defect.confidence,
          timestamp: Date.now(),
        };

        setDetectionOverlays((prev) => [...prev.slice(-10), overlay]); // Keep only last 10 overlays
        onDefectDetected(defect);

        // Play audio feedback if enabled
        if (audioEnabled) {
          const audio = new Audio(
            "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmskCEPq8CSDcTQG",
          ); // Mock audio data
          audio.volume = 0.3;
          audio.play().catch(() => {});
        }
      }
    },
    [audioEnabled, onDefectDetected],
  );

  // Process video frames
  const processFrame = useCallback(() => {
    if (!webcamRef.current || !isScanning || !cameraReady) return;

    const video = webcamRef.current.video;
    const canvas = overlayCanvasRef.current;

    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data for AI processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Run defect detection
        detectDefects(imageData);

        // Capture frame for 3D reconstruction
        const frameData = canvas.toDataURL("image/jpeg", 0.8);
        onFrameCapture(frameData);

        // Update frame rate
        frameCountRef.current++;
        const now = Date.now();
        if (now - lastFrameTimeRef.current >= 1000) {
          setFrameRate(frameCountRef.current);
          frameCountRef.current = 0;
          lastFrameTimeRef.current = now;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [isScanning, cameraReady, detectDefects, onFrameCapture]);

  // Start/stop frame processing
  useEffect(() => {
    if (isScanning && cameraReady) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning, cameraReady, processFrame]);

  // Update scanning guidance based on mode
  useEffect(() => {
    switch (scanningMode) {
      case "perimeter":
        setScanGuidance(
          "Walk slowly around the perimeter of the area. Keep the camera pointed down at a 45° angle.",
        );
        break;
      case "interior":
        setScanGuidance(
          "Move in a grid pattern across the interior surface. Overlap your paths by 30%.",
        );
        break;
      case "complete":
        setScanGuidance(
          "First scan the perimeter, then switch to interior mode for detailed surface analysis.",
        );
        break;
    }
  }, [scanningMode]);

  // Remove old overlays
  useEffect(() => {
    const interval = setInterval(() => {
      setDetectionOverlays(
        (prev) => prev.filter((overlay) => Date.now() - overlay.timestamp < 3000), // Remove after 3 seconds
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCameraReady = useCallback(() => {
    setCameraReady(true);
    setCameraError(null);
  }, []);

  const handleCameraError = useCallback((error: string | DOMException) => {
    setCameraError(typeof error === "string" ? error : error.message);
    setCameraReady(false);
  }, []);

  const videoConstraints = {
    width: 1920,
    height: 1080,
    facingMode: "environment", // Use back camera on mobile
    frameRate: 30,
  };

  const getOverlayColor = (type: string) => {
    switch (type) {
      case "crack":
        return "#ef4444"; // red
      case "pothole":
        return "#dc2626"; // dark red
      case "alligator":
        return "#f97316"; // orange
      case "water_pooling":
        return "#3b82f6"; // blue
      case "gatoring":
        return "#eab308"; // yellow
      case "broken_area":
        return "#8b5cf6"; // purple
      default:
        return "#ef4444";
    }
  };

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      {/* Camera Error */}
      {cameraError && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Camera Error: {cameraError}. Please check permissions and try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Camera Stream */}
      <div className="relative aspect-video bg-black">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={videoConstraints}
          onUserMedia={handleCameraReady}
          onUserMediaError={handleCameraError}
          className="w-full h-full object-cover"
          screenshotFormat="image/jpeg"
          screenshotQuality={0.8}
        />

        {/* Processing Overlay Canvas */}
        <canvas ref={overlayCanvasRef} className="absolute inset-0 pointer-events-none opacity-0" />

        {/* AR Overlays */}
        {isScanning &&
          detectionOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className="absolute border-2 rounded animate-pulse"
              style={{
                left: `${(overlay.x / 1920) * 100}%`,
                top: `${(overlay.y / 1080) * 100}%`,
                width: `${(overlay.width / 1920) * 100}%`,
                height: `${(overlay.height / 1080) * 100}%`,
                borderColor: getOverlayColor(overlay.type),
                backgroundColor: `${getOverlayColor(overlay.type)}20`,
              }}
            >
              <div
                className="absolute -top-6 left-0 text-xs font-bold px-1 rounded text-white"
                style={{ backgroundColor: getOverlayColor(overlay.type) }}
              >
                {overlay.type} ({Math.round(overlay.confidence * 100)}%)
              </div>
            </div>
          ))}

        {/* Scanning Crosshair */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Crosshair className="h-12 w-12 text-green-400 animate-pulse" />
          </div>
        )}

        {/* Camera Status Indicators */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge variant={cameraReady ? "default" : "destructive"} className="w-fit">
            <Camera className="h-3 w-3 mr-1" />
            {cameraReady ? "Camera Ready" : "Camera Error"}
          </Badge>

          {isScanning && (
            <>
              <Badge variant="outline" className="bg-black/50 text-white border-white/50">
                <Zap className="h-3 w-3 mr-1" />
                {frameRate} FPS
              </Badge>

              <Badge variant={exposureOptimal ? "default" : "secondary"} className="w-fit">
                <Focus className="h-3 w-3 mr-1" />
                {exposureOptimal ? "Exposure OK" : "Adjusting"}
              </Badge>

              <Badge variant={focusLocked ? "default" : "secondary"} className="w-fit">
                <CheckCircle className="h-3 w-3 mr-1" />
                {focusLocked ? "Focus Locked" : "Focusing"}
              </Badge>
            </>
          )}
        </div>

        {/* Audio Control */}
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="bg-black/50 border-white/50 text-white hover:bg-white/20"
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>

        {/* Scanning Mode Indicator */}
        {isScanning && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/70 text-white p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-medium">Scanning: {scanningMode.toUpperCase()}</span>
              </div>
              <p className="text-sm text-gray-300">{scanGuidance}</p>
            </div>
          </div>
        )}

        {/* No Camera State */}
        {!cameraReady && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Initializing Camera...</p>
              <p className="text-sm text-gray-400">Please allow camera access when prompted</p>
            </div>
          </div>
        )}
      </div>

      {/* Camera Info Bar */}
      <div className="bg-gray-900 text-white p-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>Resolution: 1920x1080</span>
            <span>•</span>
            <span>Frame Rate: {frameRate} fps</span>
            <span>•</span>
            <span>Defects Detected: {detectionOverlays.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">AI Processing:</span>
            <div
              className={`w-2 h-2 rounded-full ${isScanning ? "bg-green-400 animate-pulse" : "bg-gray-500"}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraInterface;
