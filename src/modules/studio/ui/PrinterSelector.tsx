'use client';

import React from 'react';
import { Printer, Box } from 'lucide-react';
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
      <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between px-0.5">
        <span className="flex items-center gap-1.5 text-slate-900">
          <Printer className="w-3.5 h-3.5 text-cyan-600" />
          <span>Model Máy In 3D (Build Volume Preset):</span>
        </span>
        <span className="text-[11px] text-slate-500 font-medium">
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
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between backdrop-blur-xl ${
                isSelected
                  ? 'bg-cyan-50/95 border-cyan-500 text-cyan-950 shadow-sm ring-1 ring-cyan-500'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start justify-between gap-1.5 w-full">
                <span className="text-xs font-bold text-slate-900 truncate">{p.name}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 shadow-xs"
                  style={{ backgroundColor: p.accentColor }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5">
                <span className="flex items-center gap-1">
                  <Box className="w-3 h-3 text-slate-400" />
                  {p.bedDimensions.x}×{p.bedDimensions.y}×{p.bedDimensions.z}mm
                </span>
                <span className="flex items-center gap-1 font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
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
