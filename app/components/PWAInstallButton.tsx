'use client';

import { useState } from 'react';

interface PWAInstallButtonProps {
  variant?: 'button' | 'menu-item';
  onShowTutorial?: () => void;
}

export default function PWAInstallButton({ variant = 'button', onShowTutorial }: PWAInstallButtonProps) {
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if already installed
  if (typeof window !== 'undefined') {
    const installed = window.matchMedia('(display-mode: standalone)').matches;
    if (installed && !isInstalled) {
      setIsInstalled(true);
    }
  }

  const handleClick = () => {
    if (onShowTutorial) {
      onShowTutorial();
    } else {
      // Remove dismissed flag to show tutorial again
      localStorage.removeItem('pwa-tutorial-dismissed');
      window.location.reload();
    }
  };

  if (isInstalled) {
    return null; // Don't show if already installed
  }

  if (variant === 'menu-item') {
    return (
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-left"
      >
        <span className="material-symbols-outlined text-primary">install_mobile</span>
        <div className="flex-1">
          <div className="font-medium text-on-surface">Install Aplikasi</div>
          <div className="text-xs text-on-surface-variant">Tambahkan ke layar utama</div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
    >
      <span className="material-symbols-outlined text-xl">install_mobile</span>
      <span>Install App</span>
    </button>
  );
}
