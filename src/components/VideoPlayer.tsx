import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, VolumeX, Volume2, Download } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  address: string;
  price: string;
}

export default function VideoPlayer({ videoUrl, address, price }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Handle download/open
  const handleDownload = () => {
    // Open the video in a new tab for download
    window.open(videoUrl, '_blank');
  };
  
  // Play/pause video
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Mute/unmute video
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  // Handle video loaded event
  const handleVideoLoaded = () => {
    setIsLoading(false);
  };
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-0 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        <div 
          className="aspect-video w-full relative bg-black"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Using native video element for MP4 content */}
          <video 
            ref={videoRef}
            src={videoUrl} 
            className="w-full h-full object-contain"
            onLoadedData={handleVideoLoaded}
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls
            controlsList="nodownload"
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 bg-opacity-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}
          
          {!isLoading && showControls && (
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-white h-8 w-8 p-0" 
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </Button>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-white h-8 w-8 p-0" 
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white border-t">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-lg">{address}</h3>
              {price && <p className="text-xl font-bold">{price.startsWith('$') ? price : `$${price}`}</p>}
            </div>
            <Button 
              onClick={handleDownload}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Open Full View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}