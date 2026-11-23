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
   * to ensure layout calculations are accurate
   */
  showPlaceholderInDev?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  style,
  showPlaceholderInDev = true,
}) => {
  const [adError, setAdError] = useState(false);
  const [BannerComponent, setBannerComponent] = useState<any>(null);
  const [BannerSize, setBannerSize] = useState<any>(null);

  useEffect(() => {
    // Only attempt to require if the native binary actually registers RNGoogleMobileAdsModule
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
          <Text style={styles.placeholderBadge}>AdMob Banner</Text>
          <Text style={styles.placeholderText}>
            Visible in standalone / EAS builds (AdMob disabled in Expo Go)
          </Text>
        </View>
      );
    }
    return null;
  }

  // If ad failed to load or module unavailable, safely return null
  if (adError || !BannerComponent || !BannerSize) {
    return null;
  }

  const adUnitId = AdConfig.bannerAdUnitId;
  if (!adUnitId) return null;

  return (
    <View style={[styles.container, style]}>
      <BannerComponent
        unitId={adUnitId}
        size={BannerSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('[AdBanner] Ad failed to load:', error?.message);
          setAdError(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  placeholderContainer: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    borderStyle: 'dashed',
    marginVertical: 4,
  },
  placeholderBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  placeholderText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
});
