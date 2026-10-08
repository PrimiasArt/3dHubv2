'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FlaskConical,
  ShieldCheck,
  Sparkles,
  Printer,
  Box,
  Layers,
  Store,
  Users,
  ShoppingBag,
  TrendingUp,
  Compass,
  ArrowRight,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Wallet,
  Cpu,
  Flame,
} from 'lucide-react';
import { ThreeCanvasViewer } from '@/components/viewer/ThreeCanvasViewer';
import { useModelViewer } from '@/hooks/useModelViewer';
import { SAMPLE_PRINT_MODELS, SampleModelId, ISamplePrintModel } from '@/backend/domain/sample-models';
import { useUserSession } from '@/hooks/useUserSession';
import { useSystemEnvironment } from '@/hooks/useSystemEnvironment';
import { OrderServiceModal } from '@/components/shop/OrderServiceModal';

interface MaterialOption {
  id: string;
  name: string;
  tag: string;
  pricePerGramVnd: number;
  desc: string;
  colorHex: string;
}

const STAGING_MATERIALS: MaterialOption[] = [
  {
    id: 'pla',
    name: 'PLA Matte / Silk (Giá Gốc)',
    tag: 'Decor & Mỹ Thuật',
    pricePerGramVnd: 450,
    desc: 'Bề mặt mịn màng, giá vốn gốc FDM không phụ thu',
    colorHex: '#2DD4BF',
  },
  {
    id: 'petg',
    name: 'PETG-CF Carbon (Giá Gốc)',
    tag: 'Cơ Khí Chịu Lực',
    pricePerGramVnd: 680,
    desc: 'Gia cường sợi carbon, chịu lực va đập và chịu nhiệt 80°C',
    colorHex: '#64748B',
  },
  {
    id: 'resin',
    name: 'Resin SLA 8K (Giá Gốc)',
    tag: 'Mô Hình Siêu Nét',
    pricePerGramVnd: 850,
    desc: 'Độ nét 8K, bề mặt láng bóng không lộ vân in',
    colorHex: '#5EEAD4',
  },
];

