import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PropertyInfoValues } from "@/components/PropertyInfoForm";
import { ContactInfoValues } from "@/components/ContactInfoForm";
import { VideoSettingsValues } from "@/components/VideoSettings";
import { PhotoItem } from "@/components/PhotoGrid";
import { MUSIC_TRACKS } from "@/lib/constants";

export default function useVideoMaker() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [musicTrack, setMusicTrack] = useState(MUSIC_TRACKS[0].id);
  
  const [propertyInfo, setPropertyInfoState] = useState<PropertyInfoValues>({
    address: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    price: "",
    description: "",
  });
  
  const [contactInfo, setContactInfoState] = useState<ContactInfoValues>({
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });
  
  const [videoSettings, setVideoSettingsState] = useState<VideoSettingsValues>({
    slideDuration: 5,
    transitionType: "fade",
    showPrice: true,
    voiceId: "alloy", // Default voice
  });
  
  const { toast } = useToast();
  
  // Process upload queue
  useEffect(() => {
    const processQueue = async () => {
      if (uploadQueue.length === 0 || isUploading) {
        return;
      }
      
      // Create a project if it doesn't exist yet
      if (!projectId) {
        try {
          const project = await createProject();
          setProjectId(project.id);
        } catch (error) {
          console.error("Error creating project:", error);
          toast({
            title: "Error",
            description: "Failed to create project. Please try again.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Start uploading photos
      setIsUploading(true);
      
      const file = uploadQueue[0];
      try {
        const photo = await uploadPhoto(file, projectId!, photos.length);
        
        // Add the new photo to the list with its URL
        setPhotos(prev => [
          ...prev, 
          { 
            id: photo.id, 
            url: `/uploads/${photo.storedName}`,
            originalName: photo.originalName,
            isCover: photos.length === 0 ? true : false // First photo is cover by default
          }
        ]);
        
        // Successful upload - provide subtle feedback if it's the first photo
        if (photos.length === 0) {
          toast({
            title: "First Photo Added",
            description: "This will be your cover photo. You can change it later.",
          });
        } else if (uploadQueue.length === 1) {
          // Last photo in queue
          toast({
            title: "Upload Complete",
            description: `All photos uploaded successfully.`,
          });
        }
        
        // Remove the processed file from the queue
        setUploadQueue(prev => prev.slice(1));
      } catch (error) {
        console.error("Error uploading photo:", error);
        
        // Only show a toast for server errors, not for client validation errors
        // which are already handled by the PhotoUploader component
        if (error instanceof Error && !error.message.includes("validation")) {
          toast({
            title: "Upload Failed",
            description: "Failed to upload photo. Please try again.",
            variant: "destructive"
          });
        }
        
        // Remove the failed file from the queue
        setUploadQueue(prev => prev.slice(1));
      } finally {
        setIsUploading(false);
      }
    };
    
    processQueue();
  }, [projectId, uploadQueue, isUploading]);
  
  // Create a new project on the server
  const createProject = async () => {
    const data = {
      address: propertyInfo.address || "Beautiful Property",
      streetAddress: propertyInfo.streetAddress || "123 Main Street",
      city: propertyInfo.city || "Anytown",
      state: propertyInfo.state || "CA",
      zipCode: propertyInfo.zipCode || "90210",
      price: propertyInfo.price || "$375,000",
      description: propertyInfo.description || "Spacious and well-maintained property in a great location.",
      contactName: contactInfo.contactName || "Property Owner",
      contactPhone: contactInfo.contactPhone || "(555) 123-4567",
      contactEmail: contactInfo.contactEmail || "contact@example.com",
      photoOrder: [],
      musicTrack: musicTrack,
      slideDuration: videoSettings.slideDuration,
      transitionType: videoSettings.transitionType,
      showPrice: videoSettings.showPrice,
      voiceId: videoSettings.voiceId,
    };
    
    const response = await apiRequest("POST", "/api/videos", data);
    return await response.json();
  };
  
  // Upload a photo to the server
  const uploadPhoto = async (file: File, videoId: number, order: number) => {
    // Validate file before processing
    if (!file) {
      console.error("No file provided for upload");
      throw new Error("No file selected for upload");
    }
    
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("videoId", String(videoId));
    formData.append("order", String(order));
    formData.append("isCover", String(order === 0));
    
    try {
      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error in uploadPhoto:", error);
      throw error;
    }
  };
  
  // Add photos to upload queue
  const addPhotos = (files: File[]) => {
    setUploadQueue(prev => [...prev, ...files]);
  };
  
  // Remove a photo
  const removePhoto = async (id: number) => {
    try {
      // If we have a project ID, delete from server
      if (projectId) {
        await apiRequest("DELETE", `/api/photos/${id}`);
      }
      
      // Remove from local state
      setPhotos(prev => prev.filter(photo => photo.id !== id));
      
      toast({
        title: "Photo Removed",
        description: "The photo has been removed from your project.",
      });
    } catch (error) {
      console.error("Error removing photo:", error);
      toast({
        title: "Error",
        description: "Failed to remove photo. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Reorder photos
  const reorderPhotos = async (startIndex: number, endIndex: number) => {
    // Create a copy of the photos array
    const items = Array.from(photos);
    const [reorderedItem] = items.splice(startIndex, 1);
    items.splice(endIndex, 0, reorderedItem);
    
    // Update local state first for immediate feedback
    setPhotos(items);
    
    // Update on server if we have a project ID
    if (projectId) {
      try {
        // Update the order of each photo
        const updatePromises = items.map((photo, index) => 
          apiRequest("PATCH", `/api/photos/${photo.id}/order`, { order: index })
        );
        
        await Promise.all(updatePromises);
      } catch (error) {
        console.error("Error updating photo order:", error);
        toast({
          title: "Error",
          description: "Failed to update photo order on server.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Set a photo as the cover photo
  const setCoverPhoto = async (id: number) => {
    // Update local state first for immediate feedback
    setPhotos(prev => prev.map(photo => ({
      ...photo,
      isCover: photo.id === id
    })));
    
    // Update on server if we have a project ID
    if (projectId) {
      try {
        // First, unset all cover photos
        const updatePromises = photos.map(photo => 
          apiRequest("PATCH", `/api/photos/${photo.id}/cover`, { isCover: false })
        );
        
        await Promise.all(updatePromises);
        
        // Then set the new cover photo
        await apiRequest("PATCH", `/api/photos/${id}/cover`, { isCover: true });
      } catch (error) {
        console.error("Error setting cover photo:", error);
        toast({
          title: "Error",
          description: "Failed to set cover photo on server.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Store property info
  const setPropertyInfo = (values: PropertyInfoValues) => {
    setPropertyInfoState(values);
  };
  
  // Store contact info
  const setContactInfo = (values: ContactInfoValues) => {
    setContactInfoState(values);
  };
  
  // Store video settings
  const setVideoSettings = (values: VideoSettingsValues) => {
    setVideoSettingsState(values);
  };
  
  // Generate the video
  const generateVideo = async () => {
    if (!projectId) {
      // Create a project first if it doesn't exist
      try {
        const project = await createProject();
        setProjectId(project.id);
      } catch (error) {
        console.error("Error creating project:", error);
        throw new Error("Failed to create project");
      }
    }
    
    // Update project data before generating video
    try {
      const data = {
        address: propertyInfo.address,
        streetAddress: propertyInfo.streetAddress,
        city: propertyInfo.city,
        state: propertyInfo.state,
        zipCode: propertyInfo.zipCode,
        price: propertyInfo.price,
        description: propertyInfo.description,
        contactName: contactInfo.contactName,
        contactPhone: contactInfo.contactPhone,
        contactEmail: contactInfo.contactEmail,
        photoOrder: photos.map(p => p.id),
        musicTrack: musicTrack,
        slideDuration: videoSettings.slideDuration,
        transitionType: videoSettings.transitionType,
        showPrice: videoSettings.showPrice,
        voiceId: videoSettings.voiceId,
      };
      
      // Update the project data
     // Update the project data
await apiRequest("PATCH", `/.netlify/functions/videos-update?id=${projectId}`, data);
    } catch (error) {
      console.error("Error updating project data:", error);
      // Continue anyway, as long as we have a project ID
    }
    
    // Start video generation
    setIsGenerating(true);
    
    try {
      const response = await apiRequest("POST", "/.netlify/functions/videos", data);
      const result = await response.json();
      
      // Poll for status until complete
      let videoData;
      do {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls
        const statusResponse = await fetch(`/.netlify/functions/videos/${projectId}`, {
          credentials: "include"
        });
        videoData = await statusResponse.json();
      } while (videoData.status === 'processing');
      
      if (videoData.status === 'error') {
        throw new Error("Video generation failed");
      }
      
      // Set the video URL when done
      setVideoUrl(videoData.videoUrl);
      setIsGenerating(false);
      
      toast({
        title: "Success",
        description: "Your property video has been created successfully!",
      });
      
      return videoData.videoUrl;
    } catch (error) {
      setIsGenerating(false);
      
      // Safely handle the error
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error !== null && error !== undefined) {
        try {
          errorMessage = String(error);
        } catch {
          errorMessage = "Unknown error occurred";
        }
      }
      
      console.error("Error generating video:", error);
      
      toast({
        title: "Video Generation Failed",
        description: "Failed to generate property video. Please try again.",
        variant: "destructive"
      });
      
      throw new Error(errorMessage);
    }
  };
  
  // Cancel video generation
  const cancelGeneration = async () => {
    if (!projectId) return;
    
    try {
      await apiRequest("POST", `/.netlify/functions/videos${projectId}/cancel`);
      setIsGenerating(false);
      
      toast({
        title: "Cancelled",
        description: "Video generation has been cancelled.",
      });
    } catch (error) {
      console.error("Error cancelling generation:", error);
      toast({
        title: "Error",
        description: "Failed to cancel video generation.",
        variant: "destructive"
      });
    }
  };
  
  // Find the cover photo
  const findCoverPhoto = () => {
    return photos.find(photo => photo.isCover);
  };
  
  return {
    photos,
    videoUrl,
    isUploading,
    isGenerating,
    propertyInfo,
    contactInfo,
    videoSettings,
    projectId,
    musicTrack,
    addPhotos,
    removePhoto,
    reorderPhotos,
    setCoverPhoto,
    setPropertyInfo,
    setContactInfo,
    setVideoSettings,
    setMusicTrack,
    generateVideo,
    cancelGeneration,
    findCoverPhoto
  };
}