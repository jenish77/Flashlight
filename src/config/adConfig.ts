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
  // [1] App Open Ad Unit ID (Paste your Android App Open ID here)
  appOpenAdUnitId: '',

  // [2] Exit Interstitial Ad Unit ID (Paste your Android Interstitial ID here)
  exitInterstitialAdUnitId: '',

  // [3] Banner Ad Unit ID (Optional: paste your Banner Ad ID here)
  bannerAdUnitId: '',
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
    if (USER_ADMOB_IDS.appOpenAdUnitId) {
      return USER_ADMOB_IDS.appOpenAdUnitId;
    }
    if (Platform.OS === 'android') {
      return (
        process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_OPEN_ID ||
        GOOGLE_TEST_IDS.android.appOpen
      );
    }
    if (Platform.OS === 'ios') {
      return (
        process.env.EXPO_PUBLIC_ADMOB_IOS_APP_OPEN_ID ||
        GOOGLE_TEST_IDS.ios.appOpen
      );
    }
    return '';
  },

  // [2] Exit Full-Screen Interstitial Ad Unit ID (Close / Exit)
  get exitInterstitialAdUnitId(): string {
    if (USER_ADMOB_IDS.exitInterstitialAdUnitId) {
      return USER_ADMOB_IDS.exitInterstitialAdUnitId;
    }
    if (Platform.OS === 'android') {
      return (
        process.env.EXPO_PUBLIC_ADMOB_ANDROID_EXIT_INTERSTITIAL_ID ||
        GOOGLE_TEST_IDS.android.interstitial
      );
    }
    if (Platform.OS === 'ios') {
      return (
        process.env.EXPO_PUBLIC_ADMOB_IOS_EXIT_INTERSTITIAL_ID ||
        GOOGLE_TEST_IDS.ios.interstitial
      );
    }
    return '';
  },

  // [3] Anchored Banner Ad Unit ID (Bottom of screen)
  get bannerAdUnitId(): string {
    if (USER_ADMOB_IDS.bannerAdUnitId) {
      return USER_ADMOB_IDS.bannerAdUnitId;
    }
    if (Platform.OS === 'android') {
      return (
        process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID ||
        GOOGLE_TEST_IDS.android.banner
      );
    }
    if (Platform.OS === 'ios') {
      return (
        process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID ||
        GOOGLE_TEST_IDS.ios.banner
      );
    }
    return '';
  },

  // App Open Ad Frequency Capping (Minimum interval between App Open ads in milliseconds)
  appOpenAdIntervalMs: 4 * 60 * 60 * 1000,

  // Max wait time during launch for ad ready before giving up and proceeding immediately
  maxLaunchWaitMs: 1200,
};
