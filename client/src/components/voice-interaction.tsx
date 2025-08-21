import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/use-speech";
import { Play, Square, Mic, MicOff } from "lucide-react";

interface VoiceInteractionProps {
  onCommand: (command: string) => void;
}

export function VoiceInteraction({ onCommand }: VoiceInteractionProps) {
  const { 
    isListening, 
    isSpeaking, 
    transcript, 
    error, 
    startListening, 
    stopListening,
    clearTranscript 
  } = useSpeech();

  const handleStart = () => {
    clearTranscript();
    startListening();
  };

  const handleStop = () => {
    stopListening();
    if (transcript) {
      onCommand(transcript);
    }
  };

  return (
    <section className="p-6 bg-white border-b-2 border-gray-200" role="region" aria-labelledby="voice-section">
      <h2 id="voice-section" className="text-large-accessible font-bold mb-4 text-nav-primary">Voice Assistant</h2>
      
      {/* Voice Status Display */}
      <Card className="bg-gray-50 mb-4">
        <CardContent className="pt-6 text-center">
          <div className="text-6xl mb-2">
            {isListening ? (
              <Mic className="mx-auto text-nav-primary animate-pulse" size={64} />
            ) : (
              <MicOff className="mx-auto text-nav-primary" size={64} />
            )}
          </div>
          <p className="text-accessible font-medium">
            {isListening ? 'Listening...' : 'Ready to listen'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {transcript || 'Say "Help me navigate" to start'}
          </p>
          {error && (
            <p className="text-sm text-red-600 mt-1" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Voice Control Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={handleStart}
          disabled={isListening || isSpeaking}
          className="bg-nav-primary hover:bg-blue-700 text-white py-4 px-6 text-accessible font-bold h-auto"
          aria-label="Start voice command">
          <Play className="mr-2" size={20} />
          Start
        </Button>
        <Button 
          onClick={handleStop}
          disabled={!isListening}
          className="bg-nav-error hover:bg-red-700 text-white py-4 px-6 text-accessible font-bold h-auto"
          aria-label="Stop voice command">
          <Square className="mr-2" size={20} />
          Stop
        </Button>
      </div>
    </section>
  );
}
