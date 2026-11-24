import { Platform } from 'react-native';

/**
 * =========================================================================
 * AdMob Configuration & Production Unit IDs
 * =========================================================================
 * 
 * You can provide your two separate AdMob Ad Unit IDs below whenever ready,
 * or configure them through environment variables:
 *  - 1. App Open Ad Unit ID (shown when user opens the app)
 *  - 2. Exit Interstitial Ad Unit ID (full-screen ad shown when exiting app)
 *  - 3. Banner Ad Unit ID (bottom anchored banner)
 * 
 * If left empty, official Google Test Ad Unit IDs are automatically used,
 * ensuring safe testing without policy violations.
 */

export const USER_ADMOB_IDS = {
  // [1] App Open Ad Unit ID (shown when opening the app)
  appOpenAdUnitId: 'ca-app-pub-4691559300152959/4759672854',

  // [2] Exit Interstitial Ad Unit ID (full-screen ad shown when exiting app)
  exitInterstitialAdUnitId: 'ca-app-pub-4691559300152959/8593222066',

  // [3] Banner Ad Unit ID (bottom anchored banner)
  bannerAdUnitId: 'ca-app-pub-4691559300152959/2377052098',
};

/**
 * Official Google AdMob Test Ad Unit IDs
 */
const GOOGLE_TEST_IDS = {
  android: {
    appId: 'ca-app-pub-3940256099942544~3347511713',
    banner: 'ca-app-pub-3940256099942544/6300978111',
    appOpen: 'ca-app-pub-3940256099942544/9257395921',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
  },
  ios: {
    appId: 'ca-app-pub-3940256099942544~1458002511',
    banner: 'ca-app-pub-3940256099942544/2934735716',
    appOpen: 'ca-app-pub-3940256099942544/5575463023',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
  },
};

const isProduction = process.env.EXPO_PUBLIC_ADMOB_ENV === 'production';

export const AdConfig = {
  isProduction,

  // [1] App Open Ad Unit ID (Launch)
  get appOpenAdUnitId(): string {
    if (Platform.OS === 'android') {
      return (
        process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_OPEN_ID ||
        USER_ADMOB_IDS.appOpenAdUnitId ||
        GOOGLE_TEST_IDS.android.appOpen
      );
    }
    if (Platform.OS === 'ios') {
      return (
        process.env.EXPO_PUBLIC_ADMOB_IOS_APP_OPEN_ID ||
        GOOGLE_TEST_IDS.ios.appOpen
      );
    }
    return USER_ADMOB_IDS.appOpenAdUnitId || '';
  },

  // [2] Exit / Action Full-Screen Interstitial Ad Unit ID
  get exitInterstitialAdUnitId(): string {
    if (Platform.OS === 'android') {
      return (
        process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID ||
        USER_ADMOB_IDS.exitInterstitialAdUnitId ||
        GOOGLE_TEST_IDS.android.interstitial
      );
    }
    if (Platform.OS === 'ios') {
      return (
        process.env.EXPO_PUBLIC_ADMOB_IOS_EXIT_INTERSTITIAL_ID ||
        GOOGLE_TEST_IDS.ios.interstitial
      );
    }
    return USER_ADMOB_IDS.exitInterstitialAdUnitId || '';
  },

  // [3] Anchored Banner Ad Unit ID (Bottom of screen)
  get bannerAdUnitId(): string {
    if (Platform.OS === 'android') {
      return (
        process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID ||
        USER_ADMOB_IDS.bannerAdUnitId ||
        GOOGLE_TEST_IDS.android.banner
      );
    }
    if (Platform.OS === 'ios') {
      return (
        process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID ||
        GOOGLE_TEST_IDS.ios.banner
      );
    }
    return USER_ADMOB_IDS.bannerAdUnitId || '';
  },

  // App Open Ad Frequency Capping (0 ms allows reliable ad display on each test launch)
  appOpenAdIntervalMs: 0,

  // Max wait time during launch for ad ready before giving up and proceeding immediately (3000 ms)
  maxLaunchWaitMs: 3000,
};
