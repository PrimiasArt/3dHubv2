'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Printer,
  Box,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UploadCloud,
  RotateCcw,
  Eye,
  ShoppingBag,
  Star,
  Truck,
  Cpu,
  Clock,
  ChevronRight,
  Flame,
  Check,
} from 'lucide-react';
import { ThreeCanvasViewer } from '@/components/viewer/ThreeCanvasViewer';
import { useModelViewer } from '@/hooks/useModelViewer';
import { SAMPLE_PRINT_MODELS, SampleModelId, ISamplePrintModel } from '@/backend/domain/sample-models';
import { OrderServiceModal } from '@/components/shop/OrderServiceModal';

interface MaterialOption {
  id: string;
  name: string;
  tag: string;
  pricePerGramVnd: number;
  desc: string;
  colorHex: string;
}

const MATERIAL_OPTIONS: MaterialOption[] = [
  {
    id: 'pla',
    name: 'PLA Matte / Silk',
    tag: 'Decor & Nghệ thuật',
    pricePerGramVnd: 450,
    desc: 'Bề mặt mịn màng, màu sắc phong phú, lý tưởng cho decor',
    colorHex: '#7EC895',
  },
  {
    id: 'petg',
    name: 'PETG-CF Carbon',
    tag: 'Cơ khí & Kỹ thuật',
    pricePerGramVnd: 680,
    desc: 'Gia cường sợi carbon, chịu lực va đập và chịu nhiệt 80°C',
    colorHex: '#64748B',
  },
  {
    id: 'resin',
    name: 'Resin SLA 8K',
    tag: 'Mô hình siêu nét',
    pricePerGramVnd: 850,
    desc: 'Độ phân giải 8K, bề mặt láng bóng, không lộ vân in',
    colorHex: '#A855F7',
  },
];

const SHOWCASE_PRODUCTS = [
  {
    id: 'prod-dragon',
    name: 'Articulated Crystal Dragon V3',
    subtitle: 'Rồng khớp uốn lượn phong cách Cyberpunk',
    category: 'Toys & Fidget',
    material: 'PLA Silk Dual-Color',
    weightGrams: 95,
    printHours: 3.5,
    priceVnd: 120000,
    rating: 4.9,
    reviewsCount: 142,
    image: '/thumbnails/dragon.svg',
    modelId: 'dragon' as SampleModelId,
    tag: 'Bán chạy nhất',
  },
  {
    id: 'prod-benchy',
    name: '3D Benchy Classic Benchmark',
    subtitle: 'Thuyền kiểm chuẩn máy in kinh điển thế giới',
    category: 'Mô hình chuẩn',
    material: 'PLA Matte Forest',
    weightGrams: 35,
    printHours: 1.2,
    priceVnd: 45000,
    rating: 5.0,
    reviewsCount: 320,
    image: '/thumbnails/benchy.svg',
    modelId: 'benchy' as SampleModelId,
    tag: 'Kinh điển',
  },
  {
    id: 'prod-robot',
    name: 'Retro Fidget Bot Companion',
    subtitle: 'Robot linh vật bàn làm việc có khớp tay xoay',
    category: 'Art & Decoration',
    material: 'PETG Bền bỉ',
    weightGrams: 80,
    printHours: 2.8,
    priceVnd: 89000,
    rating: 4.8,
    reviewsCount: 88,
    image: '/thumbnails/robot.svg',
    modelId: 'robot' as SampleModelId,
    tag: 'Xu hướng 2026',
  },
  {
    id: 'prod-gear',
    name: 'Planetary Gear Bearing Fidget',
    subtitle: 'Hộp số bánh răng hành tinh xoay siêu mượt',
    category: 'Cơ khí chính xác',
    material: 'PETG-CF Carbon',
    weightGrams: 60,
    printHours: 2.1,
    priceVnd: 75000,
    rating: 4.9,
    reviewsCount: 104,
    image: '/thumbnails/gear.svg',
    modelId: 'gear' as SampleModelId,
    tag: 'Kỹ thuật',
  },
];

