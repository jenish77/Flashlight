import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Battery from 'expo-battery';
import { BatteryInfo } from '../types';
import { isWeb } from '../utils/environment';

export function useBattery(): BatteryInfo {
  const [level, setLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [isLowPower, setIsLowPower] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  const queryBattery = useCallback(async () => {
    if (isWeb) return;
    try {
      const available = await Battery.isAvailableAsync();
      if (!available) return;

      const [levelVal, stateVal, lowPowerVal] = await Promise.all([
        Battery.getBatteryLevelAsync(),
        Battery.getBatteryStateAsync(),
        Battery.isLowPowerModeEnabledAsync().catch(() => false),
      ]);

      if (levelVal >= 0) {
        const charging =
          stateVal === Battery.BatteryState.CHARGING ||
          stateVal === Battery.BatteryState.FULL;

        const roundedPercent = Math.round(levelVal * 100);

        setLevel(roundedPercent);
        setIsCharging(charging);
        setIsLowPower(!!lowPowerVal);
        setIsAvailable(true);
      }
    } catch {
      // Battery API unavailable on this environment
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let levelSub: Battery.Subscription | null = null;
    let stateSub: Battery.Subscription | null = null;

    // 1. Initial query immediately on mount
    queryBattery();

    // 2. High-frequency polling (every 2.5s) to guarantee real-time sync with phone status bar
    // Android's broadcast receiver often coalesces battery updates; polling ensures exact match
    const interval = setInterval(() => {
      if (isMounted) {
        queryBattery();
      }
    }, 2500);

    // 3. AppState change listener: query immediately whenever app is focused / resumed
    const appStateSub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        queryBattery();
      }
    });

    // 4. Native battery event listeners
    try {
      levelSub = Battery.addBatteryLevelListener(({ batteryLevel }) => {
        if (isMounted && batteryLevel >= 0) {
          setLevel(Math.round(batteryLevel * 100));
        }
      });

      stateSub = Battery.addBatteryStateListener(({ batteryState }) => {
        if (isMounted) {
          const charging =
            batteryState === Battery.BatteryState.CHARGING ||
            batteryState === Battery.BatteryState.FULL;
          setIsCharging(charging);
        }
      });
    } catch {
      // Ignore
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
      appStateSub.remove();
      if (levelSub) levelSub.remove();
      if (stateSub) stateSub.remove();
    };
  }, [queryBattery]);

  return {
    level,
    isCharging,
    isLowPower,
    isAvailable,
    refresh: queryBattery,
  };
}
