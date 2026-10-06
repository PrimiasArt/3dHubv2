'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, Zap, TrendingUp, Copy, Check } from 'lucide-react';
import { PrintCostCalculator } from '@/backend/services/slicing/PrintCostCalculator';
import { ISupportConfig } from '@/backend/domain/slicing';

interface PrintCostCalculatorProps {
  filamentType: string;
  filamentWeightGrams: number;
  printTimeMinutes: number;
  supportConfig?: ISupportConfig;
  printerWattage?: number;
}

export function PrintCostCalculatorComponent({
  filamentType,
  filamentWeightGrams,
  printTimeMinutes,
  supportConfig,
  printerWattage = 350,
}: PrintCostCalculatorProps) {
  const [marginMultiplier, setMarginMultiplier] = useState<number>(2.5);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const cost = useMemo(() => {
    return PrintCostCalculator.calculateCost({
      filamentType,
      modelWeightGrams: filamentWeightGrams,
      printTimeMinutes,
      printerWattage,
      hasSupport: !!supportConfig?.enabled && supportConfig.type !== 'none',
      supportType: supportConfig?.type || 'none',
      marginMultiplier,
    });
  }, [filamentType, filamentWeightGrams, printTimeMinutes, printerWattage, supportConfig, marginMultiplier]);

  const handleCopyQuote = () => {
    const text = `📋 BÁO GIÁ DỊCH VỤ IN 3D - 3D HUB
━━━━━━━━━━━━━━━━━━━━━
• Loại nhựa: ${filamentType.toUpperCase()}
• Khối lượng: ${filamentWeightGrams}g (Support: +${cost.supportWeightGrams}g)
• Thời gian in: ${Math.floor(printTimeMinutes / 60)}h ${printTimeMinutes % 60}p
• Chi phí nhựa: ${cost.totalFilamentCostVnd.toLocaleString('vi-VN')} đ
• Chi phí điện & khấu hao: ${(cost.powerCostVnd + cost.depreciationCostVnd).toLocaleString('vi-VN')} đ
━━━━━━━━━━━━━━━━━━━━━
👉 TỔNG GIÁ DỊCH VỤ: ${cost.suggestedSellingPriceVnd.toLocaleString('vi-VN')} VNĐ`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="p-4 sm:p-5 rounded-[28px] vision-glass space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-white">
            <Calculator className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Bóc Tách Chi Phí &amp; Báo Giá Dịch Vụ In 3D</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white/90 border border-white/15">
                FDM Market Rates VN
              </span>
            </h4>
            <p className="text-[11px] text-white/60">
              Tự động tính chi phí nhựa, điện tiêu thụ, khấu hao máy &amp; đề xuất giá bán gia công
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyQuote}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer shadow-xs active:scale-95"
          title="Sao chép văn bản báo giá cho khách hàng"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-white" />}
          <span>{isCopied ? 'Đã chép báo giá' : 'Sao chép báo giá'}</span>
        </button>
      </div>

      {/* Main KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Cost of Goods */}
        <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-1">
          <span className="text-[11px] font-semibold text-white/70 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-amber-300" /> Giá Vốn Sản Xuất (COGS)
          </span>
          <p className="text-lg font-black text-white font-mono">
            {cost.totalProductionCostVnd.toLocaleString('vi-VN')} <span className="text-xs font-normal text-white/60">đ</span>
          </p>
          <p className="text-[10px] text-white/50">
            Gồm {filamentWeightGrams + cost.supportWeightGrams}g nhựa + điện + hao mòn máy
          </p>
        </div>

        {/* Suggested Selling Price */}
        <div className="p-3.5 rounded-2xl bg-white/20 border border-white/25 space-y-1 backdrop-blur-xl">
          <span className="text-[11px] font-bold text-white flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-300" /> Giá Bán Đề Xuất (Margin {marginMultiplier}x)
          </span>
          <p className="text-xl font-black text-emerald-200 font-mono">
            {cost.suggestedSellingPriceVnd.toLocaleString('vi-VN')} <span className="text-xs font-normal text-white/70">đ</span>
          </p>
          <p className="text-[10px] text-white/70">
            Mức giá cạnh tranh tiêu chuẩn Maker Việt Nam
          </p>
        </div>

        {/* Estimated Profit */}
        <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-1">
          <span className="text-[11px] font-semibold text-white/80 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-white/90" /> Lợi Nhuận Gộp Ước Tính
          </span>
          <p className="text-lg font-black text-white font-mono">
            +{cost.estimatedProfitVnd.toLocaleString('vi-VN')} <span className="text-xs font-normal text-white/60">đ</span>
          </p>
          <p className="text-[10px] text-white/50">
            Tỷ suất lợi nhuận: <strong className="text-white">{cost.profitPercentage}%</strong>
          </p>
        </div>
      </div>

      {/* Margin Multiplier Slider */}
      <div className="space-y-1.5 p-3 rounded-2xl bg-black/20 border border-white/10">
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="text-white/70 flex items-center gap-1">
            Hệ số biên lợi nhuận (Profit Margin):
          </span>
          <span className="font-mono font-bold text-white">
            {marginMultiplier}x (Lợi nhuận {cost.profitPercentage}%)
          </span>
        </div>
        <input
          type="range"
          min="1.5"
          max="4.0"
          step="0.1"
          value={marginMultiplier}
          onChange={(e) => setMarginMultiplier(Number(e.target.value))}
          className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-white"
        />
        <div className="flex justify-between text-[10px] text-white/40 font-mono px-0.5">
          <span>1.5x (Giá hữu nghị)</span>
          <span>2.5x (Tiêu chuẩn thị trường)</span>
          <span>4.0x (Sản phẩm phức tạp / Gấp)</span>
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Filament */}
        <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
          <span className="text-[10px] text-white/50 block">SỢI NHỰA CHÍNH:</span>
          <p className="font-bold text-white mt-0.5">
            {cost.modelFilamentCostVnd.toLocaleString('vi-VN')} đ
          </p>
          <span className="text-[10px] text-white/50">{filamentWeightGrams}g @ {cost.filamentPricePerGram}đ/g</span>
        </div>

        {/* Support */}
        <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
          <span className="text-[10px] text-white/50 block">NHỰA SUPPORT:</span>
          <p className="font-bold text-white mt-0.5">
            {cost.supportCostVnd.toLocaleString('vi-VN')} đ
          </p>
          <span className="text-[10px] text-white/50">+{cost.supportWeightGrams}g hao phí</span>
        </div>

        {/* Power */}
        <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
          <span className="text-[10px] text-white/50 block">ĐIỆN TIÊU THỤ:</span>
          <p className="font-bold text-white mt-0.5">
            {cost.powerCostVnd.toLocaleString('vi-VN')} đ
          </p>
          <span className="text-[10px] text-white/50">{printerWattage}W • 2.600đ/kWh</span>
        </div>

        {/* Machine Wear */}
        <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
          <span className="text-[10px] text-white/50 block">KHẤU HAO MÁY:</span>
          <p className="font-bold text-white mt-0.5">
            {cost.depreciationCostVnd.toLocaleString('vi-VN')} đ
          </p>
          <span className="text-[10px] text-white/50">4.000đ/giờ đầu in</span>
        </div>
      </div>
    </div>
  );
}
