'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  CheckCircle2,
  ThumbsUp,
  Share2,
  Clock,
  Printer,
  Sliders,
  RefreshCw,
  Box,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { IExpertPrintProfile, IExpertPrintProfileVariant } from '@/backend/domain/wallet';
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
  customModelName?: string;
  volumeCm3?: number;
  triangleCount?: number;
  onProfileChange?: (selectedProfile: IExpertPrintProfileVariant) => void;
}

const PRINTER_FILTER_TABS = ['All', 'P1S', 'X1 Carbon', 'A1', 'A1 mini', 'K1 Max', 'Prusa MK4'];

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
  customModelName,
  volumeCm3,
  triangleCount,
  onProfileChange,
}: ExpertProfileCardProps) {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [selectedFilterTab, setSelectedFilterTab] = useState('All');
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [variants, setVariants] = useState<IExpertPrintProfileVariant[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiModelUsed, setAiModelUsed] = useState<string>('Gemini 2.5 Flash');
  const [inspectionData, setInspectionData] = useState<any>(null);

  const modelTitle = customModelName || profile.modelName;

  // Tải danh sách profile custom từ AI API cho mẫu in cụ thể
  const fetchAiProfiles = useCallback(
    async (forceRefresh = false) => {
      setIsLoadingAI(true);
      try {
        const res = await fetch('/api/slicing/ai-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelId: profile.modelId,
            modelName: modelTitle,
            dimensionsMm: dimensionsMm || { x: 60, y: 31, z: 48 },
            volumeCm3: volumeCm3 || 25,
            triangleCount: triangleCount || 15000,
            printerId: printer?.id || 'bambu-x1c-p1s',
            printerName: printer?.name || 'Bambu Lab X1-Carbon',
            filamentType: profile.filamentType,
            filamentBrand: profile.filamentBrand,
            forceRefresh,
          }),
        });

        const data = await res.json();
        if (data.success && data.profiles?.length > 0) {
          setVariants(data.profiles);
          setInspectionData(data.inspection);
          setAiModelUsed('Google Gemini 2.5 Intelligence');
          if (onProfileChange && data.profiles[0]) {
            onProfileChange(data.profiles[0]);
          }
        }
      } catch (err) {
        console.warn('Lỗi khi tải AI profiles:', err);
      } finally {
        setIsLoadingAI(false);
      }
    },
    [profile.modelId, modelTitle, dimensionsMm, volumeCm3, triangleCount, printer, profile.filamentType, profile.filamentBrand, onProfileChange]
  );

  useEffect(() => {
    fetchAiProfiles();
  }, [fetchAiProfiles]);

  const activeProfile: IExpertPrintProfileVariant =
    variants[selectedVariantIdx] || {
      ...profile,
      variantId: 'default',
      variantTitle: '0.20mm Standard Balanced Profile',
      creatorName: '3D Hub AI Slicer Pro',
      creatorBadge: 'AI Tuner',
      creatorNotes: `Profile tinh chỉnh cân bằng giữa tốc độ và độ mịn cho ${modelTitle}.`,
      wallLoops: 3,
      wallGenerator: 'Arachne',
      estimatedHours: 1.8,
      estimatedFilamentGrams: 38,
      platesCount: 1,
      rating: 4.9,
      ratingCount: 156,
      downloadsCount: 786,
      likesCount: 420,
      compatiblePrinters: ['P1S', 'X1 Carbon', 'A1', 'K1 Max', 'Prusa MK4'],
      targetStyle: 'speed',
    };

  const handleSelectVariant = (idx: number) => {
    setSelectedVariantIdx(idx);
    if (variants[idx] && onProfileChange) {
      onProfileChange(variants[idx]);
    }
  };

  const handleExportProfile = () => {
    const filename = PresetGeneratorService.downloadPreset(
      activeProfile,
      printer,
      dimensionsMm,
      supportConfig
    );
    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 4500);
  };

  return (
    <div className="relative rounded-[32px] vision-glass overflow-hidden shadow-2xl border border-white/15">
      {/* Top Bar: MakerWorld Print Files Header with Printer Filter Pills */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-black/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Print Profiles</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {variants.length || 3} Profiles Tinh Chỉnh
                </span>
              </h3>

              {isUnlocked ? (
                <button
                  type="button"
                  onClick={onLock}
                  title="Bấm để khóa lại (Demo tính năng mở khóa 1.000đ)"
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 hover:bg-rose-500/20 text-white hover:text-rose-200 border border-white/25 hover:border-rose-400/40 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Unlock className="w-3 h-3 text-emerald-400" />
                  <span>ĐÃ MỞ KHÓA</span>
                </button>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-300" /> PRO PRESET (1.000 đ)
                </span>
              )}

              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 font-mono">
                {aiModelUsed}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Phân tích riêng biệt cho mẫu <strong className="text-white">[{modelTitle}]</strong>: hình học, độ nghiêng góc treo, nan rỗng &amp; dung sai lắp ghép
            </p>
          </div>

          {/* Action Buttons: AI Refresh, Unlock / Export */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => fetchAiProfiles(true)}
              disabled={isLoadingAI}
              title="Phân tích lại mô hình bằng Gemini AI"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin text-cyan-400' : 'text-cyan-300'}`} />
              <span className="hidden sm:inline">{isLoadingAI ? 'Đang Phân Tích...' : 'AI Tinh Chỉnh Lại'}</span>
            </button>

            {isUnlocked ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportProfile}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download 3MF</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onUnlock}
                disabled={isUnlocking}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Mở Khóa Toàn Bộ (1.000 đ)</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills (MakerWorld style: All, P1S, X1 Carbon, A1...) */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {PRINTER_FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedFilterTab(tab)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedFilterTab === tab
                  ? 'bg-white/20 text-white border border-white/30 shadow'
                  : 'bg-black/30 text-white/50 hover:text-white/80 hover:bg-black/50 border border-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* ROW: PROFILE CARDS SELECTOR (Just like MakerWorld Print Files List) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(variants.length > 0
            ? variants
            : [
                {
                  variantId: 'quality',
                  variantTitle: '0.16mm Fine Layer | 3 Walls | Scarf Joint',
                  creatorName: 'Designer',
                  creatorBadge: 'Designer' as const,
                  estimatedHours: 2.2,
                  platesCount: 1,
                  rating: 4.9,
                  ratingCount: 371,
                },
                {
                  variantId: 'speed',
                  variantTitle: 'No ironing | Changed supports | Settings for speed',
                  creatorName: 'ModelWorks3D',
                  creatorBadge: 'Community Master' as const,
                  estimatedHours: 1.6,
                  platesCount: 1,
                  rating: 4.8,
                  ratingCount: 31,
                },
                {
                  variantId: 'strength',
                  variantTitle: '4 Walls | 25% Gyroid | Maximum Rigidity',
                  creatorName: '3D Hub AI Tuner',
                  creatorBadge: 'AI Tuner' as const,
                  estimatedHours: 2.8,
                  platesCount: 1,
                  rating: 5.0,
                  ratingCount: 88,
                },
              ]
          ).map((v: any, idx: number) => {
            const isSelected = selectedVariantIdx === idx;
            return (
              <div
                key={v.variantId || idx}
                onClick={() => handleSelectVariant(idx)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-400/60 shadow-lg shadow-emerald-500/10'
                    : 'bg-black/30 hover:bg-black/45 border-white/10 hover:border-white/20 text-white/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        v.creatorBadge === 'Designer'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                      }`}
                    >
                      {v.creatorName || 'Maker'}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>{v.rating || 4.9}</span>
                      <span className="text-white/40 font-normal">({v.ratingCount || 100})</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {v.variantTitle}
                  </h4>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-white/70" />
                    <strong className="text-white">{v.estimatedHours || 1.8} h</strong>
                  </span>
                  <span>1 plate</span>
                  {isSelected && (
                    <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Đang chọn
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* LOCKED BLURRED OVERLAY IF NOT UNLOCKED */}
        {!isUnlocked && (
          <div className="relative rounded-2xl bg-black/60 border border-white/10 p-6 text-center backdrop-blur-md">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
              <Lock className="w-6 h-6 text-amber-300" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              Mở Khóa Toàn Bộ Profile Tinh Chỉnh Độc Bản Cho [{modelTitle}]
            </h4>
            <p className="text-xs text-white/70 max-w-lg mx-auto mt-1 mb-4 leading-relaxed">
              Mỗi mô hình sở hữu góc thoát và hình học khác nhau. Mở khóa để nhận toàn bộ thông số chuẩn xác (Tree Support không sẹo, điều chỉnh quạt &amp; tốc độ theo độ dốc, tắt Ironing chống hỏng nan mỏng) và tải file 3MF hoàn chỉnh.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onUnlock}
                disabled={isUnlocking}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Mở Khóa Ngay • 1.000 đ</span>
              </button>
              <button
                type="button"
                onClick={onOpenTopUp}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium transition-colors"
              >
                Số dư ví: <strong className="text-emerald-300 font-mono">{userBalanceVnd.toLocaleString('vi-VN')} đ</strong> (Nạp thêm)
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE PROFILE DETAIL INSPECTOR (EXACT MAKERWORLD POPUP LAYOUT) */}
        <div className={`space-y-4 ${!isUnlocked ? 'filter blur-sm select-none opacity-40 pointer-events-none' : ''}`}>
          {/* Section: Profile Inspector Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/15 space-y-4">
            {/* Header of Inspector */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {activeProfile.variantTitle}
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/70 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{activeProfile.creatorName}</span>
                  </span>
                  <span>•</span>
                  <span>{activeProfile.downloadsCount || 786} downloads</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-white/80">
                    <ThumbsUp className="w-3 h-3 text-cyan-300" />
                    <span>{activeProfile.likesCount || 420}</span>
                  </span>
                </div>
              </div>

              {/* Download Button in Profile Header */}
              <button
                type="button"
                onClick={handleExportProfile}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download 3MF</span>
              </button>
            </div>

            {/* Compatible Printers Tags List (MakerWorld style) */}
            <div className="space-y-1 text-xs">
              <span className="text-white/50 text-[11px] font-semibold uppercase block">
                Máy in tương thích đã được kiểm chứng (Verified Printers):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(activeProfile.compatiblePrinters || ['P1S', 'X1 Carbon', 'A1', 'A1 mini', 'K1 Max', 'Prusa MK4']).map(
                  (p: string) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[11px] font-mono text-white/90"
                    >
                      {p}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Maker's Note / Rationale (Authentic creator description) */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-xs text-white/85">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" /> Ghi Chú Cân Chỉnh Từ Kỹ Sư In (Maker&apos;s Tuning Rationale):
              </span>
              <p className="leading-relaxed text-white/90 whitespace-pre-line italic">
                &ldquo;{activeProfile.creatorNotes}&rdquo;
              </p>
            </div>

            {/* Print Metric Badges Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                <span className="text-[10px] text-white/50 block">Số Plate</span>
                <strong className="text-white">{activeProfile.platesCount || 1} plate</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                <span className="text-[10px] text-white/50 block">Thời Gian In</span>
                <strong className="text-emerald-300">{activeProfile.estimatedHours || 1.6} h</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                <span className="text-[10px] text-white/50 block">Đầu Phun</span>
                <strong className="text-white">{activeProfile.nozzleSizeMm || 0.4} mm</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                <span className="text-[10px] text-white/50 block">Khối Lượng Nhựa</span>
                <strong className="text-cyan-300">{activeProfile.estimatedFilamentGrams || 35} g</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                <span className="text-[10px] text-white/50 block">Vật Liệu</span>
                <strong className="text-amber-300">{activeProfile.filamentType.split(' ')[0]}</strong>
              </div>
            </div>

            {/* Slicer Settings Detailed Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/25 border border-white/10 space-y-1">
                <span className="text-[10px] text-white/50 uppercase font-semibold flex items-center gap-1">
                  <Layers className="w-3 h-3 text-white/80" /> Độ Dày Lớp &amp; Thành
                </span>
                <p className="font-bold text-white">{activeProfile.layerHeightMm} mm</p>
                <p className="text-[11px] text-white/70">
                  {activeProfile.wallLoops || 3} Vòng tường ({activeProfile.wallGenerator || 'Arachne'})
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/25 border border-white/10 space-y-1">
                <span className="text-[10px] text-white/50 uppercase font-semibold flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-rose-300" /> Nhiệt Độ Cân Chỉnh
                </span>
                <p className="font-bold text-rose-200">{activeProfile.nozzleTempC}°C Nozzle</p>
                <p className="text-[11px] text-white/70">Bàn in: {activeProfile.bedTempC}°C (PEI Plate)</p>
              </div>

              <div className="p-3 rounded-xl bg-black/25 border border-white/10 space-y-1">
                <span className="text-[10px] text-white/50 uppercase font-semibold flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-emerald-300" /> Tốc Độ CoreXY
                </span>
                <p className="font-bold text-emerald-200">{activeProfile.outerWallSpeedMmS} mm/s Outer</p>
                <p className="text-[11px] text-white/70">Infill: {activeProfile.infillSpeedMmS} mm/s</p>
              </div>

              <div className="p-3 rounded-xl bg-black/25 border border-white/10 space-y-1">
                <span className="text-[10px] text-white/50 uppercase font-semibold flex items-center gap-1">
                  <Wind className="w-3 h-3 text-cyan-300" /> Quạt &amp; Retract
                </span>
                <p className="font-bold text-cyan-200">Quạt: {activeProfile.coolingFanPercent}%</p>
                <p className="text-[11px] text-white/70">
                  {activeProfile.retractionDistanceMm}mm @ {activeProfile.retractionSpeedMmS}mm/s
                </p>
              </div>
            </div>

            {/* Slicing Features & Tree Support Specifics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-black/25 p-3.5 rounded-xl border border-white/10">
              <div>
                <span className="text-white/60 text-[11px] block font-semibold mb-1">
                  CẤU HÌNH INFILL &amp; LÀ MẶT (IRONING):
                </span>
                <ul className="space-y-1 text-white/80 text-[11px]">
                  <li>
                    • Kiểu ruột: <strong className="text-white">{activeProfile.infillPattern} ({activeProfile.infillDensityPercent}%)</strong>
                  </li>
                  <li>
                    • Vị trí seam: <strong className="text-white">{activeProfile.seamPosition}</strong> (Ẩn vết nối)
                  </li>
                  <li>
                    • Là phẳng (Ironing):{' '}
                    <strong className={activeProfile.ironingEnabled ? 'text-cyan-300' : 'text-amber-300'}>
                      {activeProfile.ironingEnabled ? 'BẬT (Mặt phẳng láng)' : 'TẮT (Tránh biến dạng nan rỗng)'}
                    </strong>
                  </li>
                </ul>
              </div>

              <div>
                <span className="text-white/60 text-[11px] block font-semibold mb-1">
                  THÔNG SỐ TREE SUPPORT BÓC TAY:
                </span>
                <ul className="space-y-1 text-white/80 text-[11px]">
                  <li>
                    • Góc nhánh: <strong className="text-emerald-300">{activeProfile.treeSupportParams.branchAngleDeg}°</strong>
                  </li>
                  <li>
                    • Đường kính thân cây: <strong className="text-emerald-300">{activeProfile.treeSupportParams.branchDiameterMm} mm</strong>
                  </li>
                  <li>
                    • Khe hở Z (Top Z-Distance):{' '}
                    <strong className="text-emerald-300">
                      {activeProfile.treeSupportParams.topInterfaceSpacingMm} mm (Bóc tay 0 sẹo)
                    </strong>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Tips Specifically for THIS Model */}
            <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-2">
              <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-300" />
                <span>Mẹo Thực Chiến Tránh Lỗi In Dành Riêng Cho [{modelTitle}]:</span>
              </h5>
              <div className="space-y-1.5 text-xs text-white/85">
                {activeProfile.proTips.map((tip, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {tip}
                  </p>
                ))}
              </div>
            </div>

            {downloadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Đã tải thành công tệp preset 3MF: <strong>{downloadSuccess}</strong>. Bạn có thể mở trực tiếp bằng Bambu Studio hoặc OrcaSlicer!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
