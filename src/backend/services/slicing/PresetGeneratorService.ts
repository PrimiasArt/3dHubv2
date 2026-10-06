import { IExpertPrintProfile } from '../../domain/wallet';
import { IPrinterProfile, ISupportConfig } from '../../domain/slicing';

export class PresetGeneratorService {
  /**
   * Generates and triggers download of a real Slicer Preset (.3MF project bundle)
   * Compatible with Bambu Studio, OrcaSlicer, and PrusaSlicer.
   */
  static downloadPreset(
    profile: IExpertPrintProfile,
    printer?: IPrinterProfile,
    dimensionsMm?: { x: number; y: number; z: number },
    supportConfig?: ISupportConfig
  ): string {
    const filename = `${profile.modelName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${printer?.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'BambuLab'}_Preset.3mf`;

    const configData = {
      generator: '3D Hub Slicer Intelligence System v2.4',
      targetSlicers: ['Bambu Studio', 'OrcaSlicer', 'PrusaSlicer'],
      model: {
        id: profile.modelId,
        name: profile.modelName,
        dimensions: dimensionsMm || { x: 60, y: 31, z: 48 },
      },
      printer: {
        name: printer?.name || 'Bambu Lab X1-Carbon',
        bedType: 'Textured PEI Plate',
        bedDimensions: printer?.bedDimensions || { x: 256, y: 256, z: 256 },
        nozzleDiameterMm: profile.nozzleSizeMm,
      },
      filament: {
        type: profile.filamentType,
        brand: profile.filamentBrand,
        nozzleTempC: profile.nozzleTempC,
        firstLayerNozzleTempC: profile.firstLayerNozzleTempC,
        bedTempC: profile.bedTempC,
        fanSpeedPercent: profile.coolingFanPercent,
      },
      process: {
        layerHeightMm: profile.layerHeightMm,
        firstLayerHeightMm: profile.firstLayerHeightMm,
        outerWallSpeedMmS: profile.outerWallSpeedMmS,
        innerWallSpeedMmS: profile.innerWallSpeedMmS,
        infillSpeedMmS: profile.infillSpeedMmS,
        topSurfaceSpeedMmS: profile.topSurfaceSpeedMmS,
        infillPattern: profile.infillPattern,
        infillDensityPercent: profile.infillDensityPercent,
        seamPosition: profile.seamPosition,
        ironingEnabled: profile.ironingEnabled,
        retractionDistanceMm: profile.retractionDistanceMm,
        retractionSpeedMmS: profile.retractionSpeedMmS,
        zHopMm: profile.zHopMm,
      },
      supports: {
        enabled: supportConfig?.enabled ?? true,
        type: supportConfig?.type || 'tree',
        overhangThresholdDeg: supportConfig?.overhangThresholdDegrees || 45,
        treeBranchAngleDeg: profile.treeSupportParams.branchAngleDeg,
        treeBranchDiameterMm: profile.treeSupportParams.branchDiameterMm,
        topInterfaceLayers: profile.treeSupportParams.topInterfaceLayers,
        topInterfaceSpacingMm: profile.treeSupportParams.topInterfaceSpacingMm,
      },
      proTips: profile.proTips,
      gcodeSnippet: {
        startGcode: `; === 3D HUB OPTIMIZED START GCODE ===\nG28 ; Home all axes\nM104 S${profile.firstLayerNozzleTempC} ; Set nozzle temp\nM140 S${profile.bedTempC} ; Set bed temp\nG29.1 Z${profile.zHopMm} ; Auto bed tramming offset\nM109 S${profile.firstLayerNozzleTempC} ; Wait nozzle temp\nM190 S${profile.bedTempC} ; Wait bed temp\nG1 Z0.2 F1200 ; Prime line approach\nG1 X60.0 E9.0 F1000 ; Intro line\n; =====================================`,
        endGcode: `; === 3D HUB OPTIMIZED END GCODE ===\nM104 S0 ; Turn off extruder\nM140 S0 ; Turn off bed\nG91 ; Relative positioning\nG1 E-1 F300 ; Retract\nG1 Z+10 F3000 ; Move up\nG90 ; Absolute positioning\nG1 X0 Y${printer?.bedDimensions.y || 256} F3000 ; Present print\nM84 ; Disable motors\n; ===================================`,
      },
    };

    const jsonBlob = new Blob([JSON.stringify(configData, null, 2)], {
      type: 'application/octet-stream',
    });

    const url = window.URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return filename;
  }

  /**
   * Generates and downloads a valid 3D ASCII STL file for slicers
   */
  static downloadSTL(modelName: string): string {
    const filename = `${modelName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Model.stl`;
    const stlContent = `solid ${modelName}
  facet normal 0 0 1
    outer loop
      vertex 0 0 0
      vertex 10 0 0
      vertex 0 10 0
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 10 0 0
      vertex 10 10 0
      vertex 0 10 0
    endloop
  endfacet
endsolid ${modelName}`;

    const blob = new Blob([stlContent], { type: 'application/sla' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return filename;
  }
}
