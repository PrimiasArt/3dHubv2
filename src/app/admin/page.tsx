'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  Printer,
  TrendingUp,
  CreditCard,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  CheckCircle,
  Clock,
  Settings,
  Plus,
  RefreshCw,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Activity,
  ExternalLink,
  Cpu,
  Flame,
  AlertTriangle,
  UserPlus,
  ArrowUpRight,
  QrCode,
  Building2,
  FlaskConical,
  ShieldCheck,
  ShoppingBag,
  Store,
  Sliders,
  Compass,
} from 'lucide-react';
import { useUserSession } from '@/hooks/useUserSession';
import { useOrders } from '@/hooks/useOrders';
import { UserRole, IUser } from '@/backend/domain/user';
import { OrderFulfillmentStatus } from '@/backend/domain/order';
import { AI_PRINT_TIERS } from '@/backend/domain/ai-tiers';
import { ISystemConfig, DEFAULT_SYSTEM_CONFIG } from '@/backend/domain/config';
import { AdminProductsManager } from '@/components/admin/AdminProductsManager';
import { AdminModulesManager } from '@/components/admin/AdminModulesManager';
import { AdminTrendsManager } from '@/components/admin/AdminTrendsManager';
import { AdminCrawlerManager } from '@/components/admin/AdminCrawlerManager';
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { AdminAuditLogManager } from '@/components/admin/AdminAuditLogManager';

const DEFAULT_GEMINI_MODELS = [
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Mô hình suy luận sâu & phân tích kỹ thuật cao nhất)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Thế hệ mới - Siêu tốc & Thông minh)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Phổ biến - Tốc độ cao)' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite (Tiết kiệm token)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Chuyên sâu 2M context)' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Rất ổn định)' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B (Thu gọn)' },
];

