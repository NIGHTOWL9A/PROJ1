import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/use-speech";
import { Volume2 } from "lucide-react";
import type { RecognizedText } from "@shared/schema";

interface TextModuleProps {
  recognizedTexts: RecognizedText[];
}

export function TextModule({ recognizedTexts }: TextModuleProps) {
  const { speak, isSpeaking } = useSpeech();
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const handleReadAloud = (text: string, index: number) => {
    if (isSpeaking) return;
    
    setSpeakingIndex(index);
    speak(text);
    
    // Reset speaking index after a delay
    setTimeout(() => setSpeakingIndex(null), 3000);
  };

  const getTextTypeColor = (type: string) => {
    if (type.toLowerCase().includes('sign')) return 'bg-purple-50 border-purple-200';
    if (type.toLowerCase().includes('gate')) return 'bg-blue-50 border-blue-200';
    if (type.toLowerCase().includes('warning')) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <section className="p-6 bg-white border-b-2 border-gray-200" role="region" aria-labelledby="text-section">
      <h2 id="text-section" className="text-large-accessible font-bold mb-4 text-nav-primary">Text Recognition</h2>
      
      {/* OCR Results */}
      <div className="space-y-3">
        {recognizedTexts.length === 0 && (
          <Card className="border-gray-200">
            <CardContent className="p-4 text-center">
              <p className="text-gray-600">No text detected yet. Point camera at signs or text.</p>
            </CardContent>
          </Card>
        )}
        
        {recognizedTexts.map((text, index) => (
          <Card 
            key={index}
            className={`border ${getTextTypeColor(text.type)}`}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-accessible">{text.type}</p>
                  <p className="text-lg mt-1 font-semibold">"{text.content}"</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Confidence: {text.confidence ? `${text.confidence}%` : 'Unknown'}
                  </p>
                  {text.timestamp && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(text.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={() => handleReadAloud(text.content, index)}
                  disabled={isSpeaking}
                  className={`bg-nav-primary hover:bg-blue-700 text-white px-3 py-1 text-sm ${
                    speakingIndex === index ? 'animate-pulse' : ''
                  }`}
                  aria-label={`Read text aloud: ${text.content}`}
                >
                  <Volume2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
