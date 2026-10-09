'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Wand2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Sliders,
  Printer,
  Layers,
  Box,
  Save,
  Store,
  Download,
  X,
  Tag,
  FileCheck,
} from 'lucide-react';
import { use3DGenerator } from '@/hooks/use3DGenerator';
import { useModelViewer } from '@/hooks/useModelViewer';
import { usePrintSlicer } from '@/hooks/usePrintSlicer';
import { useUserWallet } from '@/hooks/useUserWallet';
import { ImageUploadZone } from '@/components/studio/ImageUploadZone';
import { EngineSelector } from '@/components/studio/EngineSelector';
import { GenerationProgress } from '@/components/studio/GenerationProgress';
import { PrinterSelector } from '@/components/studio/PrinterSelector';
import { DimensionsControl } from '@/components/studio/DimensionsControl';
import { SupportConfigPanel } from '@/components/studio/SupportConfigPanel';
import { PrintSimulationSlider } from '@/components/studio/PrintSimulationSlider';
import { SampleModelSelector } from '@/components/studio/SampleModelSelector';
import { ExpertProfileCard } from '@/components/studio/ExpertProfileCard';
import { PrintCostCalculatorComponent } from '@/components/studio/PrintCostCalculator';
import { TopUpModal } from '@/components/wallet/TopUpModal';
import { ThreeCanvasViewer } from '@/components/viewer/ThreeCanvasViewer';
import { ViewerToolbar } from '@/components/viewer/ViewerToolbar';
import { PresetGeneratorService } from '@/backend/services/slicing/PresetGeneratorService';
import Link from 'next/link';
import { OrderServiceModal } from '@/components/shop/OrderServiceModal';
import { SAMPLE_PRINT_MODELS, SampleModelId } from '@/backend/domain/sample-models';

