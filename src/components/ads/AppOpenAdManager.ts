import { areAdsSupported, isAdMobNativeBinaryAvailable } from '../../utils/environment';
import { AdConfig } from '../../config/adConfig';
import { getLastAppOpenAdTimestamp, setLastAppOpenAdTimestamp } from '../../utils/storage';

let isInitialized = false;

// [1] App Open Ad States
let appOpenAdInstance: any = null;
let isAppOpenLoaded = false;
let isAppOpenShowing = false;

// [2] Exit Interstitial Ad States
let exitInterstitialInstance: any = null;
let isExitInterstitialLoaded = false;
let isExitInterstitialShowing = false;

/**
 * Dynamically and safely gets the Google Mobile Ads module without
 * breaking Expo Go runtime.
 */
function getMobileAdsModule() {
  if (!isAdMobNativeBinaryAvailable()) {
    return null;
  }
  try {
    // Guarded dynamic require
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require('react-native-google-mobile-ads');
    return module;
  } catch (error) {
    console.log('[AdMob] Native module not available or failed to load:', error);
    return null;
  }
}

/**
 * Initializes the Mobile Ads SDK asynchronously.
 * Never blocks the main thread or UI.
 */
export async function initializeMobileAds(): Promise<boolean> {
  if (isInitialized) return true;
  if (!isAdMobNativeBinaryAvailable()) {
    console.log('[AdMob] Running in Expo Go or environment without native AdMob module; AdMob disabled.');
    return false;
  }

  try {
    const mobileAds = getMobileAdsModule();
    if (!mobileAds || !mobileAds.default) {
      return false;
    }

    await mobileAds.default().initialize();
    isInitialized = true;
    console.log('[AdMob] SDK initialized successfully.');

    // Preload both ads in background
    preloadAppOpenAd();
    preloadExitInterstitialAd();
    return true;
  } catch (err) {
    console.warn('[AdMob] Failed to initialize mobile ads SDK:', err);
    return false;
  }
}

// =========================================================================
// [1] APP OPEN AD (LAUNCH ADVERTISEMENT)
// =========================================================================

/**
 * Preloads an App Open ad in the background
 */
export function preloadAppOpenAd(): void {
  if (!isAdMobNativeBinaryAvailable() || isAppOpenShowing) return;

  const mobileAds = getMobileAdsModule();
  if (!mobileAds || !mobileAds.AppOpenAd || !mobileAds.AdEventType) return;

  try {
    const { AppOpenAd, AdEventType } = mobileAds;
    const adUnitId = AdConfig.appOpenAdUnitId;
    if (!adUnitId) return;

    appOpenAdInstance = AppOpenAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    const unsubscribeLoaded = appOpenAdInstance.addAdEventListener(
      AdEventType.LOADED,
      () => {
        isAppOpenLoaded = true;
        console.log('[AdMob] App Open ad preloaded.');
        unsubscribeLoaded();
      }
    );

    const unsubscribeError = appOpenAdInstance.addAdEventListener(
      AdEventType.ERROR,
      (error: any) => {
        isAppOpenLoaded = false;
        console.log('[AdMob] App Open ad load failed:', error?.message);
        unsubscribeError();
      }
    );

    appOpenAdInstance.load();
  } catch (e) {
    console.warn('[AdMob] Exception preloading App Open ad:', e);
  }
}

async function isEligibleByFrequency(): Promise<boolean> {
  const lastShown = await getLastAppOpenAdTimestamp();
  const now = Date.now();
  if (!lastShown) return true;
  return now - lastShown >= AdConfig.appOpenAdIntervalMs;
}

/**
 * Attempts to display an App Open ad during app launch.
 * Non-blocking: if the ad is not ready within maxLaunchWaitMs,
 * it immediately proceeds to the home screen without waiting!
 */
export async function tryShowAppOpenAdOnLaunch(onFinish: () => void): Promise<void> {
  if (!isAdMobNativeBinaryAvailable()) {
    onFinish();
    return;
  }

  const eligible = await isEligibleByFrequency();
  if (!eligible) {
    console.log('[AdMob] App Open ad skipped due to frequency capping.');
    onFinish();
    return;
  }

  if (isAppOpenLoaded && appOpenAdInstance) {
    showLoadedAppOpenAd(onFinish);
    return;
  }

  let finished = false;
  const finishOnce = () => {
    if (!finished) {
      finished = true;
      onFinish();
    }
  };

  const timeoutTimer = setTimeout(() => {
    console.log('[AdMob] Launch ad timeout reached; proceeding to app without blocking.');
    finishOnce();
  }, AdConfig.maxLaunchWaitMs);

  const mobileAds = getMobileAdsModule();
  if (!mobileAds || !mobileAds.AppOpenAd || !mobileAds.AdEventType) {
    clearTimeout(timeoutTimer);
    finishOnce();
    return;
  }

  const { AppOpenAd, AdEventType } = mobileAds;
  const ad = AppOpenAd.createForAdRequest(AdConfig.appOpenAdUnitId, {
    requestNonPersonalizedAdsOnly: false,
  });

  const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
    clearTimeout(timeoutTimer);
    unsubLoaded();
    if (!finished) {
      appOpenAdInstance = ad;
      isAppOpenLoaded = true;
      showLoadedAppOpenAd(finishOnce);
    }
  });

  const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
    clearTimeout(timeoutTimer);
    unsubError();
    finishOnce();
  });

  try {
    ad.load();
  } catch {
    clearTimeout(timeoutTimer);
    finishOnce();
  }
}

