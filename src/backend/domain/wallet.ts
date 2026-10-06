export interface IExpertPrintProfile {
  modelId: string;
  modelName: string;
  filamentType: string;
  filamentBrand: string;
  nozzleSizeMm: number; // 0.4mm
  layerHeightMm: number; // 0.16mm - 0.20mm
  firstLayerHeightMm: number; // 0.24mm
  nozzleTempC: number; // 215°C
  firstLayerNozzleTempC: number; // 220°C
  bedTempC: number; // 60°C
  outerWallSpeedMmS: number; // 80 mm/s
  innerWallSpeedMmS: number; // 150 mm/s
  infillSpeedMmS: number; // 250 mm/s
  topSurfaceSpeedMmS: number; // 60 mm/s
  retractionDistanceMm: number; // 0.8 mm (Direct Drive)
  retractionSpeedMmS: number; // 30 mm/s
  zHopMm: number; // 0.4 mm
  coolingFanPercent: number; // 100%
  minLayerTimeSec: number; // 8 sec
  infillPattern: 'Gyroid' | 'Grid' | 'Adaptive Cubic' | 'Honeycomb';
  infillDensityPercent: number; // 15%
  seamPosition: 'Aligned' | 'Back' | 'Nearest' | 'Scarf Joint' | 'Random';
  ironingEnabled: boolean; // Làm mịn bề mặt trên cùng
  treeSupportParams: {
    branchAngleDeg: number; // 40°
    branchDiameterMm: number; // 2.5mm
    topInterfaceLayers: number; // 3 layers
    topInterfaceSpacingMm: number; // 0.2mm (dễ bóc)
  };
  proTips: string[];
}

export interface IWalletTransaction {
  id: string;
  type: 'deposit' | 'unlock_profile';
  amountVnd: number;
  description: string;
  timestamp: string;
}

export interface IUserWallet {
  balanceVnd: number;
  unlockedProfileIds: string[];
  transactions: IWalletTransaction[];
}
