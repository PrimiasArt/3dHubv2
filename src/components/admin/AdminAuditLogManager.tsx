'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Activity,
  Layers,
  FileText,
} from 'lucide-react';
import { IAuditLog } from '@/backend/repositories/AuditLogRepository';

export function AdminAuditLogManager() {
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, warning: 0, info: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedSeverity !== 'all') params.append('severity', selectedSeverity);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Lỗi tải nhật ký kiểm toán:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedSeverity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
          label: 'Nghiêm Trọng',
          className: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'Cảnh Báo',
          className: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
        };
      default:
        return {
          icon: <Info className="w-3.5 h-3.5" />,
          label: 'Thông Thường',
          className: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
        };
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header Banner */}
      <div className="vision-glass-panel rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/20 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Nhật Ký Kiểm Toán Hệ Thống (Audit Trail)
              </h2>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                AUDIT LOGS
              </span>
            </div>
            <p className="text-xs text-white/70 mt-1">
              Ghi nhận bất biến mọi thay đổi nhạy cảm: Quyền hạn RBAC, kiểm duyệt gian hàng, điều phối máy in xưởng và giao dịch hoàn tiền.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm Mới Log</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="vision-glass rounded-[24px] p-4 space-y-1 backdrop-blur-2xl border border-white/15">
          <div className="text-[11px] text-white/60 font-semibold">Tổng Bản Ghi</div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <div className="text-[10px] text-white/50">Lịch sử sự kiện</div>
        </div>

        <div className="vision-glass rounded-[24px] p-4 space-y-1 backdrop-blur-2xl border border-rose-500/25 bg-rose-500/10">
          <div className="text-[11px] text-rose-200 font-bold">Nghiêm Trọng (Critical)</div>
          <div className="text-2xl font-black text-rose-300">{stats.critical}</div>
          <div className="text-[10px] text-rose-200/70">Thay đổi quyền &amp; giải ngân</div>
        </div>

        <div className="vision-glass rounded-[24px] p-4 space-y-1 backdrop-blur-2xl border border-amber-500/25 bg-amber-500/10">
          <div className="text-[11px] text-amber-200 font-bold">Cảnh Báo (Warning)</div>
          <div className="text-2xl font-black text-amber-300">{stats.warning}</div>
          <div className="text-[10px] text-amber-200/70">Đổi môi trường &amp; hủy đơn</div>
        </div>

        <div className="vision-glass rounded-[24px] p-4 space-y-1 backdrop-blur-2xl border border-cyan-500/25 bg-cyan-500/10">
          <div className="text-[11px] text-cyan-200 font-bold">Thông Thường (Info)</div>
          <div className="text-2xl font-black text-cyan-300">{stats.info}</div>
          <div className="text-[10px] text-cyan-200/70">Duyệt hàng &amp; gán máy in</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="vision-glass rounded-[28px] p-4 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo sự kiện, người thực hiện, mô tả..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-black/30 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {['all', 'critical', 'warning', 'info'].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
                selectedSeverity === sev
                  ? 'bg-white/30 text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {sev === 'all' ? 'Tất Cả' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="vision-glass rounded-[32px] p-5 sm:p-6 border border-white/15 space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-white/50 text-xs">Đang truy vấn nhật ký kiểm toán...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-white/60 space-y-2">
            <FileText className="w-8 h-8 text-white/30 mx-auto" />
            <p className="text-xs">Không tìm thấy bản ghi kiểm toán phù hợp.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10 text-xs">
            {logs.map((log) => {
              const badge = getSeverityBadge(log.severity);
              return (
                <div key={log.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-white text-xs px-2 py-0.5 rounded-md bg-black/40 border border-white/10">
                        {log.id}
                      </span>
                      <span className="font-bold text-sm text-white">{log.actionTitle}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <p className="text-white/80 text-xs leading-relaxed">{log.description}</p>

                    <div className="flex items-center gap-3 text-[11px] text-white/50 flex-wrap">
                      <span className="flex items-center gap-1 text-cyan-200">
                        <User className="w-3 h-3" />
                        <strong>{log.actorName}</strong> ({log.actorRole.toUpperCase()})
                      </span>
                      <span>•</span>
                      <span>Thực thể: <strong className="text-white/70">{log.entityType}</strong> {log.entityId ? `(#${log.entityId})` : ''}</span>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-white/50 shrink-0 flex items-center md:flex-col md:items-end justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-white/40" />
                      {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                    </span>
                    <span className="text-[10px] text-white/40">
                      {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
