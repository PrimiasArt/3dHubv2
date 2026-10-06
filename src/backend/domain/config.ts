export interface IMaterialCostConfig {
  plaPerKgVnd: number;       // Giá vốn PLA (đ/kg)
  petgPerKgVnd: number;      // Giá vốn PETG (đ/kg)
  petgCfPerKgVnd: number;    // Giá vốn PETG-CF (đ/kg)
  absPerKgVnd: number;       // Giá vốn ABS (đ/kg)
  resinPerLiterVnd: number;  // Giá vốn Resin SLA (đ/lít)
}

export interface IOperationCostConfig {
  machineHourlyRateVnd: number;  // Khấu hao & bảo trì máy in theo giờ (đ/h)
  electricityHourlyVnd: number;  // Chi phí điện theo giờ (đ/h)
  laborPostProcessVnd: number;   // Nhân công hậu kỳ gỡ support (đ/đơn)
  profitMarginPercent: number;   // % chi phí phụ thu / biên lợi nhuận (0% = giá gốc, 15%, 30%...)
}

export interface IAICostConfig {
  tripoUsd: number;      // $0.01
  tripoVnd: number;      // 250 đ (giá gốc)
  trellisUsd: number;    // $0.05
  trellisVnd: number;    // 1.250 đ (giá gốc)
  meshyUsd: number;      // $0.80
  meshyVnd: number;      // 20.000 đ (giá gốc)
  exchangeRate: number;  // 25.400 đ/USD
}

export interface IApiKeysConfig {
  falKey: string;
  meshyApiKey: string;
  geminiApiKey: string;
  makerWorldCookie: string;
}

export interface ISystemConfig {
  materials: IMaterialCostConfig;
  operations: IOperationCostConfig;
  aiPricing: IAICostConfig;
  apiKeys: IApiKeysConfig;
  updatedAt: string;
  updatedBy: string;
}

export const DEFAULT_SYSTEM_CONFIG: ISystemConfig = {
  materials: {
    plaPerKgVnd: 180000,      // 180.000 đ/kg ~ 180 đ/g
    petgPerKgVnd: 220000,     // 220.000 đ/kg ~ 220 đ/g
    petgCfPerKgVnd: 450000,   // 450.000 đ/kg ~ 450 đ/g
    absPerKgVnd: 240000,      // 240.000 đ/kg ~ 240 đ/g
    resinPerLiterVnd: 420000, // 420.000 đ/lít ~ 420 đ/g
  },
  operations: {
    machineHourlyRateVnd: 8000,
    electricityHourlyVnd: 2500,
    laborPostProcessVnd: 15000,
    profitMarginPercent: 0, // Mặc định 0% để tính đúng giá gốc
  },
  aiPricing: {
    tripoUsd: 0.01,
    tripoVnd: 250,        // Giá gốc API: 250 đ
    trellisUsd: 0.05,
    trellisVnd: 1250,     // Giá gốc API: 1.250 đ
    meshyUsd: 0.80,
    meshyVnd: 20000,      // Giá gốc API: 20.000 đ
    exchangeRate: 25400,
  },
  apiKeys: {
    falKey: process.env.FAL_KEY || '',
    meshyApiKey: process.env.MESHY_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    makerWorldCookie: '',
  },
  updatedAt: '2026-10-05T09:00:00.000Z',
  updatedBy: 'Hệ thống mặc định',
};