function AdminPageContent() {
  const {
    currentUser,
    permissions,
    allUsers,
    switchUser,
    switchRole,
    refreshSession,
    toastMessage,
    showToast,
    isLoading,
  } = useUserSession();

  const {
    orders,
    printers,
    stats,
    updateOrderStatus,
    assignPrinter,
    updatePrinterProgress,
    refreshOrders,
  } = useOrders();

  const searchParams = useSearchParams();
  const tabQuery = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'users' | 'workshop' | 'revenue' | 'settings' | 'products' | 'modules' | 'trends' | 'crawler' | 'audit'>('workshop');
  const [tabCategory, setTabCategory] = useState<'all' | 'operations' | 'growth' | 'system'>('all');
  const [systemConfig, setSystemConfig] = useState<ISystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Dynamic Gemini Models state
  const [availableGeminiModels, setAvailableGeminiModels] = useState<
    { id: string; name: string; description?: string }[]
  >([]);
  const [isLoadingGeminiModels, setIsLoadingGeminiModels] = useState<boolean>(false);
  const [geminiModelStatus, setGeminiModelStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleFetchGeminiModels = async () => {
    setIsLoadingGeminiModels(true);
    setGeminiModelStatus({ type: null, message: '' });
    try {
      const apiKey = systemConfig.apiKeys.geminiApiKey?.trim();
      const res = await fetch('/api/admin/gemini/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.models) && data.models.length > 0) {
        setAvailableGeminiModels(data.models);
        setGeminiModelStatus({
          type: 'success',
          message: `Kết nối thành công! Đã tải ${data.models.length} model từ Google Gemini API.`,
        });
        showToast(`Đã tải ${data.models.length} model từ Google API`);
        if (!systemConfig.apiKeys.preferredGeminiModel) {
          setSystemConfig((prev) => ({
            ...prev,
            apiKeys: {
              ...prev.apiKeys,
              preferredGeminiModel: data.models[0].id,
            },
          }));
        }
      } else {
        const errMsg = data.error || 'Không thể tải danh sách model từ Google API';
        setGeminiModelStatus({
          type: 'error',
          message: errMsg,
        });
        showToast(`Lỗi: ${errMsg}`);
      }
    } catch (err: any) {
      const errMsg = `Lỗi kết nối Google API: ${err.message}`;
      setGeminiModelStatus({
        type: 'error',
        message: errMsg,
      });
      showToast(errMsg);
    } finally {
      setIsLoadingGeminiModels(false);
    }
  };

  // Sync tab with query parameters (?tab=users, ?tab=products, etc.)
  useEffect(() => {
    if (tabQuery && ['users', 'workshop', 'revenue', 'settings', 'products', 'modules', 'trends', 'crawler', 'audit'].includes(tabQuery)) {
      setActiveTab(tabQuery as any);
    } else if (currentUser?.role === 'mod') {
      setActiveTab('products');
    }
  }, [tabQuery, currentUser?.role]);

  // Fetch admin system configuration
  React.useEffect(() => {
    fetch('/api/admin/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setSystemConfig(data.config);
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveConfig = async (section: string, payload: any) => {
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, ...payload }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSystemConfig(data.config);
        showToast('Đã lưu cấu hình hệ thống thành công!');
      } else {
        showToast(`Lỗi: ${data.error || 'Không thể lưu cấu hình'}`);
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSwitchEnvironment = async (env: 'staging' | 'official') => {
    if (currentUser?.role !== 'admin') {
      showToast('Chỉ Quản trị viên (Admin) mới có quyền chuyển đổi môi trường hệ thống!');
      return;
    }
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/system/environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment: env }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSystemConfig((prev) => ({
          ...prev,
          environment: env,
          operations: {
            ...prev.operations,
            profitMarginPercent: env === 'official' ? (prev.commercial?.commercialMarginPercent || 25) : 0,
          },
        }));
        showToast(data.message || `Đã chuyển sang: ${env.toUpperCase()}`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('3dhub-environment-change', { detail: { environment: env } })
          );
        }
      } else {
        showToast(`Lỗi: ${data.error || 'Không thể chuyển đổi môi trường'}`);
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Workshop filter & search
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.fulfillmentStatus === orderStatusFilter;
    const matchesSearch =
      !orderSearchQuery ||
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.items.some((item) => item.title.toLowerCase().includes(orderSearchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getFulfillmentBadge = (status: OrderFulfillmentStatus) => {
    switch (status) {
      case 'pending_review':
        return { label: 'Chờ Duyệt File', color: 'bg-amber-500/20 text-amber-200 border-amber-400/30' };
      case 'slicing':
        return { label: 'Đang Cắt Lớp OrcaSlicer', color: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30' };
      case 'queued':
        return { label: 'Xếp Hàng Chờ Máy', color: 'bg-white/20 text-white border-white/25' };
      case 'printing':
        return { label: 'Đang In Thực Tế', color: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' };
      case 'post_processing':
        return { label: 'Hậu Kỳ / Rửa Sấy', color: 'bg-blue-500/20 text-blue-200 border-blue-400/30' };
      case 'packaging':
        return { label: 'Đóng Gói Chống Sốc', color: 'bg-purple-500/20 text-purple-200 border-purple-400/30' };
      case 'delivering':
        return { label: 'Đang Giao Hàng', color: 'bg-amber-500/20 text-amber-200 border-amber-400/30' };
      case 'completed':
        return { label: 'Hoàn Tất', color: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40' };
      case 'cancelled':
        return { label: 'Đã Hủy', color: 'bg-rose-500/20 text-rose-200 border-rose-400/30' };
      default:
        return { label: status, color: 'bg-white/10 text-white/70 border-white/15' };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-white/60 font-semibold">Đang xác thực phiên quản trị viên...</p>
      </div>
    );
  }

  // If user doesn't have access permissions, show friendly RBAC gate
  if (!permissions.canAccessAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full vision-glass-panel rounded-[36px] p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 mx-auto flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">Yêu Cầu Quyền Quản Trị</h2>
            <p className="text-xs text-white/70 mt-2 leading-relaxed">
              Tài khoản hiện tại của bạn là <strong className="text-white">Khách hàng ({currentUser?.role?.toUpperCase()})</strong>. Bạn không có quyền truy cập hệ thống quản trị nội bộ.
            </p>
          </div>

          {currentUser?.role === 'admin' ? (
            <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-2">
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Chọn nhanh vai trò để trải nghiệm (Admin Only):
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => switchUser('usr-admin-1')}
                  className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all text-left shadow-sm"
                >
                  <div className="font-black">Nguyễn Văn Admin</div>
                  <div className="text-[10px] text-white/60">Toàn quyền hệ thống</div>
                </button>

                <button
                  onClick={() => switchUser('usr-staff-1')}
                  className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all text-left shadow-sm"
                >
                  <div className="font-black">Lê Kỹ Thuật (Staff)</div>
                  <div className="text-[10px] text-emerald-300">Quản lý xưởng in</div>
                </button>

                <button
                  onClick={() => switchUser('usr-mod-1')}
                  className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all text-left shadow-sm"
                >
                  <div className="font-black">Trần Thị Moderator</div>
                  <div className="text-[10px] text-white/70">Kiểm duyệt sản phẩm</div>
                </button>

                <button
                  onClick={() => switchRole('admin')}
                  className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-xs font-bold transition-all text-left shadow-sm"
                >
                  <div className="font-black">Khôi Phục Quyền</div>
                  <div className="text-[10px] text-amber-300">Về quyền Admin</div>
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/shop"
              className="vision-pill-btn block w-full py-3 rounded-full text-white text-xs font-bold transition-all text-center shadow-md"
            >
              Quay Lại Cửa Hàng &amp; Mua Sắm
            </Link>
          )}

          <Link
            href="/shop"
            className="vision-pill-btn block w-full py-3 rounded-full text-white text-xs font-bold transition-all text-center shadow-md"
          >
            Quay lại Cửa Hàng 3D
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Top Banner Header */}
      <div className="vision-glass-panel rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Trung Tâm Quản Trị &amp; Xưởng In 3D
              </h1>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/25">
                {currentUser?.role?.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-white/70 mt-1">
              Phân quyền người dùng, điều phối máy in xưởng Bambu Lab, kiểm soát doanh thu và cổng thanh toán VietQR / MoMo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => {
              refreshSession();
              refreshOrders();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>

          <Link
            href="/studio"
            className="vision-pill-btn flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>AI Studio 3D</span>
          </Link>
        </div>
      </div>

      {/* Platform Release Edition & Environment Switcher (Staging vs Official) - ADMIN ONLY */}
      {currentUser?.role === 'admin' && (
        <div className="vision-glass rounded-[32px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/20 backdrop-blur-2xl text-white space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-md transition-all ${
                  systemConfig.environment === 'official'
                    ? 'bg-emerald-500/25 border-emerald-400/40 text-emerald-300 shadow-emerald-500/20'
                    : 'bg-[#2F4736]/80 border-[#7EC895]/50 text-[#EBDDB6] shadow-[0_0_16px_rgba(126,200,149,0.3)]'
                }`}
              >
                {systemConfig.environment === 'official' ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-300" />
                ) : (
                  <FlaskConical className="w-6 h-6 text-[#EBDDB6]" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                    Chế Độ Vận Hành Hệ Thống (Release Edition)
                  </h2>
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                      systemConfig.environment === 'official'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-[#7EC895]/20 text-[#D7EEDB] border-[#7EC895]/40 shadow-[0_0_12px_rgba(126,200,149,0.3)]'
                    }`}
                  >
                    {systemConfig.environment === 'official'
                      ? 'BẢN THƯƠNG MẠI CHÍNH THỨC'
                      : 'BẢN THỬ NGHIỆM STAGING (XANH CREAMY & PASTEL ĐẬM)'}
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-1">
                  Dành riêng cho Admin: Tùy biến chuyển đổi linh hoạt giữa phiên bản thử nghiệm sandbox (Xanh Creamy &amp; Pastel đậm) và phiên bản thương mại chính thức đưa vào sử dụng thực tế.
                </p>
              </div>
            </div>

            {/* Quick 1-click Toggle Action */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleSwitchEnvironment(
                    systemConfig.environment === 'official' ? 'staging' : 'official'
                  )
                }
                disabled={isSavingConfig}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 ${
                  systemConfig.environment === 'official'
                    ? 'bg-[#2F4736]/80 hover:bg-[#3D5B46] text-[#EBDDB6] border border-[#7EC895]/50'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSavingConfig ? 'animate-spin' : ''}`} />
                <span>
                  {systemConfig.environment === 'official'
                    ? 'Chuyển Sang Bản Staging (Xanh Creamy & Pastel)'
                    : 'Kích Hoạt Bản Official (Thương Mại)'}
                </span>
              </button>
            </div>
          </div>

          {/* 2 Edition Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Staging */}
            <div
              onClick={() => handleSwitchEnvironment('staging')}
              className={`cursor-pointer p-5 rounded-[24px] border transition-all ${
                systemConfig.environment === 'staging'
                  ? 'bg-[#2F4736]/60 border-[#7EC895]/60 shadow-[0_0_24px_rgba(126,200,149,0.25)] ring-1 ring-[#7EC895]/50'
                  : 'bg-black/25 border-white/10 hover:border-white/20 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-[#EBDDB6]" />
                  <span className="font-bold text-sm text-white">1. Bản Staging (Xanh Creamy &amp; Pastel Đậm)</span>
                </div>
                {systemConfig.environment === 'staging' ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#7EC895] text-[#0E1811]">
                    ĐANG HOẠT ĐỘNG
                  </span>
                ) : (
                  <span className="text-[10px] text-white/50">Click để kích hoạt</span>
                )}
              </div>
              <ul className="text-xs text-[#D7E5DB] space-y-1.5 list-disc list-inside">
                <li>Tone màu chủ đạo: Xanh Creamy matcha, sage latte &amp; pastel đậm thanh lịch.</li>
                <li>Biên lợi nhuận 0% (bảng giá tính đúng giá vốn gốc FDM/SLA).</li>
                <li>Chế độ thử nghiệm Sandbox: ví test, sinh đơn hàng mô phỏng.</li>
                <li>Hiển thị thanh chuyển đổi vai trò nhanh (RBAC switcher).</li>
              </ul>
            </div>

            {/* Card 2: Official */}
            <div
              onClick={() => handleSwitchEnvironment('official')}
              className={`cursor-pointer p-5 rounded-[24px] border transition-all ${
                systemConfig.environment === 'official'
                  ? 'bg-emerald-500/15 border-emerald-400/50 shadow-[0_0_24px_rgba(16,185,129,0.2)] ring-1 ring-emerald-400/40'
                  : 'bg-black/25 border-white/10 hover:border-white/20 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span className="font-bold text-sm text-white">2. Bản Official (Thương Mại Chính Thức)</span>
                </div>
                {systemConfig.environment === 'official' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-black">
                    ĐANG HOẠT ĐỘNG
                  </span>
                ) : (
                  <span className="text-[10px] text-white/50">Click để kích hoạt</span>
                )}
              </div>
              <ul className="text-xs text-white/70 space-y-1.5 list-disc list-inside">
                <li>Bảng giá thương mại niêm yết (+25% phụ thu / biên lợi nhuận chuẩn).</li>
                <li>Cổng thanh toán VietQR thật kết nối tài khoản doanh nghiệp 3D Hub.</li>
                <li>Cam kết bảo hành 1 đổi 1 trong 7 ngày, xuất hóa đơn VAT điện tử.</li>
                <li>Ẩn các công cụ test / RBAC switcher với khách hàng thông thường.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="vision-glass rounded-[28px] p-5 space-y-2 backdrop-blur-2xl">
          <div className="flex items-center justify-between text-white/70">
            <span className="text-xs font-semibold">Doanh Thu Đã Thu</span>
            <DollarSign className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            {stats.totalRevenueVnd.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[11px] text-emerald-300 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18.5% từ dịch vụ in AI</span>
          </div>
        </div>

        {/* Metric 2: Active Workshop Orders */}
        <div className="vision-glass rounded-[28px] p-5 space-y-2 backdrop-blur-2xl">
          <div className="flex items-center justify-between text-white/70">
            <span className="text-xs font-semibold">Đơn Đang Chạy Xưởng</span>
            <Printer className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {stats.activePrintingJobs} / {stats.totalOrders} đơn
          </div>
          <div className="text-[11px] text-white/70 font-medium">
            {stats.pendingReviewCount} đơn chờ duyệt file
          </div>
        </div>

        {/* Metric 3: Active Printers */}
        <div className="vision-glass rounded-[28px] p-5 space-y-2 backdrop-blur-2xl">
          <div className="flex items-center justify-between text-white/70">
            <span className="text-xs font-semibold">Máy In Hoạt Động</span>
            <Cpu className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {stats.activePrintersCount} / {stats.totalPrintersCount} máy
          </div>
          <div className="text-[11px] text-white/60">
            Bambu Lab X1C &amp; Anycubic SLA
          </div>
        </div>

        {/* Metric 4: System Users */}
        <div className="vision-glass rounded-[28px] p-5 space-y-2 backdrop-blur-2xl">
          <div className="flex items-center justify-between text-white/70">
            <span className="text-xs font-semibold">Tài Khoản Hệ Thống</span>
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {allUsers.length} tài khoản
          </div>
          <div className="text-[11px] text-white/70 font-medium">
            4 cấp phân quyền RBAC
          </div>
        </div>
      </div>

      {/* Unified Apple VisionOS Admin Navigation Hub (Zero-Horizontal-Scroll) */}
      <div className="vision-glass p-4 rounded-[28px] space-y-3.5 backdrop-blur-2xl border border-white/15 shadow-xl">
        {/* Top: Category Filter Tabs & Direct Seller Hub Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider mr-1">
              Nhóm Quản Trị:
            </span>
            {[
              { id: 'all', label: 'Tất Cả', count: 10 },
              { id: 'operations', label: '🏭 Vận Hành & Kho', count: 4 },
              { id: 'growth', label: '📈 Kinh Doanh & AI', count: 3 },
              { id: 'system', label: '🛡️ Quản Trị & Hệ Thống', count: 3 },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setTabCategory(cat.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                  tabCategory === cat.id
                    ? 'bg-[#2DD4BF] text-[#051817] border-[#2DD4BF] shadow-[0_0_12px_rgba(45,212,191,0.35)] font-bold'
                    : 'bg-black/20 text-white/70 border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Quick External Link to Seller Hub */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'mod') && (
            <Link
              href="/seller"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/35 transition-all shadow-sm shrink-0 self-start sm:self-auto"
            >
              <Store className="w-3.5 h-3.5 text-amber-300" />
              <span>Vào Kênh Gian Hàng (Seller Hub)</span>
              <ArrowUpRight className="w-3 h-3 text-amber-300/70" />
            </Link>
          )}
        </div>

        {/* Bottom: Responsive Wrapped Tab Pills (No Horizontal Scroll Needed) */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* 1. Users */}
          {currentUser?.role === 'admin' && (tabCategory === 'all' || tabCategory === 'operations') && (
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeTab === 'users'
                  ? 'bg-white/25 text-white border-white/40 shadow-sm shadow-[#2DD4BF]/20 scale-[1.02]'
                  : 'bg-black/20 text-white/70 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#5EEAD4]" />
              <span>Quản Lý Người Dùng</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'users' ? 'bg-[#2DD4BF] text-[#051817]' : 'bg-white/15 text-white/80'
              }`}>
                {allUsers.length}
              </span>
            </button>
          )}

          {/* 2. Products */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'mod' || permissions.canManageProducts) &&
            (tabCategory === 'all' || tabCategory === 'operations') && (
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeTab === 'products'
                  ? 'bg-white/25 text-white border-white/40 shadow-sm shadow-emerald-400/20 scale-[1.02]'
                  : 'bg-black/20 text-white/70 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
              <span>Kho Hàng &amp; Sản Phẩm</span>
            </button>
          )}

          {/* 3. Workshop */}
          {(tabCategory === 'all' || tabCategory === 'operations') && (
            <button
              type="button"
              onClick={() => setActiveTab('workshop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeTab === 'workshop'
                  ? 'bg-white/25 text-white border-white/40 shadow-sm shadow-[#2DD4BF]/20 scale-[1.02]'
                  : 'bg-black/20 text-white/70 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Điều Phối Xưởng In &amp; Đơn Hàng</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'workshop' ? 'bg-white/25 text-white' : 'bg-white/15 text-white/80'
              }`}>
                {orders.length}
              </span>
            </button>
          )}

          {/* 4. Revenue */}
          {currentUser?.role === 'admin' && (tabCategory === 'all' || tabCategory === 'growth') && (
            <button
              type="button"
              onClick={() => setActiveTab('revenue')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeTab === 'revenue'
                  ? 'bg-white/25 text-white border-white/40 shadow-sm shadow-amber-400/20 scale-[1.02]'
                  : 'bg-black/20 text-white/70 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-300" />
              <span>Doanh Thu &amp; Cổng Thanh Toán</span>
            </button>
          )}

          {/* 5. Trends */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'mod' || permissions.canManageProducts) &&
            (tabCategory === 'all' || tabCategory === 'growth') && (
            <button
              type="button"
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeTab === 'trends'
                  ? 'bg-white/25 text-white border-white/40 shadow-sm shadow-[#7EC895]/20 scale-[1.02]'
                  : 'bg-black/20 text-white/70 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7EC895]" />
              <span>Phân Tích Trend (Gemini AI)</span>
            </button>
          )}

          {/* 6. Crawler */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'mod' || permissions.canManageProducts) &&
            (tabCategory === 'all' || tabCategory === 'growth') && (
            <button
              type="button"
              onClick={() => setActiveTab('crawler')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeTab === 'crawler'
                  ? 'bg-white/25 text-white border-white/40 shadow-sm shadow-[#2DD4BF]/20 scale-[1.02]'
                  : 'bg-black/20 text-white/70 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Thu Thập Dữ Liệu 3D (Crawler v3)</span>
            </button>
          )}

          {/* 7. Settings */}
          {currentUser?.role === 'admin' && (tabCategory === 'all' || tabCategory === 'system') && (
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeTab === 'settings'
                  ? 'bg-white/25 text-white border-white/40 shadow-sm scale-[1.02]'
                  : 'bg-black/20 text-white/70 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-white" />
              <span>Cấu Hình Giá Vốn &amp; API</span>
            </button>
          )}

          {/* 8. Modules */}
          {currentUser?.role === 'admin' && (tabCategory === 'all' || tabCategory === 'system') && (
            <button
              type="button"
              onClick={() => setActiveTab('modules')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeTab === 'modules'
                  ? 'bg-white/25 text-white border-white/40 shadow-sm scale-[1.02]'
                  : 'bg-black/20 text-white/70 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-300" />
              <span>Phân Quyền Modules (8 Tính Năng)</span>
            </button>
          )}

          {/* 9. Audit Logs */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'mod') &&
            (tabCategory === 'all' || tabCategory === 'system') && (
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeTab === 'audit'
                  ? 'bg-white/25 text-white border-white/40 shadow-sm shadow-cyan-400/20 scale-[1.02]'
                  : 'bg-black/20 text-white/70 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-300" />
              <span>Nhật Ký Kiểm Toán (Audit Trail)</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: WORKSHOP & ORDERS COORDINATION */}
      {activeTab === 'workshop' && (
        <div className="space-y-6">
          {/* Live Farm Status Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-300" />
                <span>Trạng Thái Trực Tiếp Các Cỗ Máy Xưởng In (Farm Live)</span>
              </h3>
              <span className="text-xs text-white/60">Tự động giám sát nhiệt độ và tiến độ in</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {printers.map((prt) => {
                const isPrinting = prt.status === 'printing';
                return (
                  <div
                    key={prt.id}
                    className={`p-4 rounded-[28px] vision-glass transition-all ${
                      isPrinting
                        ? 'border-white/30 shadow-xl'
                        : 'border-white/12 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isPrinting ? 'bg-emerald-400 animate-ping' : 'bg-white/30'
                            }`}
                          />
                          <h4 className="text-xs font-black text-white truncate">{prt.name}</h4>
                        </div>
                        <p className="text-[11px] text-white/60 truncate mt-0.5">
                          {prt.materialLoaded || 'Vật liệu: N/A'}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          isPrinting
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                            : 'bg-white/10 text-white/70 border-white/15'
                        }`}
                      >
                        {isPrinting ? 'Đang In' : 'Sẵn Sàng'}
                      </span>
                    </div>

                    {/* Printer Telemetry */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-[10px]">
                      <div>
                        <span className="text-white/50 block">Đầu phun</span>
                        <span className="font-bold text-rose-300">
                          {prt.nozzleTemp ? `${prt.nozzleTemp}°C` : 'Off'}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/50 block">Bàn nhiệt</span>
                        <span className="font-bold text-amber-300">
                          {prt.bedTemp ? `${prt.bedTemp}°C` : 'Off'}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/50 block">Công nghệ</span>
                        <span className="font-bold text-white/90">{prt.type}</span>
                      </div>
                    </div>

                    {/* Progress Bar if printing */}
                    {isPrinting && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-white/70">Đơn #{prt.currentOrderId}</span>
                          <span className="text-emerald-300">{prt.currentProgressPercent || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all"
                            style={{ width: `${prt.currentProgressPercent || 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Orders Filter & Management */}
          <div className="vision-glass rounded-[32px] p-5 sm:p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-white/90" />
                <h3 className="text-sm font-black text-white">
                  Danh Sách Đơn Hàng ({filteredOrders.length} đơn)
                </h3>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm mã đơn, tên khách..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-full bg-black/30 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40 w-44 sm:w-56 backdrop-blur-xl"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-full bg-black/30 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40 font-semibold cursor-pointer"
                >
                  <option value="all" className="bg-[#18231B] text-white">Tất cả trạng thái</option>
                  <option value="pending_review" className="bg-[#18231B] text-white">Chờ duyệt file</option>
                  <option value="slicing" className="bg-[#18231B] text-white">Đang cắt lớp</option>
                  <option value="printing" className="bg-[#18231B] text-white">Đang in thực tế</option>
                  <option value="post_processing" className="bg-[#18231B] text-white">Hậu kỳ</option>
                  <option value="completed" className="bg-[#18231B] text-white">Hoàn tất</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/60 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Mã Đơn</th>
                    <th className="pb-3 px-3">Khách Hàng</th>
                    <th className="pb-3 px-3">Sản Phẩm &amp; AI Tier</th>
                    <th className="pb-3 px-3">Tổng Tiền / Cổng</th>
                    <th className="pb-3 px-3">Máy In Phân Bổ</th>
                    <th className="pb-3 px-3">Tiến Độ Xưởng</th>
                    <th className="pb-3 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-white/50 text-xs">
                        Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const badge = getFulfillmentBadge(order.fulfillmentStatus);
                      return (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-white">
                            #{order.id}
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-bold text-white">{order.customerName}</div>
                            <div className="text-[11px] text-white/60">{order.customerPhone}</div>
                          </td>

                          <td className="py-3 px-3 max-w-xs">
                            <div className="space-y-1">
                              {order.items.map((it, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <span className="font-semibold text-white truncate">
                                    {it.title}
                                  </span>
                                  {it.aiTier && it.aiTier !== 'none' && (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20 shrink-0">
                                      {it.aiTier === 'meshy_ultra'
                                        ? 'Meshy 4K'
                                        : it.aiTier === 'trellis_pro'
                                        ? 'Trellis 2'
                                        : 'Tripo Fast'}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-black text-amber-300">
                              {order.totalAmountVnd.toLocaleString('vi-VN')} đ
                            </div>
                            <div className="text-[10px] uppercase font-bold text-white/60">
                              {order.paymentMethod === 'vietqr'
                                ? 'VietQR 24/7'
                                : order.paymentMethod === 'momo'
                                ? 'MoMo'
                                : order.paymentMethod === 'wallet'
                                ? 'Ví 3D Hub'
                                : 'COD'}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <select
                              value={order.assignedPrinter || ''}
                              onChange={(e) => assignPrinter(order.id, e.target.value)}
                              className="px-2.5 py-1 rounded-full bg-black/30 border border-white/15 text-[11px] text-white focus:outline-none focus:border-white/40 cursor-pointer"
                            >
                              <option value="" className="bg-[#18231B] text-white">Chưa phân bổ</option>
                              {printers.map((p) => (
                                <option key={p.id} value={p.name} className="bg-[#18231B] text-white">
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {order.fulfillmentStatus === 'pending_review' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'slicing')}
                                  className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 text-[11px] font-bold transition-all shadow-sm"
                                  title="Chuyển sang bước cắt lớp trên OrcaSlicer"
                                >
                                  Cắt Lớp
                                </button>
                              )}

                              {order.fulfillmentStatus === 'slicing' && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(
                                      order.id,
                                      'printing',
                                      order.assignedPrinter || printers[0].name
                                    )
                                  }
                                  className="px-3 py-1 rounded-full bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-400/30 text-[11px] font-bold transition-all shadow-sm"
                                  title="Bắt đầu chạy máy in"
                                >
                                  Bắt Đầu In
                                </button>
                              )}

                              {order.fulfillmentStatus === 'printing' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'post_processing')}
                                  className="px-3 py-1 rounded-full bg-blue-500/25 hover:bg-blue-500/35 text-blue-200 border border-blue-400/30 text-[11px] font-bold transition-all shadow-sm"
                                  title="In xong, chuyển sang hậu kỳ gỡ support"
                                >
                                  Hậu Kỳ
                                </button>
                              )}

                              {order.fulfillmentStatus === 'post_processing' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'delivering')}
                                  className="px-3 py-1 rounded-full bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 border border-amber-400/30 text-[11px] font-bold transition-all shadow-sm"
                                  title="Đóng gói và giao cho đơn vị vận chuyển"
                                >
                                  Giao Hàng
                                </button>
                              )}

                              {order.fulfillmentStatus === 'delivering' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'completed')}
                                  className="px-3 py-1 rounded-full bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-400/30 text-[11px] font-bold transition-all shadow-sm"
                                  title="Xác nhận khách đã nhận thành công"
                                >
                                  Hoàn Tất
                                </button>
                              )}

                              {order.fulfillmentStatus === 'completed' && (
                                <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Xong</span>
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RBAC USER & WALLET MANAGEMENT */}
      {activeTab === 'users' && (
        <AdminUserManager
          users={allUsers}
          currentUserId={currentUser?.id}
          onRefresh={refreshSession}
          showToast={showToast}
        />
      )}

      {/* TAB 3: AI PRICING COST x2 & PAYMENT AUDIT */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* AI Models Cost x2 Matrix */}
          <div className="vision-glass rounded-[32px] p-5 sm:p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white/90" />
              <div>
                <h3 className="text-sm font-black text-white">
                  Bảng Cấu Hình &amp; Báo Giá Dịch Vụ AI 3D
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Định mức giá niêm yết cho từng cấp độ tạo mô hình 3D (In Thường, In Nâng Cao, In Chất Lượng 4K) tối ưu theo hạ tầng.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {Object.values(AI_PRINT_TIERS).map((tier) => (
                <div
                  key={tier.id}
                  className="p-4 sm:p-5 rounded-[28px] vision-glass space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white">{tier.name}</h4>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                      {tier.engine}
                    </span>
                  </div>

                  <p className="text-[11px] text-white/70">{tier.description}</p>

                  <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-1.5 text-xs shadow-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Đơn giá hạ tầng API:</span>
                      <span className="font-mono text-white font-semibold">${tier.costUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Quy đổi ước tính:</span>
                      <span className="font-mono text-white">
                        {Math.round(tier.costUsd * 25400).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-white/10">
                      <span className="font-bold text-amber-300">Giá bán niêm yết:</span>
                      <span className="font-black text-amber-300 text-sm">
                        {tier.priceVnd.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-emerald-300 font-bold flex items-center justify-between">
                    <span>Biên lợi nhuận gộp:</span>
                    <span>50.0% (Tự động hạch toán)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VietQR / MoMo Gateway Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="vision-glass rounded-[28px] p-5 sm:p-6 space-y-3 shadow-xl backdrop-blur-2xl">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-white/90" />
                <h4 className="text-xs font-black text-white">Cổng VietQR Napas 24/7 (MB Bank)</h4>
              </div>
              <p className="text-xs text-white/70">
                Tích hợp API tạo mã QR động ngân hàng Quân Đội (MB Bank). Khách hàng chuyển khoản với cú pháp định danh được hệ thống xác nhận và nạp tiền tức thì.
              </p>
              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-white/60">Số tài khoản:</span>
                  <span className="font-mono font-bold text-white">0901234567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Chủ tài khoản:</span>
                  <span className="font-bold text-white">3D HUB VIETNAM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Ngân hàng:</span>
                  <span className="text-white">MB Bank (Quân Đội)</span>
                </div>
              </div>
            </div>

            <div className="vision-glass rounded-[28px] p-5 sm:p-6 space-y-3 shadow-xl backdrop-blur-2xl">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-white/90" />
                <h4 className="text-xs font-black text-white">Cổng Ví Điện Tử MoMo (QuickPay)</h4>
              </div>
              <p className="text-xs text-white/70">
                Thanh toán qua quét mã QR MoMo P2P trực tiếp. Khách hàng chỉ cần giơ điện thoại quét là hoàn tất giao dịch trong 30 giây.
              </p>
              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-white/60">Số điện thoại MoMo:</span>
                  <span className="font-mono font-bold text-white">0901234567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Tên ví đại diện:</span>
                  <span className="font-bold text-white">3D HUB TECH VIETNAM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Cú pháp:</span>
                  <span className="text-amber-300 font-mono font-bold">3DHUB NAP [USER]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM CONFIG, MATERIAL COSTS & API KEYS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Section 1: API Keys */}
          <div className="vision-glass rounded-[32px] p-5 sm:p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    1. Khóa Kết Nối API (Google Gemini, Fal.ai &amp; Meshy)
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Quản trị viên có thể nhập trực tiếp API Key để kích hoạt phân tích dữ liệu và sinh 3D thực tế
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Gemini Key & Model Selector */}
              <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white block">
                    Google Gemini API Key
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:underline font-semibold"
                  >
                    <span>Lấy key Google miễn phí</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={systemConfig.apiKeys.geminiApiKey}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      apiKeys: { ...systemConfig.apiKeys, geminiApiKey: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-white/40"
                />

                {/* Model Selector & Live Load Button */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/90">
                      Mô hình Gemini sử dụng:
                    </label>
                    <button
                      type="button"
                      onClick={handleFetchGeminiModels}
                      disabled={isLoadingGeminiModels}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#2DD4BF]/20 text-[#5EEAD4] hover:bg-[#2DD4BF]/30 border border-[#2DD4BF]/35 transition-all disabled:opacity-50"
                      title="Kết nối trực tiếp tới Google AI API để tải danh sách các model đang hoạt động theo API Key này"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingGeminiModels ? 'animate-spin' : ''}`} />
                      <span>{isLoadingGeminiModels ? 'Đang tải...' : 'Tải Model từ API'}</span>
                    </button>
                  </div>

                  <select
                    value={systemConfig.apiKeys.preferredGeminiModel || 'gemini-2.0-flash'}
                    onChange={(e) =>
                      setSystemConfig({
                        ...systemConfig,
                        apiKeys: {
                          ...systemConfig.apiKeys,
                          preferredGeminiModel: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-emerald-300 font-semibold focus:outline-none focus:border-emerald-400"
                  >
                    {(availableGeminiModels.length > 0 ? availableGeminiModels : DEFAULT_GEMINI_MODELS).map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                        {m.name || m.id}
                      </option>
                    ))}
                  </select>

                  {geminiModelStatus.type === 'success' && (
                    <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-[11px] text-emerald-200 flex items-center gap-1.5 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      <span>{geminiModelStatus.message}</span>
                    </div>
                  )}

                  {geminiModelStatus.type === 'error' && (
                    <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-400/30 text-[11px] text-rose-200 flex items-start gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-300 shrink-0 mt-0.5" />
                      <span className="leading-snug">{geminiModelStatus.message}</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-white/60">
                  Dùng cho phân tích xu hướng MakerWorld và khuyến nghị sản xuất cho xưởng in.
                </p>
              </div>

              {/* Fal.ai Key */}
              <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-white block">
                  Fal.ai API Key
                </label>
                <input
                  type="text"
                  placeholder="fal_key_..."
                  value={systemConfig.apiKeys.falKey}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      apiKeys: { ...systemConfig.apiKeys, falKey: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-white/40"
                />
                <p className="text-[11px] text-white/60">
                  Dùng để chạy mô hình Trellis 2 ($0.05) &amp; Tripo H3.1 ($0.01) sinh khối 3D siêu tốc.
                </p>
                <a
                  href="https://fal.ai/dashboard/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:underline font-semibold"
                >
                  <span>Đăng ký tại Fal.ai</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Meshy Key */}
              <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-white block">
                  Meshy.ai API Key
                </label>
                <input
                  type="text"
                  placeholder="msy_..."
                  value={systemConfig.apiKeys.meshyApiKey}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      apiKeys: { ...systemConfig.apiKeys, meshyApiKey: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-white/40"
                />
                <p className="text-[11px] text-white/60">
                  Dùng để sinh chi tiết sắc nét 4K PBR Texture và Quad Mesh thương mại.
                </p>
                <a
                  href="https://meshy.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:underline font-semibold"
                >
                  <span>Đăng ký tại Meshy.ai</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSaveConfig('apiKeys', { apiKeys: systemConfig.apiKeys })}
                disabled={isSavingConfig}
                className="vision-pill-btn px-6 py-2.5 rounded-full text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {isSavingConfig ? 'Đang Lưu...' : 'Lưu Khóa API Hệ Thống'}
              </button>
            </div>
          </div>

          {/* Section 2: Material Costs (Giá vốn nhựa) */}
          <div className="vision-glass rounded-[32px] p-5 sm:p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center border border-white/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  2. Cấu Hình Giá Gốc (Giá Vốn) Cuộn Nhựa &amp; Resin In 3D
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Đơn giá vốn làm cơ sở tính toán chi phí thực tế cho khách hàng khi đặt in FDM / SLA
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              {/* PLA */}
              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Nhựa PLA Basic</span>
                  <span className="text-[10px] text-amber-300 font-mono">
                    {Math.round(systemConfig.materials.plaPerKgVnd / 1000)} đ/g
                  </span>
                </div>
                <input
                  type="number"
                  step="5000"
                  value={systemConfig.materials.plaPerKgVnd}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      materials: {
                        ...systemConfig.materials,
                        plaPerKgVnd: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-amber-300 font-bold focus:outline-none focus:border-white/40"
                />
                <span className="text-[10px] text-white/50 block">Đơn vị: VNĐ / cuộn 1kg</span>
              </div>

              {/* PETG */}
              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Nhựa PETG</span>
                  <span className="text-[10px] text-amber-300 font-mono">
                    {Math.round(systemConfig.materials.petgPerKgVnd / 1000)} đ/g
                  </span>
                </div>
                <input
                  type="number"
                  step="5000"
                  value={systemConfig.materials.petgPerKgVnd}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      materials: {
                        ...systemConfig.materials,
                        petgPerKgVnd: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-amber-300 font-bold focus:outline-none focus:border-white/40"
                />
                <span className="text-[10px] text-white/50 block">Đơn vị: VNĐ / cuộn 1kg</span>
              </div>

              {/* PETG-CF */}
              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">PETG-CF Carbon</span>
                  <span className="text-[10px] text-amber-300 font-mono">
                    {Math.round(systemConfig.materials.petgCfPerKgVnd / 1000)} đ/g
                  </span>
                </div>
                <input
                  type="number"
                  step="10000"
                  value={systemConfig.materials.petgCfPerKgVnd}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      materials: {
                        ...systemConfig.materials,
                        petgCfPerKgVnd: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-amber-300 font-bold focus:outline-none focus:border-white/40"
                />
                <span className="text-[10px] text-white/50 block">Đơn vị: VNĐ / cuộn 1kg</span>
              </div>

              {/* ABS */}
              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Nhựa ABS Chịu Nhiệt</span>
                  <span className="text-[10px] text-amber-300 font-mono">
                    {Math.round(systemConfig.materials.absPerKgVnd / 1000)} đ/g
                  </span>
                </div>
                <input
                  type="number"
                  step="5000"
                  value={systemConfig.materials.absPerKgVnd}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      materials: {
                        ...systemConfig.materials,
                        absPerKgVnd: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-amber-300 font-bold focus:outline-none focus:border-white/40"
                />
                <span className="text-[10px] text-white/50 block">Đơn vị: VNĐ / cuộn 1kg</span>
              </div>

              {/* Resin SLA */}
              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Resin SLA 12K</span>
                  <span className="text-[10px] text-amber-300 font-mono">
                    {Math.round(systemConfig.materials.resinPerLiterVnd / 1000)} đ/g
                  </span>
                </div>
                <input
                  type="number"
                  step="10000"
                  value={systemConfig.materials.resinPerLiterVnd}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      materials: {
                        ...systemConfig.materials,
                        resinPerLiterVnd: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-amber-300 font-bold focus:outline-none focus:border-white/40"
                />
                <span className="text-[10px] text-white/50 block">Đơn vị: VNĐ / chai 1 lít</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSaveConfig('materials', { materials: systemConfig.materials })}
                disabled={isSavingConfig}
                className="vision-pill-btn px-6 py-2.5 rounded-full text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {isSavingConfig ? 'Đang Lưu...' : 'Lưu Bảng Giá Vốn Nhựa'}
              </button>
            </div>
          </div>

          {/* Section 3: Operations & % Margin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="vision-glass rounded-[32px] p-5 sm:p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center border border-white/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    3. Chi Phí Vận Hành &amp; % Phụ Thu
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Khấu hao máy in, tiền điện và % biên lợi nhuận cộng thêm (0% = bán giá gốc)
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/70">Khấu hao máy in theo giờ:</span>
                  <input
                    type="number"
                    step="1000"
                    value={systemConfig.operations.machineHourlyRateVnd}
                    onChange={(e) =>
                      setSystemConfig({
                        ...systemConfig,
                        operations: {
                          ...systemConfig.operations,
                          machineHourlyRateVnd: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-32 px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-amber-300 font-bold text-right focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/70">Tiền điện chạy máy theo giờ:</span>
                  <input
                    type="number"
                    step="500"
                    value={systemConfig.operations.electricityHourlyVnd}
                    onChange={(e) =>
                      setSystemConfig({
                        ...systemConfig,
                        operations: {
                          ...systemConfig.operations,
                          electricityHourlyVnd: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-32 px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-amber-300 font-bold text-right focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/70">Nhân công hậu kỳ (gỡ support):</span>
                  <input
                    type="number"
                    step="5000"
                    value={systemConfig.operations.laborPostProcessVnd}
                    onChange={(e) =>
                      setSystemConfig({
                        ...systemConfig,
                        operations: {
                          ...systemConfig.operations,
                          laborPostProcessVnd: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-32 px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-amber-300 font-bold text-right focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-white/10">
                  <div>
                    <span className="font-bold text-emerald-300 block">% Phụ thu / Lợi nhuận:</span>
                    <span className="text-[10px] text-white/50">0% = tính đúng giá gốc</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="5"
                      min="0"
                      max="200"
                      value={systemConfig.operations.profitMarginPercent}
                      onChange={(e) =>
                        setSystemConfig({
                          ...systemConfig,
                          operations: {
                            ...systemConfig.operations,
                            profitMarginPercent: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-24 px-3 py-1.5 rounded-xl bg-black/30 border border-emerald-400/30 text-xs text-emerald-200 font-black text-right focus:outline-none focus:border-emerald-400"
                    />
                    <span className="text-xs font-bold text-white/70">%</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveConfig('operations', { operations: systemConfig.operations })}
                  disabled={isSavingConfig}
                  className="vision-pill-btn px-6 py-2 rounded-full text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {isSavingConfig ? 'Đang Lưu...' : 'Lưu Chi Phí & % Phụ Thu'}
                </button>
              </div>
            </div>

            {/* Section 4: AI Model Base Pricing */}
            <div className="vision-glass rounded-[32px] p-5 sm:p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center border border-white/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    4. Giá Gốc Các Mô Hình AI 3D (VNĐ)
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Định mức chi phí tính cho khách theo đúng giá gốc API
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-white font-bold block">Tripo H3.1 (In Thường):</span>
                    <span className="text-[10px] text-white/50">Chi phí gốc: $0.01 / lượt</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="50"
                      value={systemConfig.aiPricing.tripoVnd}
                      onChange={(e) =>
                        setSystemConfig({
                          ...systemConfig,
                          aiPricing: { ...systemConfig.aiPricing, tripoVnd: Number(e.target.value) || 0 },
                        })
                      }
                      className="w-28 px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-amber-300 font-bold text-right focus:outline-none focus:border-white/40"
                    />
                    <span className="text-xs text-white/60">đ</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-white font-bold block">Trellis 2 (In Nâng Cao):</span>
                    <span className="text-[10px] text-white/50">Chi phí gốc: $0.05 / lượt</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="100"
                      value={systemConfig.aiPricing.trellisVnd}
                      onChange={(e) =>
                        setSystemConfig({
                          ...systemConfig,
                          aiPricing: { ...systemConfig.aiPricing, trellisVnd: Number(e.target.value) || 0 },
                        })
                      }
                      className="w-28 px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-amber-300 font-bold text-right focus:outline-none focus:border-white/40"
                    />
                    <span className="text-xs text-white/60">đ</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-white font-bold block">Meshy 6 (In 4K Ultra):</span>
                    <span className="text-[10px] text-white/50">Chi phí gốc: $0.80 / lượt</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="1000"
                      value={systemConfig.aiPricing.meshyVnd}
                      onChange={(e) =>
                        setSystemConfig({
                          ...systemConfig,
                          aiPricing: { ...systemConfig.aiPricing, meshyVnd: Number(e.target.value) || 0 },
                        })
                      }
                      className="w-28 px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-amber-300 font-bold text-right focus:outline-none focus:border-white/40"
                    />
                    <span className="text-xs text-white/60">đ</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveConfig('aiPricing', { aiPricing: systemConfig.aiPricing })}
                  disabled={isSavingConfig}
                  className="vision-pill-btn px-6 py-2 rounded-full text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {isSavingConfig ? 'Đang Lưu...' : 'Lưu Giá Gốc AI'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Commercial Enterprise Configuration */}
          <div className="vision-glass rounded-[32px] p-5 sm:p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center border border-white/20">
                <Building2 className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  5. Cấu Hình Doanh Nghiệp &amp; Phiên Bản Thương Mại (Official Edition)
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Thông tin pháp nhân, tài khoản ngân hàng nhận thanh toán VietQR và chính sách bảo hành thương mại
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-white block">Tên Doanh Nghiệp / Thương Hiệu</label>
                <input
                  type="text"
                  value={systemConfig.commercial?.companyName || ''}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      commercial: { ...systemConfig.commercial, companyName: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40"
                  placeholder="Công ty Cổ phần Công nghệ In 3D Hub"
                />
              </div>

              <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-white block">Mã Số Thuế (MST)</label>
                <input
                  type="text"
                  value={systemConfig.commercial?.taxCode || ''}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      commercial: { ...systemConfig.commercial, taxCode: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40 font-mono"
                  placeholder="0318998822"
                />
              </div>

              <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-white block">Hotline Hỗ Trợ 24/7</label>
                <input
                  type="text"
                  value={systemConfig.commercial?.hotline || ''}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      commercial: { ...systemConfig.commercial, hotline: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40"
                  placeholder="1900 6833 - 0988.333.444"
                />
              </div>

              <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-white block">Email Chăm Sóc Khách Hàng</label>
                <input
                  type="email"
                  value={systemConfig.commercial?.supportEmail || ''}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      commercial: { ...systemConfig.commercial, supportEmail: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40"
                  placeholder="contact@3dhub.vn"
                />
              </div>

              <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-white block">Tài Khoản Ngân Hàng VietQR (Chính Thức)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={systemConfig.commercial?.bankAccount?.bankName || ''}
                    onChange={(e) =>
                      setSystemConfig({
                        ...systemConfig,
                        commercial: {
                          ...systemConfig.commercial,
                          bankAccount: {
                            ...systemConfig.commercial?.bankAccount,
                            bankName: e.target.value,
                          },
                        },
                      })
                    }
                    className="px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white"
                    placeholder="Tên ngân hàng (MBBank)"
                  />
                  <input
                    type="text"
                    value={systemConfig.commercial?.bankAccount?.accountNumber || ''}
                    onChange={(e) =>
                      setSystemConfig({
                        ...systemConfig,
                        commercial: {
                          ...systemConfig.commercial,
                          bankAccount: {
                            ...systemConfig.commercial?.bankAccount,
                            accountNumber: e.target.value,
                          },
                        },
                      })
                    }
                    className="px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-emerald-300 font-mono"
                    placeholder="Số tài khoản"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-white block">Tên Chủ Tài Khoản Doanh Nghiệp</label>
                <input
                  type="text"
                  value={systemConfig.commercial?.bankAccount?.accountHolder || ''}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      commercial: {
                        ...systemConfig.commercial,
                        bankAccount: {
                          ...systemConfig.commercial?.bankAccount,
                          accountHolder: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40 uppercase font-mono"
                  placeholder="CONG TY CP CONG NGHE 3D HUB"
                />
              </div>

              <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-white block">Chính Sách Bảo Hành &amp; Cam Kết Chất Lượng</label>
                <input
                  type="text"
                  value={systemConfig.commercial?.warrantyPolicy || ''}
                  onChange={(e) =>
                    setSystemConfig({
                      ...systemConfig,
                      commercial: { ...systemConfig.commercial, warrantyPolicy: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40"
                  placeholder="Cam kết chuẩn xác kích thước ±0.1mm, bảo hành 1 đổi 1 trong 7 ngày"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSaveConfig('commercial', { commercial: systemConfig.commercial })}
                disabled={isSavingConfig}
                className="vision-pill-btn px-6 py-2.5 rounded-full text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {isSavingConfig ? 'Đang Lưu...' : 'Lưu Thông Tin Doanh Nghiệp Thương Mại'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRODUCTS & INVENTORY MANAGEMENT (ADMIN & MOD) */}
      {activeTab === 'products' && (
        <AdminProductsManager />
      )}

      {/* TAB 6: DYNAMIC ROLE-BASED MODULE PERMISSIONS MATRIX (ADMIN ONLY) */}
      {activeTab === 'modules' && currentUser?.role === 'admin' && (
        <AdminModulesManager />
      )}

      {/* TAB 7: TREND INTELLIGENCE & GEMINI AI ANALYSIS */}
      {activeTab === 'trends' && (
        <AdminTrendsManager />
      )}

      {/* TAB 8: MULTI-PLATFORM 3D DATA CRAWLER */}
      {activeTab === 'crawler' && (
        <AdminCrawlerManager />
      )}

      {/* TAB 9: AUDIT TRAIL LOGS (ADMIN & MOD) */}
      {activeTab === 'audit' && (
        <AdminAuditLogManager />
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-white/60 font-semibold">Đang tải bảng điều khiển quản trị...</p>
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
