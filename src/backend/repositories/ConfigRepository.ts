import {
  ISystemConfig,
  DEFAULT_SYSTEM_CONFIG,
  IMaterialCostConfig,
  IOperationCostConfig,
  IAICostConfig,
  IApiKeysConfig,
} from '../domain/config';

class ConfigRepository {
  private config: ISystemConfig = { ...DEFAULT_SYSTEM_CONFIG };

  getConfig(): ISystemConfig {
    return { ...this.config };
  }

  updateMaterials(materials: Partial<IMaterialCostConfig>, updatedBy: string = 'Admin'): ISystemConfig {
    this.config.materials = { ...this.config.materials, ...materials };
    this.config.updatedAt = new Date().toISOString();
    this.config.updatedBy = updatedBy;
    return this.getConfig();
  }

  updateOperations(operations: Partial<IOperationCostConfig>, updatedBy: string = 'Admin'): ISystemConfig {
    this.config.operations = { ...this.config.operations, ...operations };
    this.config.updatedAt = new Date().toISOString();
    this.config.updatedBy = updatedBy;
    return this.getConfig();
  }

  updateAIPricing(aiPricing: Partial<IAICostConfig>, updatedBy: string = 'Admin'): ISystemConfig {
    this.config.aiPricing = { ...this.config.aiPricing, ...aiPricing };
    this.config.updatedAt = new Date().toISOString();
    this.config.updatedBy = updatedBy;
    return this.getConfig();
  }

  updateApiKeys(keys: Partial<IApiKeysConfig>, updatedBy: string = 'Admin'): ISystemConfig {
    this.config.apiKeys = { ...this.config.apiKeys, ...keys };
    this.config.updatedAt = new Date().toISOString();
    this.config.updatedBy = updatedBy;
    return this.getConfig();
  }

  // Tiện ích lấy giá theo từng loại vật liệu (đ/gram) có tính % chi phí
  getMaterialGramPrice(materialName: string): number {
    const marginMultiplier = 1 + (this.config.operations.profitMarginPercent || 0) / 100;
    const mat = materialName.toLowerCase();

    let costPerKg = this.config.materials.plaPerKgVnd;
    if (mat.includes('petg-cf') || mat.includes('carbon')) {
      costPerKg = this.config.materials.petgCfPerKgVnd;
    } else if (mat.includes('petg')) {
      costPerKg = this.config.materials.petgPerKgVnd;
    } else if (mat.includes('abs')) {
      costPerKg = this.config.materials.absPerKgVnd;
    } else if (mat.includes('resin') || mat.includes('sla')) {
      costPerKg = this.config.materials.resinPerLiterVnd;
    }

    const baseCostPerGram = costPerKg / 1000;
    return Math.round(baseCostPerGram * marginMultiplier);
  }

  // Tiện ích lấy phí AI theo tier có tính % chi phí
  getAITierFee(tierId?: string): number {
    const marginMultiplier = 1 + (this.config.operations.profitMarginPercent || 0) / 100;
    let baseVnd = 0;
    if (tierId === 'tripo_fast') baseVnd = this.config.aiPricing.tripoVnd;
    else if (tierId === 'trellis_pro') baseVnd = this.config.aiPricing.trellisVnd;
    else if (tierId === 'meshy_ultra') baseVnd = this.config.aiPricing.meshyVnd;

    return Math.round(baseVnd * marginMultiplier);
  }

  getGeminiApiKey(): string {
    return this.config.apiKeys.geminiApiKey || process.env.GEMINI_API_KEY || '';
  }
}

export const configRepository = new ConfigRepository();
