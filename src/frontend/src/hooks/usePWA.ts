import { useState, useEffect } from 'react';

interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installPrompt?: BeforeInstallPromptEvent;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
  });

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newWorker, setNewWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // 检查是否已安装为PWA
    const checkInstalled = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone ||
                         document.referrer.includes('android-app://');

      setPwaStatus(prev => ({ ...prev, isInstalled }));
    };

    // 监听安装提示事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installPrompt = e as BeforeInstallPromptEvent;

      setPwaStatus(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt
      }));
    };

    // 监听网络状态变化
    const handleOnline = () => setPwaStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaStatus(prev => ({ ...prev, isOnline: false }));

    // 监听Service Worker更新
    const handleSWUpdate = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        navigator.serviceWorker.getRegistration()
          .then(registration => {
            if (registration) {
              registration.addEventListener('updatefound', () => {
                const newSW = registration.installing;
                if (newSW) {
                  setNewWorker(newSW);
                  newSW.addEventListener('statechange', () => {
                    if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                      setUpdateAvailable(true);
                    }
                  });
                }
              });
            }
          });
      }
    };

    // 初始化检查
    checkInstalled();
    handleSWUpdate();

    // 事件监听器
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 提示安装
  const promptInstall = async (): Promise<boolean> => {
    if (!pwaStatus.installPrompt) {
      return false;
    }

    try {
      await pwaStatus.installPrompt.prompt();
      const choiceResult = await pwaStatus.installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setPwaStatus(prev => ({
          ...prev,
          isInstallable: false,
          isInstalled: true,
          installPrompt: undefined
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Installation prompt failed:', error);
      return false;
    }
  };

  // 应用更新
  const applyUpdate = async (): Promise<void> => {
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
  };

  return {
    pwaStatus,
    updateAvailable,
    promptInstall,
    applyUpdate
  };
};
