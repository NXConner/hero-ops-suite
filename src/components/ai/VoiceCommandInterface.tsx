// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Zap, 
  Settings, 
  X as CloseIcon,
  Play,
  Pause,
  RotateCcw,
  Send
} from 'lucide-react';

interface CommandParameters {
  location?: { lat: number; lng: number };
  distance?: number;
  time?: string;
  filter?: string;
  value?: string | number;
  [key: string]: unknown;
}

interface VoiceCommand {
  id: string;
  text: string;
  confidence: number;
  timestamp: Date;
  response: string;
  action?: string;
  parameters?: CommandParameters;
  success: boolean;
}

interface VoiceCommandInterfaceProps {
  isVisible: boolean;
  onCommand?: (command: VoiceCommand) => void;
  terminologyMode: 'military' | 'civilian' | 'both';
  onClose?: () => void;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// Extend the Window interface for Speech Recognition
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  grammars: SpeechGrammarList;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechGrammarList {
  [index: number]: SpeechGrammar;
  length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

const VoiceCommandInterface: React.FC<VoiceCommandInterfaceProps> = ({
  isVisible,
  onCommand,
  terminologyMode,
  onClose
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [supportedCommands, setSupportedCommands] = useState<string[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getTerminology = useCallback((military: string, civilian: string) => {
    switch (terminologyMode) {
      case 'military': return military;
      case 'civilian': return civilian;
      case 'both': return `${military} / ${civilian}`;
      default: return military;
    }
  }, [terminologyMode]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 3;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setCurrentTranscript('');
      };

              recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(finalTranscript + interimTranscript);

        if (finalTranscript) {
          processVoiceCommand(finalTranscript, event.results[event.resultIndex][0].confidence);
        }
      };

              recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          speak('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          speak('Microphone access denied. Please enable microphone permissions.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setCurrentTranscript('');
      };
    }

    // Initialize supported commands
    setSupportedCommands([
      'Show weather overlay',
      'Hide weather overlay',
      'Show fleet tracking',
      'Hide fleet tracking',
      'Zoom to coordinates',
      'Find nearest vehicle',
      'Show defects',
      'Hide defects',
      'Switch to satellite view',
      'Switch to map view',
      'Create new project',
      'Show alerts',
      'Acknowledge alerts',
      'Export data',
      'Take screenshot',
      'Start measuring',
      'Stop measuring',
      'Clear drawings',
      'Save layout',
      'Load layout'
    ]);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Process voice commands using natural language understanding
  const processVoiceCommand = useCallback(async (transcript: string, confidence: number) => {
    setIsProcessing(true);
    
    try {
      const command = await parseCommand(transcript.toLowerCase().trim());
      
      const voiceCommand: VoiceCommand = {
        id: Date.now().toString(),
        text: transcript,
        confidence,
        timestamp: new Date(),
        response: command.response,
        action: command.action,
        parameters: command.parameters,
        success: command.success
      };

      setCommandHistory(prev => [voiceCommand, ...prev.slice(0, 49)]); // Keep last 50 commands

      if (command.success && command.action) {
        onCommand?.(voiceCommand);
        speak(command.response);
      } else {
        speak(command.response);
      }
    } catch (error) {
      console.error('Command processing error:', error);
      speak('Sorry, I could not process that command. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onCommand, parseCommand, speak]);

  // Natural Language Understanding for commands
  const parseCommand = useCallback(async (input: string): Promise<{
    action?: string;
    parameters?: CommandParameters;
    response: string;
    success: boolean;
  }> => {
    // Remove wake words
    const cleanInput = input.replace(/^(overwatch|hey overwatch|computer|system)\s*/i, '');
    
    // Command patterns with both military and civilian terminology
    const patterns = [
      // Weather commands
      {
        pattern: /(show|display|enable).*(weather|environmental intel|conditions)/i,
        action: 'show_weather_overlay',
        response: getTerminology('Environmental intel activated', 'Weather overlay enabled')
      },
      {
        pattern: /(hide|disable|remove).*(weather|environmental intel|conditions)/i,
        action: 'hide_weather_overlay',
        response: getTerminology('Environmental intel deactivated', 'Weather overlay disabled')
      },

      // Fleet tracking commands
      {
        pattern: /(show|display|enable).*(fleet|assets|vehicles|units|personnel)/i,
        action: 'show_fleet_tracking',
        response: getTerminology('Asset tracking activated', 'Fleet tracking enabled')
      },
      {
        pattern: /(hide|disable|remove).*(fleet|assets|vehicles|units|personnel)/i,
        action: 'hide_fleet_tracking',
        response: getTerminology('Asset tracking deactivated', 'Fleet tracking disabled')
      },

      // Navigation commands
      {
        pattern: /(zoom to|go to|navigate to)\s*coordinates?\s*([\d.,\s-]+)/i,
        action: 'zoom_to_coordinates',
        extractParams: (match: RegExpMatchArray) => {
          const coords = match[2].match(/[\d.,-]+/g);
          return coords && coords.length >= 2 ? { lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) } : null;
        },
        response: 'Navigating to specified coordinates'
      },
      {
        pattern: /(find|locate|show).*(nearest|closest)\s*(vehicle|unit|asset|equipment)/i,
        action: 'find_nearest_vehicle',
        response: getTerminology('Locating nearest unit', 'Finding nearest vehicle')
      },

      // Pavement scan commands
      {
        pattern: /(show|display|enable).*(defects|cracks|problems|issues|damage|surface intel)/i,
        action: 'show_defects',
        response: getTerminology('Surface intel defects displayed', 'Pavement defects shown')
      },
      {
        pattern: /(hide|disable|remove).*(defects|cracks|problems|issues|damage|surface intel)/i,
        action: 'hide_defects',
        response: getTerminology('Surface intel defects hidden', 'Pavement defects hidden')
      },

      // Map view commands
      {
        pattern: /(switch to|change to|use)\s*(satellite|aerial|imagery)\s*(view|mode)?/i,
        action: 'switch_map_service',
        parameters: { service: 'satellite' },
        response: 'Switching to satellite view'
      },
      {
        pattern: /(switch to|change to|use)\s*(map|street|road)\s*(view|mode)?/i,
        action: 'switch_map_service',
        parameters: { service: 'osm' },
        response: 'Switching to street map view'
      },

      // Alert commands
      {
        pattern: /(show|display|list).*(alerts|warnings|notifications)/i,
        action: 'show_alerts',
        response: getTerminology('Displaying tactical alerts', 'Showing alerts')
      },
      {
        pattern: /(acknowledge|clear|dismiss).*(alerts?|warnings?|notifications?)/i,
        action: 'acknowledge_alerts',
        response: getTerminology('Alerts acknowledged', 'Alerts cleared')
      },

      // Data commands
      {
        pattern: /(export|download|save)\s*(data|information|report)/i,
        action: 'export_data',
        response: 'Exporting data'
      },
      {
        pattern: /(take|capture)\s*(screenshot|picture|image)/i,
        action: 'take_screenshot',
        response: 'Taking screenshot'
      },

      // Drawing commands
      {
        pattern: /(start|begin|enable)\s*(measuring|measurement)/i,
        action: 'start_measuring',
        response: 'Measurement mode activated'
      },
      {
        pattern: /(stop|end|disable)\s*(measuring|measurement)/i,
        action: 'stop_measuring',
        response: 'Measurement mode deactivated'
      },
      {
        pattern: /(clear|remove|delete)\s*(drawings|shapes|lines)/i,
        action: 'clear_drawings',
        response: 'Drawings cleared'
      },

      // Layout commands
      {
        pattern: /(save|store)\s*(layout|configuration|setup)/i,
        action: 'save_layout',
        response: 'Layout saved'
      },
      {
        pattern: /(load|restore)\s*(layout|configuration|setup)/i,
        action: 'load_layout',
        response: 'Layout loaded'
      },

      // What-if scenarios
      {
        pattern: /what if\s*(.*)/i,
        action: 'what_if_scenario',
        extractParams: (match: RegExpMatchArray) => ({ scenario: match[1] }),
        response: 'Analyzing scenario...'
      },

      // Status queries
      {
        pattern: /(status|state|condition)\s*(of|for)?\s*(.*)/i,
        action: 'get_status',
        extractParams: (match: RegExpMatchArray) => ({ target: match[3] || 'system' }),
        response: 'Retrieving status information'
      }
    ];

    for (const pattern of patterns) {
      const match = cleanInput.match(pattern.pattern);
      if (match) {
        let parameters = pattern.parameters || {};
        
        if (pattern.extractParams) {
          const extracted = pattern.extractParams(match);
          if (extracted) {
            parameters = { ...parameters, ...extracted };
          } else {
            return {
              response: 'Could not understand the parameters. Please try again.',
              success: false
            };
          }
        }

        return {
          action: pattern.action,
          parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
          response: pattern.response,
          success: true
        };
      }
    }

    // If no pattern matches, try to provide helpful guidance
    const suggestions = getSuggestions(cleanInput);
    return {
      response: suggestions.length > 0 
        ? `I didn't understand that command. Did you mean: ${suggestions.slice(0, 2).join(' or ')}?`
        : 'Command not recognized. Say "help" for available commands.',
      success: false
    };
  }, [terminologyMode, getSuggestions, getTerminology]);

  // Get command suggestions based on partial input
  const getSuggestions = useCallback((input: string): string[] => {
    const keywords = input.split(' ');
    const suggestions: string[] = [];

    supportedCommands.forEach(command => {
      const commandWords = command.toLowerCase().split(' ');
      const matches = keywords.filter(keyword => 
        commandWords.some(word => word.includes(keyword) || keyword.includes(word))
      ).length;
      
      if (matches > 0) {
        suggestions.push(command);
      }
    });

    return suggestions.sort((a, b) => {
      const aMatches = keywords.filter(k => a.toLowerCase().includes(k)).length;
      const bMatches = keywords.filter(k => b.toLowerCase().includes(k)).length;
      return bMatches - aMatches;
    });
  }, [supportedCommands]);

  // Text-to-speech function
  const speak = useCallback((text: string) => {
    if (!isSpeechEnabled || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Try to use a professional voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Microsoft') || 
      voice.name.includes('Google') ||
      voice.name.includes('Alex') ||
      voice.name.includes('Samantha')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSpeechEnabled]);

  // Start/stop listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      speak('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        speak('Failed to start speech recognition. Please try again.');
      }
    }
  };

  // Manual command input
  const processManualCommand = (text: string) => {
    if (text.trim()) {
      processVoiceCommand(text, 1.0);
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="absolute top-4 right-[420px] w-96 z-[800] bg-slate-900/95 border-cyan-500/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {getTerminology('Command Interface', 'Voice Control')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={isEnabled ? "text-green-400 border-green-400" : "text-slate-400 border-slate-400"}>
              {isEnabled ? 'ACTIVE' : 'DISABLED'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-cyan-400 p-1"
            >
              <CloseIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="voice" className="text-xs">Voice</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
            <TabsTrigger value="commands" className="text-xs">Commands</TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-300">Voice Recognition</Label>
                <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-300">Speech Responses</Label>
                <Switch checked={isSpeechEnabled} onCheckedChange={setIsSpeechEnabled} />
              </div>
            </div>

            {isEnabled && (
              <>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    size="sm"
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                    {isListening ? 'Stop Listening' : 'Start Listening'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speak('Voice interface ready. How can I assist you?')}
                    disabled={!isSpeechEnabled}
                  >
                    {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </div>

                {currentTranscript && (
                  <div className="bg-slate-800 p-3 rounded border border-cyan-500/30">
                    <div className="text-xs text-cyan-400 mb-1">Listening...</div>
                    <div className="text-sm text-slate-300">{currentTranscript}</div>
                  </div>
                )}

                {isProcessing && (
                  <div className="bg-slate-800 p-3 rounded border border-orange-500/30">
                    <div className="text-xs text-orange-400 mb-1">Processing command...</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-300">Analyzing input</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs text-cyan-400">Quick Commands:</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      'Show weather',
                      'Hide fleet',
                      'Take screenshot',
                      'Show alerts'
                    ].map(command => (
                      <Button
                        key={command}
                        variant="outline"
                        size="sm"
                        onClick={() => processManualCommand(command)}
                        className="text-xs h-7"
                      >
                        {command}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-cyan-400">Command History</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCommandHistory([])}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {commandHistory.length === 0 ? (
                  <div className="text-center text-slate-400 text-xs py-4">
                    No commands yet
                  </div>
                ) : (
                  commandHistory.map(command => (
                    <div key={command.id} className="bg-slate-800 p-2 rounded text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 font-mono">{command.text}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${command.success ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}`}
                        >
                          {(command.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="text-cyan-400">{command.response}</div>
                      <div className="text-slate-500 text-xs mt-1">
                        {command.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="commands" className="space-y-3">
            <Label className="text-xs text-cyan-400">Available Commands:</Label>
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {supportedCommands.map((command, index) => (
                  <div key={index} className="bg-slate-800 p-2 rounded text-xs">
                    <div className="text-slate-300">{command}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="text-xs text-slate-400">
              Prefix commands with "OverWatch" or "Computer" for better recognition.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VoiceCommandInterface;