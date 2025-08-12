// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  X as CloseIcon,
  Play,
  Pause,
  Square,
  RotateCcw,
  Zap,
  Brain,
  Shield,
} from "lucide-react";

interface VoiceCommand {
  id: string;
  command: string;
  confidence: number;
  timestamp: Date;
  status: "processing" | "completed" | "failed";
  response?: string;
}

interface VoiceCommandInterfaceProps {
  isVisible: boolean;
  onClose: () => void;
  terminologyMode: "military" | "civilian" | "both";
  onCommand?: (command: any) => void;
}

const VoiceCommandInterface: React.FC<VoiceCommandInterfaceProps> = ({
  isVisible,
  onClose,
  terminologyMode,
  onCommand,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<string>("");
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const getTerminology = (military: string, civilian: string) => {
    switch (terminologyMode) {
      case "military":
        return military;
      case "civilian":
        return civilian;
      case "both":
        return `${military} / ${civilian}`;
      default:
        return military;
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      setIsListening(true);
      simulateVoiceRecognition();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopListening = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
    setAudioLevel(0);
  };

  const simulateVoiceRecognition = () => {
    const commands = [
      "Show tactical overview",
      "Zoom to coordinates Alpha Seven",
      "Display team positions",
      "Switch to thermal imaging",
      "Request air support",
      "Update mission status",
    ];

    setTimeout(() => {
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      const confidence = 0.6 + Math.random() * 0.4;

      setCurrentCommand(randomCommand);
      setIsProcessing(true);

      setTimeout(() => {
        const newCommand: VoiceCommand = {
          id: Date.now().toString(),
          command: randomCommand,
          confidence,
          timestamp: new Date(),
          status: confidence > confidenceThreshold ? "completed" : "failed",
          response:
            confidence > confidenceThreshold
              ? `Executed: ${randomCommand}`
              : "Command not recognized",
        };

        setCommandHistory((prev) => [newCommand, ...prev.slice(0, 9)]);
        setIsProcessing(false);
        setCurrentCommand("");
        stopListening();
      }, 2000);
    }, 3000);
  };

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isListening]);

  if (!isVisible) return null;

  return (
    <Card className="absolute top-4 right-4 w-96 z-[1000] bg-slate-900/95 border-cyan-500/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-cyan-400 text-lg flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {getTerminology("AI Command Interface", "Voice Assistant")}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-cyan-400 p-1"
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            size="lg"
            variant={isListening ? "destructive" : "default"}
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={isListening ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isListening ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
            {isListening ? "Stop" : "Listen"}
          </Button>

          <Button variant="outline" size="icon" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Audio Level Indicator */}
        {isListening && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Audio Level</span>
              <Badge variant="outline" className="text-green-400 border-green-500/30">
                ACTIVE
              </Badge>
            </div>
            <Progress value={audioLevel} className="h-2" />
          </div>
        )}

        {/* Current Processing */}
        {isProcessing && (
          <div className="bg-slate-800 p-3 rounded border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-sm font-medium text-cyan-400">Processing Command</span>
            </div>
            <p className="text-sm text-slate-300">"{currentCommand}"</p>
            <Progress value={66} className="h-1 mt-2" />
          </div>
        )}

        {/* Command History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Recent Commands</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandHistory([])}
              className="text-xs text-slate-400 hover:text-cyan-400"
            >
              Clear
            </Button>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-2">
            {commandHistory.map((cmd) => (
              <div
                key={cmd.id}
                className="bg-slate-800 p-2 rounded text-xs border border-slate-600"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300">{cmd.command}</span>
                  <Badge
                    variant={cmd.status === "completed" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {Math.round(cmd.confidence * 100)}%
                  </Badge>
                </div>
                {cmd.response && (
                  <p
                    className={`text-xs ${
                      cmd.status === "completed" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {cmd.response}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="pt-2 border-t border-slate-600">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Confidence Threshold</span>
            <span className="text-cyan-400">{Math.round(confidenceThreshold * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="0.9"
            step="0.1"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full mt-1 accent-cyan-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceCommandInterface;
