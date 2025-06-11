import { Step } from '../types';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  return (
    <div className="h-[calc(110vh-14rem)] overflow-y-auto pr-2">
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = step.status === 'completed';
          const isInProgress = step.status === 'in-progress';

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${isActive ? 'z-10' : 'z-0'}`}
            >
              <button
                onClick={() => onStepClick?.(step.id)}
                className={`w-full text-left group transition-all duration-200 ${
                  isActive
                    ? 'scale-100'
                    : 'scale-95 hover:scale-100'
                }`}
              >
                <div className={`
                  relative p-2 rounded-lg border transition-all duration-200
                  ${isActive 
                    ? 'bg-secondary/80 border-ring shadow-lg' 
                    : 'bg-secondary/20 border-border/40 hover:bg-secondary/40'
                  }
                `}>
                  {/* Status Icon */}
                  <div className="absolute -left-1 -top-1">
                    {isCompleted ? (
                      <div className="bg-background rounded-full p-0.5">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      </div>
                    ) : isInProgress ? (
                      <div className="bg-background rounded-full p-0.5">
                        <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                      </div>
                    ) : (
                      <div className="bg-background rounded-full p-0.5">
                        <Circle className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-0.5">
                    <h3 className={`text-xs font-medium ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-[10px] line-clamp-1 ${
                      isActive ? 'text-muted-foreground' : 'text-muted-foreground/70'
                    }`}>
                      {step.description}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  {isInProgress && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5">
                      <div className="h-full bg-blue-500/50 animate-pulse rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}