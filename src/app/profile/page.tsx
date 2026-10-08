'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Wallet,
  Package,
  Sparkles,
  ShoppingBag,
  Store,
  CheckCircle,
  Clock,
  ExternalLink,
  Plus,
  ShieldCheck,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Printer,
  Edit2,
  Save,
  MapPin,
  Phone,
  Mail,
  Copy,
} from 'lucide-react';
import { useUserSession } from '@/hooks/useUserSession';
import { useUserWallet } from '@/hooks/useUserWallet';
import { useOrders } from '@/hooks/useOrders';
import { TopUpModal } from '@/components/wallet/TopUpModal';
import { GoogleAuthModal } from '@/components/common/GoogleAuthModal';

export default function ProfilePage() {
  const { currentUser, switchUser, refreshSession, showToast, permissions } = useUserSession();
  const { balanceVnd, isTopUpModalOpen, setIsTopUpModalOpen, topUpBalance } = useUserWallet();
  const { orders } = useOrders();

  const [activeTab, setActiveTab] = useState<'info' | 'wallet' | 'orders' | 'creations' | 'seller'>('info');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Form states for profile editing
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '0901234567');
  const [address, setAddress] = useState(currentUser?.address || '123 Đường Điện Biên Phủ, TP. Hồ Chí Minh');
  const [isSaving, setIsSaving] = useState(false);

  // Filter orders of current user
  const userOrders = orders.filter((o) => o.userId === currentUser?.id || o.customerName === currentUser?.name);

  // Sample AI creations for current user
  const myCreations = [
    {
      id: 'cr-1',
      title: 'Mô hình Rồng Phong Thủy Không Gian',
      date: 'Hôm nay, 10:15',
      thumbnailUrl: '/thumbnails/dragon.svg',
      format: 'STL & GLB',
      polygonCount: '48.2k polys',
      isWatertight: true,
    },
    {
      id: 'cr-2',
      title: 'Tàu Benchy Tốc Độ Cao Bambu X1C',
      date: 'Hôm qua, 15:30',
      thumbnailUrl: '/thumbnails/benchy.svg',
      format: 'STL',
      polygonCount: '12.8k polys',
      isWatertight: true,
    },
    {
      id: 'cr-3',
      title: 'Hộp Vỏ Bảo Vệ Raspberry Pi 5 Voron',
      date: '05/10/2026',
      thumbnailUrl: '/thumbnails/rpi5-case.svg',
      format: 'STL & STEP',
      polygonCount: '24.5k polys',
      isWatertight: true,
    },
  ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      showToast('Đã cập nhật thông tin hồ sơ thành công!');
    } finally {
      setIsSaving(false);
    }
  };

  const getOrderStatusPill = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Đã Giao Thành Công', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' };
      case 'printing':
        return { label: 'Đang In Thực Tế (Xưởng 24H)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' };
      case 'slicing':
        return { label: 'Đang Cắt Lớp OrcaSlicer', color: 'bg-blue-500/20 text-blue-300 border-blue-400/30' };
      case 'pending_review':
        return { label: 'Chờ Duyệt File 3D', color: 'bg-amber-500/20 text-amber-300 border-amber-400/30' };
      default:
        return { label: status, color: 'bg-white/10 text-white/70 border-white/15' };
    }
  };

  const isSeller = currentUser?.role === 'seller';

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-white">
      {/* Top Profile Header Card - Apple VisionOS Style */}
      <div className="vision-glass-panel rounded-[36px] p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.4)] border border-white/20 relative overflow-hidden">
        {/* Subtle Ambient Spatial Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-[#46694E]/25 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Avatar & Info */}
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-black/40 border-2 border-white/25 shadow-xl shrink-0">
              {currentUser?.avatar ? (
                <Image src={currentUser.avatar} alt={currentUser.name} fill unoptimized className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/70 text-2xl font-bold">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {currentUser?.name}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/25">
                  {currentUser?.role?.toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Google Verified</span>
                </span>
              </div>

              <p className="text-xs text-white/70 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-white/50" />
                <span>{currentUser?.email}</span>
                <span className="text-white/30">•</span>
                <Phone className="w-3.5 h-3.5 text-white/50" />
                <span>{currentUser?.phone || '0901234567'}</span>
              </p>

              <p className="text-xs text-white/60 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/50" />
                <span className="truncate max-w-md">{currentUser?.address || 'Hồ Chí Minh, Việt Nam'}</span>
              </p>
            </div>
          </div>

          {/* Quick Balance & Action Pills */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <div className="p-3.5 rounded-2xl bg-black/30 border border-white/15 backdrop-blur-md">
              <div className="text-[10px] text-white/60 font-medium">Số dư ví khả dụng:</div>
              <div className="text-lg font-black text-amber-300">
                {(currentUser?.walletBalanceVnd ?? balanceVnd).toLocaleString('vi-VN')} đ
              </div>
            </div>

            <button
              onClick={() => setIsTopUpModalOpen(true)}
              className="vision-pill-btn flex items-center gap-1.5 px-5 py-3 rounded-full text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nạp Tiền Ví</span>
            </button>
          </div>
        </div>
      </div>

      {/* Segmented Pill Tabs Navigation */}
      <div className="vision-glass p-1.5 rounded-full flex items-center gap-2 overflow-x-auto backdrop-blur-2xl border border-white/15">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'info' ? 'bg-white/28 text-white shadow-xs' : 'text-white/60 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Hồ Sơ Cá Nhân</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'wallet' ? 'bg-white/28 text-white shadow-xs' : 'text-white/60 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Ví Điện Tử &amp; Giao Dịch</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'orders' ? 'bg-white/28 text-white shadow-xs' : 'text-white/60 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Đơn Hàng Của Tôi</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
            {userOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('creations')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'creations' ? 'bg-white/28 text-white shadow-xs' : 'text-white/60 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Mô Hình AI 3D</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
            {myCreations.length}
          </span>
        </button>

        {isSeller && (
          <button
            onClick={() => setActiveTab('seller')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'seller' ? 'bg-white/28 text-white shadow-xs' : 'text-white/60 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4 text-amber-300" />
            <span>Khu Vực Seller</span>
          </button>
        )}
      </div>

      {/* TAB 1: PERSONAL INFORMATION */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Edit Form */}
          <div className="md:col-span-8 vision-glass rounded-[32px] p-6 sm:p-7 border border-white/15 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Cập Nhật Thông Tin Cá Nhân</h3>
                <p className="text-xs text-white/60">
                  Địa chỉ và số điện thoại này sẽ tự động được sử dụng khi bạn đặt in dịch vụ hoặc mua vật tư.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">Họ Và Tên</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">Email</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white/50 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">Số Điện Thoại Nhận Hàng</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">Địa Chỉ Giao Hàng Mặc Định</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="vision-pill-btn flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Đang Lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Google Account Status Card */}
          <div className="md:col-span-4 space-y-4">
            <div className="vision-glass rounded-[32px] p-6 border border-white/15 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center p-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Tài Khoản Google</h4>
                  <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Đã liên kết thành công
                  </span>
                </div>
              </div>

              <p className="text-xs text-white/60 leading-relaxed">
                Tài khoản Google cho phép bạn đăng nhập nhanh chóng, sao lưu bộ sưu tập mô hình 3D và khôi phục số dư ví an toàn.
              </p>

              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all text-center"
              >
                Chuyển Hoặc Đồng Bộ Lại Google
              </button>
            </div>

            {/* Quick Link to Seller registration if not seller */}
            {!isSeller && (
              <div className="vision-glass rounded-[32px] p-6 border border-amber-400/20 bg-amber-500/10 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Store className="w-4 h-4" />
                  <span>Trở Thành Seller 3D Hub</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Bạn có xưởng in hoặc nhà sáng tạo mẫu 3D? Đăng ký mở gian hàng để bán cuộn nhựa, linh kiện và nhận hoa hồng hấp dẫn.
                </p>
                <Link
                  href="/seller"
                  className="block w-full py-2.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-xs font-bold text-center transition-all"
                >
                  Khám Phá Gian Hàng Seller
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WALLET & TRANSACTIONS */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* Large VisionOS Glass Balance Card */}
          <div className="vision-glass rounded-[36px] p-8 border border-white/20 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                <span>Ví Tiền Điện Tử 3D Hub</span>
              </span>
              <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
                {(currentUser?.walletBalanceVnd ?? balanceVnd).toLocaleString('vi-VN')} đ
              </div>
              <p className="text-xs text-white/60">
                Thanh toán tự động siêu tốc cho các lượt sinh ảnh AI 3D, dịch vụ in cấp tốc và mua sắm tại cửa hàng.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsTopUpModalOpen(true)}
                className="vision-pill-btn flex items-center gap-2 px-6 py-3 rounded-full text-white text-xs font-bold shadow-lg transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Nạp Tiền Qua VietQR (Napas 24/7)</span>
              </button>
            </div>
          </div>

          {/* Transaction History Table */}
          <div className="vision-glass rounded-[32px] p-6 border border-white/15 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>Lịch Sử Biến Động Số Dư Gần Đây</span>
            </h3>

            <div className="divide-y divide-white/10 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Nạp tiền vào ví qua VietQR Napas 24/7</div>
                    <div className="text-[11px] text-white/50">Hôm nay, 10:30 • Giao dịch tức thì</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-300">+250.000 đ</div>
                  <span className="text-[10px] text-emerald-200/70">Thành công</span>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Thanh toán đơn in dịch vụ cấp tốc #DH3D-88219</div>
                    <div className="text-[11px] text-white/50">06/10/2026, 14:20 • Xưởng Bambu Lab X1C</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">-145.000 đ</div>
                  <span className="text-[10px] text-white/60">Đã thanh toán</span>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Tặng thưởng chào mừng thành viên mới</div>
                    <div className="text-[11px] text-white/50">01/10/2026, 09:00 • Quà tặng đăng ký</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-300">+50.000 đ</div>
                  <span className="text-[10px] text-emerald-200/70">Khuyến mãi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY ORDERS WITH 8-STAGE PROGRESS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white">Danh Sách Đơn Hàng &amp; Tiến Độ In Xưởng</h3>
            <Link href="/shop" className="text-xs text-emerald-300 hover:underline">
              + Đặt in hoặc mua vật tư mới
            </Link>
          </div>

          {userOrders.length === 0 ? (
            <div className="vision-glass rounded-[32px] p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-white/40 mx-auto" />
              <h4 className="text-base font-bold text-white">Chưa có đơn hàng nào</h4>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                Bạn chưa phát sinh đơn in hoặc đơn vật tư nào. Hãy khám phá dịch vụ in 24h hoặc ghé thăm cửa hàng.
              </p>
              <Link
                href="/shop?tab=services"
                className="vision-pill-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold mt-2"
              >
                <span>Đặt In Cấp Tốc Ngay</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userOrders.map((order) => {
                const statusPill = getOrderStatusPill(order.fulfillmentStatus);
                return (
                  <div
                    key={order.id}
                    className="vision-glass rounded-[28px] p-5 border border-white/15 space-y-4 transition-all hover:border-white/25"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-sm text-white">{order.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusPill.color}`}>
                          {statusPill.label}
                        </span>
                      </div>
                      <div className="text-xs text-white/60">
                        Ngày tạo: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-8 space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-white/90 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{item.title}</span>
                            <span className="text-white/50">x{item.quantity}</span>
                          </div>
                        ))}
                        <p className="text-[11px] text-white/60">Giao đến: {order.customerAddress}</p>
                      </div>

                      <div className="md:col-span-4 text-right">
                        <div className="text-xs text-white/50">Tổng thanh toán:</div>
                        <div className="text-base font-black text-amber-300">
                          {order.totalAmountVnd.toLocaleString('vi-VN')} đ
                        </div>
                        <span className="text-[10px] text-emerald-300 font-semibold uppercase">
                          {order.paymentStatus === 'paid' ? 'Đã Thanh Toán' : 'Thanh Toán COD'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MY AI CREATIONS */}
      {activeTab === 'creations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-bold text-white">Mô Hình 3D Đã Tạo Bằng AI</h3>
              <p className="text-xs text-white/60">Bộ sưu tập mô hình được tạo từ ảnh 2D qua Tripo, Trellis, Meshy.</p>
            </div>

            <Link
              href="/studio"
              className="vision-pill-btn flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dựng Mô Hình Mới</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCreations.map((item) => (
              <div
                key={item.id}
                className="vision-glass rounded-[28px] p-5 border border-white/15 space-y-4 flex flex-col justify-between hover:border-white/30 transition-all group"
              >
                <div className="space-y-3">
                  <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 p-4">
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-contain p-2 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                        {item.format}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">{item.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-white/60 mt-1">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.polygonCount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <Link
                    href="/shop?tab=services"
                    className="flex-1 py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Gửi In 24H</span>
                  </Link>

                  <a
                    href={item.thumbnailUrl}
                    download
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                    title="Tải tệp STL"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SELLER HUB (CHỈ DÀNH CHO SELLER) */}
      {activeTab === 'seller' && isSeller && (
        <div className="space-y-6">
          <div className="vision-glass rounded-[32px] p-6 border border-amber-400/30 bg-amber-500/10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Gian Hàng Đối Tác</span>
                <h3 className="text-xl font-black text-white">{currentUser.sellerStoreName || 'Hoàng 3D Maker Studio'}</h3>
                <p className="text-xs text-white/70">
                  Đánh giá shop: <strong>4.9 / 5.0 ⭐</strong> (128 lượt mua) • Hoa hồng sàn: 8%
                </p>
              </div>

              <Link
                href="/seller"
                className="vision-pill-btn flex items-center gap-1.5 px-6 py-2.5 rounded-full text-white text-xs font-bold shrink-0 self-start md:self-auto"
              >
                <Store className="w-4 h-4" />
                <span>Mở Toàn Diện Seller Hub</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10">
                <div className="text-[10px] text-white/60">Doanh thu chờ rút (Escrow):</div>
                <div className="text-base font-bold text-amber-300">
                  {(currentUser.sellerPendingBalanceVnd || 420000).toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10">
                <div className="text-[10px] text-white/60">Tổng sản phẩm đăng bán:</div>
                <div className="text-base font-bold text-white">8 mặt hàng</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-white/60">Đơn hàng hoàn tất tháng này:</div>
                <div className="text-base font-bold text-emerald-300">24 đơn</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TopUp Modal */}
      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        currentBalanceVnd={currentUser?.walletBalanceVnd ?? balanceVnd}
        onTopUp={topUpBalance}
      />

      {/* Google Auth Modal */}
      <GoogleAuthModal isOpen={isGoogleModalOpen} onClose={() => setIsGoogleModalOpen(false)} />
    </div>
  );
}
