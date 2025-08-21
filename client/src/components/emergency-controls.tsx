import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Hand, Pause } from "lucide-react";

interface EmergencyControlsProps {
  onEmergencyStop: () => void;
  onRequestHelp: () => void;
  onPauseNavigation: () => void;
}

export function EmergencyControls({ 
  onEmergencyStop, 
  onRequestHelp, 
  onPauseNavigation 
}: EmergencyControlsProps) {
  return (
    <section className="p-6 bg-red-50 border-b-2 border-red-200" role="region" aria-labelledby="emergency-section">
      <h2 id="emergency-section" className="text-large-accessible font-bold mb-4 text-nav-error">Emergency & Safety</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <Button 
          onClick={onEmergencyStop}
          className="bg-nav-error hover:bg-red-700 text-white py-6 px-6 text-large-accessible font-bold h-auto w-full"
          aria-label="Emergency stop navigation">
          <AlertTriangle className="mb-2" size={32} />
          <br />
          EMERGENCY STOP
        </Button>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={onRequestHelp}
            className="bg-nav-warning hover:bg-orange-600 text-white py-4 px-4 text-accessible font-bold h-auto"
            aria-label="Request human assistance">
            <Hand className="mb-2" size={20} />
            <br />
            Need Help
          </Button>
          
          <Button 
            onClick={onPauseNavigation}
            className="bg-gray-600 hover:bg-gray-700 text-white py-4 px-4 text-accessible font-bold h-auto"
            aria-label="Pause navigation">
            <Pause className="mb-2" size={20} />
            <br />
            Pause
          </Button>
        </div>
      </div>
    </section>
  );
}
