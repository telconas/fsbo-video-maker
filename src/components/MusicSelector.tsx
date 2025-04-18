import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { MUSIC_TRACKS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface MusicSelectorProps {
  selectedTrack: string;
  onSelect: (trackId: string) => void;
}

export default function MusicSelector({ selectedTrack, onSelect }: MusicSelectorProps) {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const { toast } = useToast();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  
  // Create audio element only on client side
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener("ended", () => {
      setPlayingTrack(null);
      clearInterval(progressIntervalRef.current as number);
    });
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  const togglePlay = (trackId: string) => {
    // If already playing this track, pause it
    if (playingTrack === trackId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setPlayingTrack(null);
      return;
    }
    
    // If another track is playing, stop it
    if (playingTrack && audioRef.current) {
      audioRef.current.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
    
    // Play the selected track
    const track = MUSIC_TRACKS.find(t => t.id === trackId);
    if (track && audioRef.current) {
      // Directly select the track by updating state, even if playback fails
      setPlayingTrack(trackId);
      onSelect(trackId);
      
      // Set audio source
      audioRef.current.src = `/music/${track.filename}`;
      
      // Attempt to play, but handle errors gracefully
      audioRef.current.play().then(() => {
        // Only set up progress tracking if playback succeeds
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        
        progressIntervalRef.current = window.setInterval(() => {
          if (audioRef.current) {
            // Only update if we have valid duration (avoid NaN)
            if (!isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
              const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
              setProgress(percentage || 0); // Ensure we never set NaN
              
              // Format current time
              const minutes = Math.floor(audioRef.current.currentTime / 60);
              const seconds = Math.floor(audioRef.current.currentTime % 60);
              setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            } else {
              // If duration not available, show indeterminate progress
              setProgress(50);
            }
          }
        }, 1000) as unknown as number;
      }).catch(error => {
        console.error("Error playing audio:", error);
        // Still show track as selected even if audio doesn't play
        toast({
          title: "Audio Playback",
          description: "Sample audio unavailable. The track is still selected for your video.",
          variant: "default"
        });
      });
    }
  };
  
  const updateProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Ensure we set a valid number
    setProgress(isNaN(value) ? 0 : value);
    
    if (audioRef.current && playingTrack && !isNaN(audioRef.current.duration)) {
      try {
        const newTime = (audioRef.current.duration * value) / 100;
        if (!isNaN(newTime)) {
          audioRef.current.currentTime = newTime;
        }
      } catch (error) {
        console.error("Error setting audio position:", error);
      }
    }
  };
  
  // Calculate which tracks to show
  const displayedTracks = showAll 
    ? MUSIC_TRACKS 
    : MUSIC_TRACKS.slice(0, 3);
  
  return (
    <div className="mb-8">
      <h3 className="font-medium mb-4 text-lg">Background Music</h3>
      <p className="text-sm text-slate-600 mb-4">
        Select one of our royalty-free music tracks for your video.
      </p>
      
      <div className="space-y-3">
        {displayedTracks.map(track => (
          <div 
            key={track.id}
            className={`${
              selectedTrack === track.id 
                ? "bg-slate-50 border-primary" 
                : "bg-white border-slate-200 hover:border-primary"
            } border rounded-lg p-4 flex items-center transition-colors cursor-pointer`}
            onClick={() => onSelect(track.id)}
          >
            <div className="flex-shrink-0 mr-4">
              <Button
                type="button" 
                variant={playingTrack === track.id ? "default" : "outline"}
                size="icon"
                className={`w-10 h-10 rounded-full ${
                  playingTrack === track.id 
                    ? "bg-primary text-white" 
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay(track.id);
                }}
              >
                {playingTrack === track.id ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} />
                )}
              </Button>
            </div>
            <div className="flex-grow">
              <h4 className="font-medium">{track.name}</h4>
              <p className="text-sm text-slate-500">{track.description}</p>
              
              {/* Custom audio player - shown when track is playing */}
              {playingTrack === track.id && (
                <div className="mt-2 flex items-center">
                  <input 
                    type="range" 
                    className="flex-grow mr-2 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
                    min="0" 
                    max="100" 
                    value={progress}
                    onChange={updateProgress}
                  />
                  <span className="text-xs text-slate-500">
                    {currentTime} / {track.duration}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-shrink-0 ml-2">
              {selectedTrack === track.id && (
                <Badge variant="default" className="bg-primary text-white">
                  Selected
                </Badge>
              )}
            </div>
          </div>
        ))}
        
        {!showAll && MUSIC_TRACKS.length > 3 && (
          <div className="text-center py-2">
            <Button 
              variant="link" 
              className="text-primary font-medium text-sm"
              onClick={() => setShowAll(true)}
            >
              Show {MUSIC_TRACKS.length - 3} More Options
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
