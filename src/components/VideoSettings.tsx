import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { TRANSITION_TYPES } from "@/lib/constants";
import VoiceSelector from "./VoiceSelector";

export interface VideoSettingsValues {
  slideDuration: number;
  transitionType: string;
  showPrice: boolean;
  voiceId: string;
}

interface VideoSettingsProps {
  defaultValues?: Partial<VideoSettingsValues>;
  onChange: (values: VideoSettingsValues) => void;
}

export default function VideoSettings({ 
  defaultValues = {}, 
  onChange 
}: VideoSettingsProps) {
  const [duration, setDuration] = useState(defaultValues.slideDuration || 5);
  
  const form = useForm<VideoSettingsValues>({
    defaultValues: {
      slideDuration: 5,
      transitionType: "fade",
      showPrice: true,
      voiceId: "alloy",
      ...defaultValues,
    },
  });
  
  // Update parent component when values change
  const handleChange = (name: string, value: any) => {
    form.setValue(name as any, value);
    onChange(form.getValues());
  };
  
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-4 text-lg">Video Settings</h3>
      
      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="slideDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo Duration</FormLabel>
                <div className="flex items-center">
                  <FormControl>
                    <Slider
                      min={3}
                      max={7}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(values) => {
                        const value = values[0];
                        setDuration(value);
                        handleChange('slideDuration', value);
                      }}
                      className="flex-grow mr-4"
                    />
                  </FormControl>
                  <span className="text-sm font-medium">{duration} seconds</span>
                </div>
                <FormDescription>How long each photo will display</FormDescription>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="transitionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transition Type</FormLabel>
                <Select 
                  onValueChange={(value) => handleChange('transitionType', value)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TRANSITION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>How photos will transition between each other</FormDescription>
              </FormItem>
            )}
          />
        </div>
        
        {/* Voice Selector */}
        <div className="mt-6 mb-4">
          <FormField
            control={form.control}
            name="voiceId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <VoiceSelector 
                    selectedVoice={field.value} 
                    onSelect={(voice) => handleChange('voiceId', voice)} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4">
          <FormField
            control={form.control}
            name="showPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      handleChange('showPrice', !!checked);
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Show price on first slide</FormLabel>
                  <FormDescription>
                    Display the property price prominently on the opening slide
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
}
