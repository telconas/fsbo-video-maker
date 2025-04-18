import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PHOTO_LIMIT } from "@/lib/constants";

interface PhotoUploaderProps {
  onUpload: (files: File[]) => void;
  currentPhotoCount: number;
}

export default function PhotoUploader({ onUpload, currentPhotoCount }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    // Filter for only image files
    const imageFiles = files.filter(file => 
      file.type === 'image/jpeg' || 
      file.type === 'image/png' || 
      file.type === 'image/webp'
    );
    
    // Check if any files were filtered out
    if (imageFiles.length < files.length) {
      toast({
        title: "Unsupported file type",
        description: "Only JPEG, PNG and WEBP images are allowed.",
        variant: "destructive"
      });
    }
    
    // Check file size (max 10MB)
    const validFiles = imageFiles.filter(file => file.size <= 10 * 1024 * 1024);
    if (validFiles.length < imageFiles.length) {
      toast({
        title: "File too large",
        description: "Some files exceed the 10MB size limit.",
        variant: "destructive"
      });
    }

    // Check the number of photos uploaded
    const availableSlots = PHOTO_LIMIT - currentPhotoCount;

    if (validFiles.length > availableSlots) {
      toast({
        title: "Too many files",
        description: `You can only upload ${availableSlots} more photo${availableSlots !== 1 ? "s" : ""}.`,
        variant: "destructive"
      });
      
      // Only take the first N files that would fit
      onUpload(validFiles.slice(0, availableSlots));
    } else {
      onUpload(validFiles);
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-8">
      <div 
        className={`border-2 border-dashed ${isDragging ? 'border-primary' : 'border-secondary'} rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer bg-slate-50`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CloudUpload size={48} className="mx-auto text-slate-400 mb-3" />
        <h3 className="font-medium mb-2">Drag & drop photos here</h3>
        <p className="text-sm text-slate-500 mb-4">or</p>
        <Button variant="default" className="bg-primary text-white px-6 py-3">Select Photos</Button>
        <p className="text-xs text-slate-500 mt-4">
          Upload up to {PHOTO_LIMIT} JPG, PNG or WEBP images (max 10MB each)
        </p>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/jpeg,image/png,image/webp" 
          multiple 
          onChange={handleFileInput}
        />
      </div>
    </div>
  );
}