'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Clock, Weight, DollarSign, Layers } from 'lucide-react';
import { IPrintEstimation } from '@/backend/domain/slicing';

interface PrintSimulationSliderProps {
  currentLayer: number;
  totalLayers: number;
  simulationProgressPercent: number;
  isPlayingSimulation: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSeek: (layer: number) => void;
  estimation: IPrintEstimation;
}

export function PrintSimulationSlider({
  currentLayer,
  totalLayers,
  simulationProgressPercent,
  isPlayingSimulation,
  onPlay,
  onPause,
  onReset,
  onSeek,
  estimation,
}: PrintSimulationSliderProps) {
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} phút`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="p-4 sm:p-5 rounded-[28px] vision-glass space-y-3.5">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-white/90" />
            <span>Mô Phỏng In 3D Từng Lớp (Layer Simulation):</span>
          </span>
        </div>

        {/* Play / Pause / Reset Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={isPlayingSimulation ? onPause : onPlay}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 border ${
              isPlayingSimulation
                ? 'bg-amber-500/25 border-amber-400/40 text-amber-200'
                : 'vision-pill-btn'
            }`}
          >
            {isPlayingSimulation ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Tạm Dừng</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Xem Mô Phỏng In</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all"
            title="Xem toàn bộ mô hình (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer Slider Track */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="text-white/70">
            Đang in lớp: <strong className="text-white font-mono text-sm">{currentLayer}</strong> / {totalLayers}
          </span>
          <span className="text-xs font-mono font-bold text-emerald-300">
            {simulationProgressPercent}%
          </span>
        </div>

        <input
          type="range"
          min="1"
          max={totalLayers}
          value={currentLayer}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-white"
        />

        <div className="flex justify-between text-[10px] text-white/40 font-mono px-0.5">
          <span>Lớp 1 (Bàn in)</span>
          <span>50%</span>
          <span>Lớp {totalLayers} (Đỉnh mô hình)</span>
        </div>
      </div>

      {/* Real-Time Slicing Specs Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {/* Print Time */}
        <div className="p-2.5 rounded-2xl bg-black/25 border border-white/10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-white/50 block">Thời gian in</span>
            <span className="text-xs font-bold text-white font-mono">
              {formatTime(estimation.estimatedPrintTimeMinutes)}
            </span>
          </div>
        </div>

        {/* Filament Weight */}
        <div className="p-2.5 rounded-2xl bg-black/25 border border-white/10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300 shrink-0">
            <Weight className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-white/50 block">Trọng lượng nhựa</span>
            <span className="text-xs font-bold text-white font-mono">
              {estimation.filamentWeightGrams}g ({estimation.filamentLengthMeters}m)
            </span>
          </div>
        </div>

        {/* Cost */}
        <div className="p-2.5 rounded-2xl bg-black/25 border border-white/10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 shrink-0">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-white/50 block">Chi phí ước tính</span>
            <span className="text-xs font-bold text-white font-mono" suppressHydrationWarning>
              {new Intl.NumberFormat('en-US').format(estimation.estimatedCostVnd)} đ
            </span>
          </div>
        </div>

        {/* Total Layers & Height */}
        <div className="p-2.5 rounded-2xl bg-black/25 border border-white/10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-white/50 block">Số lớp (0.2mm)</span>
            <span className="text-xs font-bold text-white font-mono">
              {estimation.totalLayers} Layers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
