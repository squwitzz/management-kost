'use client';

import { useEffect, useState } from 'react';

type DeviceType = 'ios-safari' | 'android-chrome' | 'android-other' | 'desktop-chrome' | 'desktop-other' | 'unknown';

interface TutorialStep {
  icon: string;
  text: string;
  image?: string;
}

interface PWAInstallTutorialProps {
  autoShow?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function PWAInstallTutorial({ autoShow = true, isOpen, onClose }: PWAInstallTutorialProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('unknown');
  const [steps, setSteps] = useState<TutorialStep[]>([]);

  // Handle external control
  useEffect(() => {
    if (isOpen !== undefined) {
      setShowTutorial(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    // Detect device and browser
    const device = detectDevice();
    setDeviceType(device);
    setSteps(getTutorialSteps(device));

    // Auto show logic
    if (!autoShow) return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if tutorial was dismissed
    const dismissed = localStorage.getItem('pwa-tutorial-dismissed');
    if (dismissed === 'true') {
      return;
    }

    // Show tutorial after 2 seconds
    setTimeout(() => {
      setShowTutorial(true);
    }, 2000);
  }, [autoShow]);

  const detectDevice = (): DeviceType => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isChrome = /Chrome/.test(ua) && !/Edg/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    const isDesktop = !/Mobile|Android|iPhone|iPad|iPod/.test(ua);

    if (isIOS && isSafari) return 'ios-safari';
    if (isAndroid && isChrome) return 'android-chrome';
    if (isAndroid) return 'android-other';
    if (isDesktop && isChrome) return 'desktop-chrome';
    if (isDesktop) return 'desktop-other';
    
    return 'unknown';
  };

  const getTutorialSteps = (device: DeviceType): TutorialStep[] => {
    switch (device) {
      case 'ios-safari':
        return [
          {
            icon: 'touch_app',
            text: 'Tap tombol Share di bagian bawah browser Safari'
          },
          {
            icon: 'add_box',
            text: 'Scroll ke bawah dan pilih "Add to Home Screen"'
          },
          {
            icon: 'edit',
            text: 'Ubah nama aplikasi jika diperlukan, lalu tap "Add"'
          },
          {
            icon: 'check_circle',
            text: 'Aplikasi akan muncul di Home Screen Anda!'
          }
        ];
      
      case 'android-chrome':
        return [
          {
            icon: 'more_vert',
            text: 'Tap menu titik tiga di pojok kanan atas browser'
          },
          {
            icon: 'install_mobile',
            text: 'Pilih "Install app" atau "Add to Home screen"'
          },
          {
            icon: 'check_circle',
            text: 'Tap "Install" pada popup konfirmasi'
          },
          {
            icon: 'home',
            text: 'Aplikasi akan muncul di Home Screen Anda!'
          }
        ];
      
      case 'android-other':
        return [
          {
            icon: 'more_vert',
            text: 'Tap menu browser (biasanya titik tiga atau garis tiga)'
          },
          {
            icon: 'add_to_home_screen',
            text: 'Cari dan pilih opsi "Add to Home screen"'
          },
          {
            icon: 'check_circle',
            text: 'Konfirmasi untuk menambahkan aplikasi'
          }
        ];
      
      case 'desktop-chrome':
        return [
          {
            icon: 'install_desktop',
            text: 'Klik ikon install di address bar (sebelah kanan URL)'
          },
          {
            icon: 'check_circle',
            text: 'Klik "Install" pada popup konfirmasi'
          },
          {
            icon: 'desktop_windows',
            text: 'Aplikasi akan terbuka di window terpisah'
          }
        ];
      
      default:
        return [
          {
            icon: 'info',
            text: 'Cari opsi "Add to Home Screen" atau "Install" di menu browser Anda'
          },
          {
            icon: 'help',
            text: 'Biasanya ada di menu Settings atau Share'
          }
        ];
    }
  };

  const getDeviceName = (): string => {
    switch (deviceType) {
      case 'ios-safari': return 'iPhone/iPad (Safari)';
      case 'android-chrome': return 'Android (Chrome)';
      case 'android-other': return 'Android';
      case 'desktop-chrome': return 'Desktop (Chrome)';
      case 'desktop-other': return 'Desktop';
      default: return 'Device Anda';
    }
  };

  const handleClose = () => {
    setShowTutorial(false);
    localStorage.setItem('pwa-tutorial-dismissed', 'true');
    if (onClose) onClose();
  };

  const handleShowLater = () => {
    setShowTutorial(false);
    if (onClose) onClose();
    // Don't set dismissed flag, so it shows again next time
  };

  if (!showTutorial) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[100] animate-fade-in"
        onClick={handleShowLater}
      />
      
      {/* Tutorial Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-surface-container-lowest rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden pointer-events-auto animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary to-primary-dark p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">install_mobile</span>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
              <h2 className="font-headline font-bold text-2xl mb-1">Install Aplikasi</h2>
              <p className="text-white/90 text-sm">Untuk {getDeviceName()}</p>
            </div>
          </div>

          {/* Steps */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-240px)]">
            <p className="text-on-surface-variant text-sm mb-6">
              Ikuti langkah-langkah berikut untuk menambahkan aplikasi ke layar utama:
            </p>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">{step.icon}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-start gap-2">
                      <span className="font-headline font-bold text-primary text-sm">Step {index + 1}</span>
                    </div>
                    <p className="text-on-surface text-sm mt-1 leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="mt-6 p-4 bg-secondary-container/30 rounded-2xl border border-secondary/20">
              <h3 className="font-headline font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-secondary">star</span>
                Keuntungan Install Aplikasi
              </h3>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-secondary mt-0.5">check_circle</span>
                  <span>Akses lebih cepat tanpa buka browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-secondary mt-0.5">check_circle</span>
                  <span>Notifikasi real-time untuk update penting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-secondary mt-0.5">check_circle</span>
                  <span>Pengalaman seperti aplikasi native</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-secondary mt-0.5">check_circle</span>
                  <span>Bisa digunakan offline (fitur tertentu)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-outline-variant/20 bg-surface-container-low">
            <div className="flex gap-3">
              <button
                onClick={handleShowLater}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-primary hover:bg-primary/10 transition-colors"
              >
                Nanti Saja
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-primary text-white hover:opacity-90 transition-opacity shadow-md"
              >
                Mengerti
              </button>
            </div>
            <p className="text-center text-xs text-on-surface-variant mt-3">
              Tutorial ini hanya muncul sekali
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
