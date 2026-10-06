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
  // 1. NHỰA & PHỤ KIỆN
  getFilaments(filters?: { material?: string; brand?: string; search?: string }): IFilamentItem[] {
    let result = [...SHOP_FILAMENTS];
    if (filters?.material && filters.material !== 'all') {
      result = result.filter(item => item.material.toLowerCase() === filters.material?.toLowerCase());
    }
    if (filters?.brand && filters.brand !== 'all') {
      result = result.filter(item => item.brand.toLowerCase() === filters.brand?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
    }
    return result;
  }

  getAccessories(filters?: { subCategory?: string; brand?: string; search?: string }): IAccessoryItem[] {
    let result = [...SHOP_ACCESSORIES];
    if (filters?.subCategory && filters.subCategory !== 'all') {
      result = result.filter(item => item.subCategory === filters.subCategory);
    }
    if (filters?.brand && filters.brand !== 'all') {
      result = result.filter(item => item.brand.toLowerCase() === filters.brand?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
    }
    return result;
  }

  // 2. IN DỊCH VỤ & PROFILE IN
  getPrintingServices(): IPrintingServicePackage[] {
    return SHOP_PRINTING_SERVICES;
  }

  getPrintProfiles(filters?: { slicer?: string; isFree?: boolean; search?: string }): IPrintProfileItem[] {
    let result = [...SHOP_PRINT_PROFILES];
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
    const service = SHOP_PRINTING_SERVICES.find(s => s.technology === request.technology) || SHOP_PRINTING_SERVICES[0];
    
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
    let result = [...SHOP_MODELS];
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
    const fil = SHOP_FILAMENTS.find(f => f.id === id);
    if (fil) return { type: 'filament', data: fil };

    const acc = SHOP_ACCESSORIES.find(a => a.id === id);
    if (acc) return { type: 'accessory', data: acc };

    const srv = SHOP_PRINTING_SERVICES.find(s => s.id === id);
    if (srv) return { type: 'service', data: srv };

    const prof = SHOP_PRINT_PROFILES.find(p => p.id === id);
    if (prof) return { type: 'profile', data: prof };

    const mod = SHOP_MODELS.find(m => m.id === id);
    if (mod) return { type: 'model', data: mod };

    return null;
  }
}

export const shopService = new ShopService();
