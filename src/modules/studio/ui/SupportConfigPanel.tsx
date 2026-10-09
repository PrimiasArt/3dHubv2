'use client';

import React from 'react';
import { GitBranch, Shield, Sparkles, Check, AlertCircle, Info } from 'lucide-react';
import { ISupportConfig, SupportType, IPrintEstimation } from '@/backend/domain/slicing';
import { SampleModelId } from '@/backend/domain/sample-models';

interface SupportConfigPanelProps {
  supportConfig: ISupportConfig;
  onUpdateSupport: (patch: Partial<ISupportConfig>) => void;
  estimation: IPrintEstimation;
  selectedModelId?: SampleModelId;
  disabled?: boolean;
}

export function SupportConfigPanel({
  supportConfig,
  onUpdateSupport,
  estimation,
  selectedModelId = 'benchy',
  disabled,
}: SupportConfigPanelProps) {
  const isRecommendedActive = supportConfig.type === estimation.aiSupportRecommendation.suggestedType;

  return (
    <div className="space-y-3.5 p-4 rounded-[24px] vision-glass">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
          <GitBranch className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-white">Hệ Thống Support In 3D (Support Prefs):</span>
        </label>

        {/* Support Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={supportConfig.enabled}
            onChange={(e) => onUpdateSupport({ enabled: e.target.checked })}
            disabled={disabled}
            className="sr-only peer"
          />
          <div className="w-10 h-5.5 bg-black/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
          <span className="ml-2 text-xs font-bold text-white">
            {supportConfig.enabled ? 'BẬT' : 'TẮT'}
          </span>
        </label>
      </div>

      {/* Model-specific Real-World Advice Notice */}
      {selectedModelId === 'gear' && supportConfig.enabled && (
        <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs flex items-center gap-2 backdrop-blur-md">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-300" />
          <span>
            <strong>Cảnh báo in bánh răng:</strong> Mô hình cơ khí tự thoát góc 45°. Không nên bật support để tránh kẹt các rãnh răng chuyển động!
          </span>
        </div>
      )}

      {selectedModelId === 'dragon' && supportConfig.enabled && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs flex items-center gap-2 backdrop-blur-md">
          <Info className="w-4 h-4 shrink-0 text-emerald-300" />
          <span>
            <strong>Tree Support Rồng Chuẩn:</strong> Các nhánh cây uốn lượn ôm sát cằm và sừng, tự động né tránh hoàn toàn các khớp cầu xoay (*Print-in-Place*).
          </span>
        </div>
      )}

      {selectedModelId === 'helmet' && supportConfig.enabled && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs flex items-center gap-2 backdrop-blur-md">
          <Info className="w-4 h-4 shrink-0 text-emerald-300" />
          <span>
            <strong>Tree Support Nón Giáp:</strong> Hệ thống cành cây ôm khít vòm cằm màng lọc, ốp má và cụm tai nghe 2 bên, để hở mặt kính visor.
          </span>
        </div>
      )}

      {selectedModelId === 'turbine' && supportConfig.enabled && (
        <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs flex items-center gap-2 backdrop-blur-md">
          <Info className="w-4 h-4 shrink-0 text-cyan-300" />
          <span>
            <strong>Support Động Cơ Phản Lực:</strong> Trụ đỡ kiên cố mép miệng hút gió tròn phía trước và bụng dưới thân vỏ nacelle.
          </span>
        </div>
      )}

      {selectedModelId === 'eiffel' && supportConfig.enabled && (
        <div className="p-3 rounded-2xl bg-white/20 border border-white/25 text-white text-xs flex items-center gap-2 backdrop-blur-md">
          <Info className="w-4 h-4 shrink-0 text-white" />
          <span>
            <strong>Tree Support Tháp Eiffel:</strong> Chùm cành cây hội tụ nâng đỡ mặt trần vòm La Mã trung tâm dưới sàn quan sát tầng 1.
          </span>
        </div>
      )}

      {supportConfig.enabled && (
        <div className="space-y-3 pt-1">
          {/* Support Type Radio Options */}
          <div className="grid grid-cols-2 gap-2">
            {/* Tree Support */}
            <div
              onClick={() => !disabled && onUpdateSupport({ type: 'tree' })}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between backdrop-blur-xl ${
                supportConfig.type === 'tree'
                  ? 'bg-white/28 border-white/35 text-white shadow-md ring-1 ring-white/30'
                  : 'bg-black/20 border-white/10 text-white/70 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-white">
                  <GitBranch className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Tree Support (Cây)</span>
                </span>
                {supportConfig.type === 'tree' && <Check className="w-3.5 h-3.5 text-emerald-300" />}
              </div>
              <p className="text-[11px] text-white/70 mt-1">
                Ôm sát mô hình, tiết kiệm ~45% nhựa, dễ bóc tách bằng tay 0 vết sẹo.
              </p>
            </div>

            {/* Normal Support */}
            <div
              onClick={() => !disabled && onUpdateSupport({ type: 'normal' })}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between backdrop-blur-xl ${
                supportConfig.type === 'normal'
                  ? 'bg-white/28 border-white/35 text-white shadow-md ring-1 ring-white/30'
                  : 'bg-black/20 border-white/10 text-white/70 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-white">
                  <Shield className="w-3.5 h-3.5 text-white/90" />
                  <span>Normal Support (Cột)</span>
                </span>
                {supportConfig.type === 'normal' && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <p className="text-[11px] text-white/70 mt-1">
                Chắc chắn và kiên cố, phù hợp cho bề mặt phẳng ngang lớn.
              </p>
            </div>
          </div>

          {/* Overhang Threshold Slider */}
          <div className="space-y-1 bg-black/20 p-2.5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs text-white/70 px-0.5">
              <span>Ngưỡng góc nghiêng Overhang:</span>
              <span className="font-mono font-bold text-white">
                {supportConfig.overhangThresholdDegrees}°
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="65"
              step="1"
              value={supportConfig.overhangThresholdDegrees}
              onChange={(e) => onUpdateSupport({ overhangThresholdDegrees: Number(e.target.value) })}
              disabled={disabled}
              className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-[10px] text-white/40 font-mono px-0.5">
              <span>40° (Nhiều)</span>
              <span>50° (Chuẩn FDM)</span>
              <span>65° (Ít)</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Support Recommendation Box */}
      <div className="p-3.5 rounded-2xl bg-white/15 border border-white/20 space-y-1.5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-white/90" />
            <span>AI Slicing Advisor Đề Xuất:</span>
          </span>
          {!isRecommendedActive && (
            <button
              type="button"
              onClick={() => onUpdateSupport({ enabled: true, type: estimation.aiSupportRecommendation.suggestedType })}
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/25 hover:bg-white/35 text-white border border-white/25 transition-all shadow-xs"
            >
              Áp dụng ngay
            </button>
          )}
        </div>
        <p className="text-xs text-white/80 leading-relaxed">
          {estimation.aiSupportRecommendation.reason}
        </p>
      </div>
    </div>
  );
}
