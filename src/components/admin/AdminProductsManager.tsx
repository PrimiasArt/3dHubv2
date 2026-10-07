'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Palette,
  Layers,
  Tag,
  Sliders,
  X,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Flame,
  Zap,
  Thermometer,
  Gauge,
  PlusCircle,
  MinusCircle,
  Eye,
} from 'lucide-react';
import { useShopManagement } from '@/hooks/useShopManagement';
import { IFilamentItem, IAccessoryItem, FilamentMaterial, AccessorySubCategory } from '@/backend/domain/shop';

const FILAMENT_MATERIALS: FilamentMaterial[] = [
  'PLA',
  'PLA-CF',
  'PETG',
  'PETG-CF',
  'ABS',
  'ASA',
  'TPU',
  'Resin',
];

const ACCESSORY_CATEGORIES: { id: AccessorySubCategory; label: string }[] = [
  { id: 'nozzle', label: 'Đầu Phun (Nozzle)' },
  { id: 'build_plate', label: 'Bàn In (Build Plate PEI)' },
  { id: 'hotend', label: 'Cụm Hotend Hoàn Chỉnh' },
  { id: 'extruder', label: 'Bộ Đùn Nhựa (Extruder)' },
  { id: 'dryer', label: 'Hộp Sấy Nhựa (Dryer Box)' },
  { id: 'maintenance', label: 'Bảo Dưỡng & Mỡ Bôi Trơn' },
  { id: 'tools', label: 'Dụng Cụ Cắt Tỉa & Tháo Lắp' },
];

const SAMPLE_THUMBNAILS = [
  { label: 'Cuộn PLA Trắng', url: '/thumbnails/spool-pla.svg' },
  { label: 'Cuộn Sợi Carbon CF', url: '/thumbnails/spool-cf.svg' },
  { label: 'Cuộn PLA+ Bền', url: '/thumbnails/spool-pla-plus.svg' },
  { label: 'Cuộn TPU Dẻo', url: '/thumbnails/spool-tpu.svg' },
  { label: 'Cuộn ASA Chịu Nắng', url: '/thumbnails/spool-asa.svg' },
  { label: 'Chai Nhựa Resin 8K', url: '/thumbnails/bottle-resin.svg' },
  { label: 'Phụ Kiện Bambu Lab', url: '/thumbnails/bambu-acc.svg' },
  { label: 'Cụm Đầu In Voron', url: '/thumbnails/voron-toolhead.svg' },
];

