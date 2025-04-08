import React from 'react';
import { Step } from '../types';
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  return (
    <div className="space-y-2">
      {steps.map((step, index) => {
        const isCompleted = step.status === "completed";
        const isCurrent = index + 1 === currentStep;
        const isPending = step.status === "pending";

        return (
          <button
            key={index}
            onClick={() => onStepClick(index + 1)}
            className={`w-full p-4 rounded-lg transition-all duration-200 ${
              isCurrent
                ? 'bg-indigo-500/20 border border-indigo-500/50'
                : 'hover:bg-gray-800/50 border border-transparent'
            } ${isCompleted ? 'opacity-75' : ''}`}
          >
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : isCurrent ? (
                  <PlayCircle className="w-5 h-5 text-indigo-400 animate-pulse" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    isCurrent ? 'text-indigo-400' : 'text-gray-300'
                  }`}>
                    Step {index + 1}
                  </span>
                  {isPending && (
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {step.description || 'Processing...'}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}