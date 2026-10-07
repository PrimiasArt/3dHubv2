'use client';

import React from 'react';
import {
  ShoppingBag,
  Package,
  Layers,
  Sparkles,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Wallet,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react';
import { ShopCategoryTab } from '@/backend/domain/shop';
import { useSystemEnvironment } from '@/hooks/useSystemEnvironment';

interface ShopHeaderProps {
  activeTab: ShopCategoryTab;
  setActiveTab: (tab: ShopCategoryTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  filamentsCount: number;
  servicesCount: number;
  modelsCount: number;
}

export function ShopHeader({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  cartCount,
  onOpenCart,
  filamentsCount,
  servicesCount,
  modelsCount,
}: ShopHeaderProps) {
  const { isOfficial, isStaging, commercial } = useSystemEnvironment();

  const tabs = [
    {
      id: 'filaments_accessories' as ShopCategoryTab,
      label: 'Nhựa In & Phụ Kiện',
      icon: Package,
      count: filamentsCount,
      badge: 'Chính Hãng',
    },
    {
      id: 'printing_services' as ShopCategoryTab,
      label: 'Dịch Vụ In & Profiles',
      icon: Layers,
      count: servicesCount,
      badge: 'Báo Giá Tức Thì',
    },
    {
      id: 'models_marketplace' as ShopCategoryTab,
      label: 'Thư Viện Mô Hình 3D',
      icon: Sparkles,
      count: modelsCount,
      badge: 'Bản Quyền & Free',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner - VisionOS Spatial Glass */}
      <div className="relative rounded-[32px] overflow-hidden border border-white/20 vision-glass-panel p-7 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.45)] text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-semibold backdrop-blur-md transition-all ${
                isOfficial
                  ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-amber-500/20 border-amber-400/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              }`}
            >
              {isOfficial ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>3D Hub Official Store • Vật Tư &amp; Dịch Vụ Thương Mại Chính Thức</span>
                </>
              ) : (
                <>
                  <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
                  <span>3D Hub Sandbox • Môi Trường Thử Nghiệm Nội Bộ (Giá Vốn 0%)</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
              {isOfficial ? 'Cửa Hàng 3D Hub Official.' : 'Cửa Hàng 3D Hub (Staging).'}
            </h1>

            <p className="text-xs sm:text-base text-white/70 leading-relaxed">
              {isOfficial
                ? `Cung cấp cuộn nhựa in FDM chính hãng, linh kiện Bambu Lab, dịch vụ in 3D gia công công nghiệp và xuất hóa đơn VAT điện tử bởi ${commercial?.companyName || '3D Hub'}.`
                : 'Môi trường Sandbox thử nghiệm: cuộn nhựa in FDM, phụ kiện máy in, đặt in thử nghiệm với giá vốn gốc 0% phụ thu.'}
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-white/80">
              <div className="flex items-center gap-1.5 font-medium text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isOfficial ? '100% Chính hãng (Bảo hành 1 đổi 1)' : 'Thử nghiệm giá vốn 0%'}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-white">
                <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                <span>{isOfficial ? 'Báo giá tự động & Xuất hóa đơn VAT' : 'Báo giá mô phỏng Sandbox'}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-white">
                <CheckCircle2 className="w-4 h-4 text-purple-300" />
                <span>{isOfficial ? `VietQR ${commercial?.bankAccount?.bankName || 'MBBank'} & Ví` : 'Ví thử nghiệm Sandbox'}</span>
              </div>
            </div>
          </div>

          {/* Cart Trigger Button - VisionOS Pill */}
          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2.5 px-6 py-3 rounded-full vision-pill-btn text-white font-medium text-sm shadow-md transition-all hover:scale-102 active:scale-98 group"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Giỏ Hàng</span>
              {cartCount > 0 ? (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-emerald-900 text-[11px] font-bold shadow-xs">
                  {cartCount}
                </span>
              ) : (
                <span className="text-xs text-white/70">(0)</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Category Tabs - VisionOS Segmented Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center justify-between p-4 rounded-[24px] border transition-all text-left group ${
                isActive
                  ? 'vision-glass border-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.35)] ring-1 ring-white/30 text-white'
                  : 'vision-glass border-white/12 hover:border-white/25 text-white/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-white/25 border border-white/30 text-white shadow-sm'
                      : 'bg-white/10 border border-white/10 text-white/80 group-hover:scale-105 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-tight text-white">
                    {tab.label}
                  </div>
                  <div className="text-[11px] text-white/60 mt-0.5">
                    {tab.count} sản phẩm
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
                  isActive
                    ? 'bg-white/25 text-white border-white/30'
                    : 'bg-white/10 text-white/60 border-white/10'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Global VisionOS Pill Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-white/50 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm cuộn nhựa (PLA, PETG), phụ kiện máy in, dịch vụ in SLA hoặc mô hình 3D..."
            className="w-full pl-11 pr-24 py-3.5 rounded-full bg-black/25 backdrop-blur-xl border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/35 focus:bg-black/35 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 px-2.5 py-1 text-xs text-white/70 hover:text-white bg-white/15 hover:bg-white/25 rounded-full transition-colors font-medium border border-white/15"
            >
              Xóa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
