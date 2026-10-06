'use client';

import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Sparkles,
  Thermometer,
  Gauge,
  Wind,
  Layers,
  Lightbulb,
  Download,
} from 'lucide-react';
import { IExpertPrintProfile } from '@/backend/domain/wallet';
import { IPrinterProfile, ISupportConfig } from '@/backend/domain/slicing';
import { PresetGeneratorService } from '@/backend/services/slicing/PresetGeneratorService';

interface ExpertProfileCardProps {
  profile: IExpertPrintProfile;
  isUnlocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
  isUnlocking: boolean;
  userBalanceVnd: number;
  onOpenTopUp: () => void;
  printer?: IPrinterProfile;
  dimensionsMm?: { x: number; y: number; z: number };
  supportConfig?: ISupportConfig;
}

export function ExpertProfileCard({
  profile,
  isUnlocked,
  onUnlock,
  onLock,
  isUnlocking,
  userBalanceVnd,
  onOpenTopUp,
  printer,
  dimensionsMm,
  supportConfig,
}: ExpertProfileCardProps) {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleExportProfile = () => {
    const filename = PresetGeneratorService.downloadPreset(
      profile,
      printer,
      dimensionsMm,
      supportConfig
    );
    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="relative rounded-[32px] vision-glass overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              Profile In Chuyên Nghiệp &amp; Hướng Dẫn In Đẹp Nhất
            </h3>
            {isUnlocked ? (
              <button
                type="button"
                onClick={onLock}
                title="Bấm để khóa lại (Demo tính năng mở khóa 1.000đ)"
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 hover:bg-rose-500/20 text-white hover:text-rose-200 border border-white/25 hover:border-rose-400/40 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Unlock className="w-3 h-3" />
                <span>ĐÃ MỞ KHÓA</span>
              </button>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white border border-white/20 flex items-center gap-1">
                <Lock className="w-3 h-3" /> PRO PRESET (1.000 đ)
              </span>
            )}
          </div>
          <p className="text-xs text-white/60 mt-1">
            Thông số chuẩn được cân chỉnh bởi Maker chuyên nghiệp: Nhiệt độ, Tốc độ, Quạt, Retraction, và Tip-Trick
          </p>
        </div>

        {/* Action Button: Unlock or Unlocked/Re-lock Toggle + Export */}
        {isUnlocked ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLock}
              title="Bấm để khóa lại profile và thử lại tính năng mở khóa trừ tiền"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/15 hover:bg-rose-500/20 text-white hover:text-rose-200 border border-white/20 hover:border-rose-400/30 text-xs font-semibold transition-all active:scale-95 group cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5 text-white group-hover:hidden" />
              <Lock className="w-3.5 h-3.5 text-rose-300 hidden group-hover:inline" />
              <span className="group-hover:hidden">Đã Mở Khóa (Bấm để Khóa Lại)</span>
              <span className="hidden group-hover:inline">Khóa Lại (Demo)</span>
            </button>

            <button
              type="button"
              onClick={handleExportProfile}
              className="vision-pill-btn flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Xuất Preset (.3MF)</span>
            </button>

            {downloadSuccess && (
              <span className="hidden lg:inline text-[11px] text-emerald-300 font-semibold animate-pulse">
                ✓ Đã tải: {downloadSuccess}
              </span>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onUnlock}
            disabled={isUnlocking}
            className="vision-pill-btn flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-lg active:scale-95 cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Mở Khóa Profile (1.000 đ)</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative p-5 space-y-5">
        {/* If LOCKED: Blurred Overlay with Prompt to Unlock or Top-up */}
        {!isUnlocked && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-white/20 border border-white/25 flex items-center justify-center text-white shadow-xl mb-3">
              <Lock className="w-7 h-7" />
            </div>

            <h4 className="text-base font-bold text-white">
              Mở Khóa Profile In Chuyên Nghiệp Cho [{profile.modelName}]
            </h4>
            <p className="text-xs text-white/70 max-w-md mt-1 mb-4 leading-relaxed">
              Nhận bộ thông số in tối ưu bề mặt láng mịn, thông số Tree Support dễ bóc tách bằng tay không để lại sẹo, nhiệt độ & tốc độ CoreXY chuẩn xác nhất.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onUnlock}
                disabled={isUnlocking}
                className="vision-pill-btn px-6 py-3 rounded-full text-white font-bold text-sm shadow-xl flex items-center gap-2 active:scale-95"
              >
                <Unlock className="w-4 h-4" />
                <span>Mở Khóa Ngay • 1.000 đ</span>
              </button>

              <button
                onClick={onOpenTopUp}
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium transition-colors"
              >
                Số dư: <strong className="text-white font-mono">{userBalanceVnd.toLocaleString('vi-VN')} đ</strong> (Nạp thêm)
              </button>
            </div>
          </div>
        )}

        {/* UNLOCKED DETAILED SLICING PROFILE */}
        <div className={`space-y-4 ${!isUnlocked ? 'filter blur-sm select-none opacity-40' : ''}`}>
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Nozzle & Layer */}
            <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-1">
              <span className="text-[10px] text-white/50 uppercase font-semibold flex items-center gap-1">
                <Layers className="w-3 h-3 text-white/80" /> Đầu In &amp; Lớp
              </span>
              <p className="text-xs font-bold text-white">
                {profile.nozzleSizeMm}mm Nozzle
              </p>
              <p className="text-[11px] text-white/70">
                Độ cao lớp: <strong>{profile.layerHeightMm}mm</strong> (Lớp đầu: {profile.firstLayerHeightMm}mm)
              </p>
            </div>

            {/* Temperatures */}
            <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-1">
              <span className="text-[10px] text-white/50 uppercase font-semibold flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-rose-300" /> Nhiệt Độ Chuẩn
              </span>
              <p className="text-xs font-bold text-rose-200">
                {profile.nozzleTempC}°C Nozzle
              </p>
              <p className="text-[11px] text-white/70">
                Bàn in: <strong>{profile.bedTempC}°C</strong> (Đầu phun: {profile.firstLayerNozzleTempC}°C lớp 1)
              </p>
            </div>

            {/* Speeds */}
            <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-1">
              <span className="text-[10px] text-white/50 uppercase font-semibold flex items-center gap-1">
                <Gauge className="w-3 h-3 text-emerald-300" /> Tốc Độ CoreXY
              </span>
              <p className="text-xs font-bold text-emerald-200">
                {profile.outerWallSpeedMmS} mm/s (Lớp ngoài)
              </p>
              <p className="text-[11px] text-white/70">
                Lớp trong: {profile.innerWallSpeedMmS} mm/s • Infill: {profile.infillSpeedMmS} mm/s
              </p>
            </div>

            {/* Cooling & Retraction */}
            <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-1">
              <span className="text-[10px] text-white/50 uppercase font-semibold flex items-center gap-1">
                <Wind className="w-3 h-3 text-cyan-300" /> Quạt &amp; Retract
              </span>
              <p className="text-xs font-bold text-cyan-200">
                Quạt: {profile.coolingFanPercent}%
              </p>
              <p className="text-[11px] text-white/70">
                Retraction: {profile.retractionDistanceMm}mm @ {profile.retractionSpeedMmS}mm/s (Z-hop: {profile.zHopMm}mm)
              </p>
            </div>
          </div>

          {/* Slicing Features & Tree Support Specifics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-black/20 p-3.5 rounded-2xl border border-white/10">
            <div>
              <span className="text-white/60 text-[11px] block font-semibold mb-1">
                CẤU HÌNH LIÊN KẾT &amp; ĐƯỜNG MAY (SEAM):
              </span>
              <ul className="space-y-1 text-white/80 text-[11px]">
                <li>• Kiểu đan ruột (Infill): <strong className="text-white">{profile.infillPattern} ({profile.infillDensityPercent}%)</strong></li>
                <li>• Vị trí giấu đường may: <strong className="text-white">{profile.seamPosition}</strong> (Triệt tiêu vết lồi)</li>
                <li>• Là phẳng mặt trên (Ironing): <strong>{profile.ironingEnabled ? 'BẬT (Mịn lỳ)' : 'TẮT'}</strong></li>
              </ul>
            </div>

            <div>
              <span className="text-white/60 text-[11px] block font-semibold mb-1">
                THÔNG SỐ TREE SUPPORT DỄ BÓC:
              </span>
              <ul className="space-y-1 text-white/80 text-[11px]">
                <li>• Góc nhánh (Branch Angle): <strong className="text-emerald-200">{profile.treeSupportParams.branchAngleDeg}°</strong></li>
                <li>• Đường kính thân cây: <strong className="text-emerald-200">{profile.treeSupportParams.branchDiameterMm} mm</strong></li>
                <li>• Khe hở tiếp xúc (Top Z-Distance): <strong className="text-emerald-200">{profile.treeSupportParams.topInterfaceSpacingMm} mm (Bóc tay 0 vết)</strong></li>
              </ul>
            </div>
          </div>

          {/* Pro Tips & Tricks */}
          <div className="p-4 rounded-2xl bg-white/15 border border-white/20 space-y-2 backdrop-blur-xl">
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-white/90" />
              <span>Mẹo &amp; Tip-Trick Thực Chiến Của Chuyên Gia:</span>
            </h5>
            <div className="space-y-1.5 text-xs text-white/85">
              {profile.proTips.map((tip, idx) => (
                <p key={idx} className="leading-relaxed">
                  {tip}
                </p>
              ))}
            </div>
          </div>

          {/* Demo Mode Re-lock Banner */}
          {isUnlocked && (
            <div className="p-3.5 rounded-2xl bg-black/25 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white shrink-0" />
                <span>
                  <strong>Chế độ Demo:</strong> Bạn có thể bấm vào nút <strong>&quot;Đã Mở Khóa (Bấm để Khóa Lại)&quot;</strong> để khóa lại profile, được hoàn lại 1.000đ và thử lại quy trình mở khóa.
                </span>
              </div>
              <button
                type="button"
                onClick={onLock}
                className="self-end sm:self-center px-3 py-1.5 rounded-full bg-white/15 hover:bg-rose-500/25 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-white/15"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Khóa Lại (Demo)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
