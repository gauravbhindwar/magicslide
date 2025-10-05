'use client';

import { useState, useEffect } from 'react';
import { Loader2, Brain, FileText, Palette, Sparkles } from 'lucide-react';

const LOADING_STAGES = [
  { 
    icon: Brain, 
    text: 'Understanding your request...', 
    description: 'Analyzing content requirements',
    duration: 2000 
  },
  { 
    icon: FileText, 
    text: 'Generating slide content...', 
    description: 'Creating engaging content with AI',
    duration: 3000 
  },
  { 
    icon: Palette, 
    text: 'Designing layout...', 
    description: 'Applying professional themes',
    duration: 2000 
  },
  { 
    icon: Sparkles, 
    text: 'Adding finishing touches...', 
    description: 'Optimizing for your audience',
    duration: 1500 
  }
];

export default function LoadingIndicator({ isVisible, onComplete }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStage(0);
      setProgress(0);
      return;
    }

    const totalDuration = LOADING_STAGES.reduce((acc, stage) => acc + stage.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 100;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      // Update current stage based on elapsed time
      let cumulativeDuration = 0;
      for (let i = 0; i < LOADING_STAGES.length; i++) {
        cumulativeDuration += LOADING_STAGES[i].duration;
        if (elapsed <= cumulativeDuration) {
          setCurrentStage(i);
          break;
        }
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const CurrentIcon = LOADING_STAGES[currentStage]?.icon || Loader2;

  return (
    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-sm animate-fade-in-scale">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <CurrentIcon className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-400 rounded-full flex items-center justify-center">
            <Loader2 className="h-2 w-2 text-white animate-spin" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="text-base font-semibold text-purple-800 mb-1">
            {LOADING_STAGES[currentStage]?.text || 'Processing...'}
          </div>
          <div className="text-sm text-purple-600 mb-3">
            {LOADING_STAGES[currentStage]?.description || 'Working on your presentation...'}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-purple-600">
            <span>Stage {currentStage + 1} of {LOADING_STAGES.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>
      </div>
      
      {/* Stage indicators */}
      <div className="mt-4 flex justify-between">
        {LOADING_STAGES.map((stage, index) => (
          <div key={index} className="flex flex-col items-center space-y-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              index <= currentStage 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'bg-purple-100 text-purple-400'
            }`}>
              <stage.icon className="h-4 w-4" />
            </div>
            <div className={`text-xs text-center transition-colors ${
              index <= currentStage ? 'text-purple-700 font-medium' : 'text-purple-400'
            }`}>
              {stage.text.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}