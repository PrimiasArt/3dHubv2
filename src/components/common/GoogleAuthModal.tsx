'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, CheckCircle, Sparkles, Shield, ArrowRight, Wallet } from 'lucide-react';
import { useUserSession } from '@/hooks/useUserSession';
import { useUserWallet } from '@/hooks/useUserWallet';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoogleAuthModal({ isOpen, onClose }: GoogleAuthModalProps) {
  const { currentUser, switchUser, refreshSession, showToast } = useUserSession();
  const { topUpBalance } = useUserWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('maker.google@gmail.com');
  const [googleName, setGoogleName] = useState('Phạm Minh Maker (Google)');

  if (!isOpen) return null;

  const handleGoogleSignIn = async (presetUser?: string) => {
    setIsAuthenticating(true);
    try {
      // Simulate real Google OAuth 2.0 handshake
      await new Promise((resolve) => setTimeout(resolve, 800));

      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_user',
          name: googleName,
          email: googleEmail,
          role: 'user',
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        // Tặng 50.000 đ credit ví khi đăng nhập Google lần đầu
        await topUpBalance(50000);
        showToast(`🎉 Chào mừng ${googleName}! Đã đăng nhập thành công với Google.`);
      } else {
        // Fallback switch to existing user
        await switchUser(presetUser || 'usr-customer-1');
        showToast('Đã đăng nhập thành công bằng tài khoản Google!');
      }

      refreshSession();
      onClose();
    } catch (err: any) {
      showToast(`Lỗi đăng nhập Google: ${err.message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="vision-glass-panel rounded-[36px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/20 text-white space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header with Google G Logo */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center mx-auto border border-white/30 p-3">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
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
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            Đăng Nhập Với Google
          </h3>
          <p className="text-xs text-white/70 max-w-xs mx-auto">
            Trải nghiệm dựng hình AI 3D, theo dõi tiến độ xưởng in 24h và quản lý ví điện tử 3D Hub chỉ với 1 chạm.
          </p>
        </div>

        {/* Benefits Pill */}
        <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2 text-xs text-white/80">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Ưu đãi thành viên Google mới:</span>
          </div>
          <ul className="space-y-1 text-[11px] text-white/70 list-disc list-inside">
            <li>Tặng ngay <strong>50.000 đ</strong> vào ví để thử nghiệm in 3D</li>
            <li>Tự động đồng bộ ảnh đại diện và email Google</li>
            <li>Lưu trữ không giới hạn các mô hình 3D sinh bằng AI</li>
          </ul>
        </div>

        {/* Primary 1-Click Google Sign In Button */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => handleGoogleSignIn()}
            disabled={isAuthenticating}
            className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-[0_8px_24px_rgba(255,255,255,0.2)] active:scale-95 disabled:opacity-50"
          >
            {isAuthenticating ? (
              <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
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
            )}
            <span>Tiếp tục với Google (@gmail.com)</span>
          </button>

          <p className="text-[10px] text-center text-white/50">
            Bằng việc tiếp tục, bạn đồng ý với Điều khoản Dịch vụ &amp; Chính sách Bảo mật của 3D HUB.
          </p>
        </div>
      </div>
    </div>
  );
}