export function AdminProductsManager() {
  const {
    filaments,
    accessories,
    stats,
    isLoading,
    isProcessing,
    toastMessage,
    showToast,
    refreshInventory,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
  } = useShopManagement();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | 'filament' | 'accessory'>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingItemType, setEditingItemType] = useState<'filament' | 'accessory'>('filament');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form Fields
  const [formType, setFormType] = useState<'filament' | 'accessory'>('filament');
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('Bambu Lab');
  const [formMaterial, setFormMaterial] = useState<FilamentMaterial>('PLA');
  const [formColorName, setFormColorName] = useState('Trắng Sữa');
  const [formColorHex, setFormColorHex] = useState('#ffffff');
  const [formWeightKg, setFormWeightKg] = useState(1.0);
  const [formSubCategory, setFormSubCategory] = useState<AccessorySubCategory>('nozzle');
  const [formCompatibility, setFormCompatibility] = useState('Bambu Lab X1/P1/A1, Creality K1, Voron 2.4');
  const [formPriceVnd, setFormPriceVnd] = useState(380000);
  const [formOriginalPriceVnd, setFormOriginalPriceVnd] = useState(420000);
  const [formStockCount, setFormStockCount] = useState(20);
  const [formInStock, setFormInStock] = useState(true);
  const [formNozzleTemp, setFormNozzleTemp] = useState('190°C - 230°C');
  const [formBedTemp, setFormBedTemp] = useState('45°C - 60°C');
  const [formPrintSpeed, setFormPrintSpeed] = useState('50 - 300 mm/s');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('/thumbnails/spool-pla.svg');
  const [formBadge, setFormBadge] = useState<string>('Bán chạy');
  const [formDescription, setFormDescription] = useState('');
  const [formHighlights, setFormHighlights] = useState('Chính hãng 100%, Bề mặt láng mịn, Ít kéo sợi');

  // Delete Confirmation Modal
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; name: string; type: 'filament' | 'accessory' } | null>(null);

  // List of all unique brands
  const brands = useMemo(() => {
    const set = new Set<string>();
    filaments.forEach((f) => set.add(f.brand));
    accessories.forEach((a) => set.add(a.brand));
    return Array.from(set);
  }, [filaments, accessories]);

  // Combined and filtered items
  const filteredItems = useMemo(() => {
    let items: Array<({ itemType: 'filament' } & IFilamentItem) | ({ itemType: 'accessory' } & IAccessoryItem)> = [];

    if (productTypeFilter === 'all' || productTypeFilter === 'filament') {
      items.push(...filaments.map((f) => ({ ...f, itemType: 'filament' as const })));
    }
    if (productTypeFilter === 'all' || productTypeFilter === 'accessory') {
      items.push(...accessories.map((a) => ({ ...a, itemType: 'accessory' as const })));
    }

    // Filter by Brand
    if (selectedBrandFilter !== 'all') {
      items = items.filter((item) => item.brand.toLowerCase() === selectedBrandFilter.toLowerCase());
    }

    // Filter by Stock Status
    if (stockStatusFilter === 'in_stock') {
      items = items.filter((item) => item.inStock && item.stockCount > 5);
    } else if (stockStatusFilter === 'low_stock') {
      items = items.filter((item) => item.stockCount > 0 && item.stockCount <= 5);
    } else if (stockStatusFilter === 'out_of_stock') {
      items = items.filter((item) => !item.inStock || item.stockCount === 0);
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter((item) => {
        const matchName = item.name.toLowerCase().includes(q);
        const matchBrand = item.brand.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q) || false;
        const matchColor = item.itemType === 'filament' ? (item as IFilamentItem).colorName.toLowerCase().includes(q) : false;
        const matchMat = item.itemType === 'filament' ? (item as IFilamentItem).material.toLowerCase().includes(q) : false;
        return matchName || matchBrand || matchDesc || matchColor || matchMat;
      });
    }

    return items;
  }, [filaments, accessories, productTypeFilter, stockStatusFilter, selectedBrandFilter, searchQuery]);

  // Open Modal for Create
  const handleOpenCreateModal = (type: 'filament' | 'accessory' = 'filament') => {
    setModalMode('create');
    setEditingItemId(null);
    setFormType(type);
    setFormName('');
    setFormBrand('Bambu Lab');
    setFormMaterial('PLA');
    setFormColorName('Trắng Ngọc');
    setFormColorHex('#f8fafc');
    setFormWeightKg(1.0);
    setFormSubCategory('nozzle');
    setFormCompatibility('Bambu Lab X1/P1/A1, Creality K1');
    setFormPriceVnd(type === 'filament' ? 420000 : 250000);
    setFormOriginalPriceVnd(type === 'filament' ? 350000 : 190000);
    setFormStockCount(25);
    setFormInStock(true);
    setFormNozzleTemp('190°C - 230°C');
    setFormBedTemp('45°C - 60°C');
    setFormPrintSpeed('50 - 300 mm/s');
    setFormThumbnailUrl(type === 'filament' ? '/thumbnails/spool-pla.svg' : '/thumbnails/bambu-acc.svg');
    setFormBadge('Bán chạy');
    setFormDescription('');
    setFormHighlights('Chính hãng 100%, Bề mặt láng mịn, Chuẩn công nghiệp');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item: ({ itemType: 'filament' } & IFilamentItem) | ({ itemType: 'accessory' } & IAccessoryItem)) => {
    setModalMode('edit');
    setEditingItemId(item.id);
    setEditingItemType(item.itemType);
    setFormType(item.itemType);
    setFormName(item.name);
    setFormBrand(item.brand);
    setFormPriceVnd(item.priceVnd);
    setFormOriginalPriceVnd(item.originalPriceVnd || Math.round(item.priceVnd * 0.8));
    setFormStockCount(item.stockCount);
    setFormInStock(item.inStock);
    setFormThumbnailUrl(item.thumbnailUrl);
    setFormBadge(item.badge || '');
    setFormDescription(item.description || '');

    if (item.itemType === 'filament') {
      const f = item as IFilamentItem;
      setFormMaterial(f.material);
      setFormColorName(f.colorName);
      setFormColorHex(f.colorHex);
      setFormWeightKg(f.weightKg);
      setFormNozzleTemp(f.nozzleTempRange);
      setFormBedTemp(f.bedTempRange);
      setFormPrintSpeed(f.printSpeedRange);
      setFormHighlights(f.highlights ? f.highlights.join(', ') : '');
    } else {
      const a = item as IAccessoryItem;
      setFormSubCategory(a.subCategory);
      setFormCompatibility(a.compatibility ? a.compatibility.join(', ') : 'Universal');
    }

    setIsModalOpen(true);
  };

  // Save Modal (Create or Update)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Vui lòng nhập tên sản phẩm!');
      return;
    }

    const highlightsArray = formHighlights
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (formType === 'filament') {
      const filamentPayload = {
        name: formName.trim(),
        brand: formBrand.trim(),
        material: formMaterial,
        colorName: formColorName.trim(),
        colorHex: formColorHex,
        weightKg: Number(formWeightKg) || 1.0,
        diameterMm: 1.75,
        priceVnd: Number(formPriceVnd) || 0,
        originalPriceVnd: Number(formOriginalPriceVnd) || undefined,
        inStock: formInStock,
        stockCount: Number(formStockCount) || 0,
        nozzleTempRange: formNozzleTemp.trim(),
        bedTempRange: formBedTemp.trim(),
        printSpeedRange: formPrintSpeed.trim(),
        description: formDescription.trim(),
        highlights: highlightsArray,
        thumbnailUrl: formThumbnailUrl.trim() || '/thumbnails/spool-pla.svg',
        badge: formBadge ? (formBadge as any) : undefined,
      };

      if (modalMode === 'create') {
        const ok = await createProduct('filament', filamentPayload);
        if (ok) setIsModalOpen(false);
      } else if (editingItemId) {
        const ok = await updateProduct(editingItemId, 'filament', filamentPayload);
        if (ok) setIsModalOpen(false);
      }
    } else {
      const compatibilityArray = formCompatibility
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const accessoryPayload = {
        name: formName.trim(),
        brand: formBrand.trim(),
        subCategory: formSubCategory,
        compatibility: compatibilityArray,
        priceVnd: Number(formPriceVnd) || 0,
        originalPriceVnd: Number(formOriginalPriceVnd) || undefined,
        inStock: formInStock,
        stockCount: Number(formStockCount) || 0,
        description: formDescription.trim(),
        thumbnailUrl: formThumbnailUrl.trim() || '/thumbnails/bambu-acc.svg',
        badge: formBadge ? (formBadge as any) : undefined,
        specs: {},
      };

      if (modalMode === 'create') {
        const ok = await createProduct('accessory', accessoryPayload);
        if (ok) setIsModalOpen(false);
      } else if (editingItemId) {
        const ok = await updateProduct(editingItemId, 'accessory', accessoryPayload);
        if (ok) setIsModalOpen(false);
      }
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    const ok = await deleteProduct(deleteConfirmItem.id, deleteConfirmItem.type);
    if (ok) {
      setDeleteConfirmItem(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/25 text-white font-semibold text-xs shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-slideUp flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Fast Actions */}
      <div className="vision-glass-panel rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Quản Lý Kho Hàng &amp; Sản Phẩm
              </h2>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ADMIN &amp; MOD
              </span>
            </div>
            <p className="text-xs text-white/70 mt-1">
              Thêm mới, điều chỉnh số lượng tồn kho tức thì, cập nhật giá niêm yết, giá vốn gốc và thông số kỹ thuật cuộn nhựa &amp; linh kiện máy in.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            onClick={() => refreshInventory()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới kho</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal('filament')}
            className="vision-pill-btn flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Sản Phẩm Mới</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Total SKU */}
        <div className="vision-glass rounded-[24px] p-4 space-y-1.5 backdrop-blur-2xl border border-white/15">
          <div className="flex items-center justify-between text-white/70">
            <span className="text-[11px] font-semibold">Tổng SKU (Mẫu Hàng)</span>
            <Package className="w-4 h-4 text-white" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {stats.totalSKU}
          </div>
          <div className="text-[10px] text-white/60">
            {stats.totalFilaments} cuộn nhựa • {stats.totalAccessories} linh kiện
          </div>
        </div>

        {/* KPI 2: Total Units in Stock */}
        <div className="vision-glass rounded-[24px] p-4 space-y-1.5 backdrop-blur-2xl border border-white/15">
          <div className="flex items-center justify-between text-white/70">
            <span className="text-[11px] font-semibold">Tổng Số Lượng Tồn</span>
            <Layers className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300">
            {stats.totalStockUnits} <span className="text-xs font-normal text-white/70">món</span>
          </div>
          <div className="text-[10px] text-emerald-200/80">
            Sẵn sàng xuất kho &amp; giao 24h
          </div>
        </div>

        {/* KPI 3: Low Stock Alert (<= 5) */}
        <div className="vision-glass rounded-[24px] p-4 space-y-1.5 backdrop-blur-2xl border border-amber-400/25 bg-amber-500/10">
          <div className="flex items-center justify-between text-amber-200">
            <span className="text-[11px] font-bold">Cảnh Báo Sắp Hết (≤5)</span>
            <AlertTriangle className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            {stats.lowStockCount} <span className="text-xs font-normal text-white/70">SKU</span>
          </div>
          <div className="text-[10px] text-amber-200/80 font-medium">
            Cần nhập thêm hàng sớm
          </div>
        </div>

        {/* KPI 4: Out of Stock */}
        <div className="vision-glass rounded-[24px] p-4 space-y-1.5 backdrop-blur-2xl border border-rose-400/25 bg-rose-500/10">
          <div className="flex items-center justify-between text-rose-200">
            <span className="text-[11px] font-bold">Đã Hết Hàng (0)</span>
            <X className="w-4 h-4 text-rose-300" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-300">
            {stats.outOfStockCount} <span className="text-xs font-normal text-white/70">SKU</span>
          </div>
          <div className="text-[10px] text-rose-200/80 font-medium">
            Tạm ngưng nhận đơn
          </div>
        </div>

        {/* KPI 5: Inventory Asset Valuation */}
        <div className="vision-glass rounded-[24px] p-4 space-y-1.5 backdrop-blur-2xl border border-white/15 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-white/70">
            <span className="text-[11px] font-semibold">Giá Trị Kho Hàng</span>
            <DollarSign className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-300 truncate">
            {stats.totalInventoryValueVnd.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[10px] text-white/60">
            Tính theo giá vốn gốc
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="vision-glass rounded-[28px] p-4 backdrop-blur-2xl border border-white/15 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên sản phẩm, hãng, vật liệu PLA/PETG/ABS, màu sắc..."
              className="w-full pl-10 pr-9 py-2.5 rounded-full bg-black/30 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 font-semibold whitespace-nowrap">Hãng:</span>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="px-3 py-2 rounded-full bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
            >
              <option value="all">Tất cả hãng ({brands.length})</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Segmented Controls (Product Category & Stock Status) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-white/10">
          {/* Category Pill Switcher */}
          <div className="inline-flex p-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
            <button
              onClick={() => setProductTypeFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                productTypeFilter === 'all'
                  ? 'bg-white/30 text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Tất Cả ({stats.totalSKU})
            </button>
            <button
              onClick={() => setProductTypeFilter('filament')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                productTypeFilter === 'filament'
                  ? 'bg-white/30 text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Cuộn Nhựa ({stats.totalFilaments})
            </button>
            <button
              onClick={() => setProductTypeFilter('accessory')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                productTypeFilter === 'accessory'
                  ? 'bg-white/30 text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Phụ Kiện Máy In ({stats.totalAccessories})
            </button>
          </div>

          {/* Stock Status Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStockStatusFilter('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                stockStatusFilter === 'all'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'text-white/60 hover:text-white border border-transparent'
              }`}
            >
              Toàn Bộ Tồn Kho
            </button>
            <button
              onClick={() => setStockStatusFilter('in_stock')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                stockStatusFilter === 'in_stock'
                  ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/40'
                  : 'text-emerald-300/70 hover:text-emerald-200 border border-transparent'
              }`}
            >
              Còn Dồi Dào (&gt;5)
            </button>
            <button
              onClick={() => setStockStatusFilter('low_stock')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                stockStatusFilter === 'low_stock'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
                  : 'text-amber-300/70 hover:text-amber-200 border border-transparent'
              }`}
            >
              Sắp Hết (≤5)
            </button>
            <button
              onClick={() => setStockStatusFilter('out_of_stock')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                stockStatusFilter === 'out_of_stock'
                  ? 'bg-rose-500/25 text-rose-200 border border-rose-400/40'
                  : 'text-rose-300/70 hover:text-rose-200 border border-transparent'
              }`}
            >
              Đã Hết Hàng
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid / Cards */}
      {filteredItems.length === 0 ? (
        <div className="vision-glass rounded-[32px] p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-white/40 mx-auto" />
          <h4 className="text-base font-bold text-white">Không tìm thấy sản phẩm phù hợp</h4>
          <p className="text-xs text-white/60 max-w-sm mx-auto">
            Thử thay đổi bộ lọc tìm kiếm hoặc nhấn nút &ldquo;+ Thêm Sản Phẩm Mới&rdquo; để bổ sung vào kho hàng.
          </p>
          <button
            onClick={() => handleOpenCreateModal('filament')}
            className="vision-pill-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm Ngay</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isFilament = item.itemType === 'filament';
            const fil = isFilament ? (item as IFilamentItem) : null;
            const acc = !isFilament ? (item as IAccessoryItem) : null;

            const isLowStock = item.stockCount > 0 && item.stockCount <= 5;
            const isOut = !item.inStock || item.stockCount === 0;

            const profitMargin = item.originalPriceVnd
              ? Math.round(((item.priceVnd - item.originalPriceVnd) / item.originalPriceVnd) * 100)
              : null;

            return (
              <div
                key={item.id}
                className={`vision-glass rounded-[26px] p-4 sm:p-5 backdrop-blur-2xl border transition-all ${
                  isOut
                    ? 'border-rose-500/30 bg-rose-950/10'
                    : isLowStock
                    ? 'border-amber-500/30 bg-amber-950/10'
                    : 'border-white/15 hover:border-white/25'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Column 1: Thumbnail & Badges */}
                  <div className="lg:col-span-2 relative aspect-square sm:aspect-4/3 w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                    <Image
                      src={item.thumbnailUrl || '/thumbnails/spool-pla.svg'}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-contain p-3 transition-transform hover:scale-105"
                    />

                    {/* Badge top-left */}
                    {item.badge && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/30 backdrop-blur-md text-white border border-white/20">
                          {item.badge}
                        </span>
                      </div>
                    )}

                    {/* Stock status indicator pill */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <span
                        className={`block text-center px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                          isOut
                            ? 'bg-rose-500/80 text-white border-rose-400'
                            : isLowStock
                            ? 'bg-amber-500/80 text-black border-amber-300 font-black animate-pulse'
                            : 'bg-emerald-500/80 text-white border-emerald-400'
                        }`}
                      >
                        {isOut
                          ? 'HẾT HÀNG'
                          : isLowStock
                          ? `SẮP HẾT: CÒN ${item.stockCount}`
                          : `CÒN HÀNG: ${item.stockCount}`}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Product Info & Technical Specs */}
                  <div className="lg:col-span-6 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/15 text-white border border-white/20">
                        {item.brand}
                      </span>

                      {isFilament && fil && (
                        <>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#46694E]/40 text-emerald-200 border border-emerald-400/30">
                            {fil.material}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/30 border border-white/15 text-white">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0"
                              style={{ backgroundColor: fil.colorHex }}
                            />
                            <span>{fil.colorName}</span>
                          </span>
                          <span className="text-[10px] text-white/60">{fil.weightKg} kg</span>
                        </>
                      )}

                      {!isFilament && acc && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                          {ACCESSORY_CATEGORIES.find((c) => c.id === acc.subCategory)?.label || acc.subCategory}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                      {item.name}
                    </h3>

                    {/* Detailed Specs Row */}
                    {isFilament && fil && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/70">
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-amber-300" />
                          <span>Đầu in: {fil.nozzleTempRange}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-300" />
                          <span>Bàn in: {fil.bedTempRange}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-cyan-300" />
                          <span>Tốc độ: {fil.printSpeedRange}</span>
                        </span>
                      </div>
                    )}

                    {!isFilament && acc && acc.compatibility && (
                      <div className="text-[11px] text-white/70">
                        <span className="font-semibold text-white/90">Tương thích: </span>
                        <span>{acc.compatibility.join(', ')}</span>
                      </div>
                    )}

                    {item.description && (
                      <p className="text-xs text-white/60 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Column 3: Price & Inventory Stock Management Controls */}
                  <div className="lg:col-span-4 flex flex-col gap-2.5 border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-5">
                    {/* Prices row */}
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-xs text-white/60">Giá niêm yết:</div>
                        <div className="text-base sm:text-lg font-black text-amber-300">
                          {item.priceVnd.toLocaleString('vi-VN')} đ
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-white/50">Giá vốn gốc:</div>
                        <div className="text-xs font-semibold text-white/80">
                          {item.originalPriceVnd
                            ? `${item.originalPriceVnd.toLocaleString('vi-VN')} đ`
                            : 'Chưa đặt'}
                        </div>
                        {profitMargin !== null && (
                          <div className={`text-[10px] font-bold ${profitMargin >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {profitMargin >= 0 ? `+${profitMargin}%` : `${profitMargin}%`} biên lãi
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stock Counter with Quick Stepper Buttons */}
                    <div className="p-2.5 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between gap-2">
                      <span className="text-xs text-white/70 font-semibold whitespace-nowrap">
                        Tồn kho:
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Decrement -1 */}
                        <button
                          type="button"
                          onClick={() => adjustStock(item.id, item.itemType, { delta: -1 })}
                          disabled={item.stockCount <= 0}
                          className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white disabled:opacity-40 transition-all active:scale-90"
                          title="Giảm 1"
                        >
                          <span className="font-black text-sm">-</span>
                        </button>

                        {/* Stock Number */}
                        <span className="min-w-8 text-center text-sm font-black text-white">
                          {item.stockCount}
                        </span>

                        {/* Increment +1 */}
                        <button
                          type="button"
                          onClick={() => adjustStock(item.id, item.itemType, { delta: 1 })}
                          className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all active:scale-90"
                          title="Tăng 1"
                        >
                          <span className="font-black text-sm">+</span>
                        </button>

                        {/* Quick Restock +5 */}
                        <button
                          type="button"
                          onClick={() => adjustStock(item.id, item.itemType, { delta: 5 })}
                          className="px-2 h-7 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 text-xs font-bold transition-all active:scale-95"
                          title="Nhập thêm 5 cuộn/món"
                        >
                          +5
                        </button>
                      </div>

                      {/* InStock Quick Toggle */}
                      <button
                        type="button"
                        onClick={() => adjustStock(item.id, item.itemType, { inStock: !item.inStock })}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                          item.inStock
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                        }`}
                      >
                        {item.inStock ? 'Kinh doanh' : 'Tạm khóa'}
                      </button>
                    </div>

                    {/* Row of Management Buttons */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa Chi Tiết</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirmItem({
                            id: item.id,
                            name: item.name,
                            type: item.itemType,
                          })
                        }
                        className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-rose-300 text-xs transition-all active:scale-95"
                        title="Xóa sản phẩm khỏi kho"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT                                */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="vision-glass-panel rounded-[36px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-white/25 text-white my-8 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center text-white">
                  <Package className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {modalMode === 'create' ? 'Thêm Sản Phẩm Mới Vào Kho' : 'Cập Nhật Chi Tiết Sản Phẩm'}
                  </h3>
                  <p className="text-xs text-white/70">
                    Phân loại danh mục, thông số kỹ thuật, giá vốn, giá niêm yết và tồn kho.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Product Type Selector (Only selectable on Create) */}
              {modalMode === 'create' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">Loại Sản Phẩm</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFormType('filament');
                        setFormThumbnailUrl('/thumbnails/spool-pla.svg');
                      }}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                        formType === 'filament'
                          ? 'bg-white/25 border-white/40 text-white shadow-sm'
                          : 'bg-black/25 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      Cuộn Nhựa In 3D (Filament)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormType('accessory');
                        setFormThumbnailUrl('/thumbnails/bambu-acc.svg');
                      }}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                        formType === 'accessory'
                          ? 'bg-white/25 border-white/40 text-white shadow-sm'
                          : 'bg-black/25 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      Phụ Kiện Máy In (Accessory)
                    </button>
                  </div>
                </div>
              )}

              {/* Product Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-white block">Tên Sản Phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Bambu Lab PLA Basic 1.75mm Trắng Ngọc"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/35 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">Thương Hiệu</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="Bambu Lab, eSUN, Creality..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/35 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              {/* Filament Specific Fields */}
              {formType === 'filament' && (
                <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-3.5">
                  <div className="text-xs font-black uppercase text-emerald-300 tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Thông Số Cuộn Nhựa</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-white/80">Loại Nhựa</label>
                      <select
                        value={formMaterial}
                        onChange={(e) => setFormMaterial(e.target.value as FilamentMaterial)}
                        className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                      >
                        {FILAMENT_MATERIALS.map((mat) => (
                          <option key={mat} value={mat}>
                            {mat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-white/80">Khối Lượng (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formWeightKg}
                        onChange={(e) => setFormWeightKg(parseFloat(e.target.value) || 1.0)}
                        className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-white/80">Tên Màu Sắc</label>
                      <input
                        type="text"
                        value={formColorName}
                        onChange={(e) => setFormColorName(e.target.value)}
                        placeholder="VD: Trắng Ngọc"
                        className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-white/80">Mã Màu HEX</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formColorHex}
                          onChange={(e) => setFormColorHex(e.target.value)}
                          className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20 p-0.5"
                        />
                        <input
                          type="text"
                          value={formColorHex}
                          onChange={(e) => setFormColorHex(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Printing Temperatures & Speeds */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-white/80">Nhiệt Độ Đầu Phun</label>
                      <input
                        type="text"
                        value={formNozzleTemp}
                        onChange={(e) => setFormNozzleTemp(e.target.value)}
                        placeholder="190°C - 230°C"
                        className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-white/80">Nhiệt Độ Bàn In</label>
                      <input
                        type="text"
                        value={formBedTemp}
                        onChange={(e) => setFormBedTemp(e.target.value)}
                        placeholder="45°C - 60°C"
                        className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-white/80">Tốc Độ In</label>
                      <input
                        type="text"
                        value={formPrintSpeed}
                        onChange={(e) => setFormPrintSpeed(e.target.value)}
                        placeholder="Lên tới 300 mm/s"
                        className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Accessory Specific Fields */}
              {formType === 'accessory' && (
                <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-3.5">
                  <div className="text-xs font-black uppercase text-cyan-300 tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Thông Số Phụ Kiện</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-white/80">Phân Loại Phụ Kiện</label>
                      <select
                        value={formSubCategory}
                        onChange={(e) => setFormSubCategory(e.target.value as AccessorySubCategory)}
                        className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                      >
                        {ACCESSORY_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-white/80">Tương Thích Dòng Máy In</label>
                      <input
                        type="text"
                        value={formCompatibility}
                        onChange={(e) => setFormCompatibility(e.target.value)}
                        placeholder="VD: Bambu Lab X1/P1/A1, Creality K1, Voron 2.4"
                        className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing & Stock Management */}
              <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-3">
                <div className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Giá Cả &amp; Quản Lý Tồn Kho</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-white/80">Giá Niêm Yết (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      step="1000"
                      value={formPriceVnd}
                      onChange={(e) => setFormPriceVnd(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-300 font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-white/80">Giá Vốn / Gốc (VNĐ)</label>
                    <input
                      type="number"
                      step="1000"
                      value={formOriginalPriceVnd}
                      onChange={(e) => setFormOriginalPriceVnd(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white/80 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-white/80">Số Lượng Tồn Kho *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formStockCount}
                      onChange={(e) => setFormStockCount(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-white/80">Trạng Thái Kho</label>
                    <button
                      type="button"
                      onClick={() => setFormInStock(!formInStock)}
                      className={`w-full py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        formInStock
                          ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40'
                          : 'bg-rose-500/25 text-rose-200 border-rose-400/40'
                      }`}
                    >
                      {formInStock ? 'Còn Hàng' : 'Tạm Hết'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Thumbnail Image & Badge */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-white block">URL Hình Ảnh Thumbnail *</label>
                    <input
                      type="text"
                      required
                      value={formThumbnailUrl}
                      onChange={(e) => setFormThumbnailUrl(e.target.value)}
                      placeholder="/thumbnails/spool-pla.svg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/35 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white block">Nhãn Badge (Nếu có)</label>
                    <select
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/35 border border-white/15 text-xs text-white focus:outline-none"
                    >
                      <option value="">Không có</option>
                      <option value="Bán chạy">Bán chạy</option>
                      <option value="Khuyên dùng">Khuyên dùng</option>
                      <option value="Mới ra mắt">Mới ra mắt</option>
                      <option value="Chính hãng">Chính hãng</option>
                      <option value="Sale 15%">Sale 15%</option>
                    </select>
                  </div>
                </div>

                {/* Sample Thumbnails Selector */}
                <div className="space-y-1">
                  <div className="text-[11px] text-white/60">Chọn nhanh hình ảnh có sẵn trong hệ thống:</div>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_THUMBNAILS.map((thumb) => (
                      <button
                        key={thumb.url}
                        type="button"
                        onClick={() => setFormThumbnailUrl(thumb.url)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                          formThumbnailUrl === thumb.url
                            ? 'bg-white/30 text-white border-white/50 font-bold'
                            : 'bg-black/30 text-white/70 border-white/10 hover:border-white/25'
                        }`}
                      >
                        {thumb.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description & Highlights */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white block">Mô Tả Sản Phẩm</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Mô tả công dụng, tính chất vật liệu, đặc tính bề mặt hoàn thiện..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/35 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white block">
                    Điểm Nổi Bật (Phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={formHighlights}
                    onChange={(e) => setFormHighlights(e.target.value)}
                    placeholder="Chính hãng 100%, Bề mặt mờ che layer, Tốc độ in 300mm/s"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/35 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all disabled:opacity-50"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="vision-pill-btn flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{modalMode === 'create' ? 'Tạo Sản Phẩm Mới' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION                               */}
      {/* ======================================================== */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="vision-glass-panel rounded-[32px] p-6 max-w-md w-full shadow-2xl border border-rose-500/30 text-white space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">Xác Nhận Xóa Sản Phẩm?</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Bạn có chắc chắn muốn xóa sản phẩm <strong className="text-white">&ldquo;{deleteConfirmItem.name}&rdquo;</strong> khỏi danh mục và kho hàng không? Thao tác này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Xóa Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
