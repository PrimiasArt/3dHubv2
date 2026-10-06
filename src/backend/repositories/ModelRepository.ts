import { IModel3D, IAI3DJob, PlatformType } from '../domain/models';

class ModelRepository {
  private models: IModel3D[] = [];
  private jobs: Map<string, IAI3DJob> = new Map();

  constructor() {
    this.models = [];
  }

  /**
   * Khóa chuẩn hóa để lọc dữ liệu trùng lặp thông minh (bỏ qua ký tự đặc biệt, hoa thường, thẻ tag trong tiêu đề)
   */
  private getDeduplicationKey(model: Pick<IModel3D, 'title' | 'platform'>): string {
    const cleanTitle = model.title
      .toLowerCase()
      .replace(/\[.*?\]|\(.*?\)/g, '') // Bỏ phần bổ trợ như [keyword] hoặc (keyword)
      .replace(/[^a-z0-9]/g, ''); // Chỉ giữ lại chữ và số
    return `${model.platform}:${cleanTitle}`;
  }

  /**
   * Làm sạch toàn bộ dữ liệu (chỉ giữ dữ liệu cào thực tế từ người dùng)
   */
  resetToSeed(): void {
    this.models = [];
  }

  getAllModels(): IModel3D[] {
    return [...this.models];
  }

  getModelById(id: string): IModel3D | undefined {
    return this.models.find(m => m.id === id);
  }

  getModelsByPlatform(platform: PlatformType): IModel3D[] {
    return this.models.filter(m => m.platform === platform);
  }

  addModel(model: IModel3D): IModel3D | null {
    // Trong trường hợp không có hình ảnh hợp lệ thì bỏ luôn
    if (!model.thumbnailUrl || model.thumbnailUrl.trim() === '') {
      return null;
    }

    const key = this.getDeduplicationKey(model);
    const existingIndex = this.models.findIndex(
      m => m.id === model.id || this.getDeduplicationKey(m) === key
    );

    if (existingIndex >= 0) {
      // Đã tồn tại model trùng lặp -> Chỉ cập nhật thông số (lượt tải, lượt in, likes) thay vì tạo thẻ mới
      const existing = this.models[existingIndex];
      this.models[existingIndex] = {
        ...existing,
        ...model,
        id: existing.id, // Giữ ID gốc
        downloads: Math.max(existing.downloads, model.downloads),
        prints: Math.max(existing.prints, model.prints),
        likes: Math.max(existing.likes, model.likes),
        updatedAt: new Date().toISOString(),
      };
      return this.models[existingIndex];
    } else {
      this.models.unshift(model);
      return model;
    }
  }

  addBulkModels(newModels: IModel3D[]): number {
    let addedCount = 0;
    for (const model of newModels) {
      const prevLen = this.models.length;
      const res = this.addModel(model);
      if (res && this.models.length > prevLen) {
        addedCount++;
      }
    }
    return addedCount;
  }

  /**
   * Lọc và loại bỏ toàn bộ dữ liệu trùng lặp và mô hình không có hình trong bộ nhớ
   */
  deduplicate(): number {
    const seenIds = new Set<string>();
    const seenKeys = new Set<string>();
    const uniqueList: IModel3D[] = [];
    let removedCount = 0;

    for (const model of this.models) {
      // Bỏ luôn mô hình không có hình
      if (!model.thumbnailUrl || model.thumbnailUrl.trim() === '') {
        removedCount++;
        continue;
      }

      const key = this.getDeduplicationKey(model);
      if (seenIds.has(model.id) || seenKeys.has(key)) {
        removedCount++;
        continue;
      }
      seenIds.add(model.id);
      seenKeys.add(key);
      uniqueList.push(model);
    }

    this.models = uniqueList;
    return removedCount;
  }

  saveAIJob(job: IAI3DJob): void {
    this.jobs.set(job.id, job);
  }

  getAIJob(jobId: string): IAI3DJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllAIJobs(): IAI3DJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

// Singleton instance across API calls in the same Node.js runtime
export const modelRepository = new ModelRepository();
