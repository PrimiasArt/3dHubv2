'use client';

import React, { useState } from 'react';
import { FlaskConical, ChevronDown, ChevronUp, UserCheck, Shield, Wallet, Sparkles, X } from 'lucide-react';
import { useSystemEnvironment } from '@/hooks/useSystemEnvironment';
import { useUserSession } from '@/hooks/useUserSession';
import { useUserWallet } from '@/hooks/useUserWallet';
import { UserRole } from '@/backend/domain/user';

export function StagingSandboxDock() {
  const { isStaging, isAdmin } = useSystemEnvironment();
  const { currentUser, allUsers, switchUser, showToast } = useUserSession();
  const { topUpBalance } = useUserWallet();
  const [isExpanded, setIsExpanded] = useState(false);

  // Ghi nhớ phiên Admin khi Admin bắt đầu test đổi vai trò
  const [hasAdminPrivilege, setHasAdminPrivilege] = useState(false);

  React.useEffect(() => {
    if (currentUser?.role === 'admin') {
      setHasAdminPrivilege(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('3dhub_admin_authorized', 'true');
      }
    } else if (typeof window !== 'undefined' && sessionStorage.getItem('3dhub_admin_authorized') === 'true') {
      setHasAdminPrivilege(true);
    } else {
      setHasAdminPrivilege(false);
    }
  }, [currentUser?.role]);

  // Tuyệt đối chỉ hiển thị trên bản Staging VÀ chỉ dành cho tài khoản Admin (hoặc Admin đang test vai trò khác)
  // Các tài khoản thường (mod, seller, staff, user) không bao giờ nhìn thấy dock hoặc tag chuyển đổi RBAC
  if (!isStaging || !hasAdminPrivilege) return null;

  const isTestingOtherRole = currentUser?.role !== 'admin';

  return (
    <div className="fixed bottom-5 right-5 z-40 animate-fadeIn">
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all active:scale-95 group ${
            isTestingOtherRole
              ? 'bg-amber-950/90 border-amber-400/40 text-amber-200'
              : 'bg-[#0B2523]/90 hover:bg-[#123835] border-[#2DD4BF]/40 text-[#E6FAF6]'
          }`}
          title="Mở bảng điều khiển nhanh Staging Sandbox"
        >
          <FlaskConical className="w-4 h-4 text-[#5EEAD4] group-hover:rotate-12 transition-transform" />
          <span className="text-[#F0FDFA]">
            {isTestingOtherRole ? `Test: ${currentUser?.role?.toUpperCase()}` : 'Staging Sandbox'}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping" />
        </button>
      ) : (
        <div className="w-80 rounded-[28px] vision-glass-panel border border-[#2DD4BF]/35 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-white space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#F0FDFA]">
              <FlaskConical className="w-4 h-4 text-[#5EEAD4]" />
              <span>Staging Sandbox Dock (Admin Only)</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick RBAC Switcher */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-white/70">
              <span>Đổi vai trò test (RBAC):</span>
              <span className="text-[#5EEAD4] font-bold uppercase">{currentUser?.role}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {['admin', 'mod', 'seller', 'staff', 'user'].map((r) => {
                const target = allUsers.find((u) => u.role === r);
                const isSelected = currentUser?.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      if (target) {
                        switchUser(target.id);
                      }
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                      isSelected
                        ? 'bg-[#2DD4BF] text-[#051817] shadow-xs'
                        : 'bg-white/10 hover:bg-white/15 text-white/80'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>

            {/* If currently testing another role, show 1-click return to Admin */}
            {isTestingOtherRole && (
              <button
                onClick={() => {
                  const adminUser = allUsers.find((u) => u.role === 'admin');
                  if (adminUser) switchUser(adminUser.id);
                }}
                className="w-full mt-2 py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold border border-rose-400/30 flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Trở Về Tài Khoản Admin Gốc</span>
              </button>
            )}
          </div>

          {/* Quick Wallet Top Up */}
          <div className="space-y-1.5 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] font-semibold text-white/70">
              <span>Nạp ví Sandbox:</span>
              <span className="text-[#5EEAD4] font-mono font-bold">
                {(currentUser?.walletBalanceVnd ?? 0).toLocaleString('vi-VN')} đ
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => topUpBalance(100000)}
                className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white transition-all text-center"
              >
                +100k
              </button>
              <button
                onClick={() => topUpBalance(500000)}
                className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white transition-all text-center"
              >
                +500k
              </button>
            </div>
          </div>

          <div className="pt-0.5 text-[9px] text-[#7ECEC5] text-center">
            Dock này chỉ hiển thị khi ở bản Staging cho quản trị viên.
          </div>
        </div>
      )}
    </div>
  );
}
