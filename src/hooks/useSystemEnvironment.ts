'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppEnvironment, ICommercialConfig, DEFAULT_COMMERCIAL_CONFIG } from '@/backend/domain/config';

export function useSystemEnvironment() {
  const [environment, setEnvironment] = useState<AppEnvironment>('official');
  const [commercial, setCommercial] = useState<ICommercialConfig>(DEFAULT_COMMERCIAL_CONFIG);
  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(25);
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
      }
    } catch (err) {
      console.error('Failed to fetch system environment:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnvironment();

    // Listen to cross-window or local custom event for environment change
    const handleEnvChanged = (e: any) => {
      if (e.detail?.environment) {
        setEnvironment(e.detail.environment);
      }
    };
    window.addEventListener('3dhub-environment-change', handleEnvChanged);
    return () => window.removeEventListener('3dhub-environment-change', handleEnvChanged);
  }, [fetchEnvironment]);

  const toggleEnvironment = useCallback(
    async (target?: AppEnvironment): Promise<boolean> => {
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
          
          // Dispatch global custom event
          if (typeof window !== 'undefined') {
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
    [environment, showToast]
  );

  return {
    environment,
    isOfficial: environment === 'official',
    isStaging: environment === 'staging',
    commercial,
    profitMarginPercent,
    isLoading,
    isSwitching,
    toastMessage,
    showToast,
    refreshEnvironment: fetchEnvironment,
    toggleEnvironment,
  };
}
