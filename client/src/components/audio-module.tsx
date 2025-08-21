import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMicrophone } from "@/hooks/use-microphone";
import { apiRequest } from "@/lib/queryClient";
import { Volume2, Car, AlertTriangle } from "lucide-react";

interface AudioEvent {
  type: string;
  content: string;
  importance: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  timestamp: string;
}

interface AudioModuleProps {
  sessionId: string | null;
  onAudioEvent: (events: AudioEvent[]) => void;
}

export function AudioModule({ sessionId, onAudioEvent }: AudioModuleProps) {
  const { isRecording, audioLevel, error, startRecording, stopRecording } = useMicrophone();
  const [audioEvents, setAudioEvents] = useState<AudioEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Auto-record for 5 seconds every 10 seconds when session is active
    let timeoutId: NodeJS.Timeout;
    
    if (sessionId && !isRecording && !isProcessing) {
      timeoutId = setTimeout(() => {
        recordAndProcess();
      }, 5000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sessionId, isRecording, isProcessing]);

  const recordAndProcess = async () => {
    if (!sessionId || isRecording || isProcessing) return;

    try {
      await startRecording();
      
      // Record for 5 seconds
      setTimeout(async () => {
        const audioBlob = await stopRecording();
        
        if (audioBlob) {
          setIsProcessing(true);
          await processAudio(audioBlob);
        }
      }, 5000);
    } catch (error) {
      console.error('Audio recording error:', error);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    if (!sessionId) return;

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('sessionId', sessionId);
      formData.append('audioLevel', audioLevel.toString());

      const response = await apiRequest('POST', '/api/audio/process', formData);
      const data = await response.json();
      
      if (data.analysis && data.analysis.events) {
        const eventsWithTimestamp = data.analysis.events.map((event: any) => ({
          ...event,
          timestamp: new Date().toISOString()
        }));
        
        setAudioEvents(prev => [...eventsWithTimestamp, ...prev].slice(0, 10)); // Keep latest 10
        onAudioEvent(eventsWithTimestamp);
      }
    } catch (error) {
      console.error('Audio processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getAudioLevelLabel = (level: number) => {
    if (level < 30) return 'Quiet';
    if (level < 60) return 'Moderate';
    if (level < 80) return 'Loud';
    return 'Very Loud';
  };

  const getEventIcon = (type: string) => {
    if (type.toLowerCase().includes('vehicle') || type.toLowerCase().includes('car')) {
      return <Car className="text-nav-warning" size={20} />;
    }
    if (type.toLowerCase().includes('announcement')) {
      return <Volume2 className="text-nav-secondary" size={20} />;
    }
    return <AlertTriangle className="text-gray-500" size={20} />;
  };

  const getEventBackground = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-green-50 border-green-200';
    }
  };

  return (
    <section className="p-6 bg-white border-b-2 border-gray-200" role="region" aria-labelledby="audio-section">
      <h2 id="audio-section" className="text-large-accessible font-bold mb-4 text-nav-primary">Audio Analysis</h2>
      
      {/* Audio Level Indicator */}
      <Card className="bg-gray-100 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-accessible font-medium">Ambient Sound Level</span>
            <span className="text-sm">{getAudioLevelLabel(audioLevel)}</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3">
            <div 
              className="bg-nav-secondary h-3 rounded-full transition-all duration-300" 
              style={{ width: `${audioLevel}%` }}
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-600 mt-2" role="alert">
              {error}
            </p>
          )}
          
          {isProcessing && (
            <p className="text-sm text-blue-600 mt-2">
              Processing audio...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Detected Sounds */}
      <div className="space-y-3">
        <h3 className="text-accessible font-medium mb-2">Recent Audio Cues</h3>
        
        {audioEvents.length === 0 && (
          <Card className="border-gray-200">
            <CardContent className="p-4 text-center">
              <p className="text-gray-600">No audio events detected yet.</p>
            </CardContent>
          </Card>
        )}
        
        {audioEvents.map((event, index) => (
          <Card 
            key={index}
            className={`border ${getEventBackground(event.importance)}`}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getEventIcon(event.type)}
                  <div className="ml-3">
                    <p className="font-medium text-accessible">{event.type}</p>
                    <p className="text-sm text-gray-600">{event.content}</p>
                    {event.actionRequired && (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        ⚠ Action Required
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
