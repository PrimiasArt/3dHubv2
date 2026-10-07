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
} from 'lucide-react';
import { useUserWallet } from '@/hooks/useUserWallet';
import { useUserSession } from '@/hooks/useUserSession';
import { useSystemEnvironment } from '@/hooks/useSystemEnvironment';
import { TopUpModal } from '@/components/wallet/TopUpModal';
import { UserRole } from '@/backend/domain/user';

export function Navbar() {
  const pathname = usePathname();
  const { balanceVnd, isTopUpModalOpen, setIsTopUpModalOpen, topUpBalance } = useUserWallet();
  const { currentUser, permissions, allUsers, switchUser, switchRole, toastMessage } = useUserSession();
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

  const navItems = [
    { label: 'Studio 3D', href: '/studio', icon: Sparkles },
    { label: 'Cửa Hàng', href: '/shop', icon: ShoppingBag },
    { label: 'Xu Hướng', href: '/trends', icon: TrendingUp },
    { label: 'Crawler', href: '/crawler', icon: Compass },
  ];

  if (permissions.canAccessAdmin) {
    navItems.push({
      label: 'Quản Trị',
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
      case 'staff':
        return {
          text: 'STAFF',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      default:
        return {
          text: 'USER',
          bg: 'bg-white/10 text-white/70 border-white/10',
        };
    }
  };

  const currentBadge = getRoleBadge(currentUser?.role);

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4">
        {/* Apple VisionOS Floating Frosted Glass Capsule Bar */}
        <div className="max-w-7xl mx-auto h-16 rounded-full px-4 sm:px-6 flex items-center justify-between vision-glass shadow-[0_16px_40px_rgba(0,0,0,0.35)] border border-white/15">
          {/* Brand Logo with VisionOS Circular Glass Icon */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all shadow-sm group-hover:scale-105">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base sm:text-lg tracking-tight text-white">
                  3D HUB
                </span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border transition-all ${
                    isOfficial
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                  }`}
                  title={isOfficial ? 'Phiên bản thương mại chính thức' : 'Phiên bản thử nghiệm Staging'}
                >
                  {isOfficial ? 'OFFICIAL' : 'STAGING'}
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation - VisionOS Segmented Pill Control */}
          <nav className="flex items-center p-1 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isAdminTab = item.href === '/admin';
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white/25 backdrop-blur-md text-white font-semibold border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
                      : 'text-white/70 hover:text-white font-medium hover:bg-white/10'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-white/60'
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
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Admin Environment Switcher Button (Chỉ hiển thị cho riêng Admin) */}
            {currentUser?.role === 'admin' && (
              <button
                type="button"
                onClick={() => toggleEnvironment()}
                disabled={isSwitching}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs border backdrop-blur-md active:scale-95 group ${
                  isOfficial
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                }`}
                title={`Admin Switcher: Đang ở bản ${isOfficial ? 'Official (Thương Mại)' : 'Staging (Thử Nghiệm)'}. Click để chuyển đổi tức thì!`}
              >
                {isOfficial ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 group-hover:scale-110 transition-transform" />
                    <span className="tracking-tight">OFFICIAL</span>
                    <span className="hidden xl:inline text-[10px] text-emerald-200/70 font-normal">| Live</span>
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
                    <span className="tracking-tight">STAGING</span>
                    <span className="hidden xl:inline text-[10px] text-amber-200/70 font-normal">| Sandbox</span>
                  </>
                )}
              </button>
            )}

            {/* VisionOS Glass Wallet Pill Button */}
            <button
              onClick={() => setIsTopUpModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/15 text-white text-xs font-medium transition-all shadow-xs backdrop-blur-md active:scale-95 group"
              title="Nạp tiền vào ví qua VietQR hoặc MoMo"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-300 group-hover:scale-110 transition-transform" />
              <span suppressHydrationWarning className="font-semibold text-xs tracking-tight text-white">
                {new Intl.NumberFormat('en-US').format(currentUser?.walletBalanceVnd ?? balanceVnd)} đ
              </span>
              <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-white text-[10px]">
                <Plus className="w-2.5 h-2.5" />
              </span>
            </button>

            {/* VisionOS User Profile Trigger */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/15 transition-all text-left shadow-xs backdrop-blur-md"
              >
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-black/30 border border-white/20 shrink-0">
                  {currentUser?.avatar ? (
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.name}
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
                <div className="absolute right-0 mt-3 w-80 rounded-[28px] vision-glass-panel border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.5)] p-4 z-50 space-y-3.5 text-white">
                  {/* Current User Header */}
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-black/40 border border-white/20 shrink-0">
                        {currentUser?.avatar && (
                          <Image
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
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
                        <p className="text-[11px] text-emerald-300 font-semibold mt-0.5">
                          Ví: {(currentUser?.walletBalanceVnd ?? balanceVnd).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    </div>

                    {permissions.canAccessAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-all shadow-xs border border-white/15"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Mở Trang Quản Trị Hệ Thống</span>
                      </Link>
                    )}
                  </div>

                  {/* Admin Environment Switcher Section (Chỉ hiển thị cho riêng Admin) */}
                  {currentUser?.role === 'admin' && (
                    <div className="p-3 rounded-2xl bg-black/30 border border-white/15 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Môi Trường Vận Hành</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isOfficial
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                          }`}
                        >
                          {isOfficial ? 'OFFICIAL' : 'STAGING'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
                        <button
                          type="button"
                          onClick={() => toggleEnvironment('staging')}
                          disabled={isSwitching}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isStaging
                              ? 'bg-amber-500/30 text-amber-200 border border-amber-400/30 shadow-xs'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
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
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Official</span>
                        </button>
                      </div>

                      <p className="text-[10px] text-white/60 leading-tight">
                        {isOfficial
                          ? '🌟 Đang vận hành bản Thương Mại: Bảng giá niêm yết thương mại (+25%), bảo hành & thanh toán VietQR thật.'
                          : '🧪 Đang ở bản Staging: Dữ liệu thử nghiệm, giá vốn gốc 0% phụ thu và sandbox.'}
                      </p>
                    </div>
                  )}

                  {/* Switch Demo User Section (Hiển thị khi ở Staging hoặc là Admin) */}
                  {(isStaging || currentUser?.role === 'admin') && (
                    <>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 px-1 mb-1.5">
                          Chuyển Tài Khoản (RBAC Sandbox)
                        </p>
                        <div className="space-y-1">
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
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                                  isCurrent
                                    ? 'bg-white/20 border border-white/20 text-white font-semibold'
                                    : 'hover:bg-white/10 text-white/80'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/20">
                                    <Image src={u.avatar} alt={u.name} fill unoptimized className="object-cover" />
                                  </div>
                                  <div className="truncate">
                                    <span className="font-medium block truncate">{u.name}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span
                                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${badge.bg}`}
                                  >
                                    {badge.text}
                                  </span>
                                  {isCurrent && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Switch Direct Role */}
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 px-1 mb-1.5">
                          Đổi Quyền Nhanh (Thử Nghiệm)
                        </p>
                        <div className="grid grid-cols-4 gap-1">
                          {(['admin', 'mod', 'staff', 'user'] as UserRole[]).map((r) => {
                            const isActive = currentUser?.role === r;
                            return (
                              <button
                                key={r}
                                onClick={() => {
                                  switchRole(r);
                                  setIsUserMenuOpen(false);
                                }}
                                className={`py-1 text-[10px] font-semibold rounded-lg uppercase border transition-all ${
                                  isActive
                                    ? 'bg-white/30 border-white/40 text-white shadow-xs'
                                    : 'bg-white/10 border-white/10 text-white/70 hover:text-white hover:bg-white/15'
                                }`}
                              >
                                {r}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* VisionOS Floating Notification Capsule */}
      {(envToastMessage || toastMessage) && (
        <div className="fixed bottom-6 right-6 z-50 vision-glass text-white px-5 py-2.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom-3 duration-300">
          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
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
    </>
  );
}