export default function HomePage() {
  const [selectedModelId, setSelectedModelId] = useState<SampleModelId>('benchy');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption>(MATERIAL_OPTIONS[0]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3D Canvas Viewer Options
  const {
    options: viewerOptions,
    toggleAutoRotate,
    toggleWireframe,
    toggleGrid,
    toggleDimensions,
    setMaterialColor,
  } = useModelViewer(selectedMaterial.colorHex);

  const selectedModel = SAMPLE_PRINT_MODELS.find((m) => m.id === selectedModelId) || SAMPLE_PRINT_MODELS[0];

  // Live Print Cost Calculation
  const estimatedGrams = Math.round(
    ((selectedModel.defaultDimensionsMm.x * selectedModel.defaultDimensionsMm.y * selectedModel.defaultDimensionsMm.z) / 1000) * 0.35
  );
  const estimatedHours = Number((estimatedGrams / 28).toFixed(1));
  const estimatedPriceVnd = Math.max(35000, Math.round(estimatedGrams * selectedMaterial.pricePerGramVnd + estimatedHours * 8000));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectMaterial = (mat: MaterialOption) => {
    setSelectedMaterial(mat);
    setMaterialColor(mat.colorHex);
  };

  const handleQuickOrder = (modelId: SampleModelId) => {
    setSelectedModelId(modelId);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="space-y-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 py-3 px-5 rounded-2xl bg-[#1E3123] border border-[#7EC895]/50 text-white text-xs font-bold shadow-2xl backdrop-blur-xl animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#7EC895]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          HERO SECTION: ALL-IN-ONE 3D CREATION & LIVE PRINT LAB
          ======================================================== */}
      <section className="relative rounded-[36px] overflow-hidden vision-glass-panel p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.45)] border border-[#7EC895]/25">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#7EC895]/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Creator & Quote Engine (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#7EC895]/20 text-[#D7EEDB] border border-[#7EC895]/35 shadow-[0_0_12px_rgba(126,200,149,0.25)]">
                <Sparkles className="w-3.5 h-3.5 text-[#7EC895]" />
                <span>SPATIAL 3D LAB • ALL-IN-ONE ENGINE</span>
              </span>
              <span className="text-[11px] text-[#A5BAAC]">
                Bản Staging Sandbox (Xanh Creamy &amp; Pastel Đậm)
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-white leading-tight">
                Biến Ý Tưởng &amp; Hình Ảnh Thành{' '}
                <span className="text-[#EBDDB6] drop-shadow-sm">Sản Phẩm 3D Thực Tế</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#D7E5DB] leading-relaxed max-w-xl">
                Tải ảnh bất kỳ hoặc chọn mẫu thiết kế. Xem mô hình 3D xoay 360° tương tác thời gian thực, nhận báo giá in FDM / SLA tự động và đặt in giao tận nơi trong 24 giờ.
              </p>
            </div>

            {/* Step 1: Model Selector (Presets + Upload link) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#7EC895]/25 text-[#7EC895] flex items-center justify-center text-[11px] font-black">
                    1
                  </span>
                  <span>Chọn mẫu mô hình trải nghiệm hoặc tải ảnh:</span>
                </label>
                <Link
                  href="/studio"
                  className="text-[11px] font-semibold text-[#7EC895] hover:text-[#A6DCB8] flex items-center gap-1 transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Tải ảnh lên Studio AI →</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_PRINT_MODELS.slice(0, 4).map((m) => {
                  const isSelected = selectedModelId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedModelId(m.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-[#7EC895]/20 border-[#7EC895] shadow-[0_0_16px_rgba(126,200,149,0.25)] ring-1 ring-[#7EC895]/50'
                          : 'bg-black/25 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-xs text-white truncate">{m.name.split('-')[0].trim()}</div>
                      <div className="text-[10px] text-[#A5BAAC] truncate mt-0.5">{m.category}</div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#7EC895]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Material & Live Slicer Quote */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#7EC895]/25 text-[#7EC895] flex items-center justify-center text-[11px] font-black">
                  2
                </span>
                <span>Chọn chất liệu nhựa in xưởng Bambu Lab:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {MATERIAL_OPTIONS.map((mat) => {
                  const isSelected = selectedMaterial.id === mat.id;
                  return (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => handleSelectMaterial(mat)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#7EC895]/20 border-[#7EC895] shadow-[0_0_16px_rgba(126,200,149,0.25)] ring-1 ring-[#7EC895]/50'
                          : 'bg-black/25 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{mat.name}</span>
                        <span
                          className="w-3 h-3 rounded-full border border-white/30"
                          style={{ backgroundColor: mat.colorHex }}
                        />
                      </div>
                      <div className="text-[10px] text-[#EBDDB6] font-semibold mt-0.5">{mat.tag}</div>
                      <div className="text-[10px] text-[#A5BAAC] mt-1 line-clamp-1">{mat.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Live Slicer Pricing Capsule & Primary CTA */}
            <div className="p-4 rounded-3xl bg-black/35 border border-[#7EC895]/30 space-y-3 shadow-inner">
              <div className="grid grid-cols-3 gap-2 text-center divide-x divide-white/10">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#A5BAAC]">Kích Thước</div>
                  <div className="text-xs font-mono font-bold text-white mt-0.5">
                    {selectedModel.defaultDimensionsMm.x}×{selectedModel.defaultDimensionsMm.y}×{selectedModel.defaultDimensionsMm.z} mm
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#A5BAAC]">Trọng Lượng &amp; Giờ</div>
                  <div className="text-xs font-mono font-bold text-white mt-0.5">
                    ~{estimatedGrams}g • {estimatedHours}h
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#A5BAAC]">Báo Giá Trọn Gói</div>
                  <div className="text-base font-black text-[#EBDDB6] font-mono mt-0.5">
                    {estimatedPriceVnd.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(true)}
                  className="w-full sm:flex-1 py-3 px-6 rounded-full bg-[#7EC895] hover:bg-[#92D4A6] text-[#0E1811] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_8px_24px_rgba(126,200,149,0.35)] active:scale-95 group"
                >
                  <Printer className="w-4 h-4 text-[#0E1811] group-hover:rotate-12 transition-transform" />
                  <span>Đặt In Xưởng 24H Ngay</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <Link
                  href="/studio"
                  className="w-full sm:w-auto py-3 px-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#EBDDB6]" />
                  <span>Mở AI Studio Chuyên Sâu</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D WebGL Viewer (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative rounded-[32px] overflow-hidden border border-white/20 shadow-2xl bg-black/40 h-[380px] sm:h-[440px]">
              {/* ThreeCanvasViewer component */}
              <ThreeCanvasViewer
                options={viewerOptions}
                sampleModelId={selectedModelId}
                dimensionsMm={selectedModel.defaultDimensionsMm}
                className="w-full h-full"
              />

              {/* Top Floating Glass Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white pointer-events-none">
                <Check className="w-3 h-3 text-[#7EC895]" />
                <span>Mô hình 3D sẵn sàng in (Watertight)</span>
              </div>

              {/* Bottom Quick Controls Toolbar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 text-xs text-white">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleAutoRotate}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                      viewerOptions.autoRotate
                        ? 'bg-[#7EC895] text-black shadow-xs'
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
                        ? 'bg-[#7EC895] text-black shadow-xs'
                        : 'bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    Lưới
                  </button>
                  <button
                    type="button"
                    onClick={toggleDimensions}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                      viewerOptions.showDimensions
                        ? 'bg-[#7EC895] text-black shadow-xs'
                        : 'bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    Thước
                  </button>
                </div>

                <span className="text-[10px] text-[#A5BAAC]">Kéo chuột để xoay 360°</span>
              </div>
            </div>

            <p className="text-[11px] text-[#A5BAAC] text-center">
              Khung xem 3D không gian Three.js chuẩn xác kích thước và bề mặt in thực tế.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2: E-COMMERCE SHOWCASE (SẢN PHẨM & MẪU IN BÁN CHẠY)
          ======================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#7EC895]" />
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Mẫu In &amp; Thiết Kế 3D Được Yêu Thích Nhất
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#A5BAAC] mt-1">
              Tuyển tập mô hình in sẵn chất lượng cao, tối ưu hóa đường chạy dao trên OrcaSlicer
            </p>
          </div>

          <Link
            href="/shop"
            className="vision-pill-btn flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-white self-start sm:self-auto transition-all group"
          >
            <span>Xem Toàn Bộ Cửa Hàng (48+)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SHOWCASE_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="vision-glass rounded-[32px] p-5 space-y-4 border border-white/15 hover:border-[#7EC895]/50 transition-all hover:-translate-y-1 shadow-lg group flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Product Thumbnail */}
                <div className="relative w-full h-44 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#7EC895]/20 border border-[#7EC895]/30 text-[#D7EEDB] text-[10px] font-bold">
                    {prod.tag}
                  </div>
                  <div className="relative w-28 h-28 group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#A5BAAC]">
                    <span>{prod.category}</span>
                    <span className="flex items-center gap-1 text-[#EBDDB6]">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{prod.rating}</span>
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#7EC895] transition-colors line-clamp-1">
                    {prod.name}
                  </h3>
                  <p className="text-[11px] text-white/60 line-clamp-1">
                    {prod.subtitle}
                  </p>
                </div>

                {/* Specs Pill */}
                <div className="flex items-center gap-2 text-[10px] text-[#A5BAAC]">
                  <span>{prod.material}</span>
                  <span>•</span>
                  <span>~{prod.weightGrams}g</span>
                  <span>•</span>
                  <span>{prod.printHours}h</span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#A5BAAC]">Giá in xưởng</div>
                  <div className="text-base font-black text-[#EBDDB6] font-mono">
                    {prod.priceVnd.toLocaleString('vi-VN')} đ
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickOrder(prod.modelId)}
                  className="px-4 py-2 rounded-full bg-white/15 hover:bg-[#7EC895] hover:text-[#0E1811] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  Đặt In Ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 3: PROFESSIONAL INDUSTRIAL WORKSHOP STANDARDS
          ======================================================== */}
      <section className="vision-glass-panel rounded-[36px] p-6 sm:p-8 space-y-6 border border-white/20">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7EC895]">
            TIÊU CHUẨN XƯỞNG SẢN XUẤT 3D HUB
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-white">
            Công Nghệ In 3D Đỉnh Cao &amp; Bảo Hành 1 Đổi 1
          </h2>
          <p className="text-xs text-[#D7E5DB]">
            Chúng tôi cam kết chất lượng từng lớp in (layer) với quy trình kiểm định gắt gao.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-black/25 border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#7EC895]/20 flex items-center justify-center text-[#7EC895]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Farm Máy In Bambu Lab</h3>
            <p className="text-xs text-[#A5BAAC]">
              Dàn máy Bambu Lab X1-Carbon &amp; P1S tốc độ 500mm/s khép kín kiểm soát nhiệt độ tự động.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/25 border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#7EC895]/20 flex items-center justify-center text-[#7EC895]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Chuẩn Xác ±0.1mm</h3>
            <p className="text-xs text-[#A5BAAC]">
              Độ khít khớp cơ khí hoàn hảo cho bánh răng, linh kiện máy móc và mô hình khớp nối.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/25 border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#7EC895]/20 flex items-center justify-center text-[#7EC895]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Nhựa Chính Hãng 100%</h3>
            <p className="text-xs text-[#A5BAAC]">
              Nguyên liệu cuộn nhựa eSun &amp; Bambu Lab cao cấp, không độc hại, đạt chứng nhận an toàn RoHS.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/25 border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#7EC895]/20 flex items-center justify-center text-[#7EC895]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Bảo Hành 1 Đổi 1</h3>
            <p className="text-xs text-[#A5BAAC]">
              In lại miễn phí 100% trong 7 ngày nếu sản phẩm nứt gãy, cong vênh hoặc lỗi kỹ thuật.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          ORDER SERVICE MODAL (KHI BẤM ĐẶT IN)
          ======================================================== */}
      {isOrderModalOpen && (
        <OrderServiceModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          initialFileName={selectedModel.name}
          initialDimensions={selectedModel.defaultDimensionsMm}
          initialWeightGrams={estimatedGrams}
          initialPrintHours={estimatedHours}
          initialMaterial={selectedMaterial.name}
          initialCostVnd={estimatedPriceVnd}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}
