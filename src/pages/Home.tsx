import { useState } from "react";
import ProcessStepper from "@/components/ProcessStepper";
import PhotoUploader from "@/components/PhotoUploader";
import PhotoGrid, { PhotoItem } from "@/components/PhotoGrid";
import PropertyInfoForm, { PropertyInfoValues } from "@/components/PropertyInfoForm";
import ContactInfoForm, { ContactInfoValues } from "@/components/ContactInfoForm";
import MusicSelector from "@/components/MusicSelector";
import VideoSettings, { VideoSettingsValues } from "@/components/VideoSettings";
import VideoPreview from "@/components/VideoPreview";
import VideoGeneration from "@/components/VideoGeneration";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useVideoMaker from "@/hooks/useVideoMaker";

// Define the steps in our process
const STEPS = [
  { label: "Upload Photos" },
  { label: "Property Details" },
  { label: "Music & Settings" },
  { label: "Generate & Download" }
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [propertyInfoValid, setPropertyInfoValid] = useState(false);
  const [contactInfoValid, setContactInfoValid] = useState(false);
  const { toast } = useToast();
  
  const {
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
  } = useVideoMaker();
  
  // Navigation functions
  const nextStep = () => {
    // Validation before proceeding
    if (currentStep === 0 && photos.length === 0) {
      toast({
        title: "Upload Required",
        description: "Please upload at least one photo before continuing.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep === 1) {
      // Check for required property info
      if (!propertyInfo.address || propertyInfo.address.length < 3) {
        toast({
          title: "Missing Information",
          description: "Please enter a valid property address (at least 3 characters).",
          variant: "destructive"
        });
        return;
      }
      
      if (!propertyInfo.price || propertyInfo.price.length < 1) {
        toast({
          title: "Missing Information",
          description: "Please enter a valid property price.",
          variant: "destructive"
        });
        return;
      }
      
      // Check for required contact info
      if (!contactInfo.contactName || contactInfo.contactName.length < 2) {
        toast({
          title: "Missing Information",
          description: "Please enter your name (at least 2 characters).",
          variant: "destructive"
        });
        return;
      }
      
      // Need either phone or email
      if ((!contactInfo.contactPhone || contactInfo.contactPhone.length === 0) && 
          (!contactInfo.contactEmail || contactInfo.contactEmail.length === 0)) {
        toast({
          title: "Missing Information",
          description: "Please provide either a phone number or email address.",
          variant: "destructive"
        });
        return;
      }
      
      // If email is provided, validate it minimally
      if (contactInfo.contactEmail && contactInfo.contactEmail.length > 0 && !contactInfo.contactEmail.includes('@')) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle photo uploads
  const handlePhotoUpload = (files: File[]) => {
    addPhotos(files);
  };
  
  // Handle photo reordering
  const handleReorder = (startIndex: number, endIndex: number) => {
    reorderPhotos(startIndex, endIndex);
  };
  
  // Video generation handler
  const handleGenerateVideo = async () => {
    try {
      const url = await generateVideo();
      return url;
    } catch (error) {
      console.error("Error generating video:", error);
      toast({
        title: "Error",
        description: "Failed to generate video. Please try again.",
        variant: "destructive"
      });
      return "";
    }
  };
  
  // Editing handler
  const handleEdit = () => {
    setCurrentStep(0); // Go back to step 1
  };
  
  // Get the cover image URL if it exists
  const coverPhoto = findCoverPhoto();
  const coverImageUrl = coverPhoto ? coverPhoto.url : undefined;
  
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Process Stepper */}
      <div>
        <ProcessStepper currentStep={currentStep} steps={STEPS} />
      </div>
      
      {/* Step Container */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        {/* Step 1: Upload Photos */}
        {currentStep === 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Upload Property Photos</h2>
            <p className="text-slate-600 mb-6">
              Upload 10-12 high-quality photos of your property. You can drag and drop to reorder them later.
            </p>
            
            <PhotoUploader onUpload={handlePhotoUpload} currentPhotoCount={photos.length} />
            
            {photos.length > 0 && (
              <PhotoGrid 
                photos={photos} 
                onReorder={handleReorder} 
                onSetCover={setCoverPhoto}
                onDelete={removePhoto}
              />
            )}
            
            <div className="flex justify-between mt-8">
              <div></div>
              <Button 
                className="bg-primary text-white hover:bg-primary/90 flex items-center"
                onClick={nextStep}
                disabled={isUploading}
              >
                Continue to Property Details
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 2: Property Details */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Property Details</h2>
            <p className="text-slate-600 mb-6">
              Enter information about your property and contact details for potential buyers.
            </p>
            
            <PropertyInfoForm 
              defaultValues={propertyInfo} 
              onSubmit={setPropertyInfo}
              setFormValid={setPropertyInfoValid}
            />
            
            <ContactInfoForm 
              defaultValues={contactInfo} 
              onSubmit={setContactInfo}
              setFormValid={setContactInfoValid}
            />
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={prevStep}
              >
                <ArrowLeft className="mr-2" size={16} />
                Back to Photos
              </Button>
              <Button 
                className="bg-primary text-white hover:bg-primary/90 flex items-center"
                onClick={nextStep}
              >
                Continue to Music & Settings
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 3: Music & Settings */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Music & Video Settings</h2>
            <p className="text-slate-600 mb-6">
              Choose background music and adjust your video settings.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <MusicSelector selectedTrack={musicTrack} onSelect={setMusicTrack} />
                
                <VideoSettings 
                  defaultValues={videoSettings} 
                  onChange={setVideoSettings} 
                />
              </div>
              
              <div>
                <h3 className="font-medium mb-4 text-lg">Sample Preview</h3>
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-600 mb-4">
                    Here's a sample of how your video will look. This preview shows the first slide with your property address and price.
                  </p>
                  
                  <VideoPreview 
                    address={propertyInfo.address || propertyInfo.streetAddress || "Beautiful Property"}
                    price={propertyInfo.price || "$0"}
                    coverImage={coverImageUrl}
                    onPlay={() => {
                      toast({
                        title: "Preview Only",
                        description: "Go to the next step to generate and play the full video."
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={prevStep}
              >
                <ArrowLeft className="mr-2" size={16} />
                Back to Property Details
              </Button>
              <Button 
                className="bg-primary text-white hover:bg-primary/90 flex items-center"
                onClick={nextStep}
              >
                Generate Video
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 4: Generate & Download */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Generate & Download Your Video</h2>
            <p className="text-slate-600 mb-6">
              Review your project and create your property video.
            </p>
            
            <VideoPreview 
              address={propertyInfo.address || "Beautiful Property"} 
              price={propertyInfo.price || "$0"}
              coverImage={coverImageUrl}
              videoUrl={videoUrl}
            />
            
            <VideoGeneration 
              onGenerate={handleGenerateVideo} 
              onEdit={handleEdit}
              isGenerating={isGenerating}
              videoUrl={videoUrl}
              onCancel={cancelGeneration}
              propertyInfo={propertyInfo}
            />
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={prevStep}
              >
                <ArrowLeft className="mr-2" size={16} />
                Back to Music & Settings
              </Button>
              <div></div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
