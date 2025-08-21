import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/use-speech";
import { Route, RotateCcw, Check } from "lucide-react";

interface NavigationInstructionsProps {
  currentInstruction: string;
  progress: number;
  totalSteps: number;
  onRepeat: () => void;
  onMarkCompleted: () => void;
}

export function NavigationInstructions({ 
  currentInstruction, 
  progress, 
  totalSteps,
  onRepeat,
  onMarkCompleted 
}: NavigationInstructionsProps) {
  const { speak, isSpeaking } = useSpeech();

  const handleRepeat = () => {
    speak(currentInstruction);
    onRepeat();
  };

  const progressPercentage = totalSteps > 0 ? (progress / totalSteps) * 100 : 0;

  return (
    <section className="p-6 bg-white border-b-2 border-gray-200" role="region" aria-labelledby="navigation-section">
      <h2 id="navigation-section" className="text-large-accessible font-bold mb-4 text-nav-primary">Navigation</h2>
      
      {/* Current Instruction */}
      <Card className="bg-nav-primary text-white mb-4">
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            <Route className="mr-3" size={24} />
            <span className="font-medium text-accessible">Current Direction</span>
          </div>
          <p className="text-large-accessible font-bold mb-3">
            {currentInstruction || "No navigation instruction available. Use voice commands to get directions."}
          </p>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleRepeat}
              disabled={isSpeaking || !currentInstruction}
              className="bg-white text-nav-primary hover:bg-gray-100 px-4 py-2 font-medium text-accessible"
              aria-label="Repeat instruction">
              <RotateCcw className="mr-2" size={16} />
              Repeat
            </Button>
            <Button 
              onClick={onMarkCompleted}
              disabled={!currentInstruction}
              className="bg-nav-secondary hover:bg-green-700 text-white px-4 py-2 font-medium text-accessible"
              aria-label="Mark step as completed">
              <Check className="mr-2" size={16} />
              Done
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <Card className="bg-gray-50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-accessible font-medium">Progress</span>
            <span className="text-sm">
              Step {progress} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div 
              className="bg-nav-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={totalSteps}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
