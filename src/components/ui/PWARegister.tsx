'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useNativeApp } from '@/hooks/useNativeApp';

export function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Init native Capacitor features (status bar, back button, splash hide, haptics)
  useNativeApp();

  useEffect(() => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const nw = reg.installing;
            nw?.addEventListener('statechange', () => {
              if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                toast('🔄 Mise à jour dispo — rechargez');
              }
            });
          });
        })
        .catch(() => {});
    }

    // Capture Android Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      const dismissed = localStorage.getItem('kascore-install-dismissed');
      if (!dismissed) setTimeout(() => setShowBanner(true), 12_000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setInstallPrompt(null);
      localStorage.setItem('kascore-installed', '1');
      toast.success('✅ Kascore installé !');
    });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
  };

  const dismiss = () => {
    setShowBanner(false);
    localStorage.setItem('kascore-install-dismissed', '1');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 md:bottom-6 md:left-auto md:right-6 md:max-w-sm animate-slide-up">
      <div className="bg-[#111111] border border-[#C9A84C]/40 rounded-2xl p-4 shadow-gold-lg flex items-center gap-3">
        <Image src="/logo.png" alt="Kascore" width={44} height={44} className="rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-sm text-[#E8D5A0]">Installer Kascore</div>
          <div className="text-xs text-[#5A4E35] mt-0.5">Accès rapide depuis l'écran d'accueil</div>
        </div>
        <div className="flex flex-col gap-1.5">
          <button onClick={handleInstall}
            className="px-3 py-1.5 gold-gradient-bg text-[#0A0A0A] text-xs font-bold rounded-lg whitespace-nowrap">
            Installer
          </button>
          <button onClick={dismiss}
            className="px-3 py-1 text-[#5A4E35] text-xs hover:text-[#C9A84C] transition-colors text-center">
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
