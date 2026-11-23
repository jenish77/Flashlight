import { Platform, TurboModuleRegistry, NativeModules } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * Utility to reliably detect runtime environment:
 * - Expo Go client (cannot run custom native AdMob modules)
 * - Standalone or Custom Development Build (EAS preview/prod APK)
 * - Web browser
 */

export const isWeb = Platform.OS === 'web';
export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

/**
 * Returns true if running inside the Expo Go app.
 */
export const isExpoGo: boolean =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as unknown as { appOwnership?: string })?.appOwnership === 'expo';

/**
 * Checks if RNGoogleMobileAdsModule is actually registered in the native binary
 * before calling require('react-native-google-mobile-ads').
 *
 * Calling require('react-native-google-mobile-ads') when the native module is not
 * linked causes TurboModuleRegistry.getEnforcing('RNGoogleMobileAdsModule') to throw
 * an uncatchable Invariant Violation.
 *
 * TurboModuleRegistry.get(...) returns null instead of throwing, allowing 100% safe detection.
 */
export function isAdMobNativeBinaryAvailable(): boolean {
  if (isWeb) return false;
  if (isExpoGo) return false;

  try {
    // Check TurboModuleRegistry without throwing
    const turbo =
      typeof TurboModuleRegistry !== 'undefined' && TurboModuleRegistry?.get
        ? TurboModuleRegistry.get('RNGoogleMobileAdsModule')
        : null;
    if (turbo != null) return true;

    // Check legacy bridge NativeModules
    if (
      typeof NativeModules !== 'undefined' &&
      NativeModules &&
      (NativeModules.RNGoogleMobileAdsModule != null ||
        NativeModules.RNGoogleMobileAdsConsentModule != null)
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Ads are only supported in standalone / custom dev builds with the native module present.
 */
export const areAdsSupported: boolean = isAdMobNativeBinaryAvailable();
