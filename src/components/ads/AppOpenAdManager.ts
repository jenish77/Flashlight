import { isAdMobNativeBinaryAvailable } from '../../utils/environment';
import { AdConfig } from '../../config/adConfig';

let isSdkInitialized = false;

// Interstitial / Video Ad State
let interstitialInstance: any = null;
let isInterstitialLoaded = false;
let isInterstitialShowing = false;

// Light toggle counter for 5x toggle trigger
let lightToggleCounter = 0;

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
  if (isSdkInitialized) return true;
  if (!isAdMobNativeBinaryAvailable()) {
    console.log('[AdMob] Native module not present in current environment (e.g. Expo Go).');
    return false;
  }

  try {
    const mobileAds = getMobileAdsModule();
    if (!mobileAds || !mobileAds.default) {
      return false;
    }

    // Configure test devices if needed
    try {
      await mobileAds.default().setRequestConfiguration({
        testDeviceIdentifiers: ['EMULATOR'],
      });
    } catch {
      // Non-critical
    }

    await mobileAds.default().initialize();
    isSdkInitialized = true;
    console.log('[AdMob] Mobile Ads SDK initialized successfully.');

    // Preload an interstitial video ad for the 5x light toggles and exit
    preloadInterstitialAd();
    return true;
  } catch (err) {
    console.warn('[AdMob] Failed to initialize mobile ads SDK:', err);
    return false;
  }
}

// =========================================================================
// [1] LAUNCH FULL-SCREEN VIDEO AD (APP OPEN)
// =========================================================================

/**
 * Loads and plays a full-screen Video Ad when opening the app,
 * matching the user's reference video advertisement (e.g. Angel One).
 * 
 * Has a 3.5-second safety timer: if ad fails or takes too long, it immediately
 * calls onFinish() so the user is never stuck on a black/blank screen!
 */
export function showLaunchVideoAd(onFinish: () => void): void {
  if (!isAdMobNativeBinaryAvailable()) {
    onFinish();
    return;
  }

  let finished = false;
  const finishOnce = () => {
    if (!finished) {
      finished = true;
      onFinish();
    }
  };

  // 3.5s safety timeout
  const safetyTimeout = setTimeout(() => {
    console.log('[AdMob] Launch video ad timeout; entering app.');
    finishOnce();
  }, AdConfig.maxLaunchWaitMs);

  const mobileAds = getMobileAdsModule();
  if (!mobileAds || !mobileAds.InterstitialAd || !mobileAds.AdEventType) {
    clearTimeout(safetyTimeout);
    finishOnce();
    return;
  }

  const { InterstitialAd, AdEventType } = mobileAds;
  const adUnitId = AdConfig.launchVideoAdUnitId;

  try {
    const ad = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    let unsubClosed: (() => void) | null = null;
    let unsubError: (() => void) | null = null;

    const cleanupListeners = () => {
      if (unsubClosed) unsubClosed();
      if (unsubError) unsubError();
    };

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      unsubLoaded();
      try {
        console.log('[AdMob] Launch video ad loaded! Showing full-screen video...');
        ad.show();
      } catch (err) {
        console.warn('[AdMob] Error calling ad.show():', err);
        clearTimeout(safetyTimeout);
        cleanupListeners();
        finishOnce();
      }
    });

    unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[AdMob] Launch video ad completed & closed by user.');
      clearTimeout(safetyTimeout);
      cleanupListeners();
      finishOnce();
      // Preload next interstitial for toggles/exit
      setTimeout(preloadInterstitialAd, 1500);
    });

    unsubError = ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
      console.log('[AdMob] Launch ad failed with unit', adUnitId, ':', error?.message);
      // If production ad failed (no fill), fallback to official Google test video ad
      if (adUnitId !== AdConfig.testVideoAdUnitId) {
        console.log('[AdMob] Falling back to official Google test video ad...');
        try {
          const fallbackAd = InterstitialAd.createForAdRequest(AdConfig.testVideoAdUnitId, {
            requestNonPersonalizedAdsOnly: false,
          });

          const fallbackUnsubLoaded = fallbackAd.addAdEventListener(AdEventType.LOADED, () => {
            fallbackUnsubLoaded();
            fallbackAd.show().catch(() => {
              clearTimeout(safetyTimeout);
              finishOnce();
            });
          });

          const fallbackUnsubClosed = fallbackAd.addAdEventListener(AdEventType.CLOSED, () => {
            clearTimeout(safetyTimeout);
            fallbackUnsubClosed();
            finishOnce();
            setTimeout(preloadInterstitialAd, 1500);
          });

          fallbackAd.addAdEventListener(AdEventType.ERROR, () => {
            clearTimeout(safetyTimeout);
            finishOnce();
          });

          fallbackAd.load();
        } catch {
          clearTimeout(safetyTimeout);
          cleanupListeners();
          finishOnce();
        }
      } else {
        clearTimeout(safetyTimeout);
        cleanupListeners();
        finishOnce();
      }
    });

    ad.load();
  } catch (e) {
    console.warn('[AdMob] Exception loading launch video ad:', e);
    clearTimeout(safetyTimeout);
    finishOnce();
  }
}

