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
} from 'lucide-react';
import { ShopCategoryTab } from '@/backend/domain/shop';

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
      {/* Top Banner - Apple Store Style */}
      <div className="relative rounded-[28px] overflow-hidden border border-black/[0.06] bg-white p-7 sm:p-10 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F7] border border-black/[0.06] text-[#0071E3] text-xs font-semibold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>3D Hub Store • Vật Tư &amp; Dịch Vụ Chuẩn Công Nghiệp</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1D1D1F]">
              Cửa Hàng 3D Hub.
            </h1>

            <p className="text-xs sm:text-base text-[#6E6E73] leading-relaxed">
              Cung cấp cuộn nhựa in FDM chính hãng, phụ kiện nâng cấp máy in Bambu Lab, dịch vụ in gia công nhanh 24h và kho mô hình 3D chất lượng cao.
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-[#86868B]">
              <div className="flex items-center gap-1.5 font-medium text-[#1D1D1F]">
                <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                <span>100% Chính hãng</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-[#1D1D1F]">
                <CheckCircle2 className="w-4 h-4 text-[#0071E3]" />
                <span>Báo giá tự động</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-[#1D1D1F]">
                <CheckCircle2 className="w-4 h-4 text-[#5856D6]" />
                <span>Thanh toán VietQR &amp; Ví</span>
              </div>
            </div>
          </div>

          {/* Cart Trigger Button - Apple Pill */}
          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-sm shadow-sm transition-all hover:scale-102 active:scale-98 group"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Giỏ Hàng</span>
              {cartCount > 0 ? (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-[#0071E3] text-[11px] font-bold">
                  {cartCount}
                </span>
              ) : (
                <span className="text-xs text-white/80">(0)</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Category Tabs - Apple Segmented Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${
                isActive
                  ? 'bg-white border-2 border-[#0071E3] shadow-[0_4px_16px_rgba(0,113,227,0.12)]'
                  : 'bg-white border-black/[0.06] hover:border-black/[0.12] text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#0071E3] text-white shadow-sm'
                      : 'bg-[#F5F5F7] text-[#1D1D1F] group-hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-sm font-semibold tracking-tight ${isActive ? 'text-[#1D1D1F]' : 'text-[#1D1D1F]'}`}>
                    {tab.label}
                  </div>
                  <div className="text-[11px] text-[#86868B] mt-0.5">
                    {tab.count} sản phẩm
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  isActive
                    ? 'bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/20'
                    : 'bg-[#F5F5F7] text-[#86868B] border-black/[0.04]'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Global Apple Pill Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#86868B] absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm cuộn nhựa (PLA, PETG), phụ kiện máy in, dịch vụ in SLA hoặc mô hình 3D..."
            className="w-full pl-11 pr-24 py-3.5 rounded-full bg-[#F5F5F7] border border-black/[0.06] text-[#1D1D1F] placeholder-[#86868B] text-sm focus:bg-white focus:border-[#0071E3] transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 px-2.5 py-1 text-xs text-[#86868B] hover:text-[#1D1D1F] bg-[#E8E8ED] hover:bg-[#DEDEE3] rounded-full transition-colors font-medium"
            >
              Xóa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
