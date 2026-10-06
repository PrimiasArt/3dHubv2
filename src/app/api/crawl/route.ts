import { NextRequest, NextResponse } from 'next/server';
import { crawlerEngine } from '@/backend/services/crawler/CrawlerEngine';
import { PlatformType } from '@/backend/domain/models';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, platform = 'all', keyword } = body;

    if (action === 'deduplicate') {
      const removed = crawlerEngine.deduplicateModels();
      const models = crawlerEngine.getCrawledModels();
      return NextResponse.json({
        success: true,
        message: `Đã lọc sạch ${removed} bản ghi dữ liệu trùng lặp`,
        totalModels: models.length,
        models,
      });
    }

    if (action === 'reset') {
      crawlerEngine.resetDatabase();
      const models = crawlerEngine.getCrawledModels();
      return NextResponse.json({
        success: true,
        message: 'Đã hoàn nguyên kho dữ liệu về trạng thái chuẩn hóa ban đầu',
        totalModels: models.length,
        models,
      });
    }

    const result = await crawlerEngine.executeCrawl(platform as PlatformType | 'all', keyword);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platformParam = searchParams.get('platform');
  const platform = (platformParam && platformParam !== 'all') ? (platformParam as PlatformType) : undefined;

  const models = crawlerEngine.getCrawledModels(platform);
  return NextResponse.json({ success: true, count: models.length, models });
}
