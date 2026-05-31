'use client';

import { useEffect } from 'react';

/**
 * Initialises Capacitor native features when running as Android/iOS app.
 * All imports are dynamic — safe to use on web (no-ops gracefully).
 */
export function useNativeApp() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function init() {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        const platform = Capacitor.getPlatform();

        // Status Bar
        try {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#0A0A0A' });
        } catch {}

        // Splash Screen
        try {
          const { SplashScreen } = await import('@capacitor/splash-screen');
          await SplashScreen.hide({ fadeOutDuration: 400 });
        } catch {}

        // Android back button & app state
        if (platform === 'android') {
          try {
            const { App } = await import('@capacitor/app');
            const back = await App.addListener('backButton', ({ canGoBack }) => {
              if (canGoBack) window.history.back();
              else App.minimizeApp();
            });
            const state = await App.addListener('appStateChange', ({ isActive }) => {
              if (isActive) window.dispatchEvent(new CustomEvent('kascore:resume'));
            });
            cleanup = () => { back.remove(); state.remove(); };
          } catch {}
        }
      } catch {}
    }

    init();
    return () => { cleanup?.(); };
  }, []);
}

/**
 * Light haptic tap — silent no-op on web.
 */
export async function hapticTap(): Promise<void> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return;
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
}

/**
 * Success haptic notification — silent no-op on web.
 */
export async function hapticSuccess(): Promise<void> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return;
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
}
