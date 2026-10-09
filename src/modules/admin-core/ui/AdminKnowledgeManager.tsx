'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  Tag,
  Award,
} from 'lucide-react';
import { IKnowledgeEntry, KnowledgeCategory, ISlicerParameterOverride } from '@/backend/domain/knowledge';

export function AdminKnowledgeManager() {
  const [entries, setEntries] = useState<IKnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Modal thêm tri thức mới
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<KnowledgeCategory>('slicer_tuning');
  const [newProblem, setNewProblem] = useState('');
  const [newRootCause, setNewRootCause] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [newFilaments, setNewFilaments] = useState('PLA, PETG');
  const [newPrinters, setNewPrinters] = useState('all');
  const [newOverridesJson, setNewOverridesJson] = useState('{\n  "seam_slope_type": "scarf",\n  "seam_slope_angle": 45\n}');
  const [isSaving, setIsSaving] = useState(false);

  const fetchKnowledge = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('query', searchQuery.trim());
      if (selectedCategory !== 'all') params.set('category', selectedCategory);

      const res = await fetch(`/api/knowledge?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.entries)) {
        setEntries(data.entries);
      }
    } catch (err) {
      console.error('Error fetching knowledge:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchKnowledge();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa quy tắc tri thức "${title}"?`)) return;
    try {
      const res = await fetch(`/api/knowledge?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      } else {
        alert(data.error || 'Không thể xóa');
      }
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSolution.trim()) {
      alert('Vui lòng nhập tiêu đề và giải pháp.');
      return;
    }

    let parsedOverrides: ISlicerParameterOverride | undefined = undefined;
    if (newOverridesJson.trim()) {
      try {
        parsedOverrides = JSON.parse(newOverridesJson.trim());
      } catch (err) {
        alert('Cấu trúc JSON thông số Override không hợp lệ. Vui lòng kiểm tra lại cú pháp JSON.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        title: newTitle.trim(),
        category: newCategory,
        problemSymptom: newProblem.trim() || undefined,
        rootCause: newRootCause.trim() || undefined,
        solutionText: newSolution.trim(),
        applicableFilaments: newFilaments.split(',').map((f) => f.trim()).filter(Boolean),
        applicablePrinters: newPrinters.split(',').map((p) => p.trim()).filter(Boolean),
        slicerOverrides: parsedOverrides,
        tags: [newCategory, ...newFilaments.split(',').map((f) => f.trim().toLowerCase())],
      };

      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAddModalOpen(false);
        setNewTitle('');
        setNewProblem('');
        setNewRootCause('');
        setNewSolution('');
        fetchKnowledge();
      } else {
        alert(data.error || 'Lỗi lưu tri thức');
      }
    } catch (err: any) {
      alert(`Lỗi kết nối: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Tất Cả Tri Thức' },
    { id: 'vietnam_environment', label: '🇻🇳 Khí Hậu Việt Nam' },
    { id: 'slicer_tuning', label: '⚡ Tinh Chỉnh OrcaSlicer' },
    { id: 'troubleshooting', label: '🛠️ Khắc Phục Lỗi In' },
    { id: 'material_benchmark', label: '🧪 Định Mức Nhựa' },
    { id: 'printer_hardware', label: '⚙️ Phần Cứng Máy In' },
    { id: 'commercial_practice', label: '🏭 Vận Hành Xưởng In' },
  ];

  const totalVerifications = entries.reduce((sum, e) => sum + (e.verificationCount || 0), 0);
  const avgConfidence = entries.length > 0 ? Math.round(entries.reduce((sum, e) => sum + e.confidenceScore, 0) / entries.length) : 0;
  const vnCount = entries.filter((e) => e.category === 'vietnam_environment').length;

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="vision-glass-panel rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2DD4BF]/30 to-[#0F766E]/40 border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF] shrink-0 shadow-lg shadow-[#2DD4BF]/15">
            <BookOpen className="w-6 h-6 text-[#5EEAD4]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Kho Tri Thức Đối Chiếu &amp; Chuẩn Hóa In 3D (Knowledge Base)</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Ground Truth
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-white/70 mt-1">
              Hệ thống lưu trữ, đối chiếu và tái sử dụng tri thức in 3D bóc tách từ MakerWorld, Reddit, Klipper, và cộng đồng thực tế Việt Nam
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="vision-pill-btn px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg shadow-[#2DD4BF]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Tri Thức Mới</span>
          </button>

          <button
            type="button"
            onClick={fetchKnowledge}
            disabled={isLoading}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all shadow-sm"
            title="Làm mới kho tri thức"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="vision-glass rounded-[28px] p-5 space-y-1.5 backdrop-blur-2xl">
          <div className="flex items-center justify-between text-white/70 text-xs font-semibold">
            <span>Tổng Quy Tắc Đối Chiếu</span>
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-2xl font-black text-white">{entries.length} quy tắc</div>
          <div className="text-[11px] text-emerald-300">Tự động áp dụng khi cắt lớp</div>
        </div>

        <div className="vision-glass rounded-[28px] p-5 space-y-1.5 backdrop-blur-2xl">
          <div className="flex items-center justify-between text-white/70 text-xs font-semibold">
            <span>Độ Tin Cậy Trung Bình</span>
            <Award className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-2xl font-black text-amber-300">{avgConfidence}%</div>
          <div className="text-[11px] text-white/60">Đã qua kiểm nghiệm thực tế</div>
        </div>

        <div className="vision-glass rounded-[28px] p-5 space-y-1.5 backdrop-blur-2xl">
          <div className="flex items-center justify-between text-white/70 text-xs font-semibold">
            <span>Lượt Kiểm Chứng (Makes)</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="text-2xl font-black text-white">{totalVerifications.toLocaleString()} lượt</div>
          <div className="text-[11px] text-cyan-300">Từ Reddit &amp; Bambu Forum</div>
        </div>

        <div className="vision-glass rounded-[28px] p-5 space-y-1.5 backdrop-blur-2xl">
          <div className="flex items-center justify-between text-white/70 text-xs font-semibold">
            <span>Mẹo Khí Hậu Việt Nam</span>
            <Flame className="w-4 h-4 text-rose-300" />
          </div>
          <div className="text-2xl font-black text-rose-300">{vnCount} giải pháp</div>
          <div className="text-[11px] text-white/60">Xử lý nồm ẩm &amp; bàn in PEI</div>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="vision-glass p-4 rounded-[28px] space-y-3.5 backdrop-blur-2xl border border-white/15 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm theo lỗi, giải pháp, dòng máy, loại nhựa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-black/40 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#2DD4BF]"
            />
            <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-3" />
          </form>

          <div className="text-xs text-white/60">
            Hiển thị <strong>{entries.length}</strong> quy tắc tri thức chuẩn
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-white/10">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                selectedCategory === c.id
                  ? 'bg-[#2DD4BF] text-[#051817] border-[#2DD4BF] font-black shadow-md'
                  : 'bg-black/30 text-white/70 border-white/10 hover:text-white hover:border-white/25'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-white/60 font-semibold">Đang truy vấn Kho Tri Thức Đối Chiếu...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && entries.length === 0 && (
        <div className="vision-glass rounded-[32px] p-12 text-center space-y-3">
          <p className="font-bold text-sm text-white">Không tìm thấy quy tắc tri thức nào phù hợp.</p>
          <p className="text-xs text-white/60">Hãy thử xóa bộ lọc tìm kiếm hoặc thêm quy tắc tri thức mới.</p>
        </div>
      )}

      {/* Knowledge Cards Grid */}
      {!isLoading && entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => {
            const isExpanded = expandedCardId === entry.id;

            return (
              <div
                key={entry.id}
                className="vision-glass rounded-[28px] p-5 sm:p-6 border border-white/15 space-y-3.5 hover:border-white/30 transition-all flex flex-col justify-between backdrop-blur-2xl shadow-xl"
              >
                <div className="space-y-2.5">
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white border border-white/20">
                      {entry.category.replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{entry.confidenceScore}% Tin cậy</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id, entry.title)}
                        className="p-1 rounded-full text-white/40 hover:text-rose-300 hover:bg-rose-500/20 transition-all"
                        title="Xóa quy tắc tri thức này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm sm:text-base text-white leading-snug">
                    {entry.title}
                  </h3>

                  {/* Applicable Tags */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-lg bg-black/40 text-cyan-300 border border-cyan-400/20 font-mono">
                      Nhựa: {entry.applicableFilaments.join(', ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-black/40 text-amber-300 border border-amber-400/20 font-mono">
                      Máy: {entry.applicablePrinters.join(', ')}
                    </span>
                  </div>

                  {/* Problem & Symptom */}
                  {entry.problemSymptom && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-400/20 text-xs text-rose-200 space-y-0.5">
                      <span className="font-bold text-[11px] block text-rose-300">⚠️ Hiện tượng lỗi:</span>
                      <p className="text-[11px] leading-relaxed opacity-90">{entry.problemSymptom}</p>
                    </div>
                  )}

                  {/* Solution */}
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 text-xs space-y-1">
                    <span className="font-bold text-[11px] block text-emerald-300">💡 Giải pháp chuẩn:</span>
                    <p className="text-[11px] text-white/90 leading-relaxed">{entry.solutionText}</p>
                  </div>

                  {/* Slicer Overrides Collapsible */}
                  {entry.slicerOverrides && Object.keys(entry.slicerOverrides).length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpandedCardId(isExpanded ? null : entry.id)}
                        className="text-[11px] font-bold text-[#5EEAD4] hover:underline flex items-center gap-1"
                      >
                        <Sliders className="w-3 h-3 text-[#2DD4BF]" />
                        <span>{isExpanded ? 'Ẩn thông số OrcaSlicer Override' : 'Xem thông số OrcaSlicer Override'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {isExpanded && (
                        <pre className="mt-2 p-3 rounded-xl bg-black/60 border border-white/15 text-[10px] font-mono text-emerald-200 overflow-x-auto">
                          {JSON.stringify(entry.slicerOverrides, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
                  <span>Nguồn: <strong className="text-white/80">{entry.sourcePlatform}</strong></span>
                  <span>Đã kiểm chứng: <strong className="text-emerald-300 font-bold">{entry.verificationCount}</strong> ca</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Thêm Tri Thức Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="vision-glass-panel rounded-[36px] w-full max-w-xl max-h-[90vh] overflow-y-auto border border-white/20 p-6 sm:p-8 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF]">
                  <Plus className="w-5 h-5 text-[#5EEAD4]" />
                </div>
                <h3 className="text-base font-black text-white">Thêm Quy Tắc Tri Thức Đối Chiếu Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-white block">Tiêu đề quy tắc tri thức *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giảm tốc độ lớp đầu và nâng nhiệt bàn in khi in PETG trong phòng máy lạnh..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-white block">Danh mục</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-emerald-300 font-bold focus:outline-none focus:border-[#2DD4BF]"
                  >
                    <option value="vietnam_environment" className="bg-slate-900">🇻🇳 Khí hậu Việt Nam</option>
                    <option value="slicer_tuning" className="bg-slate-900">⚡ Tinh chỉnh OrcaSlicer</option>
                    <option value="troubleshooting" className="bg-slate-900">🛠️ Khắc phục lỗi in</option>
                    <option value="material_benchmark" className="bg-slate-900">🧪 Định mức nhựa</option>
                    <option value="printer_hardware" className="bg-slate-900">⚙️ Phần cứng máy in</option>
                    <option value="commercial_practice" className="bg-slate-900">🏭 Vận hành xưởng in</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white block">Loại nhựa áp dụng (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    placeholder="PLA, PETG, TPU, ABS hoặc all"
                    value={newFilaments}
                    onChange={(e) => setNewFilaments(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white block">Dấu hiệu nhận biết lỗi / Vấn đề</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả hiện tượng lỗi bề mặt, bavia, cong mép bàn..."
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white block">Giải pháp chuẩn &amp; Hướng dẫn thực thi *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Hướng dẫn cụ thể các bước xử lý và tinh chỉnh..."
                  value={newSolution}
                  onChange={(e) => setNewSolution(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white block">Thông số OrcaSlicer Override (Định dạng JSON)</label>
                <textarea
                  rows={4}
                  value={newOverridesJson}
                  onChange={(e) => setNewOverridesJson(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-emerald-300 font-mono focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="vision-pill-btn px-6 py-2 rounded-full text-white text-xs font-black shadow-lg disabled:opacity-50"
                >
                  {isSaving ? 'Đang Lưu...' : 'Lưu Vào Kho Tri Thức'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
