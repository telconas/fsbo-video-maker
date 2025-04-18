import { useEffect } from "react";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const propertyInfoSchema = z.object({
  // Legacy field - we no longer validate it directly
  address: z.string().optional().or(z.literal('')),
  
  // Make each field optional initially to prevent error states when form loads
  // But still show errors after field is touched
  streetAddress: z.string().optional().or(z.literal('')).refine(val => val !== '' || val === undefined, {
    message: "Street address is required"
  }),
  city: z.string().optional().or(z.literal('')).refine(val => val !== '' || val === undefined, {
    message: "City is required"
  }),
  state: z.string().optional().or(z.literal('')).refine(val => val !== '' || val === undefined, {
    message: "State is required"
  }),
  zipCode: z.string().optional().or(z.literal('')).refine(val => val !== '' || val === undefined, {
    message: "ZIP code is required"
  }),
  price: z.string().optional().or(z.literal('')).refine(val => val !== '' || val === undefined, {
    message: "Price is required"
  }),
  description: z.string().optional().or(z.literal('')),
});

export type PropertyInfoValues = z.infer<typeof propertyInfoSchema>;

interface PropertyInfoFormProps {
  defaultValues?: Partial<PropertyInfoValues>;
  onSubmit: (values: PropertyInfoValues) => void;
  setFormValid: (valid: boolean) => void;
}

export default function PropertyInfoForm({ 
  defaultValues = {}, 
  onSubmit,
  setFormValid 
}: PropertyInfoFormProps) {
  const form = useForm<PropertyInfoValues>({
    resolver: zodResolver(propertyInfoSchema),
    defaultValues: {
      address: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      price: "",
      description: "",
      ...defaultValues,
    },
    mode: "onChange", // This will prevent validation until user interacts 
    criteriaMode: "firstError",
    shouldFocusError: false, // Don't auto-focus on error fields
  });

  // Update parent component about form validity when it changes
  useEffect(() => {
    const subscription = form.watch(() => {
      // Always consider the form valid until user has interacted with it
      // and then only validate fields that have been touched
      if (!form.formState.isDirty) {
        setFormValid(true);
        return;
      }
      
      // Check for errors only in touched fields
      const touchedFieldsWithErrors = Object.keys(form.formState.errors)
        .filter(fieldName => {
          const fieldNameKey = fieldName as keyof typeof form.formState.touchedFields;
          return form.formState.touchedFields[fieldNameKey];
        });
      
      // Form is valid if there are no errors in touched fields
      setFormValid(touchedFieldsWithErrors.length === 0);
    });
    
    // Initial form is considered valid until user interacts
    setFormValid(true);
    
    return () => subscription.unsubscribe();
  }, [form, setFormValid]);
  
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-4 text-lg">Property Information</h3>
      
      <Form {...form}>
        <div className="space-y-6">
          {/* Street Address */}
          <div className="mb-4">
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123 Main Street" 
                      {...field} 
                      onChange={(e) => {
                        const newStreetAddress = e.target.value;
                        field.onChange(newStreetAddress); // still let RHF update its internal state

                        const values = form.getValues(); // these are stale for this field
                        const combinedAddress = `${newStreetAddress}, ${values.city || ''}, ${values.state || ''} ${values.zipCode || ''}`;
                        const updatedValues = {
                          ...values,
                          streetAddress: newStreetAddress,
                          address: combinedAddress.replace(/,\s+,/g, ',').replace(/\s+/g, ' ').trim()
                        };

                        onSubmit(updatedValues);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* City, State, Zip */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Cityville" 
                      {...field} 
                      onChange={(e) => {
                        const newCity = e.target.value;
                        field.onChange(newCity); // still let RHF update its internal state

                        const values = form.getValues(); // these are stale for this field
                        const combinedAddress = `${values.streetAddress || ''}, ${newCity}, ${values.state || ''} ${values.zipCode || ''}`;
                        const updatedValues = {
                          ...values,
                          city: newCity,
                          address: combinedAddress.replace(/,\s+,/g, ',').replace(/\s+/g, ' ').trim()
                        };

                        onSubmit(updatedValues);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="CA" 
                      {...field} 
                      onChange={(e) => {
                        const newState = e.target.value;
                        field.onChange(newState); // still let RHF update its internal state

                        const values = form.getValues(); // these are stale for this field
                        const combinedAddress = `${values.streetAddress || ''}, ${values.city || ''}, ${newState} ${values.zipCode || ''}`;
                        const updatedValues = {
                          ...values,
                          state: newState,
                          address: combinedAddress.replace(/,\s+,/g, ',').replace(/\s+/g, ' ').trim()
                        };

                        onSubmit(updatedValues);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="90210" 
                      {...field} 
                      onChange={(e) => {
                        const newZip = e.target.value;
                        field.onChange(newZip); // still let RHF update its internal state

                        const values = form.getValues(); // these are stale for this field
                        const combinedAddress = `${values.streetAddress || ''}, ${values.city || ''}, ${values.state || ''} ${newZip}`;
                        const updatedValues = {
                          ...values,
                          zipCode: newZip,
                          address: combinedAddress.replace(/,\s+,/g, ',').replace(/\s+/g, ' ').trim()
                        };

                        onSubmit(updatedValues);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Price */}
          <div className="mb-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500">$</span>
                      <Input 
                        className="pl-6" 
                        placeholder="499,000" 
                        {...field} 
                        onChange={(e) => {
                          const newPrice = e.target.value;
                          field.onChange(newPrice); // still let RHF update its internal state
                          
                          // Update parent state on change
                          const values = form.getValues(); // these are stale for this field
                          const updatedValues = {
                            ...values,
                            price: newPrice
                          };
                          
                          onSubmit(updatedValues);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe key features of your property..." 
                    className="resize-none" 
                    rows={3}
                    {...field} 
                    onChange={(e) => {
                      const newDescription = e.target.value;
                      field.onChange(newDescription); // still let RHF update its internal state
                      
                      // Update parent state on change
                      const values = form.getValues(); // these are stale for this field
                      const updatedValues = {
                        ...values,
                        description: newDescription
                      };
                      
                      onSubmit(updatedValues);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  This will be displayed as text in your video
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
}
