'use client';

import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if dismissed recently (within 24 hours)
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        return;
      }
    }

    // For iOS, show manual install prompt
    if (iOS && !(window.navigator as any).standalone) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return;
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 3 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Show again after 24 hours
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-slide-up">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/10 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">install_mobile</span>
          </div>
          <div className="flex-1">
            <h3 className="font-headline font-bold text-primary mb-1">Install Kost App</h3>
            {isIOS ? (
              <p className="text-sm text-on-surface-variant mb-4">
                Tap <span className="inline-flex items-center mx-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L12 12M12 12L8 8M12 12L16 8M5 15L5 20L19 20L19 15"/></svg></span> lalu pilih "Add to Home Screen"
              </p>
            ) : (
              <p className="text-sm text-on-surface-variant mb-4">
                Install aplikasi untuk akses lebih cepat dan notifikasi real-time
              </p>
            )}
            <div className="flex gap-2">
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Install
                </button>
              )}
              <button
                onClick={handleDismiss}
                className={`${isIOS ? 'flex-1' : ''} px-4 py-2 rounded-lg font-bold text-sm ${isIOS ? 'bg-primary text-white' : 'text-outline hover:bg-surface-container'} transition-colors`}
              >
                {isIOS ? 'Mengerti' : 'Nanti'}
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-outline hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
