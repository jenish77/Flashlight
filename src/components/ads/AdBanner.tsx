import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { isAdMobNativeBinaryAvailable, isExpoGo } from '../../utils/environment';
import { AdConfig } from '../../config/adConfig';

interface AdBannerProps {
  /**
   * Optional custom style for container
   */
  style?: object;
  /**
   * Whether to display a preview placeholder in Expo Go / Dev mode
   */
  showPlaceholderInDev?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  style,
  showPlaceholderInDev = true,
}) => {
  const [adError, setAdError] = useState<boolean>(false);
  const [BannerComponent, setBannerComponent] = useState<any>(null);
  const [BannerSize, setBannerSize] = useState<any>(null);
  const [currentUnitId, setCurrentUnitId] = useState<string>(AdConfig.bannerAdUnitId);
  const [hasTriedFallback, setHasTriedFallback] = useState<boolean>(false);

  useEffect(() => {
    // Keep ad unit ID in sync with testing mode
    setCurrentUnitId(AdConfig.bannerAdUnitId);
  }, []);

  useEffect(() => {
    if (!isAdMobNativeBinaryAvailable()) return;

    try {
      // Dynamic guarded load
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mobileAds = require('react-native-google-mobile-ads');
      if (mobileAds && mobileAds.BannerAd && mobileAds.BannerAdSize) {
        setBannerComponent(() => mobileAds.BannerAd);
        setBannerSize(mobileAds.BannerAdSize);
      }
    } catch (e) {
      console.log('[AdBanner] Could not load BannerAd module:', e);
      setAdError(true);
    }
  }, []);

  // When running in Expo Go or environment without native AdMob binary:
  if (!isAdMobNativeBinaryAvailable() || isExpoGo) {
    if (__DEV__ && showPlaceholderInDev) {
      return (
        <View style={[styles.placeholderContainer, style]}>
          <Text style={styles.placeholderBadge}>AdMob 320x50 Banner</Text>
          <Text style={styles.placeholderText}>
            Test Ad appears in standalone release APK on Android device
          </Text>
        </View>
      );
    }
    return null;
  }

  // If module is unavailable or both production & test IDs failed:
  if (!BannerComponent || !BannerSize || adError) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.testFallbackBox}>
          <Text style={styles.testFallbackText}>AdMob Banner (Connecting...)</Text>
        </View>
      </View>
    );
  }

  const handleAdFailedToLoad = (error: any) => {
    console.log(`[AdBanner] Ad failed to load with unit ${currentUnitId}:`, error?.message);
    if (!hasTriedFallback && currentUnitId !== AdConfig.testBannerId) {
      console.log('[AdBanner] Switching to official Google test banner ID...');
      setHasTriedFallback(true);
      setCurrentUnitId(AdConfig.testBannerId);
    } else {
      setAdError(true);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <BannerComponent
        key={currentUnitId}
        unitId={currentUnitId}
        size={BannerSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('[AdBanner] Banner ad successfully loaded & displayed!');
          setAdError(false);
        }}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    height: 52,
    backgroundColor: 'transparent',
  },
  placeholderContainer: {
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    borderStyle: 'dashed',
    marginVertical: 2,
  },
  placeholderBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  placeholderText: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  testFallbackBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#0F172A',
  },
  testFallbackText: {
    fontSize: 10,
    color: '#475569',
  },
});
