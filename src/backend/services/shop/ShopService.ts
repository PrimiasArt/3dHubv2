import {
  ShopCategoryTab,
  IFilamentItem,
  IAccessoryItem,
  IPrintingServicePackage,
  IPrintProfileItem,
  IShopModelItem,
  IServiceQuoteRequest,
  IServiceQuoteResult,
} from '@/backend/domain/shop';
import {
  SHOP_FILAMENTS,
  SHOP_ACCESSORIES,
  SHOP_PRINTING_SERVICES,
  SHOP_PRINT_PROFILES,
  SHOP_MODELS,
} from './ShopData';
import { configRepository } from '@/backend/repositories/ConfigRepository';

class ShopService {
  private filaments: IFilamentItem[] = [...SHOP_FILAMENTS];
  private accessories: IAccessoryItem[] = [...SHOP_ACCESSORIES];
  private printingServices: IPrintingServicePackage[] = [...SHOP_PRINTING_SERVICES];
  private printProfiles: IPrintProfileItem[] = [...SHOP_PRINT_PROFILES];
  private shopModels: IShopModelItem[] = [...SHOP_MODELS];

  // 1. NHỰA & PHỤ KIỆN
  getFilaments(filters?: { material?: string; brand?: string; search?: string }): IFilamentItem[] {
    let result = [...this.filaments];
    if (filters?.material && filters.material !== 'all') {
      result = result.filter(item => item.material.toLowerCase() === filters.material?.toLowerCase());
    }
    if (filters?.brand && filters.brand !== 'all') {
      result = result.filter(item => item.brand.toLowerCase() === filters.brand?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.colorName.toLowerCase().includes(q)
      );
    }
    return result;
  }

