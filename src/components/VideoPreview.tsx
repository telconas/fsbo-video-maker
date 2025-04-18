import { Play } from "lucide-react";

interface VideoPreviewProps {
  address: string | undefined;
  price: string | undefined;
  coverImage?: string;
  videoUrl?: string;
  onPlay?: () => void;
}

export default function VideoPreview({ 
  address, 
  price, 
  coverImage, 
  videoUrl,
  onPlay 
}: VideoPreviewProps) {
  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    }
  };
  
  return (
    <div className="mb-8">
      <h3 className="font-medium mb-4 text-lg">Video Preview</h3>
      
      <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative shadow-lg">
        {videoUrl ? (
          <video 
            src={videoUrl} 
            className="w-full h-full object-contain"
            controls
            poster={coverImage}
          />
        ) : (
          <>
            <img 
              src={coverImage || '/placeholder-property.jpg'} 
              alt="Video preview" 
              className="w-full h-full object-cover opacity-50"
            />
            
            {/* Overlay for property info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="bg-black bg-opacity-50 px-6 py-4 rounded-lg text-center">
                <h3 className="text-2xl font-semibold mb-2">{address || "Beautiful Property"}</h3>
                <p className="text-3xl font-bold">
                  {price ? (price.startsWith('$') ? price : `$${price}`) : "$0"}
                </p>
              </div>
            </div>
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition"
                onClick={handlePlay}
              >
                <Play className="text-white ml-1" size={24} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
