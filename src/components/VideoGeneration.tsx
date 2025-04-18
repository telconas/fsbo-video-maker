import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Film, Cog, Check, Download, Share2, Edit, X, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import VideoPlayer from "./VideoPlayer";
import { PropertyInfoValues } from "./PropertyInfoForm";

interface VideoGenerationProps {
  onGenerate: () => Promise<string>;
  onEdit: () => void;
  isGenerating: boolean;
  videoUrl?: string;
  onCancel?: () => void;
  propertyInfo?: PropertyInfoValues;
}

export default function VideoGeneration({ 
  onGenerate, 
  onEdit, 
  isGenerating, 
  videoUrl,
  onCancel,
  propertyInfo
}: VideoGenerationProps) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("Starting...");
  const { toast } = useToast();
  
  const handleGenerate = async () => {
    try {
      // Simulate progress updates
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          
          // Update the step message based on progress
          if (prev < 20) {
            setStep("Processing photos...");
          } else if (prev < 40) {
            setStep("Adding text overlays...");
          } else if (prev < 60) {
            setStep("Applying transitions...");
          } else if (prev < 80) {
            setStep("Adding background music...");
          } else {
            setStep("Finalizing video...");
          }
          
          return prev + 5;
        });
      }, 300);
      
      // Start the actual generation
      const url = await onGenerate();
      
      // Complete the progress
      clearInterval(interval);
      setProgress(100);
      setStep("Completed!");
      
      return url;
    } catch (error) {
      // Reset progress
      setProgress(0);
      setStep("Error");
      
      // Safe error handling
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error("Error generating video:", error);
      toast({
        title: "Video Generation Failed",
        description: "There was a problem creating your video. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDownload = () => {
    if (!videoUrl) return;
    
    // Create a hidden download link
    const link = document.createElement('a');
    link.href = videoUrl;
    
    // Use a proper filename with date stamp - now using MP4 extension
    const fileName = `property-video-${new Date().toISOString().split('T')[0]}.mp4`;
    link.download = fileName;
    
    // Set response type to trigger download dialog
    link.setAttribute('download', fileName);
    
    // Append to body, click and remove
    document.body.appendChild(link);
    link.click();
    
    // Small delay before removing the element
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
    
    toast({
      title: "Download Started",
      description: `Downloading ${fileName}`,
    });
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  // Render the appropriate state
  
  // Initial state - before generating
  if (!isGenerating && !videoUrl) {
    return (
      <div className="mb-8">
        <h3 className="font-medium mb-4 text-lg">Video Generation</h3>
        
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
              <Film className="text-primary text-2xl" />
            </div>
            <h4 className="font-medium text-lg mb-2">Ready to create your property video</h4>
            <p className="text-slate-600 mb-4 max-w-lg">
              We'll generate a professional 60-90 second video showcasing your property with music and transitions.
            </p>
            <Button 
              className="bg-primary text-white hover:bg-primary/90 flex items-center"
              onClick={handleGenerate}
            >
              <Play className="mr-2" size={16} />
              Generate Video
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // During generation
  if (isGenerating || (progress > 0 && progress < 100)) {
    return (
      <div className="mb-8">
        <h3 className="font-medium mb-4 text-lg">Video Generation</h3>
        
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
              <Cog className="text-primary text-2xl animate-spin" />
            </div>
            <h4 className="font-medium text-lg mb-2">Creating your property video</h4>
            <p className="text-slate-600 mb-4">
              This typically takes 1-2 minutes depending on the number of photos.
            </p>
            
            <div className="w-full max-w-md mb-6">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-primary">
                      Progress: {progress}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-primary">
                      Step: {step}
                    </span>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleCancel}
            >
              <X className="mr-2" size={16} />
              Cancel Generation
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // After generation - success with video URL
  if (videoUrl) {
    // Get the latest property info from the parent component through props
    // Used to populate the video preview with correct information
    const videoAddress = propertyInfo?.address || "Beautiful Property";
    const videoPrice = propertyInfo?.price || "";
    
    return (
      <div className="mb-8">
        <h3 className="font-medium mb-4 text-lg">Video Generation</h3>
        
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 w-16 h-16 bg-success bg-opacity-10 rounded-full flex items-center justify-center">
              <Check className="text-success text-2xl" />
            </div>
            <h4 className="font-medium text-lg mb-2">Your video is ready!</h4>
            <p className="text-slate-600 mb-4 text-center">
              We've created a video showcasing your property.
            </p>
            
            {/* Video Player Component */}
            <div className="w-full mb-6">
              <VideoPlayer 
                videoUrl={videoUrl} 
                address={videoAddress}
                price={videoPrice}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button
                className="bg-primary text-white hover:bg-primary/90 flex items-center justify-center"
                onClick={handleDownload}
              >
                <Download className="mr-2" size={16} />
                Download Video
              </Button>
              <Button 
                variant="outline"
                className="border-primary text-primary hover:bg-blue-50 flex items-center justify-center"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + videoUrl);
                  toast({
                    title: "Link Copied",
                    description: "Video link has been copied to clipboard",
                  });
                }}
              >
                <Share2 className="mr-2" size={16} />
                Copy Link
              </Button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-200 w-full text-center">
              <p className="text-sm text-slate-600 mb-2">Need to make changes?</p>
              <Button 
                variant="link" 
                className="text-primary font-medium"
                onClick={onEdit}
              >
                <Edit className="mr-2" size={16} />
                Edit and Regenerate Video
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}
