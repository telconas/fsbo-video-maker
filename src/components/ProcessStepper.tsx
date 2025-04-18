import { Check } from "lucide-react";

interface ProcessStepperProps {
  currentStep: number;
  steps: { label: string }[];
}

export default function ProcessStepper({ currentStep, steps }: ProcessStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto px-4 py-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                  index < currentStep 
                    ? "bg-success text-white"
                    : index === currentStep
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < currentStep ? (
                  <Check size={18} />
                ) : (
                  index + 1
                )}
              </div>
              <span 
                className={`text-xs sm:text-sm ${
                  index < currentStep 
                    ? "text-success"
                    : index === currentStep
                    ? "text-primary font-medium"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="h-1 flex-1 bg-gray-200 mx-2">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: index < currentStep ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
