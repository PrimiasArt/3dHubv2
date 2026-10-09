'use client';

import React from 'react';
import {
  Terminal,
  Play,
  Loader2,
  ShieldCheck,
  X,
  Sparkles,
  Zap,
  Flame,
  Rocket,
  Link2,
  PlusCircle,
  Brain,
} from 'lucide-react';
import { PlatformType } from '@/backend/domain/models';

interface CrawlerDashboardProps {
  selectedPlatform: PlatformType | 'all';
  onSelectPlatform: (p: PlatformType | 'all') => void;
  keyword: string;
  onChangeKeyword: (kw: string) => void;
  crawlDepth?: 'standard' | 'deep' | 'ultra';
  onChangeDepth?: (d: 'standard' | 'deep' | 'ultra') => void;
  onTriggerCrawl: () => void;
  isCrawling: boolean;
  crawlLogs: string[];
  onOpenCrawlUrlModal?: () => void;
  onOpenManualIngestModal?: () => void;
}

export function CrawlerDashboard({
  selectedPlatform,
  onSelectPlatform,
  keyword,
  onChangeKeyword,
  crawlDepth = 'deep',
  onChangeDepth,
  onTriggerCrawl,
  isCrawling,
  crawlLogs,
  onOpenCrawlUrlModal,
  onOpenManualIngestModal,
}: CrawlerDashboardProps) {
  const platforms: { id: PlatformType | 'all'; label: string }[] = [
    { id: 'all', label: 'Tất cả nguồn (8+)' },
    { id: 'printables', label: 'Printables (Prusa)' },
    { id: 'makerworld', label: 'MakerWorld (Bambu)' },
    { id: 'thangs', label: 'Thangs 3D' },
    { id: 'cults3d', label: 'Cults3D' },
    { id: 'thingiverse', label: 'Thingiverse' },
    { id: 'reddit', label: 'Reddit 3D' },
    { id: 'community-forum', label: 'Diễn đàn Bambu/Voron' },
    { id: 'github', label: 'GitHub 3D' },
    { id: 'manual', label: 'Thủ công & URL' },
  ];

  const depthOptions: { id: 'standard' | 'deep' | 'ultra'; label: string; desc: string; icon: any }[] = [
    { id: 'standard', label: 'Tiêu chuẩn', desc: '~80 - 140 models (quét nhanh)', icon: Zap },
    { id: 'deep', label: 'Chuyên sâu', desc: '~200 - 300+ models (khuyên dùng)', icon: Flame },
    { id: 'ultra', label: 'Siêu quét (Ultra)', desc: '~450 - 650+ models (quét sâu 8 sàn)', icon: Rocket },
  ];

  const suggestedKeywords = ['dragon', 'gear', 'bambu', 'voron', 'tpu', 'gridfinity', 'scarf seam', 'hull line'];

  return (
    <div className="vision-glass rounded-[32px] p-5 sm:p-6 shadow-2xl space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-white/20 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Terminal className="w-5 h-5 text-[#2DD4BF]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Crawler Engine Controller v3.5 Multi-Source</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                8+ Nền tảng &amp; Diễn đàn
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
                <Brain className="w-3 h-3" /> Đồng bộ Obsidian Vault
              </span>
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Cào đa nguồn Printables, MakerWorld, Thangs, Cults3D, Reddit, Forum &amp; Hỗ trợ nạp thủ công / URL tùy chọn
            </p>
          </div>
        </div>

        {/* Action Buttons: Trigger Crawl + Custom URL + Manual Ingest */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenCrawlUrlModal && (
            <button
              type="button"
              onClick={onOpenCrawlUrlModal}
              title="Cào và bóc tách dữ liệu từ một liên kết web bất kỳ"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <Link2 className="w-3.5 h-3.5 text-teal-300" />
              <span>Cào Link URL</span>
            </button>
          )}

          {onOpenManualIngestModal && (
            <button
              type="button"
              onClick={onOpenManualIngestModal}
              title="Tự nhập mô hình, profile in hoặc mẹo xử lý lỗi thủ công"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/40 text-violet-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-violet-300" />
              <span>Nạp Thủ Công</span>
            </button>
          )}

          <button
            onClick={() => onTriggerCrawl()}
            disabled={isCrawling}
            className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-xs text-white transition-all shadow-lg active:scale-95 border cursor-pointer ${
              isCrawling
                ? 'bg-white/10 border-white/10 text-white/40 cursor-not-allowed'
                : 'vision-pill-btn'
            }`}
          >
            {isCrawling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang Quét Dữ Liệu...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-[#051817]" />
                <span className="text-[#051817] font-black">Bắt Đầu Quét Dữ Liệu</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* Platform Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-white/70 uppercase mb-2 px-0.5">
            1. Nền tảng mục tiêu:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPlatform(p.id)}
                disabled={isCrawling}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border cursor-pointer ${
                  selectedPlatform === p.id
                    ? 'bg-[#2DD4BF] text-[#051817] border-[#2DD4BF] shadow-[0_0_12px_rgba(45,212,191,0.35)] font-bold'
                    : 'bg-black/20 text-white/70 border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Crawl Depth Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-white/70 uppercase mb-2 px-0.5">
            2. Số lượng &amp; Độ sâu quét:
          </label>
          <div className="flex flex-col gap-1.5">
            {depthOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = crawlDepth === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onChangeDepth && onChangeDepth(opt.id)}
                  disabled={isCrawling}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer ${
                    isSelected
                      ? 'bg-white/25 text-white border-white/35 shadow-xs font-bold'
                      : 'bg-black/20 text-white/60 border-white/10 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#2DD4BF]' : 'text-white/50'}`} />
                    <span>{opt.label}</span>
                  </div>
                  <span className={`text-[10px] ${isSelected ? 'text-[#7EC895]' : 'text-white/40'}`}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Keyword Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <label className="text-[11px] font-semibold text-white/70 uppercase">
              3. Từ khóa tìm kiếm:
            </label>
            {keyword && (
              <button
                onClick={() => onChangeKeyword('')}
                className="text-[11px] text-white/60 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
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
              placeholder="VD: dragon, gridfinity, voron, tpu, scarf seam, gear..."
              className="w-full px-4 py-2.5 pr-10 rounded-full bg-black/25 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all backdrop-blur-xl"
            />
            {keyword && (
              <button
                onClick={() => onChangeKeyword('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Keyword Suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-white/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#2DD4BF]" />
              Gợi ý:
            </span>
            {suggestedKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => onChangeKeyword(kw)}
                disabled={isCrawling}
                className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
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

      {/* Live Multi-Source Notice */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/15 border border-white/20 text-white text-xs backdrop-blur-xl">
        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-300" />
        <span className="text-white/85">
          <strong className="text-white">Multi-Source Repositories &amp; Community Intelligence Engine:</strong> Kết nối trực tiếp 8+ nền tảng: <strong>Printables</strong>, <strong>MakerWorld</strong>, <strong>Thingiverse</strong>, <strong>GitHub 3D</strong>, <strong>Thangs</strong>, <strong>Cults3D</strong>, <strong>Reddit (r/3Dprinting, r/BambuLab)</strong> và <strong>Diễn đàn Bambu/Voron</strong>. Hỗ trợ bóc tách link URL bất kỳ và nạp thủ công trực tiếp vào Obsidian Knowledge Vault.
        </span>
      </div>

      {/* Live Terminal Log */}
      <div className="bg-black/40 rounded-2xl p-4 border border-white/10 font-mono text-[11px] space-y-1 max-h-48 overflow-y-auto backdrop-blur-xl">
        <div className="text-white/50 flex items-center justify-between pb-2 border-b border-white/10">
          <span>// Crawler Live Logs &amp; Multi-Engine Session</span>
          <span className="text-[10px] text-emerald-300 flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live Multi-Source
          </span>
        </div>
        {crawlLogs.length === 0 ? (
          <p className="text-white/40 italic pt-1">Nhấn &quot;Bắt Đầu Quét Dữ Liệu&quot; để thực thi phiên quét dữ liệu thời gian thực...</p>
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
