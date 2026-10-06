export type ShopCategoryTab = 'filaments_accessories' | 'printing_services' | 'models_marketplace';

// 1. NHỰA IN & PHỤ KIỆN
export type FilamentMaterial = 'PLA' | 'PLA-CF' | 'PETG' | 'PETG-CF' | 'ABS' | 'ASA' | 'TPU' | 'Resin';
export type AccessorySubCategory = 'nozzle' | 'build_plate' | 'hotend' | 'extruder' | 'dryer' | 'maintenance' | 'tools';

export interface IFilamentItem {
  id: string;
  type: 'filament';
  name: string;
  brand: string;
  material: FilamentMaterial;
  colorName: string;
  colorHex: string;
  weightKg: number;
  diameterMm: number; // 1.75
  priceVnd: number;
  originalPriceVnd?: number;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewsCount: number;
  nozzleTempRange: string;
  bedTempRange: string;
  printSpeedRange: string;
  description: string;
  highlights: string[];
  thumbnailUrl: string;
  badge?: 'Bán chạy' | 'Mới ra mắt' | 'Khuyên dùng' | 'Sale 15%';
}

export interface IAccessoryItem {
  id: string;
  type: 'accessory';
  name: string;
  brand: string;
  subCategory: AccessorySubCategory;
  compatibility: string[]; // ['Bambu Lab X1/P1/A1', 'Creality K1/Ender 3', 'Universal']
  priceVnd: number;
  originalPriceVnd?: number;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewsCount: number;
  description: string;
  specs: Record<string, string>;
  thumbnailUrl: string;
  badge?: 'Chính hãng' | 'Được mua nhiều' | 'Độ bền cao';
}

// 2. IN DỊCH VỤ & PROFILE IN
export type PrintingTechnology = 'FDM High-Speed' | 'SLA Resin 8K' | 'AMS Multi-Color' | 'Engineering PA-CF';

export interface IPrintingServicePackage {
  id: string;
  type: 'service';
  name: string;
  technology: PrintingTechnology;
  pricePerGramVnd: number;
  minOrderVnd: number;
  turnaroundTime: string;
  precision: string;
  maxVolumeMm: { x: number; y: number; z: number };
  suitableFor: string[];
  materialsAvailable: string[];
  description: string;
  thumbnailUrl: string;
  badge?: 'Siêu Tốc 24h' | 'Độ Mịn 8K' | 'Đa Màu AMS' | 'Chịu Lực Cao';
}

export interface IPrintProfileItem {
  id: string;
  type: 'profile';
  title: string;
  printerModel: string;
  slicer: 'OrcaSlicer' | 'Bambu Studio' | 'Creality Print' | 'PrusaSlicer';
  filamentType: string;
  layerHeightMm: string;
  nozzleSizeMm: string;
  estimatedSpeedMmS: number;
  priceVnd: number; // 0 = Free
  downloads: number;
  rating: number;
  description: string;
  highlights: string[];
  fileName: string;
  isVerified: boolean;
  badge?: 'Đã kiểm chứng' | 'Tối ưu tốc độ' | 'Cơ khớp mượt';
}

// 3. MODEL FREE & TRẢ PHÍ
export type ModelMarketplaceCategory = 'all' | 'mechanical' | 'art_decor' | 'figure' | 'gadgets' | 'tools';

export interface IShopModelItem {
  id: string;
  type: 'model';
  title: string;
  author: string;
  authorAvatar?: string;
  isFree: boolean;
  priceVnd: number; // 0 nếu free
  originalPriceVnd?: number;
  category: ModelMarketplaceCategory;
  formats: string[]; // ['.STL', '.3MF', '.STEP']
  downloads: number;
  likes: number;
  rating: number;
  reviewsCount: number;
  difficulty: 'Dễ in' | 'Trung bình' | 'Cần chú ý Support';
  sampleModelId?: string; // Link đến 3D Viewer nếu có
  printTimeEstimate: string;
  filamentWeightEstimate: string;
  description: string;
  features: string[];
  thumbnailUrl: string;
  badge?: 'Miễn phí 100%' | 'Best Seller' | 'Độc quyền' | 'Độ chính xác cao';
}

// GIỎ HÀNG
export interface ICartItem {
  id: string;
  title: string;
  priceVnd: number;
  quantity: number;
  type: 'filament' | 'accessory' | 'service' | 'profile' | 'model';
  imageUrl: string;
  subText?: string;
}

// BÁO GIÁ DỊCH VỤ NHANH
export interface IServiceQuoteRequest {
  technology: PrintingTechnology;
  material: string;
  weightGrams: number;
  infillPercent: number;
  color: string;
  postProcessing: 'none' | 'support_removal' | 'sanding_primer';
  quantity: number;
  aiTier?: 'none' | 'tripo_fast' | 'trellis_pro' | 'meshy_ultra';
}

export interface IServiceQuoteResult {
  unitPriceVnd: number;
  materialCostVnd: number;
  postProcessingCostVnd: number;
  aiFeeVnd: number;
  totalVnd: number;
  estimatedPrintHours: number;
  estimatedDeliveryDays: number;
}
