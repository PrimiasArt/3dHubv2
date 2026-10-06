'use client';

import React from 'react';
import { Printer, Gauge, Box } from 'lucide-react';
import { IPrinterProfile } from '@/backend/domain/slicing';

interface PrinterSelectorProps {
  printers: IPrinterProfile[];
  selectedPrinter: IPrinterProfile;
  onSelectPrinter: (id: string) => void;
  disabled?: boolean;
}

export function PrinterSelector({
  printers,
  selectedPrinter,
  onSelectPrinter,
  disabled,
}: PrinterSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-white/70 flex items-center justify-between px-0.5">
        <span className="flex items-center gap-1.5 text-white">
          <Printer className="w-3.5 h-3.5 text-white/90" />
          <span>Model Máy In 3D (Build Volume Preset):</span>
        </span>
        <span className="text-[11px] text-white/60">
          Khổ in: {selectedPrinter.bedDimensions.x}×{selectedPrinter.bedDimensions.y}×{selectedPrinter.bedDimensions.z} mm
        </span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {printers.map((p) => {
          const isSelected = selectedPrinter.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPrinter(p.id)}
              className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between backdrop-blur-xl ${
                isSelected
                  ? 'bg-white/28 border-white/35 text-white shadow-lg shadow-black/20 ring-1 ring-white/30'
                  : 'bg-black/20 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start justify-between gap-1.5 w-full">
                <span className="text-xs font-bold text-white truncate">{p.name}</span>
                <span
                  className="w-2 h-2 rounded-full shrink-0 mt-1 shadow-xs"
                  style={{ backgroundColor: p.accentColor }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/60 mt-2">
                <span className="flex items-center gap-1">
                  <Box className="w-3 h-3 text-white/40" />
                  {p.bedDimensions.x}×{p.bedDimensions.y}×{p.bedDimensions.z}mm
                </span>
                <span className="flex items-center gap-1 font-mono text-emerald-300">
                  <Gauge className="w-3 h-3" />
                  {p.maxSpeedMmS}mm/s
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
