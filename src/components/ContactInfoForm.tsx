import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contactInfoSchema = z.object({
  contactName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email({ message: "Please enter a valid email" }).optional(),
}).refine(data => data.contactPhone || data.contactEmail, {
  message: "Either phone or email is required",
  path: ["contactPhone"],
});

export type ContactInfoValues = z.infer<typeof contactInfoSchema>;

interface ContactInfoFormProps {
  defaultValues?: Partial<ContactInfoValues>;
  onSubmit: (values: ContactInfoValues) => void;
  setFormValid: (valid: boolean) => void;
}

export default function ContactInfoForm({
  defaultValues = {},
  onSubmit,
  setFormValid
}: ContactInfoFormProps) {
  const form = useForm<ContactInfoValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Update parent component about form validity when it changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setFormValid(form.formState.isValid);
    });
    
    // Initial validation check
    setFormValid(form.formState.isValid);
    
    return () => subscription.unsubscribe();
  }, [form, setFormValid]);

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-4 text-lg">Contact Information</h3>
      <p className="text-sm text-slate-600 mb-4">
        This information will be displayed at the end of the video for potential buyers to contact you.
      </p>

      <Form {...form}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Smith"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Update parent state on change
                        const updatedValues = {...form.getValues(), contactName: e.target.value};
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
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Update parent state on change
                        const updatedValues = {...form.getValues(), contactPhone: e.target.value};
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
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Update parent state on change
                        const updatedValues = {...form.getValues(), contactEmail: e.target.value};
                        onSubmit(updatedValues);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
    </div>
  );
}
