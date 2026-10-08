'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppEnvironment, ICommercialConfig, DEFAULT_COMMERCIAL_CONFIG } from '@/backend/domain/config';
import { useUserSession } from './useUserSession';

export function useSystemEnvironment() {
  const { currentUser } = useUserSession();
  const isAdmin = currentUser?.role === 'admin';

  const [environment, setEnvironment] = useState<AppEnvironment>('staging');
  const [commercial, setCommercial] = useState<ICommercialConfig>(DEFAULT_COMMERCIAL_CONFIG);
  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const fetchEnvironment = useCallback(async () => {
    try {
      const res = await fetch('/api/system/environment');
      const data = await res.json();
      if (res.ok && data.success) {
        setEnvironment(data.environment);
        if (data.commercial) setCommercial(data.commercial);
        if (data.profitMarginPercent !== undefined) setProfitMarginPercent(data.profitMarginPercent);
        if (typeof document !== 'undefined') {
          const appliedEnv = isAdmin ? data.environment : 'official';
          document.documentElement.setAttribute('data-env', appliedEnv);
        }
      }
    } catch (err) {
      console.error('Failed to fetch system environment:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchEnvironment();

    const handleEnvChanged = (e: any) => {
      if (e.detail?.environment) {
        setEnvironment(e.detail.environment);
        if (typeof document !== 'undefined') {
          const appliedEnv = isAdmin ? e.detail.environment : 'official';
          document.documentElement.setAttribute('data-env', appliedEnv);
        }
      }
    };
    window.addEventListener('3dhub-environment-change', handleEnvChanged);
    return () => window.removeEventListener('3dhub-environment-change', handleEnvChanged);
  }, [fetchEnvironment, isAdmin]);

  // Nút chuyển đổi môi trường chỉ Admin mới thực hiện được
  const toggleEnvironment = useCallback(
    async (target?: AppEnvironment): Promise<boolean> => {
      if (!isAdmin) {
        showToast('Chỉ Quản trị viên (Admin) mới có quyền chuyển đổi môi trường!');
        return false;
      }

      setIsSwitching(true);
      const nextEnv: AppEnvironment = target || (environment === 'official' ? 'staging' : 'official');
      try {
        const res = await fetch('/api/system/environment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ environment: nextEnv }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setEnvironment(nextEnv);
          showToast(data.message || `Đã chuyển sang môi trường: ${nextEnv.toUpperCase()}`);

          if (typeof window !== 'undefined') {
            document.documentElement.setAttribute('data-env', nextEnv);
            window.dispatchEvent(
              new CustomEvent('3dhub-environment-change', { detail: { environment: nextEnv } })
            );
          }
          return true;
        } else {
          showToast(`Lỗi: ${data.error || 'Không thể chuyển đổi môi trường'}`);
          return false;
        }
      } catch (err: any) {
        showToast(`Lỗi kết nối: ${err.message}`);
        return false;
      } finally {
        setIsSwitching(false);
      }
    },
    [environment, isAdmin, showToast]
  );

  // Đối với các role khác ngoài Admin, luôn mặc định là Official
  const effectiveEnv: AppEnvironment = isAdmin ? environment : 'official';
  const effectiveIsOfficial = effectiveEnv === 'official';
  const effectiveIsStaging = effectiveEnv === 'staging';

  return {
    environment: effectiveEnv,
    rawEnvironment: environment,
    isOfficial: effectiveIsOfficial,
    isStaging: effectiveIsStaging,
    commercial,
    profitMarginPercent: effectiveIsOfficial ? (commercial?.commercialMarginPercent || 25) : profitMarginPercent,
    isLoading,
    isSwitching,
    toastMessage,
    showToast,
    isAdmin,
    refreshEnvironment: fetchEnvironment,
    toggleEnvironment,
  };
}
