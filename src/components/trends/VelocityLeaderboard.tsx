'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Flame, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';
import { ITrendMetric } from '@/backend/domain/models';
import { getMatchingSampleModelId } from '@/backend/domain/sample-models';

interface VelocityLeaderboardProps {
  trends: ITrendMetric[];
}

export function VelocityLeaderboard({ trends }: VelocityLeaderboardProps) {
  const [failedImgIds, setFailedImgIds] = useState<Set<string>>(new Set());

  if (trends.length === 0) {
    return (
      <div className="vision-glass rounded-[28px] border border-white/15 p-8 text-center space-y-2 text-white shadow-sm">
        <p className="font-semibold text-sm">Không tìm thấy mô hình nào phù hợp với bộ lọc.</p>
        <p className="text-white/60 text-xs">Hãy thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
      </div>
    );
  }

  return (
    <div className="vision-glass rounded-[32px] overflow-hidden border border-white/15 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-300" />
            <span>Bảng Xếp Hạng Xu Hướng Tăng Trưởng (Velocity Leaderboard)</span>
          </h3>
          <p className="text-xs text-white/60 mt-0.5">
            Đánh giá sức hút dựa trên tốc độ tải mới, tỷ lệ in thực tế (Makes) và điểm số Momentum
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-white/5 text-xs uppercase text-white/50 border-b border-white/10">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Rank</th>
              <th className="py-3.5 px-4 font-semibold">Mô hình 3D</th>
              <th className="py-3.5 px-4 font-semibold text-center">Nền tảng</th>
              <th className="py-3.5 px-4 font-semibold text-right">Lượt tải &amp; In</th>
              <th className="py-3.5 px-4 font-semibold text-center">Tỷ lệ in thực</th>
              <th className="py-3.5 px-4 font-semibold text-right">Tăng trưởng</th>
              <th className="py-3.5 px-4 font-semibold text-center">Momentum</th>
              <th className="py-3.5 px-4 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {trends.map((item, idx) => {
              const rank = idx + 1;
              const isImgFailed = failedImgIds.has(item.modelId);
              const thumbSrc = isImgFailed || !item.thumbnailUrl ? '/thumbnails/bambu-acc.svg' : item.thumbnailUrl;
              const conversion = item.printConversionRate ?? (item.currentDownloads > 0 ? Number(((item.currentPrints / item.currentDownloads) * 100).toFixed(1)) : 0);

              const platformBadgeClass =
                item.platform === 'makerworld'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : item.platform === 'printables'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : item.platform === 'github'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';

              const platformLabel =
                item.platform === 'makerworld'
                  ? 'MakerWorld'
                  : item.platform === 'printables'
                  ? 'Printables'
                  : item.platform === 'github'
                  ? 'GitHub 3D'
                  : 'Thingiverse';

              return (
                <tr key={item.modelId} className="hover:bg-white/10 transition-colors">
                  {/* Rank */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        rank === 1
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40 shadow-xs'
                          : rank === 2
                          ? 'bg-white/20 text-white border border-white/20'
                          : rank === 3
                          ? 'bg-rose-500/30 text-rose-200 border border-rose-500/40'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      #{rank}
                    </span>
                  </td>

                  {/* Model Title */}
                  <td className="py-3.5 px-4 min-w-[260px]">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbSrc}
                        alt={item.title}
                        className="w-12 h-12 rounded-xl object-cover border border-white/15 shrink-0 bg-black/40"
                        onError={() => {
                          setFailedImgIds((prev) => new Set(prev).add(item.modelId));
                        }}
                      />
                      <div className="space-y-0.5">
                        <a
                          href={item.sourceUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-white hover:text-emerald-300 flex items-center gap-1 group line-clamp-1 text-xs transition-colors"
                          title={item.title}
                        >
                          <span>{item.title}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </a>
                        <div className="text-[11px] text-white/60 flex items-center gap-2">
                          <span>Bởi <strong className="text-white font-medium">{item.author}</strong></span>
                          <span>•</span>
                          <span className="text-emerald-300">{item.category}</span>
                        </div>
                        <div className="text-[10px] text-white/50 font-mono">
                          {item.filamentType} • {item.filamentWeightGrams}g • {item.printTimeMinutes} phút
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${platformBadgeClass}`}
                    >
                      {platformLabel}
                    </span>
                  </td>

                  {/* Downloads & Prints */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-bold text-white block">
                      {item.currentDownloads.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-emerald-300">
                      {item.currentPrints.toLocaleString()} lượt in
                    </span>
                  </td>

                  {/* Print Conversion */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      {conversion}%
                    </span>
                  </td>

                  {/* Growth */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-semibold text-rose-300 flex items-center justify-end gap-1 text-xs">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{item.downloads24h.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-white/50">+{item.growth24h}%</span>
                  </td>

                  {/* Momentum Score */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        {item.momentumScore}
                      </span>
                      <div className="w-14 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full"
                          style={{ width: `${item.momentumScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Action Link to Studio */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {(() => {
                        const sampleModelId = getMatchingSampleModelId(item.title, item.category, item.tags);
                        return (
                          <Link
                            href={`/studio?sampleModel=${sampleModelId}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/20 text-white font-medium text-xs transition-all active:scale-95 whitespace-nowrap"
                            title={`Nạp mô hình ${item.title} vào 3D Studio`}
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>In Studio</span>
                          </Link>
                        );
                      })()}

                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/70 hover:text-white transition-colors"
                          title="Mở trang gốc trên sàn"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
