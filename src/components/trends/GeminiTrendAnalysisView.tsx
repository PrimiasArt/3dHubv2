'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Award,
  Zap,
  Tag,
  Palette,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { IGeminiTrendAnalysisResult } from '@/backend/services/analytics/GeminiAnalyticsService';

interface GeminiTrendAnalysisViewProps {
  selectedCategory?: string;
}

const DEFAULT_MODELS = [
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Suy luận sâu & Phân tích cao cấp)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Thế hệ mới)' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Phổ biến)' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash-Lite (Siêu nhanh)' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Chuyên sâu)' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Ổn định)' },
  { id: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash-8B' },
];

export function GeminiTrendAnalysisView({ selectedCategory }: GeminiTrendAnalysisViewProps) {
  const [analysis, setAnalysis] = useState<IGeminiTrendAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.0-flash');
  const [availableModels, setAvailableModels] = useState<{ id: string; label: string }[]>(DEFAULT_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);

  // Load configured or available models from backend on mount
  useEffect(() => {
    setIsLoadingModels(true);
    fetch('/api/admin/gemini/models')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.models) && data.models.length > 0) {
          setAvailableModels(
            data.models.map((m: any) => ({
              id: m.id,
              label: m.name || m.id,
            }))
          );
        }
        if (data.preferredModel) {
          setSelectedModel(data.preferredModel);
        }
      })
      .catch(() => {
        // Maintain DEFAULT_MODELS
      })
      .finally(() => {
        setIsLoadingModels(false);
      });
  }, []);

  const [hasNewCrawlData, setHasNewCrawlData] = useState<boolean>(false);

  const fetchGeminiAnalysis = async (modelOverride?: string) => {
    setIsLoading(true);
    setError(null);
    setHasNewCrawlData(false);
    try {
      const activeModel = modelOverride || selectedModel;
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (activeModel) {
        params.set('model', activeModel);
      }
      const url = `/api/trends/analyze?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Không thể tải phân tích từ Gemini');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối Gemini API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGeminiAnalysis();
  }, [selectedCategory]);

  // Lắng nghe sự kiện cào dữ liệu mới từ Crawler
  useEffect(() => {
    const handleCrawlUpdate = () => {
      setHasNewCrawlData(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('3dhub-crawled-models-updated', handleCrawlUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('3dhub-crawled-models-updated', handleCrawlUpdate);
      }
    };
  }, []);

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    fetchGeminiAnalysis(newModel);
  };

  return (
    <div className="rounded-[36px] vision-glass-panel border border-white/20 p-6 sm:p-8 space-y-6 shadow-[0_24px_60px_rgba(0,0,0,0.4)] relative overflow-hidden text-white">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 text-[#2DD4BF] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Phân Tích Xu Hướng Thị Trường 3D
              </h3>

              {/* Status Badge: Live API vs Local Real-Data Algorithm */}
              {analysis?.isLiveApi ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {analysis.geminiModelUsed}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-[#2DD4BF]" />
                  {analysis?.geminiModelUsed || 'Thuật Toán Phân Tích Dữ Liệu Thực Tế'}
                </span>
              )}
            </div>
            <p className="text-xs text-white/70 mt-0.5">
              Đánh giá thị hiếu Maker, dự báo nhu cầu vật liệu và cơ hội thương mại cho xưởng in dựa trên dữ liệu cào thực tế
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Model Selector Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/20 text-xs backdrop-blur-md">
            <span className="text-[11px] text-white/60 font-semibold hidden sm:inline">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="bg-transparent text-emerald-300 font-bold text-xs focus:outline-none cursor-pointer pr-1"
              title="Chọn mô hình Gemini AI để chạy phân tích"
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/admin?tab=settings"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 text-xs font-semibold transition-all"
            title="Cấu hình Google Gemini API Key & Model Mặc Định"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span className="hidden sm:inline">Cài Đặt API</span>
          </Link>

          <button
            onClick={() => fetchGeminiAnalysis()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DD4BF]/20 hover:bg-[#2DD4BF]/30 border border-[#2DD4BF]/40 text-[#5EEAD4] text-xs font-bold transition-all backdrop-blur-md disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Đang phân tích...' : 'Phân tích lại'}</span>
          </button>
        </div>
      </div>

      {/* Real-time notification if new crawl data arrived */}
      {hasNewCrawlData && (
        <div className="p-3.5 rounded-2xl bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping shrink-0" />
            <span className="font-semibold text-white">
              Phát hiện dữ liệu mô hình mới vừa được cào về từ Crawler!
            </span>
          </div>
          <button
            onClick={() => fetchGeminiAnalysis()}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-full bg-[#2DD4BF] text-[#051817] font-bold text-xs hover:bg-[#5EEAD4] transition-all shadow-sm shrink-0"
          >
            Phân Tích Dữ Liệu Mới Ngay
          </button>
        </div>
      )}

      {/* Warning Box if API Key was provided but Google returned an error */}
      {!isLoading && analysis?.apiError && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs flex items-start gap-3 backdrop-blur-md">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-100">
              Thông báo kết nối Google Gemini API:
            </p>
            <p className="text-amber-200/80 leading-relaxed font-mono text-[11px]">
              {analysis.apiError}
            </p>
            <p className="text-[11px] text-white/70 pt-1">
              Hệ thống đã tự động chuyển sang <strong>Thuật toán Phân tích Cục bộ (Dữ liệu thực từ các mô hình vừa cào)</strong> để không làm gián đoạn trải nghiệm của bạn. Bạn có thể kiểm tra lại khóa API tại{' '}
              <Link href="/admin?tab=settings" className="text-emerald-300 underline font-semibold">
                Cài Đặt Quản Trị
              </Link>.
            </p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-white/70 font-semibold">
            Đang tổng hợp dữ liệu cào đa sàn và phân tích xu hướng...
          </p>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Content */}
      {!isLoading && analysis && (
        <div className="space-y-6">
          {/* Executive Summary Box */}
          <div className="p-5 rounded-2xl bg-white/10 border border-white/15 space-y-2">
            <div className="flex items-center gap-2 text-[#2DD4BF] text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Tóm Tắt Báo Cáo Chiến Lược Thị Trường</span>
            </div>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-normal">
              {analysis.summary}
            </p>
          </div>

          {/* Market Sentiment & Trending Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/10 border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-300" />
                  <span>Thị Hiếu &amp; Chủ Đề Nóng</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Độ nóng: {analysis.marketSentiment.sentimentScore}/100
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">
                {analysis.marketSentiment.title}
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                {analysis.marketSentiment.description}
              </p>

              {/* Keywords Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysis.marketSentiment.trendingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/15 text-white border border-white/15"
                  >
                    <Tag className="w-3 h-3 text-[#2DD4BF]" />
                    <span>#{kw}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Material & Colors Prediction */}
            <div className="p-5 rounded-2xl bg-white/10 border border-white/15 space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-300" />
                <span>Dự Báo Nhu Cầu Vật Liệu &amp; Màu Sắc</span>
              </span>

              <div className="space-y-2.5">
                {analysis.materialPredictions.map((mat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/25 border border-white/10 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{mat.material}</span>
                      <span className="font-bold text-emerald-300">{mat.sharePercent}%</span>
                    </div>
                    <div className="text-[11px] text-white/70 flex items-center gap-1">
                      <span className="text-white/50">Màu gợi ý:</span>
                      <span className="text-amber-300 font-semibold">{mat.recommendedColors.join(', ')}</span>
                    </div>
                    <p className="text-[10px] text-white/50 pt-0.5">{mat.advice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Commercial Opportunities */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Award className="w-4 h-4 text-amber-300" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Top Cơ Hội Thương Mại Cho Xưởng In (Mô Hình Khuyên Dùng Sản Xuất Thực Tế)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.commercialOpportunities.map((opp) => (
                <div
                  key={opp.rank}
                  className="p-5 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition-colors space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <span className="w-6 h-6 rounded-full bg-white/20 text-white font-bold text-xs flex items-center justify-center border border-white/20">
                      #{opp.rank}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      {opp.potentialRevenueVnd}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-white line-clamp-2">
                    {opp.modelTitle}
                  </h5>

                  <p className="text-[11px] text-white/70 line-clamp-3 leading-relaxed">
                    {opp.whyProfitable}
                  </p>

                  <div className="text-[10px] text-white/50 pt-2 border-t border-white/10">
                    <span className="text-white/80 font-medium">Đối tượng: </span>
                    <span>{opp.targetAudience}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Advice for Slicing */}
          <div className="p-5 rounded-2xl bg-white/10 border border-white/15 space-y-2.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-300" />
              <span>Khuyến Nghị Kỹ Thuật Cắt Lớp &amp; Tối Ưu Máy In Xưởng</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {analysis.technicalAdvice.map((tech, i) => (
                <div key={i} className="p-3 rounded-xl bg-black/25 border border-white/10 text-xs">
                  <span className="font-semibold text-emerald-300 block mb-1">{tech.category}</span>
                  <p className="text-white/70 text-[11px] leading-relaxed">{tech.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
