import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import { useSpeech } from "@/hooks/use-speech";
import { useToast } from "@/hooks/use-toast";

import { VoiceInteraction } from "@/components/voice-interaction";
import { VisionModule } from "@/components/vision-module";
import { AudioModule } from "@/components/audio-module";
import { TextModule } from "@/components/text-module";
import { NavigationInstructions } from "@/components/navigation-instructions";
import { EmergencyControls } from "@/components/emergency-controls";
import { Button } from "@/components/ui/button";

import { Home, Settings, History, HelpCircle } from "lucide-react";
import type { NavigationSession, DetectedObject, AudioEvent, RecognizedText } from "@shared/schema";

export default function HomePage() {
  const [activeSession, setActiveSession] = useState<NavigationSession | null>(null);
  const [recognizedTexts, setRecognizedTexts] = useState<RecognizedText[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isConnected, lastMessage } = useWebSocket();
  const { speak } = useSpeech();

  // Get active navigation session
  const { data: sessionData } = useQuery({
    queryKey: ['/api/navigation/active'],
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (sessionData) {
      setActiveSession(sessionData as NavigationSession);
    }
  }, [sessionData]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'vision_analysis':
          if (lastMessage.analysis?.textContent) {
            setRecognizedTexts(prev => [
              ...lastMessage.analysis.textContent.map((text: any) => ({
                ...text,
                timestamp: new Date().toISOString()
              })),
              ...prev
            ].slice(0, 10));
          }
          break;
        case 'navigation_instruction':
          if (lastMessage.instruction?.instruction) {
            speak(lastMessage.instruction.instruction);
            toast({
              title: "New Navigation Instruction",
              description: lastMessage.instruction.instruction,
            });
          }
          break;
        case 'audio_analysis':
          if (lastMessage.analysis?.events) {
            const urgentEvents = lastMessage.analysis.events.filter(
              (event: any) => event.importance === 'high' || event.actionRequired
            );
            urgentEvents.forEach((event: any) => {
              speak(`Important: ${event.content}`);
              toast({
                title: "Important Audio Alert",
                description: event.content,
                variant: "destructive",
              });
            });
          }
          break;
      }
    }
  }, [lastMessage, speak, toast]);

  // Start navigation session
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/navigation/start', {
        userId: 'anonymous',
        currentInstruction: 'Navigation started. Please provide your destination.',
        totalSteps: 1
      });
      return response.json();
    },
    onSuccess: (data) => {
      setActiveSession(data);
      queryClient.invalidateQueries({ queryKey: ['/api/navigation/active'] });
      speak("Navigation session started. How can I help you?");
      toast({
        title: "Navigation Started",
        description: "Your navigation session is now active.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start navigation session.",
        variant: "destructive",
      });
    }
  });

  // Generate navigation instruction
  const generateInstructionMutation = useMutation({
    mutationFn: async (data: { userQuery?: string; destination?: string }) => {
      if (!activeSession) throw new Error('No active session');
      
      const response = await apiRequest('POST', '/api/navigation/instruction', {
        sessionId: activeSession.id,
        userQuery: data.userQuery,
        destination: data.destination,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (activeSession) {
        setActiveSession(prev => prev ? { ...prev, currentInstruction: data.instruction } : null);
        speak(data.instruction);
        queryClient.invalidateQueries({ queryKey: ['/api/navigation/active'] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate navigation instruction.",
        variant: "destructive",
      });
    }
  });

  // Update session progress
  const updateProgressMutation = useMutation({
    mutationFn: async () => {
      if (!activeSession) throw new Error('No active session');
      
      const response = await apiRequest('PATCH', `/api/navigation/${activeSession.id}`, {
        progress: (activeSession.progress || 0) + 1
      });
      return response.json();
    },
    onSuccess: (data) => {
      setActiveSession(data);
      queryClient.invalidateQueries({ queryKey: ['/api/navigation/active'] });
      speak("Step completed. What's next?");
    }
  });

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('help') || lowerCommand.includes('navigate')) {
      if (!activeSession) {
        startSessionMutation.mutate();
      } else {
        generateInstructionMutation.mutate({ userQuery: command });
      }
    } else if (lowerCommand.includes('go to') || lowerCommand.includes('find')) {
      const destination = command.replace(/^.*(go to|find)\s*/i, '');
      generateInstructionMutation.mutate({ userQuery: command, destination });
    } else if (lowerCommand.includes('stop') || lowerCommand.includes('end')) {
      handleEmergencyStop();
    } else {
      generateInstructionMutation.mutate({ userQuery: command });
    }
  };

  const handleVisionAnalysis = (data: any) => {
    // Vision analysis is handled via WebSocket messages
    console.log('Vision analysis received:', data);
  };

  const handleAudioEvent = (events: any[]) => {
    // Audio events are handled via WebSocket messages
    console.log('Audio events received:', events);
  };

  const handleRepeatInstruction = () => {
    if (activeSession?.currentInstruction) {
      speak(activeSession.currentInstruction);
    }
  };

  const handleMarkCompleted = () => {
    updateProgressMutation.mutate();
  };

  const handleEmergencyStop = () => {
    speak("Emergency stop activated. Navigation paused.");
    toast({
      title: "Emergency Stop",
      description: "Navigation has been stopped for safety.",
      variant: "destructive",
    });
  };

  const handleRequestHelp = () => {
    speak("Help request sent. Please wait for assistance.");
    toast({
      title: "Help Requested",
      description: "Assistance has been requested.",
    });
  };

  const handlePauseNavigation = () => {
    speak("Navigation paused.");
    toast({
      title: "Navigation Paused",
      description: "Navigation has been temporarily paused.",
    });
  };

  return (
    <div className="max-w-md mx-auto bg-nav-surface min-h-screen shadow-xl">
      {/* Header */}
      <header className="bg-nav-primary text-white p-6 text-center" role="banner">
        <h1 className="text-xl-accessible font-bold">NaviVision</h1>
        <p className="text-accessible mt-2">Navigation Assistant</p>
        <div className="flex items-center justify-center mt-3 space-x-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-nav-secondary pulse-animation' : 'bg-gray-400'
            }`} 
            aria-label={isConnected ? "System Active" : "System Inactive"}
          />
          <span className="text-sm">
            {isConnected ? "System Active" : "System Inactive"}
          </span>
        </div>
      </header>

      {/* Voice Interaction */}
      <VoiceInteraction onCommand={handleVoiceCommand} />

      {/* Vision Module */}
      <VisionModule 
        sessionId={activeSession?.id || null}
        onAnalysis={handleVisionAnalysis}
      />

      {/* Audio Module */}
      <AudioModule 
        sessionId={activeSession?.id || null}
        onAudioEvent={handleAudioEvent}
      />

      {/* Text Module */}
      <TextModule recognizedTexts={recognizedTexts} />

      {/* Navigation Instructions */}
      <NavigationInstructions
        currentInstruction={activeSession?.currentInstruction || ""}
        progress={activeSession?.progress || 0}
        totalSteps={activeSession?.totalSteps || 0}
        onRepeat={handleRepeatInstruction}
        onMarkCompleted={handleMarkCompleted}
      />

      {/* Emergency Controls */}
      <EmergencyControls
        onEmergencyStop={handleEmergencyStop}
        onRequestHelp={handleRequestHelp}
        onPauseNavigation={handlePauseNavigation}
      />

      {/* Bottom Navigation */}
      <nav className="bg-white border-t-2 border-gray-200 p-4" role="navigation" aria-label="Main navigation">
        <div className="grid grid-cols-4 gap-2">
          <Button 
            className="flex flex-col items-center py-3 px-2 bg-nav-primary text-white hover:bg-blue-700"
            aria-label="Home screen">
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </Button>
          
          <Button 
            variant="ghost"
            className="flex flex-col items-center py-3 px-2 text-gray-600 hover:bg-gray-100"
            aria-label="Settings">
            <Settings size={24} />
            <span className="text-xs mt-1">Settings</span>
          </Button>
          
          <Button 
            variant="ghost"
            className="flex flex-col items-center py-3 px-2 text-gray-600 hover:bg-gray-100"
            aria-label="Navigation history">
            <History size={24} />
            <span className="text-xs mt-1">History</span>
          </Button>
          
          <Button 
            variant="ghost"
            className="flex flex-col items-center py-3 px-2 text-gray-600 hover:bg-gray-100"
            aria-label="Help and tutorials">
            <HelpCircle size={24} />
            <span className="text-xs mt-1">Help</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
