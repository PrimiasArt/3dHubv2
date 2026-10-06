'use client';

import React from 'react';
import Image from 'next/image';
import {
  Package,
  Layers,
  Sparkles,
  Check,
  Star,
  Plus,
  ShoppingCart,
  Thermometer,
  Gauge,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { IFilamentItem, IAccessoryItem } from '@/backend/domain/shop';

interface FilamentAccessoriesViewProps {
  filaments: IFilamentItem[];
  accessories: IAccessoryItem[];
  subTab: 'all' | 'filament' | 'accessory';
  setSubTab: (tab: 'all' | 'filament' | 'accessory') => void;
  selectedMaterial: string;
  setSelectedMaterial: (mat: string) => void;
  selectedAccessorySub: string;
  setSelectedAccessorySub: (sub: string) => void;
  selectedBrand: string;
  setSelectedBrand: (b: string) => void;
  onAddToCart: (item: any) => void;
  onViewDetail: (item: any) => void;
}

export function FilamentAccessoriesView({
  filaments,
  accessories,
  subTab,
  setSubTab,
  selectedMaterial,
  setSelectedMaterial,
  selectedAccessorySub,
  setSelectedAccessorySub,
  selectedBrand,
  setSelectedBrand,
  onAddToCart,
  onViewDetail,
}: FilamentAccessoriesViewProps) {
  const materials = [
    { id: 'all', label: 'Tất cả loại nhựa' },
    { id: 'PLA', label: 'PLA / PLA+' },
    { id: 'PETG-CF', label: 'PETG / Sợi Carbon' },
    { id: 'TPU', label: 'TPU Nhựa Dẻo' },
    { id: 'ASA', label: 'ASA Chống UV' },
    { id: 'Resin', label: 'Resin SLA 8K' },
  ];

  const accessorySubs = [
    { id: 'all', label: 'Tất cả linh kiện' },
    { id: 'hotend', label: 'Cụm Hotend' },
    { id: 'build_plate', label: 'Bàn in PEI' },
    { id: 'dryer', label: 'Máy sấy cuộn' },
    { id: 'nozzle', label: 'Đầu phun Nozzle' },
    { id: 'tools', label: 'Dụng cụ thao tác' },
  ];

  const brands = ['all', 'Bambu Lab', 'eSUN', 'Sunlu', 'Polymaker', 'Phaetus'];

  const showFilaments = subTab === 'all' || subTab === 'filament';
  const showAccessories = subTab === 'all' || subTab === 'accessory';

  return (
    <div className="space-y-6">
      {/* Sub Category Controls - VisionOS Segmented Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 vision-glass p-4 rounded-[28px] border border-white/15 shadow-sm text-white">
        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-black/25 rounded-full border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => setSubTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
              subTab === 'all'
                ? 'bg-white/25 backdrop-blur-md text-white font-semibold border border-white/20 shadow-xs'
                : 'text-white/70 hover:text-white font-medium'
            }`}
          >
            Tất cả ({filaments.length + accessories.length})
          </button>
          <button
            onClick={() => setSubTab('filament')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
              subTab === 'filament'
                ? 'bg-white/25 backdrop-blur-md text-white font-semibold border border-white/20 shadow-xs'
                : 'text-white/70 hover:text-white font-medium'
            }`}
          >
            Cuộn Nhựa In ({filaments.length})
          </button>
          <button
            onClick={() => setSubTab('accessory')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
              subTab === 'accessory'
                ? 'bg-white/25 backdrop-blur-md text-white font-semibold border border-white/20 shadow-xs'
                : 'text-white/70 hover:text-white font-medium'
            }`}
          >
            Phụ Kiện Máy In ({accessories.length})
          </button>
        </div>

        {/* Brand Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/60 font-medium">Hãng:</span>
          <div className="flex flex-wrap gap-1">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedBrand === b
                    ? 'bg-white/30 text-white font-semibold border border-white/25 shadow-xs'
                    : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15 border border-white/5'
                }`}
              >
                {b === 'all' ? 'Tất cả' : b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Chips by Material or Accessory Category */}
      {subTab === 'filament' && (
        <div className="flex flex-wrap items-center gap-2">
          {materials.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMaterial(m.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                selectedMaterial === m.id
                  ? 'bg-white/30 text-white font-semibold border border-white/25 shadow-xs'
                  : 'bg-black/25 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 backdrop-blur-md'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {subTab === 'accessory' && (
        <div className="flex flex-wrap items-center gap-2">
          {accessorySubs.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAccessorySub(a.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                selectedAccessorySub === a.id
                  ? 'bg-white/30 text-white font-semibold border border-white/25 shadow-xs'
                  : 'bg-black/25 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 backdrop-blur-md'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* 1. FILAMENTS GRID */}
      {showFilaments && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-300" />
              <span>Cuộn Nhựa In 3D FDM &amp; Resin SLA</span>
            </h2>
            <span className="text-xs text-white/60">{filaments.length} loại có sẵn</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filaments.map((fil) => (
              <div
                key={fil.id}
                className="group relative flex flex-col justify-between rounded-[28px] vision-glass border border-white/15 hover:border-white/30 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1 p-6 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.25)] text-white"
              >
                {/* Header */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    {/* Visual Preview / Thumbnail */}
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center p-2.5 group-hover:scale-105 transition-transform flex-shrink-0 overflow-hidden relative">
                      <Image
                        src={fil.thumbnailUrl}
                        alt={fil.name}
                        width={48}
                        height={48}
                        unoptimized={fil.thumbnailUrl?.endsWith('.svg')}
                        className="object-contain filter drop-shadow max-w-full max-h-full"
                      />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {fil.badge && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                          fil.badge === 'Bán chạy'
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                            : fil.badge === 'Khuyên dùng'
                            ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                            : 'bg-purple-400/20 text-purple-300 border-purple-400/30'
                        }`}>
                          {fil.badge}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-white/90 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                        {fil.brand}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3
                      onClick={() => onViewDetail(fil)}
                      className="text-sm font-semibold text-white hover:text-emerald-300 cursor-pointer transition-colors line-clamp-2"
                    >
                      {fil.name}
                    </h3>

                    {/* Color Swatch & Spec */}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-xs"
                        style={{ backgroundColor: fil.colorHex }}
                        title={fil.colorName}
                      />
                      <span className="text-xs text-white/80 font-medium">{fil.colorName}</span>
                      <span className="text-[11px] text-white/50">• {fil.weightKg} kg</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1.5 pt-3 border-t border-white/10 text-[11px] text-white/70">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                      <span>Đầu phun: {fil.nozzleTempRange}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                      <span>Tốc độ: {fil.printSpeedRange}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Price & Actions */}
                <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-semibold tracking-tight text-white">
                      {fil.priceVnd.toLocaleString('vi-VN')} đ
                    </div>
                    {fil.originalPriceVnd && (
                      <div className="text-[11px] text-white/50 line-through">
                        {fil.originalPriceVnd.toLocaleString('vi-VN')} đ
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetail(fil)}
                      className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all"
                      title="Xem thông số kỹ thuật"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        onAddToCart({
                          id: fil.id,
                          title: fil.name,
                          priceVnd: fil.priceVnd,
                          type: 'filament',
                          imageUrl: fil.thumbnailUrl,
                          subText: `${fil.brand} • ${fil.colorName}`,
                        })
                      }
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full vision-pill-btn text-white font-medium text-xs shadow-xs active:scale-98 transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Thêm giỏ</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ACCESSORIES GRID */}
      {showAccessories && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-300" />
              <span>Phụ Kiện &amp; Linh Kiện Nâng Cấp Máy In 3D</span>
            </h2>
            <span className="text-xs text-white/60">{accessories.length} phụ kiện có sẵn</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accessories.map((acc) => (
              <div
                key={acc.id}
                className="group relative flex flex-col justify-between rounded-[28px] vision-glass border border-white/15 hover:border-white/30 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1 p-6 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.25)] text-white"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center p-2.5 group-hover:scale-105 transition-transform flex-shrink-0 overflow-hidden relative">
                      <Image
                        src={acc.thumbnailUrl}
                        alt={acc.name}
                        width={48}
                        height={48}
                        unoptimized={acc.thumbnailUrl?.endsWith('.svg')}
                        className="object-contain filter drop-shadow max-w-full max-h-full"
                      />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {acc.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-purple-400/20 text-purple-300 border border-purple-400/30">
                          {acc.badge}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-white/90 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                        {acc.brand}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3
                      onClick={() => onViewDetail(acc)}
                      className="text-sm font-semibold text-white hover:text-cyan-300 cursor-pointer transition-colors line-clamp-2"
                    >
                      {acc.name}
                    </h3>

                    {/* Compatibility */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {acc.compatibility.slice(0, 2).map((comp, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-white/10 text-white/80 px-2 py-0.5 rounded-full border border-white/15"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{acc.description}</p>
                </div>

                {/* Price & Cart */}
                <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-semibold tracking-tight text-white">
                      {acc.priceVnd.toLocaleString('vi-VN')} đ
                    </div>
                    {acc.originalPriceVnd && (
                      <div className="text-[11px] text-white/50 line-through">
                        {acc.originalPriceVnd.toLocaleString('vi-VN')} đ
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetail(acc)}
                      className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all"
                      title="Xem thông số kỹ thuật"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        onAddToCart({
                          id: acc.id,
                          title: acc.name,
                          priceVnd: acc.priceVnd,
                          type: 'accessory',
                          imageUrl: acc.thumbnailUrl,
                          subText: acc.brand,
                        })
                      }
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full vision-pill-btn text-white font-medium text-xs shadow-xs active:scale-98 transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Thêm giỏ</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
