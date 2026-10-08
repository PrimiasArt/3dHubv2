'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Store,
  DollarSign,
  Package,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Building2,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
  Download,
  Eye,
  Sliders,
  X,
  CreditCard,
} from 'lucide-react';
import { useUserSession } from '@/hooks/useUserSession';
import { useShopManagement } from '@/hooks/useShopManagement';

export default function SellerPage() {
  const { currentUser, switchRole, showToast } = useUserSession();
  const { filaments, accessories } = useShopManagement();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'withdrawals' | 'settings'>('products');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(1000000);
  const [bankAccount, setBankAccount] = useState('0901234567');
  const [bankName, setBankName] = useState('MBBank (Ngân hàng Quân Đội)');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const isSeller =
    currentUser?.role === 'seller' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'mod';

  // Demo products uploaded by seller
  const sellerProducts = [
    {
      id: 'sel-1',
      name: 'Bambu Lab PLA Silk Dual-Color (Cam Neon - Tím)',
      brand: currentUser?.name || 'Hoàng 3D Maker',
      category: 'Cuộn Nhựa In',
      priceVnd: 460000,
      stockCount: 18,
      salesCount: 32,
      thumbnailUrl: '/thumbnails/spool-pla.svg',
      status: 'active',
    },
    {
      id: 'sel-2',
      name: 'File 3D Khớp Cử Động - Rồng Ánh Kim Giáp (Bản Quyền STL)',
      brand: currentUser?.name || 'Hoàng 3D Maker',
      category: 'Mô Hình Bản Quyền',
      priceVnd: 95000,
      stockCount: 999, // Digital file
      salesCount: 84,
      thumbnailUrl: '/thumbnails/dragon.svg',
      status: 'active',
    },
    {
      id: 'sel-3',
      name: 'Khay Đựng Pin Gridfinity Tiết Kiệm Không Gian',
      brand: currentUser?.name || 'Hoàng 3D Maker',
      category: 'Mô Hình Bản Quyền',
      priceVnd: 45000,
      stockCount: 999,
      salesCount: 112,
      thumbnailUrl: '/thumbnails/battery-caddy.svg',
      status: 'active',
    },
  ];

  const sellerOrders = [
    {
      id: 'ORD-SEL-9912',
      customerName: 'Nguyễn Văn Long',
      items: 'File 3D Rồng Ánh Kim Giáp (x1)',
      totalVnd: 95000,
      commissionVnd: 7600, // 8% fee
      netVnd: 87400,
      date: 'Hôm nay, 10:14',
      status: 'completed',
    },
    {
      id: 'ORD-SEL-9874',
      customerName: 'Đặng Tuấn Anh',
      items: 'Cuộn PLA Silk Dual-Color (x2)',
      totalVnd: 920000,
      commissionVnd: 73600,
      netVnd: 846400,
      date: 'Hôm qua, 15:20',
      status: 'shipping',
    },
  ];

  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingWithdraw(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      showToast(`Đã gửi yêu cầu rút ${withdrawAmount.toLocaleString('vi-VN')} đ về tài khoản ${bankAccount}!`);
      setIsWithdrawModalOpen(false);
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  if (!isSeller) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full vision-glass-panel rounded-[36px] p-8 text-center space-y-5 shadow-2xl border border-white/20">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 mx-auto flex items-center justify-center shadow-lg">
            <Store className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">Đăng Ký Gian Hàng Seller</h2>
            <p className="text-xs text-white/70 mt-2 leading-relaxed">
              Tài khoản hiện tại của bạn là <strong className="text-white">{currentUser?.role?.toUpperCase()}</strong>. Quyền truy cập Kênh Gian Hàng dành cho người bán đã xác thực, Quản trị viên và Điều phối viên (Mod).
            </p>
          </div>

          {currentUser?.role === 'admin' ? (
            <button
              type="button"
              onClick={() => {
                switchRole('seller');
                showToast('🎉 Đã chuyển sang vai trò Seller! Chào mừng bạn đến với Seller Hub.');
              }}
              className="vision-pill-btn w-full py-3 rounded-full text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Kích Hoạt Quyền Seller Test (Chỉ Dành Cho Admin)
            </button>
          ) : (
            <Link
              href="/shop"
              className="vision-pill-btn block w-full py-3 rounded-full text-white text-xs font-bold transition-all text-center shadow-md"
            >
              Quay Lại Cửa Hàng &amp; Mua Sắm
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Top Banner Header */}
      <div className="vision-glass-panel rounded-[36px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/20 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 shadow-lg">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Trung Tâm Quản Lý Gian Hàng Seller
              </h1>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                SELLER VERIFIED
              </span>
            </div>
            <p className="text-xs text-white/70 mt-1">
              Đăng bán cuộn nhựa, linh kiện và file 3D có bản quyền. Quản lý doanh thu minh bạch và yêu cầu quyết toán về ngân hàng.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Yêu Cầu Rút Tiền</span>
          </button>

          <Link
            href="/shop"
            className="vision-pill-btn flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem Gian Hàng Công Khai</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Available Balance */}
        <div className="vision-glass rounded-[28px] p-5 space-y-1.5 backdrop-blur-2xl border border-white/15">
          <div className="flex items-center justify-between text-white/70">
            <span className="text-xs font-semibold">Doanh Thu Khả Dụng Rút</span>
            <DollarSign className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300">
            {(currentUser?.walletBalanceVnd ?? 1850000).toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[11px] text-emerald-200/80 font-medium">
            Có thể rút về ngân hàng ngay
          </div>
        </div>

        {/* Metric 2: Escrow Pending Balance */}
        <div className="vision-glass rounded-[28px] p-5 space-y-1.5 backdrop-blur-2xl border border-amber-400/20 bg-amber-500/10">
          <div className="flex items-center justify-between text-amber-200">
            <span className="text-xs font-semibold">Đang Ký Quỹ Tạm Giữ</span>
            <Clock className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            {(currentUser?.sellerPendingBalanceVnd || 420000).toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[11px] text-amber-200/80 font-medium">
            Tự động giải ngân sau 3 ngày
          </div>
        </div>

        {/* Metric 3: Total Sales */}
        <div className="vision-glass rounded-[28px] p-5 space-y-1.5 backdrop-blur-2xl border border-white/15">
          <div className="flex items-center justify-between text-white/70">
            <span className="text-xs font-semibold">Đơn Bán Thành Công</span>
            <Package className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            24 đơn
          </div>
          <div className="text-[11px] text-white/60">
            Tỷ lệ hoàn thành 98.5%
          </div>
        </div>

        {/* Metric 4: Store Rating */}
        <div className="vision-glass rounded-[28px] p-5 space-y-1.5 backdrop-blur-2xl border border-white/15">
          <div className="flex items-center justify-between text-white/70">
            <span className="text-xs font-semibold">Đánh Giá Gian Hàng</span>
            <ShieldCheck className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            4.9 / 5.0 ⭐
          </div>
          <div className="text-[11px] text-white/60">
            128 đánh giá tích cực
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="vision-glass p-1.5 rounded-full flex items-center gap-2 overflow-x-auto backdrop-blur-2xl border border-white/15">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'products' ? 'bg-white/28 text-white shadow-xs' : 'text-white/60 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Sản Phẩm &amp; Mô Hình Đang Bán ({sellerProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'orders' ? 'bg-white/28 text-white shadow-xs' : 'text-white/60 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Đơn Hàng Từ Khách Hàng ({sellerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'withdrawals' ? 'bg-white/28 text-white shadow-xs' : 'text-white/60 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Lịch Sử Quyết Toán &amp; Rút Tiền</span>
        </button>
      </div>

      {/* TAB 1: SELLER PRODUCTS & 3D MODELS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-bold text-white">Danh Sách Mặt Hàng Của Shop</h3>
              <p className="text-xs text-white/60">Cuộn nhựa, linh kiện và tệp 3D có bản quyền do bạn cung cấp.</p>
            </div>

            <Link
              href="/admin"
              className="vision-pill-btn flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Đăng Bán Mặt Hàng Mới</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sellerProducts.map((p) => (
              <div
                key={p.id}
                className="vision-glass rounded-[28px] p-5 border border-white/15 space-y-4 flex flex-col justify-between hover:border-white/30 transition-all"
              >
                <div className="space-y-3">
                  <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 p-3">
                    <Image src={p.thumbnailUrl} alt={p.name} fill unoptimized className="object-contain p-2" />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                        {p.category}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight leading-snug line-clamp-2">
                      {p.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-white/60 mt-2">
                      <span>Đã bán: <strong className="text-white">{p.salesCount}</strong></span>
                      <span>Tồn kho: <strong className="text-emerald-300">{p.stockCount}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="text-base font-black text-amber-300">
                    {p.priceVnd.toLocaleString('vi-VN')} đ
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-all"
                      title="Chỉnh sửa sản phẩm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SELLER ORDERS */}
      {activeTab === 'orders' && (
        <div className="vision-glass rounded-[32px] p-6 border border-white/15 space-y-4">
          <h3 className="text-sm font-bold text-white">Đơn Hàng Gần Đây Của Shop</h3>

          <div className="divide-y divide-white/10 text-xs">
            {sellerOrders.map((o) => (
              <div key={o.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{o.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        o.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                      }`}
                    >
                      {o.status === 'completed' ? 'Hoàn Tất' : 'Đang Giao Hàng'}
                    </span>
                  </div>
                  <div className="text-white/70">
                    Khách hàng: <strong>{o.customerName}</strong> • {o.items}
                  </div>
                  <div className="text-[11px] text-white/50">{o.date}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-amber-300">
                    +{o.netVnd.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-[10px] text-white/50">
                    Tổng: {o.totalVnd.toLocaleString('vi-VN')} đ (Đã trừ phí sàn: {o.commissionVnd.toLocaleString('vi-VN')} đ)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WITHDRAWALS & PAYOUTS */}
      {activeTab === 'withdrawals' && (
        <div className="vision-glass rounded-[32px] p-6 border border-white/15 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Lịch Sử Quyết Toán Về Tài Khoản Ngân Hàng</h3>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="vision-pill-btn px-4 py-2 rounded-full text-white text-xs font-bold"
            >
              + Tạo Lệnh Rút Mới
            </button>
          </div>

          <div className="divide-y divide-white/10 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Chuyển khoản Vietcombank (STK: 0071001234567)</div>
                <div className="text-[11px] text-white/50">28/09/2026, 16:30 • Mã lệnh: #WTH-8812</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-300">2.500.000 đ</div>
                <span className="text-[10px] text-emerald-200/70 font-semibold">Đã chuyển khoản thành công</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WITHDRAWAL REQUEST */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="vision-glass-panel rounded-[36px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/20 text-white space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-base">
                <DollarSign className="w-5 h-5" />
                <span>Yêu Cầu Rút Doanh Thu</span>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">Số Tiền Muốn Rút (VNĐ)</label>
                <input
                  type="number"
                  required
                  min="100000"
                  step="50000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-amber-300 font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">Ngân Hàng Thụ Hưởng</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">Số Tài Khoản Ngân Hàng</label>
                <input
                  type="text"
                  required
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="vision-pill-btn px-6 py-2 rounded-full text-white text-xs font-bold shadow-md"
                >
                  {isSubmittingWithdraw ? 'Đang Xử Lý...' : 'Gửi Yêu Cầu Rút'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
