import { IModel3D, ICrawlTaskResult, PlatformType } from '../../domain/models';
import { MakerWorldScraper } from './MakerWorldScraper';
import { PrintablesScraper } from './PrintablesScraper';
import { ThingiverseScraper } from './ThingiverseScraper';
import { GitHub3DScraper } from './GitHub3DScraper';
import { modelRepository } from '../../repositories/ModelRepository';

export class CrawlerEngine {
  private makerworldScraper = new MakerWorldScraper();
  private printablesScraper = new PrintablesScraper();
  private thingiverseScraper = new ThingiverseScraper();
  private githubScraper = new GitHub3DScraper();

  async executeCrawl(
    platform: PlatformType | 'all' = 'all',
    keyword?: string
  ): Promise<ICrawlTaskResult> {
    const jobId = `crawl-${Date.now()}`;
    const logs: string[] = [];
    const timestamp = new Date().toISOString();

    logs.push(`[${timestamp}] 🚀 Khởi động tiến trình crawler cho nền tảng: ${platform.toUpperCase()}`);
    if (keyword && keyword.trim().length > 0) {
      logs.push(`[${timestamp}] 🔍 Áp dụng bộ lọc từ khóa: "${keyword.trim()}"`);
    } else {
      logs.push(`[${timestamp}] ⚡ Chế độ quét: Trending & Featured Live Models`);
    }

    const collectedModels: IModel3D[] = [];

    try {
      // 1. Cào từ Printables (Prusa) - Live GraphQL (100% Real)
      if (platform === 'printables' || platform === 'all') {
        logs.push(`[${new Date().toISOString()}] 🌐 Kết nối Printables API Gateway (GraphQL: api.printables.com)...`);
        const prModels = await this.printablesScraper.scrapeTrending(keyword, platform === 'all' ? 10 : 15);
        if (prModels.length > 0) {
          logs.push(`[${new Date().toISOString()}] ✅ [Printables] Thu thập thành công ${prModels.length} models THỰC TẾ trực tiếp từ CDN Prusa Research`);
          collectedModels.push(...prModels);
        } else {
          logs.push(`[${new Date().toISOString()}] ℹ️ [Printables] Không tìm thấy model nào khớp với từ khóa`);
        }
      }

      // 2. Cào từ GitHub 3D Open Repositories - Live REST API (100% Real)
      if (platform === 'github' || platform === 'all') {
        logs.push(`[${new Date().toISOString()}] 🌐 Quét kho mã nguồn 3D GitHub (api.github.com/search/repositories)...`);
        const ghModels = await this.githubScraper.scrapeTrending(keyword, platform === 'all' ? 8 : 12);
        if (ghModels.length > 0) {
          logs.push(`[${new Date().toISOString()}] ✅ [GitHub 3D] Tìm thấy ${ghModels.length} dự án CAD/STL mã nguồn mở THỰC TẾ`);
          collectedModels.push(...ghModels);
        } else {
          logs.push(`[${new Date().toISOString()}] ℹ️ [GitHub 3D] Không tìm thấy repository nào`);
        }
      }

      // 3. Cào từ MakerWorld (Bambu Lab) - Live Bambu Lab Ecosystem
      if (platform === 'makerworld' || platform === 'all') {
        logs.push(`[${new Date().toISOString()}] 🌐 Kết nối MakerWorld / Bambu Lab Live Ecosystem Gateway...`);
        const mwModels = await this.makerworldScraper.scrapeTrending(keyword, platform === 'all' ? 8 : 12);
        if (mwModels.length > 0) {
          logs.push(`[${new Date().toISOString()}] ✅ [MakerWorld] Đã thu thập ${mwModels.length} models THỰC TẾ cho hệ sinh thái Bambu Lab & MakerWorld`);
          collectedModels.push(...mwModels);
        } else {
          logs.push(`[${new Date().toISOString()}] ℹ️ [MakerWorld] Không tìm thấy model Bambu Lab nào khớp yêu cầu`);
        }
      }

      // 4. Cào từ Thingiverse - Live Schema.org CDN & Open Repositories
      if (platform === 'thingiverse' || platform === 'all') {
        logs.push(`[${new Date().toISOString()}] 🌐 Quét kho tệp STL Thingiverse qua Live CDN & Schema Gateway...`);
        const thModels = await this.thingiverseScraper.scrapeTrending(keyword, platform === 'all' ? 6 : 10);
        if (thModels.length > 0) {
          logs.push(`[${new Date().toISOString()}] ✅ [Thingiverse] Đã thu thập ${thModels.length} models THỰC TẾ trực tiếp từ Thingiverse`);
          collectedModels.push(...thModels);
        } else {
          logs.push(`[${new Date().toISOString()}] ℹ️ [Thingiverse] Không tìm thấy thiết kế Thingiverse nào phù hợp`);
        }
      }

      // 5. Lưu trữ các model vừa crawl vào Repository và tự động lọc trùng
      const newlyAdded = modelRepository.addBulkModels(collectedModels);
      const duplicatesCleaned = modelRepository.deduplicate();
      logs.push(`[${new Date().toISOString()}] 💾 Hoàn tất: ${collectedModels.length} models thực tế (${newlyAdded} models mới lưu trữ, đã lọc sạch ${duplicatesCleaned} bản ghi trùng)`);

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