  getAccessories(filters?: { subCategory?: string; brand?: string; search?: string }): IAccessoryItem[] {
    let result = [...this.accessories];
    if (filters?.subCategory && filters.subCategory !== 'all') {
      result = result.filter(item => item.subCategory === filters.subCategory);
    }
    if (filters?.brand && filters.brand !== 'all') {
      result = result.filter(item => item.brand.toLowerCase() === filters.brand?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q)
      );
    }
    return result;
  }

  // 2. IN DỊCH VỤ & PROFILE IN
  getPrintingServices(): IPrintingServicePackage[] {
    return this.printingServices;
  }

  getPrintProfiles(filters?: { slicer?: string; isFree?: boolean; search?: string }): IPrintProfileItem[] {
    let result = [...this.printProfiles];
    if (filters?.slicer && filters.slicer !== 'all') {
      result = result.filter(item => item.slicer === filters.slicer);
    }
    if (filters?.isFree !== undefined) {
      result = result.filter(item => (filters.isFree ? item.priceVnd === 0 : item.priceVnd > 0));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(item => item.title.toLowerCase().includes(q) || item.printerModel.toLowerCase().includes(q));
    }
    return result;
  }

  calculateServiceQuote(request: IServiceQuoteRequest): IServiceQuoteResult {
    const service = this.printingServices.find(s => s.technology === request.technology) || this.printingServices[0];
    
    // Đơn giá vật liệu theo gram tính từ giá vốn và % chi phí config
    const gramRate = Math.max(configRepository.getMaterialGramPrice(request.material), 250);
    const materialCost = request.weightGrams * gramRate;
    
    // Chi phí hậu kỳ
    let postProcessingCost = 0;
    const baseLabor = configRepository.getConfig().operations.laborPostProcessVnd || 15000;
    if (request.postProcessing === 'support_removal') {
      postProcessingCost = baseLabor * 2;
    } else if (request.postProcessing === 'sanding_primer') {
      postProcessingCost = baseLabor * 5;
    }

    // Chi phí AI 3D Generation tính từ giá gốc và % chi phí
    const aiFeeVnd = configRepository.getAITierFee(request.aiTier);

    const unitPrice = Math.max(materialCost + postProcessingCost + aiFeeVnd, service.minOrderVnd);
    const totalVnd = unitPrice * (request.quantity || 1);

    // Thời gian in ước tính (giờ): giả lập tốc độ in FDM ~ 25g/giờ, SLA ~ 15g/giờ
    const speedGramPerHour = request.technology.includes('SLA') ? 18 : 28;
    const estimatedHours = Math.max(1, Math.round((request.weightGrams / speedGramPerHour) * 10) / 10);
    const estimatedDeliveryDays = estimatedHours > 12 || request.quantity > 3 ? 2 : 1;

    return {
      unitPriceVnd: Math.round(unitPrice),
      materialCostVnd: Math.round(materialCost),
      postProcessingCostVnd: postProcessingCost,
      aiFeeVnd,
      totalVnd: Math.round(totalVnd),
      estimatedPrintHours: estimatedHours,
      estimatedDeliveryDays,
    };
  }

  // 3. MODEL FREE & TRẢ PHÍ
  getShopModels(filters?: { isFree?: boolean; category?: string; search?: string }): IShopModelItem[] {
    let result = [...this.shopModels];
    if (filters?.isFree !== undefined) {
      result = result.filter(item => item.isFree === filters.isFree);
    }
    if (filters?.category && filters.category !== 'all') {
      result = result.filter(item => item.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(item => item.title.toLowerCase().includes(q) || item.author.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
    }
    return result;
  }

  // Tìm sản phẩm theo ID (cho modal xem chi tiết)
  getItemById(id: string): { type: string; data: any } | null {
    const fil = this.filaments.find(f => f.id === id);
    if (fil) return { type: 'filament', data: fil };

    const acc = this.accessories.find(a => a.id === id);
    if (acc) return { type: 'accessory', data: acc };

    const srv = this.printingServices.find(s => s.id === id);
    if (srv) return { type: 'service', data: srv };

    const prof = this.printProfiles.find(p => p.id === id);
    if (prof) return { type: 'profile', data: prof };

    const mod = this.shopModels.find(m => m.id === id);
    if (mod) return { type: 'model', data: mod };

    return null;
  }

  // ==========================================
  // QUẢN LÝ KHO & SẢN PHẨM (DÀNH CHO ADMIN & MOD)
  // ==========================================

  // 1. Thêm / Sửa / Xóa Nhựa In (Filament)
  addFilament(data: Omit<IFilamentItem, 'id' | 'type'> & { id?: string }): IFilamentItem {
    const stockCount = Number(data.stockCount) || 0;
    const newItem: IFilamentItem = {
      ...data,
      id: data.id || `fil-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'filament',
      stockCount,
      inStock: data.inStock !== undefined ? data.inStock : stockCount > 0,
      priceVnd: Number(data.priceVnd) || 0,
      originalPriceVnd: data.originalPriceVnd ? Number(data.originalPriceVnd) : undefined,
      weightKg: Number(data.weightKg) || 1.0,
      diameterMm: Number(data.diameterMm) || 1.75,
      rating: data.rating || 5.0,
      reviewsCount: data.reviewsCount || 0,
      highlights: data.highlights && data.highlights.length ? data.highlights : ['Chính hãng 100%', 'Chất lượng cao', 'Màu sắc chuẩn'],
      thumbnailUrl: data.thumbnailUrl || '/thumbnails/spool-pla.svg',
    };
    this.filaments.unshift(newItem);
    return newItem;
  }

  updateFilament(id: string, data: Partial<IFilamentItem>): IFilamentItem | null {
    const index = this.filaments.findIndex(f => f.id === id);
    if (index === -1) return null;
    const current = this.filaments[index];
    const updatedStock = data.stockCount !== undefined ? Number(data.stockCount) : current.stockCount;
    const updated: IFilamentItem = {
      ...current,
      ...data,
      stockCount: updatedStock,
      inStock: data.inStock !== undefined ? data.inStock : updatedStock > 0,
      priceVnd: data.priceVnd !== undefined ? Number(data.priceVnd) : current.priceVnd,
      originalPriceVnd: data.originalPriceVnd !== undefined ? Number(data.originalPriceVnd) : current.originalPriceVnd,
    };
    this.filaments[index] = updated;
    return updated;
  }

  deleteFilament(id: string): boolean {
    const prevLen = this.filaments.length;
    this.filaments = this.filaments.filter(f => f.id !== id);
    return this.filaments.length < prevLen;
  }

  // 2. Thêm / Sửa / Xóa Phụ Kiện (Accessory)
  addAccessory(data: Omit<IAccessoryItem, 'id' | 'type'> & { id?: string }): IAccessoryItem {
    const stockCount = Number(data.stockCount) || 0;
    const newItem: IAccessoryItem = {
      ...data,
      id: data.id || `acc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'accessory',
      stockCount,
      inStock: data.inStock !== undefined ? data.inStock : stockCount > 0,
      priceVnd: Number(data.priceVnd) || 0,
      originalPriceVnd: data.originalPriceVnd ? Number(data.originalPriceVnd) : undefined,
      rating: data.rating || 5.0,
      reviewsCount: data.reviewsCount || 0,
      compatibility: data.compatibility && data.compatibility.length ? data.compatibility : ['Universal'],
      specs: data.specs || {},
      thumbnailUrl: data.thumbnailUrl || '/thumbnails/bambu-acc.svg',
    };
    this.accessories.unshift(newItem);
    return newItem;
  }

  updateAccessory(id: string, data: Partial<IAccessoryItem>): IAccessoryItem | null {
    const index = this.accessories.findIndex(a => a.id === id);
    if (index === -1) return null;
    const current = this.accessories[index];
    const updatedStock = data.stockCount !== undefined ? Number(data.stockCount) : current.stockCount;
    const updated: IAccessoryItem = {
      ...current,
      ...data,
      stockCount: updatedStock,
      inStock: data.inStock !== undefined ? data.inStock : updatedStock > 0,
      priceVnd: data.priceVnd !== undefined ? Number(data.priceVnd) : current.priceVnd,
      originalPriceVnd: data.originalPriceVnd !== undefined ? Number(data.originalPriceVnd) : current.originalPriceVnd,
    };
    this.accessories[index] = updated;
    return updated;
  }

  deleteAccessory(id: string): boolean {
    const prevLen = this.accessories.length;
    this.accessories = this.accessories.filter(a => a.id !== id);
    return this.accessories.length < prevLen;
  }

  // 3. Điều Chỉnh Số Lượng Tồn Kho Nhanh (+1, -1, +5, set số lượng, toggle còn hàng)
  updateStock(
    id: string,
    type: 'filament' | 'accessory',
    params: { delta?: number; exact?: number; inStock?: boolean }
  ): { success: boolean; item?: any; message?: string } {
    if (type === 'filament') {
      const item = this.filaments.find(f => f.id === id);
      if (!item) return { success: false, message: 'Không tìm thấy cuộn nhựa' };

      if (params.exact !== undefined) {
        item.stockCount = Math.max(0, params.exact);
      } else if (params.delta !== undefined) {
        item.stockCount = Math.max(0, item.stockCount + params.delta);
      }
      if (params.inStock !== undefined) {
        item.inStock = params.inStock;
      } else {
        item.inStock = item.stockCount > 0;
      }
      return { success: true, item };
    } else {
      const item = this.accessories.find(a => a.id === id);
      if (!item) return { success: false, message: 'Không tìm thấy phụ kiện' };

      if (params.exact !== undefined) {
        item.stockCount = Math.max(0, params.exact);
      } else if (params.delta !== undefined) {
        item.stockCount = Math.max(0, item.stockCount + params.delta);
      }
      if (params.inStock !== undefined) {
        item.inStock = params.inStock;
      } else {
        item.inStock = item.stockCount > 0;
      }
      return { success: true, item };
    }
  }

  // 4. Thống kê KPI Kho Hàng (Số lượng SKU, tổng tồn, sắp hết, hết hàng, giá trị tồn kho)
  getInventoryStats() {
    const totalFilaments = this.filaments.length;
    const totalAccessories = this.accessories.length;
    const totalSKU = totalFilaments + totalAccessories;

    const allItems = [...this.filaments, ...this.accessories];
    const totalStockUnits = allItems.reduce((sum, item) => sum + (item.stockCount || 0), 0);
    const lowStockCount = allItems.filter(item => (item.stockCount || 0) > 0 && (item.stockCount || 0) <= 5).length;
    const outOfStockCount = allItems.filter(item => !item.inStock || (item.stockCount || 0) === 0).length;

    const totalInventoryValueVnd = allItems.reduce((sum, item) => {
      const price = item.originalPriceVnd || item.priceVnd;
      return sum + (price * (item.stockCount || 0));
    }, 0);

    return {
      totalSKU,
      totalFilaments,
      totalAccessories,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      totalInventoryValueVnd,
    };
  }
}

export const shopService = new ShopService();
