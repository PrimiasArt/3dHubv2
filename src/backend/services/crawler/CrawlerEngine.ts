import { IModel3D, ICrawlTaskResult, PlatformType } from '../../domain/models';
import { MakerWorldScraper } from './MakerWorldScraper';
import { PrintablesScraper } from './PrintablesScraper';
import { ThingiverseScraper } from './ThingiverseScraper';
import { GitHub3DScraper } from './GitHub3DScraper';
import { modelRepository } from '../../repositories/ModelRepository';

export type CrawlDepth = 'standard' | 'deep' | 'ultra';

export class CrawlerEngine {
  private makerworldScraper = new MakerWorldScraper();
  private printablesScraper = new PrintablesScraper();
  private thingiverseScraper = new ThingiverseScraper();
  private githubScraper = new GitHub3DScraper();

  async executeCrawl(
    platform: PlatformType | 'all' = 'all',
    keyword?: string,
    depth: CrawlDepth = 'deep'
  ): Promise<ICrawlTaskResult> {
    const jobId = `crawl-${Date.now()}`;
    const logs: string[] = [];
    const timestamp = new Date().toISOString();
    const startTime = Date.now();

    // Xác định hạn ngạch quét dựa theo độ sâu (depth)
    let prLimit = 50;
    let ghLimit = 35;
    let mwLimit = 30;
    let thLimit = 25;

    if (depth === 'ultra') {
      prLimit = 150;
      ghLimit = 90;
      mwLimit = 65;
      thLimit = 45;
    } else if (depth === 'deep') {
      prLimit = 80;
      ghLimit = 55;
      mwLimit = 45;
      thLimit = 35;
    } else {
      // standard
      prLimit = 40;
      ghLimit = 25;
      mwLimit = 20;
      thLimit = 20;
    }

    // Nếu chọn riêng 1 sàn thì tăng chỉ tiêu cho sàn đó
    if (platform === 'printables') prLimit = Math.floor(prLimit * 2.2);
    if (platform === 'github') ghLimit = Math.floor(ghLimit * 2.2);
    if (platform === 'makerworld') mwLimit = Math.floor(mwLimit * 2.2);
    if (platform === 'thingiverse') thLimit = Math.floor(thLimit * 2.2);

    logs.push(`[${timestamp}] 🚀 Khởi động siêu tiến trình Crawler Engine v3.0 (Độ sâu: ${depth.toUpperCase()})`);
    logs.push(`[${timestamp}] 🎯 Nền tảng mục tiêu: ${platform === 'all' ? 'TẤT CẢ (Printables, GitHub 3D, MakerWorld, Thingiverse)' : platform.toUpperCase()}`);

    if (keyword && keyword.trim().length > 0) {
      logs.push(`[${timestamp}] 🔍 Áp dụng bộ lọc từ khóa: "${keyword.trim()}"`);
    } else {
      logs.push(`[${timestamp}] ⚡ Chế độ quét: Đa luồng Trending, Featured & Hot Releases`);
    }

    const collectedModels: IModel3D[] = [];

    try {
      // 1. Cào từ Printables (Prusa) - Live GraphQL đa trang
      if (platform === 'printables' || platform === 'all') {
        const tPr = Date.now();
        logs.push(`[${new Date().toISOString()}] 🌐 Kết nối Printables API Gateway (GraphQL: api.printables.com, mục tiêu: ${prLimit} models)...`);
        const prModels = await this.printablesScraper.scrapeTrending(keyword, prLimit);
        const durPr = ((Date.now() - tPr) / 1000).toFixed(1);
        if (prModels.length > 0) {
          logs.push(`[${new Date().toISOString()}] ✅ [Printables] Thu thập thành công ${prModels.length} models THỰC TẾ trực tiếp từ CDN Prusa Research (${durPr}s)`);
          collectedModels.push(...prModels);
        } else {
          logs.push(`[${new Date().toISOString()}] ℹ️ [Printables] Không tìm thấy model nào khớp với từ khóa`);
        }
      }

      // 2. Cào từ GitHub 3D Open Repositories - Live REST API đa chủ đề
      if (platform === 'github' || platform === 'all') {
        const tGh = Date.now();
        logs.push(`[${new Date().toISOString()}] 🌐 Quét kho mã nguồn 3D GitHub (api.github.com, mục tiêu: ${ghLimit} repositories)...`);
        const ghModels = await this.githubScraper.scrapeTrending(keyword, ghLimit);
        const durGh = ((Date.now() - tGh) / 1000).toFixed(1);
        if (ghModels.length > 0) {
          logs.push(`[${new Date().toISOString()}] ✅ [GitHub 3D] Tìm thấy ${ghModels.length} dự án CAD/STL mã nguồn mở THỰC TẾ (${durGh}s)`);
          collectedModels.push(...ghModels);
        } else {
          logs.push(`[${new Date().toISOString()}] ℹ️ [GitHub 3D] Không tìm thấy repository nào`);
        }
      }

      // 3. Cào từ MakerWorld (Bambu Lab) - Live Bambu Lab Ecosystem
      if (platform === 'makerworld' || platform === 'all') {
        const tMw = Date.now();
        logs.push(`[${new Date().toISOString()}] 🌐 Kết nối MakerWorld / Bambu Lab Live Ecosystem Gateway (mục tiêu: ${mwLimit} models)...`);
        const mwModels = await this.makerworldScraper.scrapeTrending(keyword, mwLimit);
        const durMw = ((Date.now() - tMw) / 1000).toFixed(1);
        if (mwModels.length > 0) {
          logs.push(`[${new Date().toISOString()}] ✅ [MakerWorld] Đã thu thập ${mwModels.length} models THỰC TẾ cho hệ sinh thái Bambu Lab & MakerWorld (${durMw}s)`);
          collectedModels.push(...mwModels);
        } else {
          logs.push(`[${new Date().toISOString()}] ℹ️ [MakerWorld] Không tìm thấy model Bambu Lab nào khớp yêu cầu`);
        }
      }

      // 4. Cào từ Thingiverse - Live Schema.org CDN & Open Repositories
      if (platform === 'thingiverse' || platform === 'all') {
        const tTh = Date.now();
        logs.push(`[${new Date().toISOString()}] 🌐 Quét kho tệp STL Thingiverse qua Live CDN & Schema Gateway (mục tiêu: ${thLimit} models)...`);
        const thModels = await this.thingiverseScraper.scrapeTrending(keyword, thLimit);
        const durTh = ((Date.now() - tTh) / 1000).toFixed(1);
        if (thModels.length > 0) {
          logs.push(`[${new Date().toISOString()}] ✅ [Thingiverse] Đã thu thập ${thModels.length} models THỰC TẾ trực tiếp từ Thingiverse (${durTh}s)`);
          collectedModels.push(...thModels);
        } else {
          logs.push(`[${new Date().toISOString()}] ℹ️ [Thingiverse] Không tìm thấy thiết kế Thingiverse nào phù hợp`);
        }
      }

      // 5. Lưu trữ các model vừa crawl vào Repository và tự động lọc trùng
      const newlyAdded = modelRepository.addBulkModels(collectedModels);
      const duplicatesCleaned = modelRepository.deduplicate();
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      logs.push(
        `[${new Date().toISOString()}] 💾 Hoàn tất trong ${totalTime}s: ${collectedModels.length} models thực tế (${newlyAdded} models mới lưu trữ, đã lọc sạch ${duplicatesCleaned} bản ghi trùng)`
      );

      return {
        jobId,
        platform: platform === 'all' ? 'makerworld' : platform,
        status: 'success',
        totalCrawled: collectedModels.length,
        newModelsFound: newlyAdded,
        logs,
        timestamp,
      };
    } catch (err: any) {
      logs.push(`[${new Date().toISOString()}] ❌ Lỗi crawler: ${err.message}`);
      return {
        jobId,
        platform: platform === 'all' ? 'makerworld' : platform,
        status: 'failed',
        totalCrawled: 0,
        newModelsFound: 0,
        logs,
        timestamp,
      };
    }
  }

  getCrawledModels(platform?: PlatformType): IModel3D[] {
    modelRepository.deduplicate();
    if (platform) {
      return modelRepository.getModelsByPlatform(platform);
    }
    return modelRepository.getAllModels();
  }

  deduplicateModels(): number {
    return modelRepository.deduplicate();
  }

  resetDatabase(): void {
    modelRepository.resetToSeed();
  }
}

export const crawlerEngine = new CrawlerEngine();