// Alias for backwards compatibility
export const tryShowAppOpenAdOnLaunch = showLaunchVideoAd;
export const preloadAppOpenAd = () => {};

// =========================================================================
// [2] INTERSTITIAL VIDEO AD: 5X LIGHT TOGGLES & APP EXIT
// =========================================================================

/**
 * Called every time the user turns ON or turns OFF the flashlight or strobe.
 * Every 5 toggles, it automatically triggers the full-screen video interstitial ad.
 */
export function recordLightToggleAndCheckAd(): void {
  lightToggleCounter += 1;
  console.log(`[AdMob] Light toggle count: ${lightToggleCounter}`);

  if (lightToggleCounter % 5 === 0) {
    console.log('[AdMob] 5th light toggle reached! Showing full-screen advertisement...');
    tryShowInterstitialAd();
  }
}

/**
 * Preloads the full-screen interstitial video ad in background.
 */
export function preloadInterstitialAd(): void {
  if (!isAdMobNativeBinaryAvailable() || isInterstitialShowing) return;

  const mobileAds = getMobileAdsModule();
  if (!mobileAds || !mobileAds.InterstitialAd || !mobileAds.AdEventType) return;

  try {
    const { InterstitialAd, AdEventType } = mobileAds;
    const adUnitId = AdConfig.interstitialAdUnitId;

    interstitialInstance = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    const unsubscribeLoaded = interstitialInstance.addAdEventListener(
      AdEventType.LOADED,
      () => {
        isInterstitialLoaded = true;
        console.log('[AdMob] Interstitial video ad preloaded & ready.');
        unsubscribeLoaded();
      }
    );

    const unsubscribeError = interstitialInstance.addAdEventListener(
      AdEventType.ERROR,
      (error: any) => {
        isInterstitialLoaded = false;
        console.log('[AdMob] Interstitial ad failed to load:', error?.message);
        unsubscribeError();

        // If production ID failed, preload test video ad so next 5th toggle is guaranteed to show
        if (adUnitId !== AdConfig.testVideoAdUnitId) {
          try {
            interstitialInstance = InterstitialAd.createForAdRequest(AdConfig.testVideoAdUnitId, {
              requestNonPersonalizedAdsOnly: false,
            });
            interstitialInstance.addAdEventListener(AdEventType.LOADED, () => {
              isInterstitialLoaded = true;
            });
            interstitialInstance.load();
          } catch {
            setTimeout(preloadInterstitialAd, 10000);
          }
        } else {
          setTimeout(preloadInterstitialAd, 10000);
        }
      }
    );

    interstitialInstance.load();
  } catch (err) {
    console.warn('[AdMob] Exception preloading Interstitial ad:', err);
  }
}

export const preloadExitInterstitialAd = preloadInterstitialAd;

/**
 * Shows the full-screen Interstitial Video Ad (for 5x light toggles or app exit).
 * Calls onComplete() once the ad is closed or immediately if ad is not ready/fails.
 */
export function tryShowInterstitialAd(onComplete?: () => void): void {
  if (!isAdMobNativeBinaryAvailable()) {
    onComplete?.();
    return;
  }

  if (!isInterstitialLoaded || !interstitialInstance) {
    console.log('[AdMob] Interstitial not preloaded yet; loading on demand...');
    // Create and show directly
    const mobileAds = getMobileAdsModule();
    if (!mobileAds || !mobileAds.InterstitialAd || !mobileAds.AdEventType) {
      onComplete?.();
      return;
    }

    const { InterstitialAd, AdEventType } = mobileAds;
    const ad = InterstitialAd.createForAdRequest(AdConfig.interstitialAdUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        setTimeout(preloadInterstitialAd, 1500);
        onComplete?.();
      }
    };

    const safety = setTimeout(finish, 4000);

    ad.addAdEventListener(AdEventType.LOADED, () => {
      try {
        ad.show();
      } catch {
        clearTimeout(safety);
        finish();
      }
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      clearTimeout(safety);
      finish();
    });

    ad.addAdEventListener(AdEventType.ERROR, () => {
      clearTimeout(safety);
      finish();
    });

    ad.load();
    return;
  }

  const mobileAds = getMobileAdsModule();
  const AdEventType = mobileAds?.AdEventType;

  isInterstitialShowing = true;
  isInterstitialLoaded = false;

  let unsubClosed: (() => void) | null = null;
  let unsubError: (() => void) | null = null;

  let finished = false;
  const finishOnce = () => {
    if (!finished) {
      finished = true;
      isInterstitialShowing = false;
      interstitialInstance = null;
      if (unsubClosed) unsubClosed();
      if (unsubError) unsubError();
      setTimeout(preloadInterstitialAd, 1500);
      onComplete?.();
    }
  };

  if (AdEventType) {
    unsubClosed = interstitialInstance.addAdEventListener(AdEventType.CLOSED, finishOnce);
    unsubError = interstitialInstance.addAdEventListener(AdEventType.ERROR, finishOnce);
  }

  const safetyTimeout = setTimeout(finishOnce, 8000);

  try {
    interstitialInstance.show();
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
