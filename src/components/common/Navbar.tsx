'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Box,
  Sparkles,
  TrendingUp,
  Compass,
  Layers,
  Wallet,
  Plus,
  ShoppingBag,
  ShieldAlert,
  ChevronDown,
  UserCheck,
  Building2,
  CheckCircle,
  ExternalLink,
  FlaskConical,
  ShieldCheck,
  ChevronRight,
  Store,
  User,
  Menu,
  X,
  Coins,
} from 'lucide-react';
import { useUserWallet } from '@/hooks/useUserWallet';
import { useUserSession } from '@/hooks/useUserSession';
import { useSystemEnvironment } from '@/hooks/useSystemEnvironment';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { TopUpModal } from '@/components/wallet/TopUpModal';
import { GoogleAuthModal } from '@/components/common/GoogleAuthModal';
import { UserRole } from '@/backend/domain/user';

export function Navbar() {
  const pathname = usePathname();
  const { balanceVnd, isTopUpModalOpen, setIsTopUpModalOpen, topUpBalance } = useUserWallet();
  const { currentUser, permissions, allUsers, switchUser, switchRole, toastMessage } = useUserSession();
  const { isModuleVisible } = useModulePermissions();
  const {
    environment,
    isOfficial,
    isStaging,
    commercial,
    toggleEnvironment,
    isSwitching,
    toastMessage: envToastMessage,
  } = useSystemEnvironment();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Dynamic Navigation Items based on Module Permissions Matrix - Streamlined 3-Pillar Architecture
  const navItems = [
    { label: 'Trang Chủ', href: '/', icon: Box },
  ];
  if (isModuleVisible('studio')) {
    navItems.push({ label: 'AI Studio (Tạo 3D)', href: '/studio', icon: Sparkles });
  }
  if (isModuleVisible('shop')) {
    navItems.push({ label: 'Cửa Hàng & Dịch Vụ In', href: '/shop', icon: ShoppingBag });
  }
  if ((isModuleVisible('seller_hub') || currentUser?.role === 'seller' || permissions.canAccessSeller) && currentUser?.role !== 'user') {
    navItems.push({ label: 'Kênh Người Bán', href: '/seller', icon: Store });
  }
  if (permissions.canAccessAdmin && isModuleVisible('admin_hub')) {
    navItems.push({
      label: 'Quản Trị Hệ Thống',
      href: '/admin',
      icon: Building2,
    });
  }

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          text: 'ADMIN',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
      case 'mod':
        return {
          text: 'MOD',
          bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        };
      case 'seller':
        return {
          text: 'SELLER',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'staff':
        return {
          text: 'STAFF',
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        };
      default:
        return {
          text: 'USER',
          bg: 'bg-white/10 text-white/70 border-white/10',
        };
    }
  };

  const currentBadge = getRoleBadge(currentUser?.role);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        {/* Apple VisionOS Floating Frosted Glass Capsule Bar */}
        <div className="max-w-7xl mx-auto h-16 rounded-full px-3 sm:px-6 flex items-center justify-between vision-glass shadow-[0_16px_40px_rgba(0,0,0,0.35)] border border-white/15 relative">
          {/* Brand Logo with VisionOS Circular Glass Icon */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all shadow-sm group-hover:scale-105">
              <Box className="w-4 h-4 sm:w-5 sm:h-5 text-[#5EEAD4]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-semibold text-sm sm:text-base lg:text-lg tracking-tight text-white">
                  3D HUB
                </span>
                {/* Chỉ hiển thị badge Staging/Official cho Admin, các Role khác luôn là Official */}
                <span
                  className={`px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider rounded-full border transition-all ${
                    isAdmin
                      ? isOfficial
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                        : 'bg-[#2DD4BF]/20 text-[#CCFBF1] border-[#2DD4BF]/40 shadow-[0_0_8px_rgba(45,212,191,0.25)]'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  }`}
                  title={isAdmin ? (isOfficial ? 'Phiên bản thương mại chính thức' : 'Phiên bản thử nghiệm Staging (Ngọc Bích & Cyan)') : '3D Hub Official'}
                >
                  {isAdmin ? (isOfficial ? 'OFFICIAL' : 'STAGING') : 'OFFICIAL'}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - VisionOS Segmented Pill Control (Hidden on Mobile/Tablet to Prevent Breaking) */}
          <nav className="hidden lg:flex items-center p-1 rounded-full bg-black/25 backdrop-blur-xl border border-white/10 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isAdminTab = item.href === '/admin';
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#2DD4BF]/25 backdrop-blur-md text-[#5EEAD4] font-bold border border-[#2DD4BF]/40 shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
                      : 'text-white/70 hover:text-white font-medium hover:bg-white/10'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                      isActive ? 'text-[#5EEAD4]' : 'text-white/60'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isAdminTab && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile, Admin Switcher & VisionOS Wallet Capsule */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Admin Environment Switcher Button (Chỉ hiển thị cho riêng Admin trên desktop) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => toggleEnvironment()}
                disabled={isSwitching}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs border backdrop-blur-md active:scale-95 group ${
                  isOfficial
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-[#0A2E2A]/80 hover:bg-[#12423D] text-[#E6FAF6] border-[#2DD4BF]/50 shadow-[0_0_16px_rgba(45,212,191,0.3)]'
                }`}
                title={`Admin Switcher: Đang ở bản ${isOfficial ? 'Official (Thương Mại)' : 'Staging (Xanh Ngọc Bích & Cyan Pastel)'}. Click để chuyển đổi tức thì!`}
              >
                {isOfficial ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 group-hover:scale-110 transition-transform" />
                    <span className="tracking-tight">OFFICIAL</span>
                    <span className="hidden xl:inline text-[10px] text-emerald-200/70 font-normal">| Live</span>
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-3.5 h-3.5 text-[#5EEAD4] group-hover:scale-110 transition-transform" />
                    <span className="tracking-tight text-[#F0FDFA]">STAGING</span>
                    <span className="hidden xl:inline text-[10px] text-[#99F6E4] font-medium">| Ngọc Bích &amp; Cyan</span>
                  </>
                )}
              </button>
            )}

            {/* VisionOS Glass Wallet Pill Button */}
            {isModuleVisible('wallet') && (
              <button
                onClick={() => setIsTopUpModalOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/15 text-white text-xs font-medium transition-all shadow-xs backdrop-blur-md active:scale-95 group"
                title="Nạp tiền vào ví qua VietQR hoặc MoMo"
              >
                <Wallet className="w-3.5 h-3.5 text-[#5EEAD4] group-hover:scale-110 transition-transform" />
                <span suppressHydrationWarning className="font-semibold text-xs tracking-tight text-white">
                  {new Intl.NumberFormat('en-US').format(currentUser?.walletBalanceVnd ?? balanceVnd)} đ
                </span>
                <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-white text-[10px] hidden sm:flex">
                  <Plus className="w-2.5 h-2.5" />
                </span>
              </button>
            )}

            {/* VisionOS User Profile Trigger */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pr-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/15 transition-all text-left shadow-xs backdrop-blur-md"
              >
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-black/30 border border-white/20 shrink-0">
                  {currentUser?.avatar ? (
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.name || 'User'}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/80 text-xs font-semibold">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>

                <div className="hidden md:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white truncate max-w-[85px]">
                      {currentUser?.name || 'Tài khoản'}
                    </span>
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.2 rounded-full border ${currentBadge.bg}`}
                    >
                      {currentBadge.text}
                    </span>
                  </div>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/60 transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* VisionOS Popover Glass Sheet */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-32px)] rounded-[28px] vision-glass-panel border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.5)] p-4 z-50 space-y-3 text-white animate-fadeIn">
                  {/* Current User Header */}
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-black/40 border border-white/20 shrink-0">
                        {currentUser?.avatar ? (
                          <Image
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-white">
                            {currentUser?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${currentBadge.bg}`}
                          >
                            {currentBadge.text}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/70 truncate">{currentUser?.email}</p>
                        <p className="text-[11px] text-[#5EEAD4] font-semibold mt-0.5">
                          Ví: {(currentUser?.walletBalanceVnd ?? balanceVnd).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    </div>

                    {/* Link to My Profile */}
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="mt-2.5 w-full flex items-center justify-between py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all border border-white/15"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#5EEAD4]" />
                        <span>Hồ Sơ Cá Nhân &amp; Đơn Hàng</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                    </Link>

                    {/* Link to Seller Hub if Seller */}
                    {(currentUser?.role === 'seller' || permissions.canAccessSeller) && (
                      <Link
                        href="/seller"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="mt-1.5 w-full flex items-center justify-between py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-xs font-semibold transition-all border border-amber-400/25"
                      >
                        <div className="flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-amber-300" />
                          <span>Gian Hàng Bán Hàng (Seller)</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-300/60" />
                      </Link>
                    )}

                    {permissions.canAccessAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="mt-1.5 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-all shadow-xs border border-white/15"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Mở Trang Quản Trị Hệ Thống</span>
                      </Link>
                    )}
                  </div>

                  {/* Google Login Fast Button */}
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsGoogleAuthModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Đăng nhập với Google</span>
                    </button>
                  </div>

                  {/* Admin Environment Switcher Section (CHỈ HIỂN THỊ CHO ADMIN) */}
                  {isAdmin && (
                    <div className="p-3 rounded-2xl bg-black/30 border border-white/15 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <Sparkles className="w-3.5 h-3.5 text-[#5EEAD4]" />
                          <span>Môi Trường Vận Hành</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isOfficial
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                              : 'bg-[#2DD4BF]/20 text-[#CCFBF1] border-[#2DD4BF]/40 shadow-[0_0_10px_rgba(45,212,191,0.25)]'
                          }`}
                        >
                          {isOfficial ? 'OFFICIAL' : 'STAGING (NGỌC BÍCH & CYAN)'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
                        <button
                          type="button"
                          onClick={() => toggleEnvironment('staging')}
                          disabled={isSwitching}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isStaging
                              ? 'bg-[#2DD4BF]/30 text-[#F0FDFA] border border-[#2DD4BF]/50 shadow-xs'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          <FlaskConical className="w-3.5 h-3.5 text-[#5EEAD4]" />
                          <span>Staging</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleEnvironment('official')}
                          disabled={isSwitching}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isOfficial
                              ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 shadow-xs'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Official</span>
                        </button>
                      </div>

                      <p className="text-[10px] text-white/60 leading-tight">
                        {isOfficial
                          ? '🌟 Bản Thương Mại: Bảng giá niêm yết thương mại (+25%), VietQR & bảo hành 1 đổi 1.'
                          : '🧪 Bản Staging Sandbox: Giao diện Xanh Ngọc Bích & Cyan Pastel, dữ liệu thử nghiệm, giá gốc 0% phụ thu.'}
                      </p>
                    </div>
                  )}

                  {/* Switch Demo User Section - Collapsible for Admin in Staging */}
                  {isAdmin && isStaging && (
                    <details className="p-2.5 rounded-2xl bg-white/5 border border-white/10 group">
                      <summary className="text-[11px] font-semibold text-[#7ECEC5] cursor-pointer flex items-center justify-between list-none select-none">
                        <span className="flex items-center gap-1.5">
                          <FlaskConical className="w-3.5 h-3.5 text-[#5EEAD4]" />
                          <span>Mở Rộng Sandbox RBAC Test</span>
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180 text-white/50" />
                      </summary>

                      <div className="pt-2.5 space-y-2">
                        <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                          {allUsers.map((u) => {
                            const isCurrent = u.id === currentUser?.id;
                            const badge = getRoleBadge(u.role);
                            return (
                              <button
                                key={u.id}
                                onClick={() => {
                                  switchUser(u.id);
                                  setIsUserMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-1.5 rounded-xl text-left text-xs transition-colors ${
                                  isCurrent
                                    ? 'bg-white/20 border border-white/20 text-white font-semibold'
                                    : 'hover:bg-white/10 text-white/80'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/20">
                                    {u.avatar ? (
                                      <Image src={u.avatar} alt={u.name} fill unoptimized className="object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white">
                                        {u.name?.charAt(0) || 'U'}
                                      </div>
                                    )}
                                  </div>
                                  <span className="font-medium text-[11px] truncate">{u.name}</span>
                                </div>
                                <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${badge.bg}`}>
                                  {badge.text}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all active:scale-95 ml-1"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-[#5EEAD4]" />
              ) : (
                <Menu className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Sheet (Renders smoothly on phones/tablets) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 max-w-7xl mx-auto rounded-[28px] vision-glass-panel border border-[#2DD4BF]/30 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl space-y-3 animate-fadeIn text-white">
            {/* Mobile Navigation Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-[#2DD4BF]/25 text-[#5EEAD4] border-[#2DD4BF]/40 shadow-xs'
                        : 'bg-black/25 text-white/80 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#5EEAD4]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Wallet Button in Mobile Drawer */}
            {isModuleVisible('wallet') && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsTopUpModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-black/35 border border-white/15 text-xs text-white transition-all hover:bg-black/45"
              >
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#5EEAD4]" />
                  <span className="font-semibold">Ví 3D Hub:</span>
                  <span className="font-mono font-bold text-[#5EEAD4]">
                    {(currentUser?.walletBalanceVnd ?? balanceVnd).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#2DD4BF] text-[#051817] font-bold text-[11px] shadow-xs">
                  + Nạp Ví
                </span>
              </button>
            )}

            {/* Admin Switcher in Mobile Drawer */}
            {isAdmin && (
              <div className="p-3 rounded-2xl bg-black/35 border border-white/15 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <FlaskConical className="w-4 h-4 text-[#5EEAD4]" />
                  <span>Môi Trường:</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      isOfficial
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-[#2DD4BF]/20 text-[#CCFBF1] border-[#2DD4BF]/40'
                    }`}
                  >
                    {isOfficial ? 'OFFICIAL' : 'STAGING (NGỌC BÍCH & CYAN)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleEnvironment();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isSwitching}
                  className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 active:scale-95"
                >
                  Đổi sang {isOfficial ? 'Staging' : 'Official'}
                </button>
              </div>
            )}

            {/* Fast Google Login in Mobile Drawer */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsGoogleAuthModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Đăng nhập nhanh với Google</span>
            </button>
          </div>
        )}
      </header>

      {/* VisionOS Floating Notification Capsule */}
      {(envToastMessage || toastMessage) && (
        <div className="fixed bottom-6 right-6 z-50 vision-glass text-white px-5 py-2.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#2DD4BF]/30 flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom-3 duration-300">
          <UserCheck className="w-4 h-4 text-[#5EEAD4] shrink-0" />
          <span>{envToastMessage || toastMessage}</span>
        </div>
      )}

      {/* TopUp Modal with VietQR & MoMo */}
      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        currentBalanceVnd={currentUser?.walletBalanceVnd ?? balanceVnd}
        onTopUp={topUpBalance}
      />

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleAuthModalOpen}
        onClose={() => setIsGoogleAuthModalOpen(false)}
      />
    </>
  );
}
