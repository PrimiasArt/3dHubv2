'use client';

import React from 'react';
import { Sparkles, Zap, Rocket, Crown, Check, ShieldCheck } from 'lucide-react';
import { AITierId, AI_PRINT_TIERS } from '@/backend/domain/ai-tiers';
import { useSystemEnvironment } from '@/hooks/useSystemEnvironment';

interface AIPrintTierSelectorProps {
  selectedTier: AITierId;
  onSelectTier: (tierId: AITierId) => void;
  userBalanceVnd?: number;
}

export function AIPrintTierSelector({
  selectedTier,
  onSelectTier,
  userBalanceVnd = 100000,
}: AIPrintTierSelectorProps) {
  const { isOfficial, isStaging } = useSystemEnvironment();
  const tiers = Object.values(AI_PRINT_TIERS);

  const getTierIcon = (id: AITierId) => {
    switch (id) {
      case 'tripo_fast':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'trellis_pro':
        return <Rocket className="w-5 h-5 text-indigo-400" />;
      case 'meshy_ultra':
        return <Crown className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Chọn Cấp Độ Dựng & In 3D AI</span>
        </label>
        <span className="text-[11px] text-slate-400">
          Số dư ví: <strong className="text-amber-400 font-mono">{userBalanceVnd.toLocaleString('vi-VN')} đ</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tiers.map((t) => {
          const isSelected = selectedTier === t.id;
          const hasEnoughBalance = userBalanceVnd >= t.priceVnd;

          return (
            <div
              key={t.id}
              onClick={() => onSelectTier(t.id)}
              className={`relative rounded-2xl p-4 cursor-pointer transition-all border flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900/90 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/30 -translate-y-0.5'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.badgeColor}`}>
                  {t.badge}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{t.speedEstimate}</span>
              </div>

              {/* Title & Engine */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {getTierIcon(t.id)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{t.name}</h4>
                    <span className="text-[10px] font-mono text-indigo-300">{t.engine}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 mb-3 leading-relaxed">
                  {t.description}
                </p>

                {/* Features List */}
                <div className="space-y-1 mb-3 pt-2 border-t border-slate-800/80">
                  {t.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Selection Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between mt-auto">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-extrabold font-mono text-slate-100">
                      {t.priceVnd.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  {isOfficial ? (
                    <span className="text-[10px] text-emerald-400 font-semibold block">
                      ✓ Chuẩn in FDM / SLA 100%
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400/80 font-mono block">
                      [Staging Cost: ${t.costUsd}]
                    </span>
                  )}
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-400 text-white'
                      : 'border-slate-700 bg-slate-900 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
