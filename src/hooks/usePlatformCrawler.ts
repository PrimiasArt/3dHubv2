'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { IModel3D, PlatformType, ICrawlTaskResult } from '@/backend/domain/models';

export function usePlatformCrawler() {
  const [models, setModels] = useState<IModel3D[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | 'all'>('all');
  const [isCrawling, setIsCrawling] = useState<boolean>(false);
  const [crawlLogs, setCrawlLogs] = useState<string[]>([]);
  const [lastCrawlResult, setLastCrawlResult] = useState<ICrawlTaskResult | null>(null);
  const [keyword, setKeyword] = useState<string>('');
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);

  const fetchModels = useCallback(async (platform = selectedPlatform) => {
    setIsLoadingModels(true);
    try {
      const url = platform === 'all' ? '/api/crawl' : `/api/crawl?platform=${platform}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.models) {
        setModels(data.models);
      }
    } catch (err: any) {
      console.error('Lỗi lấy danh sách models:', err);
    } finally {
      setIsLoadingModels(false);
    }
  }, [selectedPlatform]);

  useEffect(() => {
    fetchModels(selectedPlatform);
  }, [fetchModels, selectedPlatform]);

  const triggerCrawl = useCallback(async (
    platformParam?: PlatformType | 'all' | unknown,
    customKeywordParam?: string | unknown
  ) => {
    setIsCrawling(true);
    const safePlatform: PlatformType | 'all' = (typeof platformParam === 'string' && platformParam.trim().length > 0)
      ? (platformParam as PlatformType | 'all')
      : selectedPlatform;
    const safeKeyword: string | undefined = (typeof customKeywordParam === 'string')
      ? customKeywordParam.trim()
      : (keyword.trim() || undefined);

    setCrawlLogs([`[${new Date().toLocaleTimeString()}] 🚀 Bắt đầu gửi yêu cầu crawl tới server...`]);

    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: safePlatform,
          keyword: safeKeyword,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setLastCrawlResult(data.result);
        setCrawlLogs(data.result.logs || []);
        // Refresh lại danh sách sau khi crawl xong
        await fetchModels(selectedPlatform);
      } else {
        setCrawlLogs(prev => [...prev, `❌ Lỗi: ${data.error || 'Crawl không thành công'}`]);
      }
    } catch (err: any) {
      setCrawlLogs(prev => [...prev, `❌ Lỗi mạng: ${err.message}`]);
    } finally {
      setIsCrawling(false);
    }
  }, [selectedPlatform, keyword, fetchModels]);

  const [sortBy, setSortBy] = useState<'downloads' | 'prints' | 'recent'>('downloads');
  const [filamentFilter, setFilamentFilter] = useState<string>('all');

  const filteredModels = useMemo(() => {
    let result = [...models];

    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      result = result.filter(
        m => m.title.toLowerCase().includes(q) ||
             m.author.toLowerCase().includes(q) ||
             m.category.toLowerCase().includes(q) ||
             m.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filamentFilter !== 'all') {
      result = result.filter(m => m.filamentType?.toLowerCase().includes(filamentFilter.toLowerCase()));
    }

    if (sortBy === 'downloads') {
      result.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === 'prints') {
      result.sort((a, b) => b.prints - a.prints);
    } else if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [models, keyword, filamentFilter, sortBy]);

  const deduplicateDatabase = useCallback(async () => {
    setIsLoadingModels(true);
    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deduplicate' }),
      });
      const data = await res.json();
      if (data.models) {
        setModels(data.models);
      }
    } catch (err: any) {
      console.error('Lỗi lọc trùng dữ liệu:', err);
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  return {
    models: filteredModels,
    rawModels: models,
    selectedPlatform,
    setSelectedPlatform,
    isCrawling,
    isLoadingModels,
    crawlLogs,
    lastCrawlResult,
    keyword,
    setKeyword,
    sortBy,
    setSortBy,
    filamentFilter,
    setFilamentFilter,
    triggerCrawl,
    deduplicateDatabase,
    refetchModels: () => fetchModels(selectedPlatform),
  };
}
