'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Star,
  ShoppingCart,
  CheckCircle2,
  Box,
  Thermometer,
  Gauge,
  Layers,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Play,
} from 'lucide-react';

interface ProductDetailModalProps {
  item: any | null;
  onClose: () => void;
  onAddToCart: (item: any) => void;
}

export function ProductDetailModal({ item, onClose, onAddToCart }: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'specs' | 'studio'>('info');

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity" />

      {/* VisionOS Floating Glass Dialog - Exactly matching reference image */}
      <div className="relative z-10 w-full max-w-3xl rounded-[36px] vision-glass-panel border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-white">
        {/* Top Control Bar: Circle Close + Center Segmented Pill */}
        <div className="flex items-center justify-between">
          {/* Circular Close Button (Circle icon top-left in reference) */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Segmented Pill Tabs (Info / Specs / Studio) */}
          <div className="inline-flex items-center p-1 rounded-full bg-black/25 backdrop-blur-xl border border-white/10">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'info'
                  ? 'bg-white/30 backdrop-blur-md text-white font-semibold shadow-xs border border-white/20'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Thông Tin
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'specs'
                  ? 'bg-white/30 backdrop-blur-md text-white font-semibold shadow-xs border border-white/20'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Thông Số
            </button>
            {item.sampleModelId && (
              <button
                onClick={() => setActiveTab('studio')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'studio'
                    ? 'bg-white/30 backdrop-blur-md text-white font-semibold shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Xem 3D Studio
              </button>
            )}
          </div>

          {/* Spacer balance */}
          <div className="w-10" />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Thumbnail Image */}
          <div className="md:col-span-4 relative aspect-video md:aspect-square w-full rounded-2xl overflow-hidden bg-black/30 border border-white/15 shadow-inner flex items-center justify-center p-4">
            <Image
              src={item.thumbnailUrl || '/thumbnails/benchy.svg'}
              alt={item.name || item.title}
              width={160}
              height={160}
              unoptimized={item.thumbnailUrl?.endsWith?.('.svg')}
              className="object-contain max-w-full max-h-full filter drop-shadow"
            />
            {item.badge && (
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {item.badge}
                </span>
              </div>
            )}
          </div>

          {/* Middle Details */}
          <div className="md:col-span-5 space-y-3">
            <div>
              <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider block mb-1">
                {item.brand || '3D Hub Official'}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">{item.name || item.title}</h2>
            </div>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed line-clamp-3">
              {item.description}
            </p>

            {/* Pill Badges (like [PG] [3D] in reference image) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-white/70">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/15 border border-white/15 text-white">
                {item.type === 'filament' ? 'FDM SPOOL' : 'ACCESSORY'}
              </span>
              {item.weightKg && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/15 border border-white/15 text-white">
                  {item.weightKg} KG
                </span>
              )}
              {item.colorName && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/15 border border-white/15 text-white">
                  {item.colorName}
                </span>
              )}
            </div>

            {/* Price display */}
            <div className="pt-2">
              <span className="text-[11px] text-white/60 block">Đơn giá niêm yết:</span>
              <span className="text-2xl font-bold text-white tracking-tight">
                {item.priceVnd !== undefined
                  ? item.priceVnd === 0
                    ? 'Miễn phí'
                    : `${item.priceVnd.toLocaleString('vi-VN')} đ`
                  : 'Liên hệ'}
              </span>
            </div>
          </div>

          {/* Right Action Buttons (VisionOS Glass Pills exactly as in reference) */}
          <div className="md:col-span-3 flex flex-col gap-3">
            {item.priceVnd !== undefined && item.priceVnd > 0 && (
              <button
                onClick={() => {
                  onAddToCart({
                    id: item.id,
                    title: item.name || item.title,
                    priceVnd: item.priceVnd,
                    type: item.type,
                    imageUrl: item.thumbnailUrl,
                    subText: item.brand || item.author,
                  });
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-white/25 hover:bg-white/35 backdrop-blur-md border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Thêm Vào Giỏ</span>
              </button>
            )}

            {item.sampleModelId && (
              <Link
                href={`/studio?model=${item.sampleModelId}`}
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-2xl bg-black/25 hover:bg-black/35 backdrop-blur-md border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 text-center"
              >
                <Box className="w-4 h-4 text-emerald-300" />
                <span>Mở Trong Studio</span>
              </Link>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-2xl bg-transparent hover:bg-white/10 text-white/70 hover:text-white font-medium text-xs transition-colors"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>

        {/* Tab 2: Specs Grid */}
        {activeTab === 'specs' && item.type === 'filament' && (
          <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-white/60 block">Nhiệt đầu phun</span>
              <span className="font-bold text-amber-300 mt-1 block">{item.nozzleTempRange}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-white/60 block">Nhiệt bàn in</span>
              <span className="font-bold text-emerald-300 mt-1 block">{item.bedTempRange}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-white/60 block">Tốc độ in</span>
              <span className="font-bold text-cyan-300 mt-1 block">{item.printSpeedRange}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-white/60 block">Khối lượng</span>
              <span className="font-bold text-white mt-1 block">{item.weightKg} kg</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
