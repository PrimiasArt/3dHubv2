'use client';

import React from 'react';
import { Sparkles, Ship, Bot, Flame, Cog, Shield, Fan, Landmark } from 'lucide-react';
import { SAMPLE_PRINT_MODELS, SampleModelId, ISamplePrintModel } from '@/backend/domain/sample-models';

interface SampleModelSelectorProps {
  selectedModelId: SampleModelId;
  onSelectModel: (model: ISamplePrintModel) => void;
  disabled?: boolean;
}

const ICONS: Record<SampleModelId, React.ComponentType<{ className?: string }>> = {
  benchy: Ship,
  dragon: Flame,
  robot: Bot,
  gear: Cog,
  helmet: Shield,
  turbine: Fan,
  eiffel: Landmark,
  custom: Sparkles,
};

export function SampleModelSelector({
  selectedModelId,
  onSelectModel,
  disabled,
}: SampleModelSelectorProps) {
  return (
    <div className="vision-glass rounded-[24px] p-3.5 space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-white/90" />
          <span>Mô Hình In Mẫu Có Sẵn Để Xem Mô Phỏng In (Sample Presets):</span>
        </span>
        <span className="text-[11px] text-white/60 font-medium hidden sm:inline">
          Click để nạp ngay vào bàn in 3D
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {SAMPLE_PRINT_MODELS.map((item) => {
          const isSelected = selectedModelId === item.id;
          const Icon = ICONS[item.id] || Ship;

          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectModel(item)}
              className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between backdrop-blur-xl ${
                isSelected
                  ? 'bg-white/28 border-white/35 text-white shadow-lg shadow-black/20 ring-1 ring-white/30'
                  : 'bg-black/20 hover:bg-white/12 border-white/10 text-white/80 hover:text-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white/30 text-white shadow-xs' : 'bg-white/10 text-white/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold truncate">{item.name.split(' - ')[0]}</span>
              </div>

              <div className="mt-2 text-[10px] text-white/60 flex items-center justify-between">
                <span>{item.defaultDimensionsMm.x}×{item.defaultDimensionsMm.y}×{item.defaultDimensionsMm.z}mm</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full font-semibold border ${
                    item.recommendedSupport === 'tree'
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                      : 'bg-white/10 text-white/60 border-white/10'
                  }`}
                >
                  {item.recommendedSupport === 'tree' ? 'Tree Sup' : 'No Sup'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