function StudioInner() {
  const searchParams = useSearchParams();

  // 🟦 TẦNG 2: HOOK (CẦU NỐI ĐIỀU PHỐI)
  const {
    isGenerating,
    progress,
    currentStep,
    activeJob,
    error,
    selectedEngine,
    setEngine,
    generate3D,
    reset,
  } = use3DGenerator();

  const {
    options: viewerOptions,
    toggleWireframe,
    toggleAutoRotate,
    toggleGrid,
    toggleDimensions,
    toggleViewMode,
    setOrientationDeg,
    rotateStep,
    setMaterialColor,
    setLightingIntensity,
  } = useModelViewer('#6366f1');

  // Hook quản lý máy in, kích thước, support, mô hình mẫu và mô phỏng in 3D
  const {
    printers,
    selectedPrinter,
    setPrinter,
    selectedModelId,
    loadSampleModel,
    dimensionsMm,
    updateDimension,
    scalePercent,
    updateScale,
    isUniformScale,
    setIsUniformScale,
    supportConfig,
    updateSupport,
    estimation,
    currentLayer,
    simulationProgressPercent,
    isPlayingSimulation,
    playSimulation,
    pauseSimulation,
    resetSimulation,
    seekLayer,
    customModel,
    isLoadingFile,
    fileError,
    clearFileError,
    loadCustomFile,
    clearCustomModel,
  } = usePrintSlicer();

  // Hook ví tiền & mở khóa Profile In Pro (1.000 VNĐ)
  const {
    balanceVnd,
    isModelUnlocked,
    unlockProfile,
    lockProfile,
    topUpBalance,
    getProfile,
    isTopUpModalOpen,
    setIsTopUpModalOpen,
    isUnlocking,
    toastMessage,
  } = useUserWallet();

  const [activeTab, setActiveTab] = useState<'ai' | 'slicer'>('slicer');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [promptText, setPromptText] = useState<string>('');
  const [studioToast, setStudioToast] = useState<string | null>(null);
  const [isOrderServiceModalOpen, setIsOrderServiceModalOpen] = useState(false);

  // Giai đoạn 2: Vault Tệp 3D & Bán Marketplace 1-Click
  const [isSavingVault, setIsSavingVault] = useState(false);
  const [isMarketplaceModalOpen, setIsMarketplaceModalOpen] = useState(false);
  const [marketplacePriceVnd, setMarketplacePriceVnd] = useState(45000);
  const [marketplaceDescription, setMarketplaceDescription] = useState('Mô hình 3D bản quyền tối ưu góc in từ 3D Studio.');
  const [isSubmittingMarketplace, setIsSubmittingMarketplace] = useState(false);

  const showStudioToast = (msg: string) => {
    setStudioToast(msg);
    setTimeout(() => setStudioToast(null), 4500);
  };

  const handleSaveToVault = async () => {
    setIsSavingVault(true);
    try {
      const currentName = customModel
        ? customModel.fileName
        : (SAMPLE_PRINT_MODELS.find(m => m.id === selectedModelId)?.name || 'Mô hình AI 3D');

      const res = await fetch('/api/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'user_assets',
          subAction: 'add',
          assetData: {
            name: currentName,
            format: 'STL',
            fileUrl: '/models/sample.stl',
            fileSizeMb: Number((estimation.filamentWeightGrams * 0.15).toFixed(1)) || 8.5,
            previewUrl: '/thumbnails/dragon.svg',
            tags: ['AI Generated', 'Studio 3D', selectedPrinter.name],
            category: 'Art & Figures',
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showStudioToast('🎉 Đã lưu mô hình vào Vault cá nhân! Bạn có thể xem tại trang Profile.');
      } else {
        showStudioToast(data.error || 'Không thể lưu vào Vault');
      }
    } catch (err: any) {
      showStudioToast(err.message || 'Lỗi mạng khi lưu Vault');
    } finally {
      setIsSavingVault(false);
    }
  };

  const handlePublishToMarketplace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMarketplace(true);
    try {
      const currentName = customModel
        ? customModel.fileName
        : (SAMPLE_PRINT_MODELS.find(m => m.id === selectedModelId)?.name || 'Mô hình AI 3D');

      const res = await fetch('/api/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_seller_product',
          productType: 'model',
          productData: {
            title: currentName,
            name: currentName,
            category: 'Art & Figures',
            priceVnd: Number(marketplacePriceVnd),
            isFree: Number(marketplacePriceVnd) === 0,
            thumbnailUrl: '/thumbnails/dragon.svg',
            fileUrl: '/models/sample.stl',
            formats: ['.STL', '.3MF'],
            description: marketplaceDescription || 'Mô hình 3D bản quyền tối ưu góc in từ 3D Studio.',
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showStudioToast('🎉 ' + data.message);
        setIsMarketplaceModalOpen(false);
      } else {
        showStudioToast(data.error || 'Lỗi khi đăng bán');
      }
    } catch (err: any) {
      showStudioToast(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsSubmittingMarketplace(false);
    }
  };

  // Tự động nạp model nếu được chuyển từ trang Trends, Crawler hoặc Shop qua URL Query (?sampleModel=... hoặc ?model=...)
  useEffect(() => {
    const modelParam = (searchParams.get('sampleModel') || searchParams.get('model')) as SampleModelId | null;
    if (modelParam) {
      const found = SAMPLE_PRINT_MODELS.find(m => m.id === modelParam);
      if (found) {
        loadSampleModel(found);
      }
    }
  }, [searchParams, loadSampleModel]);

  const handleDropCustomFile = async (file: File) => {
    const loaded = await loadCustomFile(file, viewerOptions.materialColor);
    if (loaded) {
      showStudioToast(`🎉 Đã nạp "${loaded.fileName}" (${loaded.dimensionsMm.x}×${loaded.dimensionsMm.y}×${loaded.dimensionsMm.z} mm, ${loaded.volumeCm3} cm³)!`);
    }
  };

  const currentExpertProfile = getProfile(selectedModelId);
  const isProfileUnlocked = isModelUnlocked(selectedModelId);

  const handleStartGeneration = () => {
    if (!selectedImage) return;
    generate3D(selectedImage, promptText);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="vision-glass-panel rounded-[32px] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              3D Studio &amp; Slicer Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-white/70 mt-1">
              Trung tâm chuẩn bị bản in: Căn chỉnh khổ máy, mô phỏng cắt lớp in FDM và cấu hình Tree Support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Engine Indicator */}
          <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white/15 text-white/90 border border-white/20 flex items-center gap-1.5 backdrop-blur-xl">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>AI: Fal.ai Trellis Engine</span>
          </span>
        </div>
      </div>

      {/* SAMPLE MODEL PRESETS BAR (Nạp sẵn mô hình in mẫu 1-click) */}
      <SampleModelSelector
        selectedModelId={selectedModelId}
        onSelectModel={loadSampleModel}
      />

      {/* Main Studio Grid: Left Configuration (5 cols) vs Right 3D Viewport (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Tabbed Controls (AI Creation vs Slicer & Support Prefs) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Navigation Tabs between Slicer Settings and AI Studio */}
          <div className="flex rounded-full bg-black/30 p-1.5 border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('slicer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'slicer'
                  ? 'bg-white/28 text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>1. Khổ Máy &amp; Support In</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'ai'
                  ? 'bg-white/28 text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2. AI Tạo 3D Từ Ảnh</span>
            </button>
          </div>

          {/* TAB 1: PRINTER SELECTION, DIMENSIONS, & SUPPORT PREFERENCES */}
          {activeTab === 'slicer' && (
            <div className="space-y-4">
              {/* Printer Profile Preset */}
              <PrinterSelector
                printers={printers}
                selectedPrinter={selectedPrinter}
                onSelectPrinter={setPrinter}
              />

              {/* Dimensions X, Y, Z and Scale */}
              <DimensionsControl
                dimensionsMm={dimensionsMm}
                onUpdateDimension={updateDimension}
                scalePercent={scalePercent}
                onUpdateScale={updateScale}
                isUniformScale={isUniformScale}
                onToggleUniformScale={() => setIsUniformScale(!isUniformScale)}
                selectedPrinter={selectedPrinter}
                estimation={estimation}
              />

              {/* Support Configuration & AI Recommendations */}
              <SupportConfigPanel
                supportConfig={supportConfig}
                onUpdateSupport={updateSupport}
                estimation={estimation}
                selectedModelId={selectedModelId}
              />

              {/* Business Pricing & Production Cost Breakdown */}
              <PrintCostCalculatorComponent
                filamentType={currentExpertProfile.filamentType}
                filamentWeightGrams={estimation.filamentWeightGrams}
                printTimeMinutes={estimation.estimatedPrintTimeMinutes}
                supportConfig={supportConfig}
                printerWattage={selectedPrinter.bedDimensions.x > 250 ? 350 : 180}
              />
            </div>
          )}

          {/* TAB 2: AI GENERATION */}
          {activeTab === 'ai' && (
            <div className="space-y-4 vision-glass rounded-[32px] p-5 sm:p-6 shadow-2xl">
              {/* Step 1: Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/70 px-0.5">
                  Tải Lên Ảnh 2D Cần Dựng 3D:
                </label>
                <ImageUploadZone
                  onImageSelected={(img) => setSelectedImage(img)}
                  disabled={isGenerating}
                />
              </div>

              {/* Step 2: Prompt Assistance */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/70 flex items-center justify-between px-0.5">
                  <span>Ghi Chú Mô Tả Chi Tiết:</span>
                  <span className="text-[11px] font-normal text-white/80 flex items-center gap-1">
                    <Wand2 className="w-3 h-3" /> Tự động Watertight
                  </span>
                </label>
                <input
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  disabled={isGenerating}
                  placeholder="VD: Cấu trúc cơ khí, độ dày thành 2mm, không cần support..."
                  className="w-full px-4 py-3 rounded-2xl bg-black/25 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-black/35 transition-all"
                />
              </div>

              {/* Step 3: Engine Selector */}
              <EngineSelector
                selectedEngine={selectedEngine}
                onSelectEngine={setEngine}
                disabled={isGenerating}
              />

              {/* Step 4: Generate Action Button */}
              <div className="pt-1">
                <button
                  onClick={handleStartGeneration}
                  disabled={!selectedImage || isGenerating}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm text-white transition-all shadow-lg active:scale-[0.98] ${
                    !selectedImage || isGenerating
                      ? 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed shadow-none'
                      : 'vision-pill-btn'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>{isGenerating ? 'Đang Dựng 3D...' : 'Bắt Đầu Tạo Mô Hình 3D'}</span>
                </button>
              </div>

              {/* Progress Indicator */}
              {isGenerating && (
                <GenerationProgress progress={progress} currentStep={currentStep} />
              )}

              {/* Error Notice */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs flex items-center gap-2 backdrop-blur-md">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Status */}
              {activeJob && !isGenerating && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs flex items-center justify-between backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-300" />
                    <span>Đã tạo xong! Chuyển tab &quot;Khổ Máy &amp; Support&quot; để căn chỉnh in!</span>
                  </div>
                  <button onClick={reset} className="text-white/60 hover:text-white" title="Làm mới">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: 3D WebGL Canvas & Slicing Simulation Slider */}
        <div className="lg:col-span-7 space-y-4">
          {/* Three.js Canvas Container with Printer Bed & Volume Bounding Box */}
          <div className="relative rounded-[32px] overflow-hidden border border-white/15 shadow-2xl bg-black/60">
            <ThreeCanvasViewer
              options={viewerOptions}
              modelUrl={activeJob?.resultGlbUrl}
              printer={selectedPrinter}
              dimensionsMm={dimensionsMm}
              supportConfig={supportConfig}
              currentLayer={currentLayer}
              totalLayers={estimation.totalLayers}
              sampleModelId={selectedModelId}
              customLoadedModel={customModel}
              onDropFile={handleDropCustomFile}
              onClearCustomModel={clearCustomModel}
              className="h-[480px]"
            />
          </div>

          {/* Interactive Toolbar below Canvas (With Slicer Toolpath Mode & Auto-Orientation) */}
          <ViewerToolbar
            options={viewerOptions}
            onToggleWireframe={toggleWireframe}
            onToggleAutoRotate={toggleAutoRotate}
            onToggleGrid={toggleGrid}
            onToggleDimensions={toggleDimensions}
            onToggleViewMode={toggleViewMode}
            onSetOrientation={setOrientationDeg}
            onRotateStep={rotateStep}
            onColorChange={setMaterialColor}
            onLightingChange={setLightingIntensity}
            onExportSTL={() => PresetGeneratorService.downloadSTL(selectedModelId)}
          />

          {/* Slicing Layer-by-Layer Simulation Slider with Stats */}
          <PrintSimulationSlider
            currentLayer={currentLayer}
            totalLayers={estimation.totalLayers}
            simulationProgressPercent={simulationProgressPercent}
            isPlayingSimulation={isPlayingSimulation}
            onPlay={playSimulation}
            onPause={pauseSimulation}
            onReset={resetSimulation}
            onSeek={seekLayer}
            estimation={estimation}
          />

          {/* FAST CONVERSION & 3D ASSET LIFECYCLE ACTION BAR */}
          <div className="p-4 sm:p-5 rounded-[28px] vision-glass flex flex-col gap-4 shadow-xl">
            {/* Row 1: Đặt In 3D Trực Tiếp */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-white/20 border border-white/25 flex items-center justify-center text-white shadow-md flex-shrink-0">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Đặt In Dịch Vụ Mẫu Này Ngay
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white/90 border border-white/20">
                      Báo giá tức thì
                    </span>
                  </div>
                  <p className="text-xs text-white/70 mt-0.5">
                    Ước tính: ~{estimation.filamentWeightGrams}g nhựa • Thời gian in: ~{Math.round((estimation.estimatedPrintTimeMinutes / 60) * 10) / 10}h • Giao toàn quốc
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsOrderServiceModalOpen(true)}
                  className="vision-pill-btn flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white font-bold text-xs shadow-lg active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Đặt In (Tạm Tính {Math.max(25000, estimation.filamentWeightGrams * 600 + Math.round(estimation.estimatedPrintTimeMinutes / 60) * 15000).toLocaleString('vi-VN')} đ)</span>
                </button>

                <Link
                  href={`/shop?tab=services&modelName=${encodeURIComponent(customModel ? customModel.fileName : (SAMPLE_PRINT_MODELS.find(m => m.id === selectedModelId)?.name || '3D Benchy'))}&weight=${estimation.filamentWeightGrams}&dimX=${dimensionsMm.x}&dimY=${dimensionsMm.y}&dimZ=${dimensionsMm.z}`}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 text-xs font-semibold transition-all whitespace-nowrap"
                  title="Tùy chỉnh cấu hình báo giá chi tiết tại Cửa Hàng 3D Hub"
                >
                  <span>Xem tại Shop →</span>
                </Link>
              </div>
            </div>

            {/* Row 2: Khép kín vòng đời tệp 3D: Lưu Vault, Đăng Bán Marketplace, Tải STL */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveToVault}
                  disabled={isSavingVault}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <Save className={`w-3.5 h-3.5 ${isSavingVault ? 'animate-spin' : ''}`} />
                  <span>{isSavingVault ? 'Đang Lưu...' : 'Lưu Vào 3D Vault'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMarketplaceModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Store className="w-3.5 h-3.5 text-amber-300" />
                  <span>Đưa Lên Bán Marketplace</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  PresetGeneratorService.downloadSTL(selectedModelId);
                  showStudioToast('📥 Đang tải tệp STL về thiết bị...');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải File (.STL)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ĐĂNG BÁN MÔ HÌNH LÊN MARKETPLACE 1-CLICK */}
      {isMarketplaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="vision-glass-panel rounded-[32px] p-6 sm:p-7 max-w-md w-full shadow-2xl border border-white/20 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                <Store className="w-5 h-5" />
                <span>Đăng Bán Lên Marketplace 3D</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMarketplaceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishToMarketplace} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-white block">Tên Mô Hình 3D</label>
                <input
                  type="text"
                  disabled
                  value={customModel ? customModel.fileName : (SAMPLE_PRINT_MODELS.find(m => m.id === selectedModelId)?.name || 'Mô hình AI 3D')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white/80 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white block">Giá Bán Niêm Yết (VNĐ)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    required
                    value={marketplacePriceVnd}
                    onChange={(e) => setMarketplacePriceVnd(parseInt(e.target.value) || 0)}
                    placeholder="0 = Miễn phí"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 text-[11px]">
                    {marketplacePriceVnd === 0 ? 'Miễn Phí' : 'VNĐ'}
                  </span>
                </div>
                <p className="text-[10px] text-white/50">
                  Khi khách mua: Sàn giữ 8% hoa hồng, 92% doanh thu chuyển vào ví của bạn.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white block">Mô Tả Sản Phẩm</label>
                <textarea
                  rows={2}
                  value={marketplaceDescription}
                  onChange={(e) => setMarketplaceDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMarketplaceModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMarketplace}
                  className="vision-pill-btn px-5 py-2.5 rounded-full text-white font-bold shadow-md"
                >
                  {isSubmittingMarketplace ? 'Đang Gửi...' : 'Gửi Phê Duyệt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRO EXPERT PRINT PROFILE & SLICING GUIDE CARD (MỞ KHÓA 1.000 VNĐ & XUẤT .3MF) */}
      <section className="pt-2">
        <ExpertProfileCard
          profile={currentExpertProfile}
          isUnlocked={isProfileUnlocked}
          onUnlock={() => unlockProfile(selectedModelId)}
          onLock={() => lockProfile(selectedModelId)}
          isUnlocking={isUnlocking}
          userBalanceVnd={balanceVnd}
          onOpenTopUp={() => setIsTopUpModalOpen(true)}
          printer={selectedPrinter}
          dimensionsMm={dimensionsMm}
          supportConfig={supportConfig}
        />
      </section>

      {/* TopUp Modal */}
      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        currentBalanceVnd={balanceVnd}
        onTopUp={topUpBalance}
      />

      {/* Order Service Modal synced from 3D Studio */}
      <OrderServiceModal
        isOpen={isOrderServiceModalOpen}
        onClose={() => setIsOrderServiceModalOpen(false)}
        initialFileName={customModel ? customModel.fileName : (SAMPLE_PRINT_MODELS.find(m => m.id === selectedModelId)?.name || '3D Benchy')}
        initialDimensions={dimensionsMm}
        initialWeightGrams={estimation.filamentWeightGrams}
        initialPrintHours={Math.round((estimation.estimatedPrintTimeMinutes / 60) * 10) / 10}
        initialMaterial="PLA Basic"
        initialCostVnd={Math.max(25000, estimation.filamentWeightGrams * 600 + Math.round(estimation.estimatedPrintTimeMinutes / 60) * 15000)}
        onShowToast={showStudioToast}
      />

      {/* Floating Toast Notification */}
      {(toastMessage || studioToast) && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full vision-glass border border-white/25 shadow-2xl text-white text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{toastMessage || studioToast}</span>
        </div>
      )}

      {fileError && (
        <div className="fixed bottom-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-950/85 border border-rose-500/50 shadow-2xl backdrop-blur-2xl text-rose-200 text-xs font-medium max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="flex-1 leading-relaxed">{fileError}</span>
          <button
            type="button"
            onClick={clearFileError}
            className="p-1 rounded-full text-rose-300 hover:text-white hover:bg-rose-500/20 transition-all shrink-0"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white/50">Đang chuẩn bị 3D Studio...</div>}>
      <StudioInner />
    </Suspense>
  );
}
