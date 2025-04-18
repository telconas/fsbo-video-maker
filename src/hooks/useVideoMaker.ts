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
    voiceId: "alloy",
  });

  const { toast } = useToast();

  useEffect(() => {
    const processQueue = async () => {
      if (uploadQueue.length === 0 || isUploading) return;

      if (!projectId) {
        try {
          const project = await createProject();
          setProjectId(project.id);
        } catch (error) {
          toast({ title: "Error", description: "Failed to create project.", variant: "destructive" });
          return;
        }
      }

      setIsUploading(true);
      const file = uploadQueue[0];

      try {
        const photo = await uploadPhoto(file, projectId!, photos.length);
        setPhotos(prev => [...prev, { id: photo.id, url: `/uploads/${photo.storedName}`, originalName: photo.originalName, isCover: photos.length === 0 }]);
        toast({ title: photos.length === 0 ? "First Photo Added" : "Upload Complete", description: photos.length === 0 ? "This will be your cover photo." : "All photos uploaded successfully." });
      } catch (error) {
        if (error instanceof Error && !error.message.includes("validation")) {
          toast({ title: "Upload Failed", description: "Failed to upload photo.", variant: "destructive" });
        }
      } finally {
        setUploadQueue(prev => prev.slice(1));
        setIsUploading(false);
      }
    };

    processQueue();
  }, [projectId, uploadQueue, isUploading]);

  const createProject = async () => {
    const data = { ...propertyInfo, ...contactInfo, photoOrder: [], musicTrack, slideDuration: videoSettings.slideDuration, transitionType: videoSettings.transitionType, showPrice: videoSettings.showPrice, voiceId: videoSettings.voiceId };
    const response = await apiRequest("POST", "/.netlify/functions/videos", data);
    return await response.json();
  };

  const uploadPhoto = async (file: File, videoId: number, order: number) => {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("videoId", String(videoId));
    formData.append("order", String(order));
    formData.append("isCover", String(order === 0));

    const response = await fetch("/.netlify/functions/photos-upload", { method: "POST", body: formData, credentials: "include" });
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
    return await response.json();
  };

  const addPhotos = (files: File[]) => setUploadQueue(prev => [...prev, ...files]);

  const removePhoto = async (id: number) => {
    if (projectId) await apiRequest("DELETE", `/.netlify/functions/photos-delete?id=${id}`);
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const reorderPhotos = async (startIndex: number, endIndex: number) => {
    const items = [...photos];
    const [reorderedItem] = items.splice(startIndex, 1);
    items.splice(endIndex, 0, reorderedItem);
    setPhotos(items);

    if (projectId) {
      await Promise.all(items.map((photo, i) => apiRequest("PATCH", `/.netlify/functions/photos-order?id=${photo.id}`, { order: i })));
    }
  };

  const setCoverPhoto = async (id: number) => {
    setPhotos(prev => prev.map(p => ({ ...p, isCover: p.id === id })));
    if (projectId) {
      await Promise.all(photos.map(photo => apiRequest("PATCH", `/.netlify/functions/photos-cover?id=${photo.id}`, { isCover: photo.id === id })));
    }
  };

  const generateVideo = async () => {
    if (!projectId) {
      const project = await createProject();
      setProjectId(project.id);
    }

    try {
      await apiRequest("PATCH", `/.netlify/functions/videos-update?id=${projectId}`, { ...propertyInfo, ...contactInfo, photoOrder: photos.map(p => p.id), musicTrack, slideDuration: videoSettings.slideDuration, transitionType: videoSettings.transitionType, showPrice: videoSettings.showPrice, voiceId: videoSettings.voiceId });
    } catch {}

    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/.netlify/functions/videos", {});
      const result = await response.json();

      let videoData;
      do {
        await new Promise(r => setTimeout(r, 2000));
        const statusResponse = await fetch(`/.netlify/functions/videos-status?id=${projectId}`);
        videoData = await statusResponse.json();
      } while (videoData.status === 'processing');

      if (videoData.status === 'error') throw new Error("Video generation failed");

      setVideoUrl(videoData.videoUrl);
      setIsGenerating(false);
      toast({ title: "Success", description: "Your property video has been created." });
      return videoData.videoUrl;
    } catch (error) {
      setIsGenerating(false);
      toast({ title: "Video Generation Failed", description: "Please try again.", variant: "destructive" });
      throw error;
    }
  };

  const cancelGeneration = async () => {
    if (!projectId) return;
    await apiRequest("POST", `/.netlify/functions/videos-cancel?id=${projectId}`);
    setIsGenerating(false);
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
    setPropertyInfo: setPropertyInfoState,   // ✅ Add this
    setContactInfo: setContactInfoState,     // ✅ Add this
    setVideoSettings: setVideoSettingsState, // ✅ Add this
    setPropertyInfo,
    setContactInfo,
    setVideoSettings,
    setMusicTrack,
    generateVideo,
    cancelGeneration,
    findCoverPhoto: () => photos.find(photo => photo.isCover),
  };
}
