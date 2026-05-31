import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId:   'app.kascore.wc2026',
  appName: 'Kascore',
  webDir:  'out',

  // ── Server (points to Vercel — update with your URL) ──────────────
  server: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://kascore.vercel.app',
    cleartext: false,
    androidScheme: 'https',
  },

  // ── Android ───────────────────────────────────────────────────────
  android: {
    backgroundColor:              '#0A0A0A',
    allowMixedContent:            false,
    captureInput:                 true,
    webContentsDebuggingEnabled:  false,
    loggingBehavior:              'none',
    buildOptions: {
      keystorePath:     process.env.KASCORE_KEYSTORE_PATH     || undefined,
      keystoreAlias:    process.env.KASCORE_KEY_ALIAS         || undefined,
      keystorePassword: process.env.KASCORE_KEYSTORE_PASSWORD || undefined,
      keystoreAliasPassword: process.env.KASCORE_KEY_PASSWORD || undefined,
      releaseType: 'APK',
    },
  },

  // ── Plugins ───────────────────────────────────────────────────────
  plugins: {
    SplashScreen: {
      launchShowDuration:       2500,
      launchAutoHide:           true,
      launchFadeOutDuration:    500,
      backgroundColor:          '#0A0A0A',
      androidSplashResourceName:'splash',
      androidScaleType:         'CENTER_INSIDE',
      showSpinner:              false,
      splashFullScreen:         true,
      splashImmersive:          true,
    },
    StatusBar: {
      style:           'Dark',
      backgroundColor: '#0A0A0A',
      overlaysWebView: false,
    },
    Keyboard: {
      resize:         'body',
      style:          'dark',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon:   'ic_stat_icon_config_sample',
      iconColor:   '#C9A84C',
      sound:       'default',
    },
  },
};

export default config;