function showLoadedAppOpenAd(onDismiss: () => void): void {
  if (!appOpenAdInstance || !isAppOpenLoaded) {
    onDismiss();
    return;
  }

  const mobileAds = getMobileAdsModule();
  const AdEventType = mobileAds?.AdEventType;

  isAppOpenShowing = true;
  isAppOpenLoaded = false;

  let unsubClosed: (() => void) | null = null;
  let unsubError: (() => void) | null = null;

  const cleanup = () => {
    isAppOpenShowing = false;
    appOpenAdInstance = null;
    if (unsubClosed) unsubClosed();
    if (unsubError) unsubError();
    setLastAppOpenAdTimestamp(Date.now());
    setTimeout(preloadAppOpenAd, 2000);
    onDismiss();
  };

  if (AdEventType) {
    unsubClosed = appOpenAdInstance.addAdEventListener(AdEventType.CLOSED, cleanup);
    unsubError = appOpenAdInstance.addAdEventListener(AdEventType.ERROR, cleanup);
  }

  try {
    appOpenAdInstance.show();
  } catch (err) {
    console.warn('[AdMob] Error showing App Open ad:', err);
    cleanup();
  }
}

// =========================================================================
// [2] INTERSTITIAL AD (FULL-SCREEN AD: 5X LIGHT TOGGLE & APP EXIT)
// =========================================================================

// Counter for user flashlight on/off toggles
let lightToggleCounter = 0;

/**
 * Called every time the user turns ON or turns OFF the light.
 * Every 5 toggles, it automatically triggers the full-screen interstitial ad.
 */
export function recordLightToggleAndCheckAd(): void {
  lightToggleCounter += 1;
  console.log(`[AdMob] Light toggle count: ${lightToggleCounter}`);

  if (lightToggleCounter % 5 === 0) {
    console.log('[AdMob] 5th light toggle reached! Showing interstitial advertisement...');
    tryShowInterstitialAd();
  }
}

/**
 * Preloads the full-screen interstitial ad in background.
 */
export function preloadExitInterstitialAd(): void {
  if (!isAdMobNativeBinaryAvailable() || isExitInterstitialShowing) return;

  const mobileAds = getMobileAdsModule();
  if (!mobileAds || !mobileAds.InterstitialAd || !mobileAds.AdEventType) return;

  try {
    const { InterstitialAd, AdEventType } = mobileAds;
    const adUnitId = AdConfig.exitInterstitialAdUnitId;
    if (!adUnitId) return;

    exitInterstitialInstance = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    const unsubscribeLoaded = exitInterstitialInstance.addAdEventListener(
      AdEventType.LOADED,
      () => {
        isExitInterstitialLoaded = true;
        console.log('[AdMob] Interstitial ad preloaded & ready.');
        unsubscribeLoaded();
      }
    );

    const unsubscribeError = exitInterstitialInstance.addAdEventListener(
      AdEventType.ERROR,
      (error: any) => {
        isExitInterstitialLoaded = false;
        console.log('[AdMob] Interstitial ad failed to load:', error?.message);
        unsubscribeError();
        // Retry preload after 10 seconds
        setTimeout(preloadExitInterstitialAd, 10000);
      }
    );

    exitInterstitialInstance.load();
  } catch (err) {
    console.warn('[AdMob] Exception preloading Interstitial ad:', err);
  }
}

export const preloadInterstitialAd = preloadExitInterstitialAd;

/**
 * Shows the full-screen Interstitial Ad (for 5x light toggles or app exit).
 * Calls onComplete() once the ad is closed or immediately if ad is not ready/fails.
 */
export function tryShowInterstitialAd(onComplete?: () => void): void {
  if (!isAdMobNativeBinaryAvailable()) {
    onComplete?.();
    return;
  }

  if (!isExitInterstitialLoaded || !exitInterstitialInstance) {
    console.log('[AdMob] Interstitial not ready yet; preloading for next event.');
    preloadExitInterstitialAd();
    onComplete?.();
    return;
  }

  const mobileAds = getMobileAdsModule();
  const AdEventType = mobileAds?.AdEventType;

  isExitInterstitialShowing = true;
  isExitInterstitialLoaded = false;

  let unsubClosed: (() => void) | null = null;
  let unsubError: (() => void) | null = null;

  let finished = false;
  const finishOnce = () => {
    if (!finished) {
      finished = true;
      isExitInterstitialShowing = false;
      exitInterstitialInstance = null;
      if (unsubClosed) unsubClosed();
      if (unsubError) unsubError();
      // Preload next interstitial ad immediately for seamless subsequent views
      setTimeout(preloadExitInterstitialAd, 1000);
      onComplete?.();
    }
  };

  if (AdEventType) {
    unsubClosed = exitInterstitialInstance.addAdEventListener(AdEventType.CLOSED, finishOnce);
    unsubError = exitInterstitialInstance.addAdEventListener(AdEventType.ERROR, finishOnce);
  }

  // Safety fallback timer: if ad fails to dismiss within 8 seconds, safely dismiss
  const safetyTimeout = setTimeout(finishOnce, 8000);

  try {
    exitInterstitialInstance.show();
  } catch (e) {
    clearTimeout(safetyTimeout);
    console.warn('[AdMob] Exception showing Interstitial ad:', e);
    finishOnce();
  }
}

/**
 * Shows the full-screen Exit Interstitial Ad when closing the app.
 */
export function tryShowExitInterstitialAd(onComplete: () => void): void {
  tryShowInterstitialAd(onComplete);
}