export default function StagingPage() {
  const { currentUser, allUsers, switchUser, permissions, isAdmin, showToast } = useUserSession();
  const { isOfficial, toggleEnvironment } = useSystemEnvironment();

  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption>(STAGING_MATERIALS[0]);
  const [infillDensity, setInfillDensity] = useState<number>(20);
  const [activeModel, setActiveModel] = useState<ISamplePrintModel>(SAMPLE_PRINT_MODELS[0]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Ép môi trường data-env="staging" khi vào trang /staging
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-env', 'staging');
    }
  }, []);

  const {
    options: viewerOptions,
    toggleAutoRotate,
    toggleWireframe,
    toggleGrid,
    toggleDimensions,
    setMaterialColor,
  } = useModelViewer(selectedMaterial.colorHex);

  const estimatedGrams = Math.round(
    ((activeModel.defaultDimensionsMm.x * activeModel.defaultDimensionsMm.y * activeModel.defaultDimensionsMm.z) / 1000) *
      0.35 *
      (0.8 + infillDensity / 100)
  );
  const estimatedHours = Number((estimatedGrams / 28).toFixed(1));
  const stagingCostVnd = estimatedGrams * selectedMaterial.pricePerGramVnd + 15000;

  return (
    <div className="space-y-12 max-w-7xl mx-auto text-white pb-20 px-2 sm:px-4">
      {/* 1. Staging Sandbox Master Header Banner */}
      <section className="vision-glass-panel rounded-[36px] p-6 sm:p-10 border border-[#2DD4BF]/40 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2DD4BF]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#2DD4BF]/25 text-[#CCFBF1] border border-[#2DD4BF]/50 shadow-[0_0_15px_rgba(45,212,191,0.3)] flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-[#5EEAD4]" />
                <span>PHIÊN BẢN STAGING SANDBOX</span>
              </span>
              <span className="text-xs text-[#99F6E4] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping" />
                <span>Môi trường thử nghiệm trực tiếp</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              3D Hub Sandbox Environment
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Đây là phiên bản thử nghiệm (Staging) với tone màu{' '}
              <strong className="text-[#5EEAD4]">Xanh Ngọc Bích Creamy &amp; Cyan Pastel</strong>. Mọi
              tính năng cốt lõi (chuyển ảnh 2D sang 3D, phân tích trend AI, điều phối xưởng in, quản
              lý sản phẩm &amp; người dùng) hoạt động với bảng giá vốn xưởng 0% phụ thu.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-white/70">
              <span className="px-3 py-1 rounded-xl bg-black/30 border border-white/10">
                Link Staging: <strong className="text-[#5EEAD4]">/staging</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-black/30 border border-white/10">
                Link Official: <strong className="text-emerald-300">/</strong>
              </span>
            </div>
          </div>

          {/* Action to switch back to Official */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-400/40 font-bold text-xs shadow-lg transition-all active:scale-95 group"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Chuyển Sang Bản Official (Thương Mại)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            {isAdmin && (
              <button
                type="button"
                onClick={() => toggleEnvironment('official')}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold text-xs transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5EEAD4]" />
                <span>Đổi Môi Trường Hệ Thống</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Quick Access Cards for All Modules in Staging Mode */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#5EEAD4]" />
              <span>Các Phân Hệ Chức Năng (Staging Module Launchpad)</span>
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Truy cập nhanh và kiểm thử toàn bộ các module trong hệ sinh thái 3D Hub.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Quản Lý Người Dùng (Admin) */}
          <Link
            href="/admin?tab=users"
            className="vision-glass p-5 rounded-[28px] border border-[#2DD4BF]/30 hover:border-[#2DD4BF] transition-all group flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(45,212,191,0.2)]"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 flex items-center justify-center text-[#5EEAD4] group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">Quản Lý Người Dùng</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2DD4BF]/20 text-[#CCFBF1] font-black border border-[#2DD4BF]/40">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Phân quyền 4 cấp (Admin, Mod, Seller, User), nạp/trừ ví, khóa tài khoản và quản trị viên.
                </p>
              </div>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-bold text-[#5EEAD4] group-hover:translate-x-1 transition-transform">
              <span>Mở Quản Trị Người Dùng</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 2: Quản Lý Sản Phẩm & Kho (Admin & Mod) */}
          <Link
            href="/admin?tab=products"
            className="vision-glass p-5 rounded-[28px] border border-emerald-400/30 hover:border-emerald-400 transition-all group flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">Quản Lý Sản Phẩm &amp; Kho</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                    Admin / Mod
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Quản lý kho cuộn nhựa, linh kiện cơ khí, kiểm duyệt sản phẩm gian hàng và điều chỉnh giá vốn.
                </p>
              </div>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-bold text-emerald-300 group-hover:translate-x-1 transition-transform">
              <span>Mở Kho Hàng</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 3: Kênh Gian Hàng Bán Hàng (Seller Hub) */}
          <Link
            href="/seller"
            className="vision-glass p-5 rounded-[28px] border border-amber-400/30 hover:border-amber-400 transition-all group flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">Kênh Gian Hàng (Seller)</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30">
                    Seller / Mod
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Đăng bán cuộn nhựa, mô hình bản quyền STL, quản lý doanh thu và tạo lệnh rút tiền ngân hàng.
                </p>
              </div>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-bold text-amber-300 group-hover:translate-x-1 transition-transform">
              <span>Vào Kênh Gian Hàng</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 4: AI Studio 2D-to-3D */}
          <Link
            href="/studio"
            className="vision-glass p-5 rounded-[28px] border border-cyan-400/30 hover:border-cyan-400 transition-all group flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(6,182,212,0.2)]"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">AI Studio 2D Sang 3D</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30">
                    Cốt Lõi
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Biến hình ảnh 2D thành mô hình 3D hoàn chỉnh dạng mesh (.obj, .glb) phục vụ in 3D thực tế.
                </p>
              </div>
            </div>
            <div className="pt-4 flex items-center gap-1 text-xs font-bold text-cyan-300 group-hover:translate-x-1 transition-transform">
              <span>Trải Nghiệm AI Studio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Interactive Slicing & 3D Viewer Sandbox */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 3D Model Canvas */}
        <div className="lg:col-span-7 vision-glass rounded-[36px] p-6 flex flex-col justify-between relative overflow-hidden border border-[#2DD4BF]/30">
          <div className="flex items-center justify-between z-10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5EEAD4] px-2.5 py-0.5 rounded-full bg-[#2DD4BF]/20 border border-[#2DD4BF]/40">
                SANDBOX 3D VIEWER
              </span>
              <h3 className="text-lg font-black text-white mt-1">{activeModel.name}</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 text-xs">
              <span className="text-white/60">Mô hình:</span>
              <span className="font-bold text-[#5EEAD4]">{activeModel.category}</span>
            </div>
          </div>

          {/* Canvas */}
          <div className="w-full h-80 sm:h-96 my-4 relative rounded-2xl overflow-hidden bg-black/40">
            <ThreeCanvasViewer
              options={viewerOptions}
              sampleModelId={activeModel.id}
              dimensionsMm={activeModel.defaultDimensionsMm}
              className="w-full h-full"
            />
            {/* Quick Viewer Controls Toolbar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 text-xs text-white">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleAutoRotate}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                    viewerOptions.autoRotate
                      ? 'bg-[#2DD4BF] text-[#051817] shadow-xs'
                      : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  Xoay
                </button>
                <button
                  type="button"
                  onClick={toggleWireframe}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                    viewerOptions.wireframe
                      ? 'bg-[#2DD4BF] text-[#051817] shadow-xs'
                      : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  Lưới Khung
                </button>
                <button
                  type="button"
                  onClick={toggleGrid}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                    viewerOptions.showGrid
                      ? 'bg-[#2DD4BF] text-[#051817] shadow-xs'
                      : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  Bàn In
                </button>
              </div>
              <span className="text-[10px] text-white/60 font-mono">
                {activeModel.defaultDimensionsMm.x}×{activeModel.defaultDimensionsMm.y}×{activeModel.defaultDimensionsMm.z} mm
              </span>
            </div>
          </div>

          {/* Model Switcher Pills */}
          <div className="z-10 flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
            <span className="text-xs text-white/60 font-semibold mr-1">Đổi mô hình test:</span>
            {SAMPLE_PRINT_MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveModel(m)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeModel.id === m.id
                    ? 'bg-[#2DD4BF] text-[#051817] shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white/80'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Instant Slicing & 0% Margin Pricing Calculator */}
        <div className="lg:col-span-5 vision-glass-panel rounded-[36px] p-6 sm:p-7 flex flex-col justify-between border border-white/15 space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#5EEAD4]" />
                <h3 className="text-base font-bold text-white">Ước Tính Slicing Staging</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                0% PHỤ THU
              </span>
            </div>

            {/* Material Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/80 block">Vật Liệu In (Giá Vốn Gốc):</label>
              <div className="grid grid-cols-1 gap-2">
                {STAGING_MATERIALS.map((mat) => (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setSelectedMaterial(mat)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      selectedMaterial.id === mat.id
                        ? 'bg-[#2DD4BF]/20 border-[#2DD4BF] shadow-sm text-white'
                        : 'bg-black/25 border-white/10 hover:border-white/20 text-white/70'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{mat.name}</div>
                      <div className="text-[10px] text-white/60">{mat.desc}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-[#5EEAD4]">
                        {mat.pricePerGramVnd.toLocaleString('vi-VN')} đ/g
                      </div>
                      <span className="text-[9px] text-white/50">{mat.tag}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Infill Density Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-white/80">Mật độ Infill:</span>
                <span className="text-[#5EEAD4] font-bold">{infillDensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={infillDensity}
                onChange={(e) => setInfillDensity(Number(e.target.value))}
                className="w-full accent-[#2DD4BF] cursor-pointer"
              />
            </div>

            {/* Slicing Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-black/30 border border-white/10">
              <div>
                <span className="text-[10px] text-white/60 block">Khối lượng ước tính</span>
                <span className="text-sm font-bold text-white">{estimatedGrams} gram</span>
              </div>
              <div>
                <span className="text-[10px] text-white/60 block">Thời gian in FDM</span>
                <span className="text-sm font-bold text-white">{estimatedHours} giờ</span>
              </div>
            </div>
          </div>

          {/* Pricing & Test Order Action */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-white/60 block">Giá Vốn Staging Sandbox:</span>
                <span className="text-xl font-black text-[#5EEAD4]">
                  {stagingCostVnd.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <span className="text-[10px] text-emerald-300 font-semibold px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/25">
                Tiết kiệm 25% so với Official
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOrderModalOpen(true)}
              className="vision-pill-btn w-full py-3.5 rounded-full text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#5EEAD4]" />
              <span>Tạo Lệnh In Thử Nghiệm Sandbox</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Comparison Table: Official vs Staging */}
      <section className="vision-glass rounded-[36px] p-6 sm:p-8 border border-white/15 space-y-5">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            So Sánh Kiến Trúc Hai Phiên Bản
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Minh bạch ranh giới giữa bản thử nghiệm Staging Sandbox và bản thương mại Official.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Official */}
          <div className="p-5 rounded-2xl bg-black/30 border border-emerald-400/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Bản Official Thương Mại (URL: /)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                Chính Thức
              </span>
            </div>
            <ul className="text-xs text-white/70 space-y-1.5 list-disc list-inside">
              <li>Áp dụng bảng giá niêm yết thương mại (+25% biên lợi nhuận chuẩn).</li>
              <li>Tích hợp cổng VietQR thật kết nối tài khoản doanh nghiệp 3D Hub.</li>
              <li>Chính sách bảo hành 1 đổi 1 trong 7 ngày, xuất hóa đơn VAT điện tử.</li>
              <li>Giao diện chuẩn hóa, ẩn hoàn toàn các công cụ RBAC sandbox với khách hàng.</li>
            </ul>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-200 pt-2"
            >
              <span>Truy cập bản Official</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card Staging */}
          <div className="p-5 rounded-2xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#5EEAD4] flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                <span>Bản Staging Sandbox (URL: /staging)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2DD4BF]/25 text-[#CCFBF1]">
                Sandbox Test
              </span>
            </div>
            <ul className="text-xs text-[#D7E5DB] space-y-1.5 list-disc list-inside">
              <li>Tone màu chủ đạo: Xanh Ngọc Bích Creamy &amp; Cyan Pastel đậm.</li>
              <li>Bảng giá tính đúng giá vốn gốc xưởng FDM/SLA (0% biên lợi nhuận).</li>
              <li>Công cụ đổi vai trò test (RBAC) dành riêng cho Admin thử nghiệm các role.</li>
              <li>Mô phỏng đơn hàng, phân tích xu hướng AI và crawler dữ liệu thời gian thực.</li>
            </ul>
            <div className="text-xs font-bold text-[#5EEAD4] pt-2">
              <span>Đang mở trên URL: /staging</span>
            </div>
          </div>
        </div>
      </section>

      {/* Order Service Modal for Sandbox Print Testing */}
      {isOrderModalOpen && (
        <OrderServiceModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          initialFileName={activeModel.name}
          initialDimensions={activeModel.defaultDimensionsMm}
          initialWeightGrams={estimatedGrams}
          initialPrintHours={Number(estimatedHours)}
          initialMaterial={selectedMaterial.name}
          initialCostVnd={stagingCostVnd}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}
