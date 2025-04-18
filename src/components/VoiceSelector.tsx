import React from 'react';
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

// Just using a single voice now
const VOICE = { id: "nova", name: "Nova", description: "Warm, professional female voice" };

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelect: (voiceId: string) => void;
}

export default function VoiceSelector({ selectedVoice, onSelect }: VoiceSelectorProps) {
  // Always set to Nova voice
  React.useEffect(() => {
    onSelect(VOICE.id);
  }, [onSelect]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Narration Voice</Label>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="font-medium">{VOICE.name}</p>
                <p className="text-sm text-muted-foreground">{VOICE.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Your property narration will use our professional Nova voice.
        This warm, friendly female voice is perfect for property tours.
      </p>
    </div>
  );
}