'use client';

import React from 'react';
import { Terminal, Play, Loader2, ShieldCheck, X, Sparkles } from 'lucide-react';
import { PlatformType } from '@/backend/domain/models';

interface CrawlerDashboardProps {
  selectedPlatform: PlatformType | 'all';
  onSelectPlatform: (p: PlatformType | 'all') => void;
  keyword: string;
  onChangeKeyword: (kw: string) => void;
  onTriggerCrawl: () => void;
  isCrawling: boolean;
  crawlLogs: string[];
}

export function CrawlerDashboard({
  selectedPlatform,
  onSelectPlatform,
  keyword,
  onChangeKeyword,
  onTriggerCrawl,
  isCrawling,
  crawlLogs,
}: CrawlerDashboardProps) {
  const platforms: { id: PlatformType | 'all'; label: string }[] = [
    { id: 'all', label: 'Tất cả sàn 3D' },
    { id: 'printables', label: 'Printables (Prusa Live)' },
    { id: 'github', label: 'GitHub 3D (Open Repos)' },
    { id: 'makerworld', label: 'MakerWorld (Bambu Lab)' },
    { id: 'thingiverse', label: 'Thingiverse' },
  ];

  const suggestedKeywords = ['dragon', 'gear', 'bambu', 'robot', 'gridfinity', 'vase'];

  return (
    <div className="vision-glass rounded-[32px] p-5 sm:p-6 shadow-2xl space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-white/20 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Crawler Engine Controller (Live Engine)</span>
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Quét &amp; bóc tách tự động đa nền tảng: Mô hình 3D, Lượt tải, Lượt in thực tế, Loại nhựa FDM tiêu hao
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onTriggerCrawl()}
          disabled={isCrawling}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs text-white transition-all shadow-lg active:scale-95 border ${
            isCrawling
              ? 'bg-white/10 border-white/10 text-white/40 cursor-not-allowed'
              : 'vision-pill-btn'
          }`}
        >
          {isCrawling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Đang Crawl Dữ Liệu Thực...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt Đầu Crawl Ngay</span>
            </>
          )}
        </button>
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
        {/* Platform Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-white/70 uppercase mb-2 px-0.5">
            Nền tảng mục tiêu:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPlatform(p.id)}
                disabled={isCrawling}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  selectedPlatform === p.id
                    ? 'bg-white/30 text-white border-white/40 shadow-xs'
                    : 'bg-black/20 text-white/70 border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Keyword Filter */}
        <div className="sm:col-span-2 space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <label className="text-[11px] font-semibold text-white/70 uppercase">
              Từ khóa tìm kiếm &amp; cào dữ liệu:
            </label>
            {keyword && (
              <button
                onClick={() => onChangeKeyword('')}
                className="text-[11px] text-white/60 hover:text-white flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Xóa từ khóa</span>
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => onChangeKeyword(e.target.value)}
              disabled={isCrawling}
              placeholder="VD: dragon, gridfinity, bambu, gear, vase, case..."
              className="w-full px-4 py-2.5 pr-10 rounded-full bg-black/25 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all backdrop-blur-xl"
            />
            {keyword && (
              <button
                onClick={() => onChangeKeyword('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Keyword Suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-white/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-white/80" />
              Gợi ý:
            </span>
            {suggestedKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => onChangeKeyword(kw)}
                disabled={isCrawling}
                className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                  keyword === kw
                    ? 'bg-white/28 border-white/35 text-white font-bold shadow-xs'
                    : 'bg-black/20 border-white/10 text-white/70 hover:text-white'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Engine Notice */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/15 border border-white/20 text-white text-xs backdrop-blur-xl">
        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-300" />
        <span className="text-white/85">
          <strong className="text-white">Live 3D Repositories Engine:</strong> Đang kết nối trực tiếp 4 nền tảng: <strong>Printables GraphQL</strong>, <strong>Thingiverse CDN/Schema</strong>, <strong>GitHub 3D</strong> và <strong>MakerWorld (Bambu Lab)</strong>. 100% dữ liệu mô hình thực tế.
        </span>
      </div>

      {/* Live Terminal Log */}
      <div className="bg-black/35 rounded-2xl p-4 border border-white/10 font-mono text-[11px] space-y-1 max-h-44 overflow-y-auto backdrop-blur-xl">
        <div className="text-white/50 flex items-center justify-between pb-2 border-b border-white/10">
          <span>// Crawler Live Logs &amp; Terminal Session</span>
          <span className="text-[10px] text-emerald-300 flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live
          </span>
        </div>
        {crawlLogs.length === 0 ? (
          <p className="text-white/40 italic pt-1">Nhấn &quot;Bắt Đầu Crawl Ngay&quot; để thực thi phiên quét dữ liệu mới...</p>
        ) : (
          crawlLogs.map((log, index) => (
            <div key={index} className="text-white/90 flex items-start gap-2 pt-0.5">
              <span className="text-white/40 select-none">&gt;</span>
              <span>{log}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
