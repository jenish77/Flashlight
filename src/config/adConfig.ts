import { Platform } from 'react-native';

/**
 * =========================================================================
 * AdMob Configuration & Production Unit IDs
 * =========================================================================
 */

export const USER_ADMOB_IDS = {
  // Production AdMob App ID
  appId: 'ca-app-pub-4691559300152959~6016914204',

  // [1] App Open Ad Unit ID (shown when user opens the app)
  appOpenAdUnitId: 'ca-app-pub-4691559300152959/4759672854',

  // [2] Exit Interstitial Ad Unit ID (full-screen video ad shown when exiting app / 5x light toggles)
  exitInterstitialAdUnitId: 'ca-app-pub-4691559300152959/8593222066',

  // [3] Banner Ad Unit ID (bottom anchored 320x50 banner)
  bannerAdUnitId: 'ca-app-pub-4691559300152959/2377052098',
};

/**
 * Official Google AdMob Test Ad Unit IDs
 * Guaranteed to always deliver ads during development and testing on real devices.
 */
export const GOOGLE_TEST_IDS = {
  android: {
    appId: 'ca-app-pub-3940256099942544~3347511713',
    banner: 'ca-app-pub-3940256099942544/6300978111', // Shows: "Nice job! This is a 320x50 test ad."
    appOpen: 'ca-app-pub-3940256099942544/9257395921',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    videoInterstitial: 'ca-app-pub-3940256099942544/8691691433', // Full-screen video with sound & timer
  },
  ios: {
    appId: 'ca-app-pub-3940256099942544~1458002511',
    banner: 'ca-app-pub-3940256099942544/2934735716',
    appOpen: 'ca-app-pub-3940256099942544/5575463023',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    videoInterstitial: 'ca-app-pub-3940256099942544/8691691433',
  },
};

/**
 * Test Ads Mode:
 * When testing on an Android device before Google Play release, newly created AdMob IDs
 * return ERROR_CODE_NO_FILL (Code 3: No ad inventory).
 * Setting this to true guarantees that Google Mobile Ads SDK immediately returns:
 * - 320x50 Test Banner ("Nice job! This is a 320x50 test ad.") matching user screenshot
 * - Full-screen Video Interstitial Ad matching user screenshot
 */
let isTestAdsModeActive = true;

export function setTestAdsMode(active: boolean): void {
  isTestAdsModeActive = active;
}

export function getTestAdsMode(): boolean {
  return isTestAdsModeActive;
}

export const AdConfig = {
  get isTestingAds(): boolean {
    return isTestAdsModeActive;
  },

  get testBannerId(): string {
    return Platform.OS === 'android' ? GOOGLE_TEST_IDS.android.banner : GOOGLE_TEST_IDS.ios.banner;
  },

  get testVideoAdUnitId(): string {
    return Platform.OS === 'android' ? GOOGLE_TEST_IDS.android.videoInterstitial : GOOGLE_TEST_IDS.ios.videoInterstitial;
  },

  get testAppOpenId(): string {
    return Platform.OS === 'android' ? GOOGLE_TEST_IDS.android.appOpen : GOOGLE_TEST_IDS.ios.appOpen;
  },

  get testInterstitialId(): string {
    return Platform.OS === 'android' ? GOOGLE_TEST_IDS.android.interstitial : GOOGLE_TEST_IDS.ios.interstitial;
  },

  // Banner Ad Unit ID
  get bannerAdUnitId(): string {
    if (isTestAdsModeActive) {
      return this.testBannerId;
    }
    return (
      process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID ||
      USER_ADMOB_IDS.bannerAdUnitId ||
      this.testBannerId
    );
  },

  // Launch Video Ad Unit ID (plays full-screen video ad when opening the app)
  get launchVideoAdUnitId(): string {
    if (isTestAdsModeActive) {
      return this.testVideoAdUnitId;
    }
    return (
      process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_OPEN_ID ||
      USER_ADMOB_IDS.appOpenAdUnitId ||
      this.testVideoAdUnitId
    );
  },

  // Interstitial Ad Unit ID (5x light toggles and exit)
  get exitInterstitialAdUnitId(): string {
    if (isTestAdsModeActive) {
      return this.testVideoAdUnitId;
    }
    return (
      process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID ||
      USER_ADMOB_IDS.exitInterstitialAdUnitId ||
      this.testVideoAdUnitId
    );
  },

  get interstitialAdUnitId(): string {
    return this.exitInterstitialAdUnitId;
  },

  // Legacy alias
  get appOpenAdUnitId(): string {
    return this.launchVideoAdUnitId;
  },

  // Frequency capping
  appOpenAdIntervalMs: 0,

  // Max wait for launch video ad (3500ms)
  maxLaunchWaitMs: 3500,
};
