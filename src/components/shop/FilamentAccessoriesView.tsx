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
      {/* Sub Category Controls - Apple Segmented Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-black/[0.06] shadow-xs">
        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#F5F5F7] rounded-full border border-black/[0.04]">
          <button
            onClick={() => setSubTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
              subTab === 'all'
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)] font-semibold'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] font-medium'
            }`}
          >
            Tất cả ({filaments.length + accessories.length})
          </button>
          <button
            onClick={() => setSubTab('filament')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
              subTab === 'filament'
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)] font-semibold'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] font-medium'
            }`}
          >
            Cuộn Nhựa In ({filaments.length})
          </button>
          <button
            onClick={() => setSubTab('accessory')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
              subTab === 'accessory'
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)] font-semibold'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] font-medium'
            }`}
          >
            Phụ Kiện Máy In ({accessories.length})
          </button>
        </div>

        {/* Brand Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#86868B] font-medium">Hãng:</span>
          <div className="flex flex-wrap gap-1">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedBrand === b
                    ? 'bg-[#1D1D1F] text-white font-medium shadow-xs'
                    : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#E8E8ED]'
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
                  ? 'bg-[#0071E3] text-white font-medium shadow-xs'
                  : 'bg-white hover:bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] border border-black/[0.06]'
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
                  ? 'bg-[#1D1D1F] text-white font-medium shadow-xs'
                  : 'bg-white hover:bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] border border-black/[0.06]'
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
            <h2 className="text-lg font-semibold tracking-tight text-[#1D1D1F] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#0071E3]" />
              <span>Cuộn Nhựa In 3D FDM &amp; Resin SLA</span>
            </h2>
            <span className="text-xs text-[#86868B]">{filaments.length} loại có sẵn</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filaments.map((fil) => (
              <div
                key={fil.id}
                className="group relative flex flex-col justify-between rounded-[24px] border border-black/[0.06] bg-white hover:border-black/[0.12] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 p-6 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
              >
                {/* Header */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    {/* Visual Preview / Thumbnail */}
                    <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-center justify-center p-2.5 group-hover:scale-105 transition-transform flex-shrink-0 overflow-hidden relative">
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
                            ? 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20'
                            : fil.badge === 'Khuyên dùng'
                            ? 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20'
                            : 'bg-[#5856D6]/10 text-[#5856D6] border-[#5856D6]/20'
                        }`}>
                          {fil.badge}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-[#1D1D1F] bg-[#F5F5F7] px-2.5 py-0.5 rounded-full border border-black/[0.04]">
                        {fil.brand}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3
                      onClick={() => onViewDetail(fil)}
                      className="text-sm font-semibold text-[#1D1D1F] hover:text-[#0071E3] cursor-pointer transition-colors line-clamp-2"
                    >
                      {fil.name}
                    </h3>

                    {/* Color Swatch & Spec */}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/[0.1] shadow-xs"
                        style={{ backgroundColor: fil.colorHex }}
                        title={fil.colorName}
                      />
                      <span className="text-xs text-[#6E6E73] font-medium">{fil.colorName}</span>
                      <span className="text-[11px] text-[#86868B]">• {fil.weightKg} kg</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1.5 pt-3 border-t border-black/[0.06] text-[11px] text-[#86868B]">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-[#FF9500] flex-shrink-0" />
                      <span>Đầu phun: {fil.nozzleTempRange}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-[#34C759] flex-shrink-0" />
                      <span>Tốc độ: {fil.printSpeedRange}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Price & Actions */}
                <div className="mt-5 pt-3.5 border-t border-black/[0.06] flex items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-semibold tracking-tight text-[#1D1D1F]">
                      {fil.priceVnd.toLocaleString('vi-VN')} đ
                    </div>
                    {fil.originalPriceVnd && (
                      <div className="text-[11px] text-[#86868B] line-through">
                        {fil.originalPriceVnd.toLocaleString('vi-VN')} đ
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetail(fil)}
                      className="p-2.5 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] transition-all"
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
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs shadow-xs active:scale-98 transition-all"
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
        <div className="space-y-4 pt-4 border-t border-black/[0.06]">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold tracking-tight text-[#1D1D1F] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#1D1D1F]" />
              <span>Phụ Kiện &amp; Linh Kiện Nâng Cấp Máy In 3D</span>
            </h2>
            <span className="text-xs text-[#86868B]">{accessories.length} phụ kiện có sẵn</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accessories.map((acc) => (
              <div
                key={acc.id}
                className="group relative flex flex-col justify-between rounded-[24px] border border-black/[0.06] bg-white hover:border-black/[0.12] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 p-6 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-center justify-center p-2.5 group-hover:scale-105 transition-transform flex-shrink-0 overflow-hidden relative">
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
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#5856D6]/10 text-[#5856D6] border border-[#5856D6]/20">
                          {acc.badge}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-[#1D1D1F] bg-[#F5F5F7] px-2.5 py-0.5 rounded-full border border-black/[0.04]">
                        {acc.brand}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3
                      onClick={() => onViewDetail(acc)}
                      className="text-sm font-semibold text-[#1D1D1F] hover:text-[#0071E3] cursor-pointer transition-colors line-clamp-2"
                    >
                      {acc.name}
                    </h3>

                    {/* Compatibility */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {acc.compatibility.slice(0, 2).map((comp, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-[#F5F5F7] text-[#6E6E73] px-2 py-0.5 rounded-full border border-black/[0.04]"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[#86868B] line-clamp-2 leading-relaxed">{acc.description}</p>
                </div>

                {/* Price & Cart */}
                <div className="mt-5 pt-3.5 border-t border-black/[0.06] flex items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-semibold tracking-tight text-[#1D1D1F]">
                      {acc.priceVnd.toLocaleString('vi-VN')} đ
                    </div>
                    {acc.originalPriceVnd && (
                      <div className="text-[11px] text-[#86868B] line-through">
                        {acc.originalPriceVnd.toLocaleString('vi-VN')} đ
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetail(acc)}
                      className="p-2.5 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] transition-all"
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
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1D1D1F] hover:bg-[#2D2D2F] text-white font-medium text-xs shadow-xs active:scale-98 transition-all"
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
