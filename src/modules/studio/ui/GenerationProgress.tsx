'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface GenerationProgressProps {
  progress: number;
  currentStep: string;
}

export function GenerationProgress({ progress, currentStep }: GenerationProgressProps) {
  const steps = [
    { label: 'Tách nền ảnh 2D', minProgress: 20 },
    { label: 'Phân tích hình học không gian', minProgress: 50 },
    { label: 'Dựng lưới đa giác 3D Mesh', minProgress: 80 },
    { label: 'Bake Texture & Manifold STL', minProgress: 100 },
  ];

  return (
    <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 font-semibold text-indigo-300">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          {currentStep}
        </span>
        <span className="font-bold text-indigo-400 text-sm">{progress}%</span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 shadow-lg shadow-indigo-500/50"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 4 Steps Indicator */}
      <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-1 text-slate-400">
        {steps.map((st, i) => {
          const isDone = progress >= st.minProgress;
          return (
            <div
              key={st.label}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isDone ? 'text-indigo-300 font-semibold' : 'text-slate-600'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  isDone ? 'bg-indigo-400' : 'bg-slate-700'
                }`}
              />
              <span className="truncate w-full">{st.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
