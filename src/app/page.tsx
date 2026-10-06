'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  TrendingUp,
  Compass,
  Box,
  ArrowRight,
  Layers,
  Cpu,
  ShieldCheck,
  ShoppingBag,
  Package,
  Building2,
  ChevronRight,
  Play,
  X,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { useTrendAnalytics } from '@/hooks/useTrendAnalytics';
import { VelocityLeaderboard } from '@/components/trends/VelocityLeaderboard';
import { TrendMetricsOverview } from '@/components/trends/TrendMetricsOverview';

export default function HomePage() {
  const { trends, isLoading } = useTrendAnalytics();
  const [activeHeroTab, setActiveHeroTab] = useState<'info' | 'features' | 'farm'>('info');

  return (
    <div className="space-y-10">
      {/* VisionOS Spatial Glass Hero Banner - Exactly Matching Reference Image */}
      <section className="relative rounded-[36px] overflow-hidden vision-glass-panel p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.45)] border border-white/20">
        {/* Subtle Ambient Organic Lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#46694E]/20 blur-[90px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top VisionOS Navigation Header (Circle Icon + Segmented Control Pill) */}
          <div className="flex items-center justify-between">
            {/* Circular Glass Icon */}
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>

            {/* VisionOS Segmented Pill Control (Exactly as "Info / Chapters / Up Next" in reference) */}
            <div className="inline-flex items-center p-1 rounded-full bg-black/25 backdrop-blur-xl border border-white/10">
              <button
                onClick={() => setActiveHeroTab('info')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeHeroTab === 'info'
                    ? 'bg-white/30 backdrop-blur-md text-white font-semibold shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Tổng Quan
              </button>
              <button
                onClick={() => setActiveHeroTab('features')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeHeroTab === 'features'
                    ? 'bg-white/30 backdrop-blur-md text-white font-semibold shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Mô Hình AI
              </button>
              <button
                onClick={() => setActiveHeroTab('farm')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeHeroTab === 'farm'
                    ? 'bg-white/30 backdrop-blur-md text-white font-semibold shadow-xs border border-white/20'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Xưởng In 24H
              </button>
            </div>

            {/* Spacer balance */}
            <div className="w-10" />
          </div>

          {/* Main Card Body (Thumbnail + Typography + VisionOS Actions) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left 16:9 Thumbnail Image */}
            <div className="lg:col-span-4 relative aspect-video w-full rounded-2xl overflow-hidden bg-black/40 border border-white/15 shadow-inner group">
              <Image
                src="/thumbnails/dragon.svg"
                alt="3D AI Model"
                fill
                unoptimized
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/25 backdrop-blur-md text-white border border-white/20">
                  AI Generated
                </span>
              </div>
            </div>

            {/* Middle Content */}
            <div className="lg:col-span-5 space-y-2.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Dựng Hình 3D Không Gian
              </h2>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Biến bản vẽ 2D hoặc ảnh chụp sản phẩm thành mô hình 3D chuẩn xác chỉ trong tích tắc. Lưới kín nước Watertight xuất file .STL và .GLB chuẩn bị in tức thì trên xưởng Bambu Lab.
              </p>

              {/* Tags & Badges */}
              <div className="flex items-center gap-2 pt-1 text-xs text-white/70">
                <span>Trí tuệ nhân tạo</span>
                <span>•</span>
                <span>Thời gian sinh: ~30s</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/20 border border-white/20 text-white">
                  STL
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/20 border border-white/20 text-white">
                  3D
                </span>
              </div>
            </div>

            {/* Right Action Buttons (VisionOS Glass Pills exactly as in reference) */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <Link
                href="/studio"
                className="w-full py-3.5 px-5 rounded-2xl bg-white/25 hover:bg-white/35 backdrop-blur-md border border-white/20 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.2)] active:scale-98 group"
              >
                <Play className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
                <span>Thử AI Dựng 3D</span>
              </Link>

              <Link
                href="/shop"
                className="w-full py-3.5 px-5 rounded-2xl bg-black/25 hover:bg-black/35 backdrop-blur-md border border-white/10 text-white font-medium text-sm flex items-center justify-center transition-all active:scale-98 text-center"
              >
                <span>Khám Phá Cửa Hàng</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Platform Pillars (VisionOS Bento Glass Cards) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Hệ Sinh Thái 3D Hub
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Ba trụ cột công nghệ được tối ưu hoá theo chuẩn mực không gian của Apple
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Hệ thống 24/7
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: AI 3D Studio */}
          <div className="group rounded-[32px] vision-glass p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-[#344637]/65 flex flex-col justify-between border border-white/15">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-6 h-6 text-emerald-300" />
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300 block mb-1">
                  Trí Tuệ Nhân Tạo
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Tạo Bản Vẽ 3D Từ Ảnh
                </h3>
              </div>

              <p className="text-xs text-white/75 leading-relaxed">
                Biến ảnh 2D thành mô hình 3D hoàn chỉnh chỉ trong 30 giây. Thuật toán tự động tạo lưới Watertight kín nước, xuất file .STL và .GLB sẵn sàng đưa vào slicer.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/60">Tripo H3.1 • Trellis 2 • Meshy 4K</span>
              <Link
                href="/studio"
                className="w-9 h-9 rounded-full bg-white/20 group-hover:bg-white/30 text-white flex items-center justify-center transition-all border border-white/15"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Bento Card 2: 3D Print Farm */}
          <div className="group rounded-[32px] vision-glass p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-[#344637]/65 flex flex-col justify-between border border-white/15">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm">
                <Package className="w-6 h-6 text-amber-300" />
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-300 block mb-1">
                  Xưởng In Công Nghiệp
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Xưởng In Farm FDM &amp; SLA
                </h3>
              </div>

              <p className="text-xs text-white/75 leading-relaxed">
                Báo giá tự động theo khối lượng nhựa. Nông trại máy in Bambu Lab X1-Carbon, P1S tốc độ cao và máy in Resin SLA 12K siêu mịn đáp ứng mọi đơn hàng lớn nhỏ.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/60">Bambu AMS • Anycubic SLA 12K</span>
              <Link
                href="/shop?tab=services"
                className="w-9 h-9 rounded-full bg-white/20 group-hover:bg-white/30 text-white flex items-center justify-center transition-all border border-white/15"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Bento Card 3: Shop & Materials */}
          <div className="group rounded-[32px] vision-glass p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-[#344637]/65 flex flex-col justify-between border border-white/15">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm">
                <ShoppingBag className="w-6 h-6 text-cyan-300" />
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-cyan-300 block mb-1">
                  Vật Tư Chính Hãng
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Cuộn Nhựa &amp; Profile In
                </h3>
              </div>

              <p className="text-xs text-white/75 leading-relaxed">
                Cung cấp cuộn nhựa PLA Basic, PETG-CF, ABS chính hãng eSUN/Sunlu, linh kiện thay thế và kho profile in tối ưu cho phần mềm OrcaSlicer.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/60">Giao nhanh toàn quốc • VietQR 24/7</span>
              <Link
                href="/shop"
                className="w-9 h-9 rounded-full bg-white/20 group-hover:bg-white/30 text-white flex items-center justify-center transition-all border border-white/15"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Overview (VisionOS Glass Analytics) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-300" />
            <span>Thị Trường In 3D Hôm Nay</span>
          </h2>
          <span className="text-xs text-white/60">Cập nhật thời gian thực</span>
        </div>
        <TrendMetricsOverview trends={trends} />
      </section>

      {/* Velocity Leaderboard Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Mô Hình Đang Tăng Trưởng Đột Biến
          </h2>
          <Link
            href="/trends"
            className="text-xs text-emerald-300 hover:underline font-medium flex items-center gap-1"
          >
            <span>Xem đầy đủ bảng xếp hạng</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <VelocityLeaderboard trends={trends} />
      </section>
    </div>
  );
}
