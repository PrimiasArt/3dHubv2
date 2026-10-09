'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Download,
  ShoppingCart,
  Eye,
  Star,
  Heart,
  Clock,
  Weight,
  Layers,
  CheckCircle2,
  Box,
  Coins,
  ArrowUpRight,
} from 'lucide-react';
import { IShopModelItem, ModelMarketplaceCategory } from '@/backend/domain/shop';

interface ModelMarketplaceViewProps {
  models: IShopModelItem[];
  modelTypeFilter: 'all' | 'free' | 'paid';
  setModelTypeFilter: (filter: 'all' | 'free' | 'paid') => void;
  selectedCategory: ModelMarketplaceCategory;
  setSelectedCategory: (cat: ModelMarketplaceCategory) => void;
  onAddToCart: (item: any) => void;
  onViewDetail: (item: any) => void;
  onShowToast: (msg: string) => void;
}

export function ModelMarketplaceView({
  models,
  modelTypeFilter,
  setModelTypeFilter,
  selectedCategory,
  setSelectedCategory,
  onAddToCart,
  onViewDetail,
  onShowToast,
}: ModelMarketplaceViewProps) {
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  const categories: { id: ModelMarketplaceCategory; label: string }[] = [
    { id: 'all', label: 'Tất cả chủ đề' },
    { id: 'mechanical', label: 'Cơ khí & Bánh răng' },
    { id: 'art_decor', label: 'Nghệ thuật & Decor' },
    { id: 'figure', label: 'Figure & Nhân vật' },
    { id: 'gadgets', label: 'Đồ chơi & Fidget' },
    { id: 'tools', label: 'Dụng cụ tiện ích' },
  ];

  const handleFreeDownload = (model: IShopModelItem) => {
    setDownloadedIds((prev) => [...prev, model.id]);
    const blob = new Blob(
      [
        JSON.stringify(
          {
            modelTitle: model.title,
            author: model.author,
            license: 'Creative Commons - Free Personal & Commercial Print',
            downloadDate: new Date().toISOString(),
            formats: model.formats,
            specs: {
              estTime: model.printTimeEstimate,
              filamentWeight: model.filamentWeightEstimate,
            },
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.id}_package.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`🎉 Đang tải gói tệp ${model.formats.join('/')} của "${model.title}"!`);
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar - VisionOS Segmented Pill Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 vision-glass p-4 rounded-[28px] border border-white/15 shadow-sm text-white">
        {/* Free vs Paid Toggle */}
        <div className="flex items-center gap-1 p-1 bg-black/25 rounded-full border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => setModelTypeFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              modelTypeFilter === 'all'
                ? 'bg-white/25 backdrop-blur-md text-white font-semibold border border-white/20 shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Tất cả ({models.length})
          </button>
          <button
            onClick={() => setModelTypeFilter('free')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              modelTypeFilter === 'free'
                ? 'bg-white/25 backdrop-blur-md text-white font-semibold border border-white/20 shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Miễn Phí (Free 100%)
          </button>
          <button
            onClick={() => setModelTypeFilter('paid')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              modelTypeFilter === 'paid'
                ? 'bg-white/25 backdrop-blur-md text-white font-semibold border border-white/20 shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Mô Hình Trả Phí (Premium)
          </button>
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === c.id
                  ? 'bg-white/30 text-white font-semibold border border-white/25 shadow-xs'
                  : 'bg-white/10 text-white/70 hover:text-white border border-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Models Grid - VisionOS Spatial Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => {
          const isFree = model.isFree;
          const isDownloaded = downloadedIds.includes(model.id);

          return (
            <div
              key={model.id}
              className="group relative flex flex-col justify-between rounded-[32px] vision-glass hover:bg-[#344637]/65 hover:-translate-y-1 p-5 transition-all duration-300 shadow-[0_16px_40px_rgba(0,0,0,0.3)] border border-white/15 text-white"
            >
              <div className="space-y-3.5">
                {/* Visual Header */}
                <div className="relative aspect-video rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-4 overflow-hidden group-hover:border-white/25 transition-colors">
                  <Image
                    src={model.thumbnailUrl}
                    alt={model.title}
                    width={96}
                    height={96}
                    unoptimized={model.thumbnailUrl?.endsWith?.('.svg')}
                    className="object-contain filter drop-shadow group-hover:scale-110 transition-transform duration-300 max-w-full max-h-full"
                  />

                  {/* Badges on preview */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {model.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white border border-white/20 backdrop-blur-md">
                        {model.badge}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${
                        isFree
                          ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/25 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {isFree ? 'FREE' : `${model.priceVnd.toLocaleString('vi-VN')} đ`}
                    </span>
                  </div>

                  {/* Formats Pills */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1">
                    {model.formats.map((fmt, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-black/50 text-white/80 rounded border border-white/10"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>

                  {/* 3D Studio Link Button */}
                  {model.sampleModelId && (
                    <Link
                      href={`/studio?model=${model.sampleModelId}`}
                      className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[10px] font-medium backdrop-blur-md border border-white/20 transition-all hover:scale-105"
                      title="Mở trong 3D Studio"
                    >
                      <Box className="w-3 h-3" />
                      <span>Xem 3D</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-white/60 mb-1">
                    <span>Tác giả: <strong className="text-white font-medium">{model.author}</strong></span>
                    <div className="flex items-center gap-1 text-amber-300">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span className="font-semibold">{model.rating}</span>
                      <span className="text-white/50">({model.reviewsCount})</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => onViewDetail(model)}
                    className="text-sm font-bold text-white hover:text-emerald-300 cursor-pointer transition-colors line-clamp-2"
                  >
                    {model.title}
                  </h3>

                  <p className="text-xs text-white/70 line-clamp-2 mt-1.5 leading-relaxed">{model.description}</p>
                </div>

                {/* Specs: Print Time & Filament Weight */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Clock className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
                    <span>In mất: <strong>{model.printTimeEstimate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Layers className="w-3.5 h-3.5 text-rose-300 flex-shrink-0" />
                    <span>Tốn: <strong>{model.filamentWeightEstimate}</strong></span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="text-xs text-white/60">
                  {model.downloads.toLocaleString('vi-VN')} lượt tải
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewDetail(model)}
                    className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all border border-white/10"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {isFree ? (
                    <button
                      onClick={() => handleFreeDownload(model)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-md text-white font-medium text-xs border border-white/20 shadow-xs active:scale-98 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloaded ? 'Tải lại' : 'Tải File'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        onAddToCart({
                          id: model.id,
                          title: model.title,
                          priceVnd: model.priceVnd,
                          type: 'model',
                          imageUrl: model.thumbnailUrl,
                          subText: `Bản quyền: ${model.author}`,
                        })
                      }
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-md text-white font-medium text-xs border border-white/20 shadow-xs active:scale-98 transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Mua Bản Quyền</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
