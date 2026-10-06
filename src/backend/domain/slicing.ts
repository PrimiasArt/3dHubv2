export interface IPrinterProfile {
  id: string;
  name: string;
  manufacturer: 'Bambu Lab' | 'Prusa' | 'Creality' | 'Anycubic' | 'Custom';
  bedDimensions: {
    x: number; // mm (Width)
    y: number; // mm (Depth)
    z: number; // mm (Height)
  };
  maxSpeedMmS: number;
  heatedBed: boolean;
  recommendedSupport: 'tree' | 'normal';
  accentColor: string;
}

export type SupportType = 'tree' | 'normal' | 'none';

export interface ISupportConfig {
  enabled: boolean;
  type: SupportType;
  overhangThresholdDegrees: number; // Ví dụ: 45° hoặc 55°
  supportDensityPercent: number; // 10% - 25%
  interfaceLayers: number;
}

export interface IPrintEstimation {
  layerHeightMm: number;
  totalLayers: number;
  modelDimensionsMm: {
    x: number;
    y: number;
    z: number;
  };
  isOutOfBounds: boolean;
  outOfBoundsAxes: ('X' | 'Y' | 'Z')[];
  estimatedPrintTimeMinutes: number;
  filamentWeightGrams: number;
  filamentLengthMeters: number;
  estimatedCostVnd: number;
  hasOverhangRisk: boolean;
  aiSupportRecommendation: {
    suggestedType: SupportType;
    reason: string;
  };
}
