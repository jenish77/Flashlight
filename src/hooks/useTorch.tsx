import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { CameraView } from 'expo-camera';
import {
  checkCameraPermission,
  requestCameraPermission,
  showCameraPermissionAlert,
} from '../utils/permissions';
import { isWeb } from '../utils/environment';
import { StrobeMode } from '../types';

export interface UseTorchReturn {
  isOn: boolean;
  isSteadyOn: boolean;
  isStrobeActive: boolean;
  strobeMode: StrobeMode;
  strobeFrequency: number;
  hasPermission: boolean | null;
  isAvailable: boolean;
  error: string | null;
  isTransitioning: boolean;
  toggleTorch: () => Promise<void>;
  toggleStrobe: () => Promise<void>;
  setStrobeMode: (mode: StrobeMode) => void;
  setStrobeFrequency: (freq: number) => void;
  turnOn: () => Promise<void>;
  turnOff: () => Promise<void>;
  startStrobe: () => Promise<void>;
  stopStrobe: () => void;
  CameraComponent: React.ReactNode;
}

// SOS Timings: 3 dots, 3 dashes, 3 dots (unit = 160ms)
const U = 160;
const SOS_STEPS = [
  // S (. . .)
  { on: true, ms: U },
  { on: false, ms: U },
  { on: true, ms: U },
  { on: false, ms: U },
  { on: true, ms: U },
  { on: false, ms: 3 * U },
  // O (- - -)
  { on: true, ms: 3 * U },
  { on: false, ms: U },
  { on: true, ms: 3 * U },
  { on: false, ms: U },
  { on: true, ms: 3 * U },
  { on: false, ms: 3 * U },
  // S (. . .)
  { on: true, ms: U },
  { on: false, ms: U },
  { on: true, ms: U },
  { on: false, ms: U },
  { on: true, ms: U },
  { on: false, ms: 7 * U },
];

export function useTorch(): UseTorchReturn {
  const [isOn, setIsOn] = useState<boolean>(false);
  const [isSteadyOn, setIsSteadyOn] = useState<boolean>(false);
  const [isStrobeActive, setIsStrobeActive] = useState<boolean>(false);
  const [strobeMode, setStrobeModeState] = useState<StrobeMode>('strobe');
  const [strobeFrequency, setStrobeFrequencyState] = useState<number>(3); // 1-10 Hz

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // References for strobe loops and cancellation
  const isStrobeActiveRef = useRef<boolean>(false);
  isStrobeActiveRef.current = isStrobeActive;

  const strobeModeRef = useRef<StrobeMode>('strobe');
  strobeModeRef.current = strobeMode;

  const strobeFrequencyRef = useRef<number>(3);
  strobeFrequencyRef.current = strobeFrequency;

  const strobeTimerRef = useRef<any>(null);
  const sosStepRef = useRef<number>(0);

  // Mutex lock ref
  const lockRef = useRef<boolean>(false);

  const clearStrobeTimers = useCallback(() => {
    if (strobeTimerRef.current) {
      clearTimeout(strobeTimerRef.current);
      clearInterval(strobeTimerRef.current);
      strobeTimerRef.current = null;
    }
  }, []);

  // Initial permission and availability check
  useEffect(() => {
    let isMounted = true;

    async function checkAvailability() {
      if (isWeb) {
        setIsAvailable(false);
        setError('LED Torch is not supported on web browser.');
        return;
      }

      try {
        const granted = await checkCameraPermission();
        if (isMounted) {
          setHasPermission(granted);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to check camera availability');
        }
      }
    }

    checkAvailability();

    return () => {
      isMounted = false;
      clearStrobeTimers();
    };
  }, [clearStrobeTimers]);

  const ensurePermission = useCallback(async (): Promise<boolean> => {
    if (isWeb) {
      setError('Physical LED Torch is unavailable on web.');
      return false;
    }

    let permitted = hasPermission;
    if (!permitted) {
      permitted = await requestCameraPermission();
      setHasPermission(permitted);
    }

    if (!permitted) {
      showCameraPermissionAlert();
      setError('Camera permission is required for the LED torch.');
      return false;
    }

    return true;
  }, [hasPermission]);

  // Turn off all light sources (steady and strobe)
  const turnOff = useCallback(async () => {
    clearStrobeTimers();
    setIsStrobeActive(false);
    setIsSteadyOn(false);
    setIsOn(false);
    setError(null);
  }, [clearStrobeTimers]);

  // AppState listener: turn off torch immediately when app moves to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        console.log('[useTorch] App moved to background; shutting down torch & strobe.');
        turnOff();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [turnOff]);

  // Steady Torch ON
  const turnOn = useCallback(async () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setIsTransitioning(true);

    try {
      const permitted = await ensurePermission();
      if (!permitted) return;

      // Stop any strobe if running
      clearStrobeTimers();
      setIsStrobeActive(false);

      setIsSteadyOn(true);
      setIsOn(true);
      setError(null);
    } catch (err: any) {
      console.warn('[useTorch] Error turning on torch:', err);
      setError(err?.message || 'Could not access flash unit');
      setIsOn(false);
      setIsSteadyOn(false);
    } finally {
      setTimeout(() => {
        setIsTransitioning(false);
        lockRef.current = false;
      }, 150);
    }
  }, [ensurePermission, clearStrobeTimers]);

  const toggleTorch = useCallback(async () => {
    if (isSteadyOn || isStrobeActive) {
      await turnOff();
    } else {
      await turnOn();
    }
  }, [isSteadyOn, isStrobeActive, turnOn, turnOff]);

  // Strobe execution engine
  const runStrobeStep = useCallback(() => {
    if (!isStrobeActiveRef.current) return;

    if (strobeModeRef.current === 'sos') {
      const stepIndex = sosStepRef.current % SOS_STEPS.length;
      const currentStep = SOS_STEPS[stepIndex];
      setIsOn(currentStep.on);
      sosStepRef.current = stepIndex + 1;

      strobeTimerRef.current = setTimeout(() => {
        runStrobeStep();
      }, currentStep.ms);
    } else {
      // Frequency strobe (1 to 10 Hz)
      const freq = strobeFrequencyRef.current;
      const halfPeriodMs = Math.max(50, Math.round(500 / freq));

      setIsOn((prev) => !prev);
      strobeTimerRef.current = setTimeout(() => {
        runStrobeStep();
      }, halfPeriodMs);
    }
  }, []);

  const startStrobe = useCallback(async () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setIsTransitioning(true);

    try {
      const permitted = await ensurePermission();
      if (!permitted) return;

      clearStrobeTimers();
      setIsSteadyOn(false);
      setIsStrobeActive(true);
      sosStepRef.current = 0;
      isStrobeActiveRef.current = true;

      // Start the cycle
      setIsOn(true);
      strobeTimerRef.current = setTimeout(() => {
        runStrobeStep();
      }, strobeModeRef.current === 'sos' ? SOS_STEPS[0].ms : Math.round(500 / strobeFrequencyRef.current));

      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Error starting strobe');
      turnOff();
    } finally {
      setTimeout(() => {
        setIsTransitioning(false);
        lockRef.current = false;
      }, 150);
    }
  }, [ensurePermission, clearStrobeTimers, runStrobeStep, turnOff]);

  const stopStrobe = useCallback(() => {
    clearStrobeTimers();
    setIsStrobeActive(false);
    isStrobeActiveRef.current = false;
    setIsOn(false);
  }, [clearStrobeTimers]);

  const toggleStrobe = useCallback(async () => {
    if (isStrobeActive) {
      stopStrobe();
    } else {
      await startStrobe();
    }
  }, [isStrobeActive, stopStrobe, startStrobe]);

  const setStrobeMode = useCallback(
    (mode: StrobeMode) => {
      setStrobeModeState(mode);
      strobeModeRef.current = mode;
      sosStepRef.current = 0;
      // If currently strobing, restart cycle with new mode
      if (isStrobeActiveRef.current) {
        clearStrobeTimers();
        runStrobeStep();
      }
    },
    [clearStrobeTimers, runStrobeStep]
  );

  const setStrobeFrequency = useCallback(
    (freq: number) => {
      const clamped = Math.max(1, Math.min(10, Math.round(freq)));
      setStrobeFrequencyState(clamped);
      strobeFrequencyRef.current = clamped;
      // If currently strobing, refresh cycle
      if (isStrobeActiveRef.current && strobeModeRef.current === 'strobe') {
        clearStrobeTimers();
        runStrobeStep();
      }
    },
    [clearStrobeTimers, runStrobeStep]
  );

  // Hidden CameraView instance used solely to engage the rear LED torch
  const CameraComponent =
    !isWeb && hasPermission ? (
      <CameraView
        facing="back"
        enableTorch={isOn}
        style={{
          width: 1,
          height: 1,
          opacity: 0,
          position: 'absolute',
          top: -100,
          left: -100,
        }}
        onMountError={(mountErr) => {
          console.warn('[useTorch] Camera mount error:', mountErr);
          setError('Camera hardware error occurred.');
          turnOff();
        }}
      />
    ) : null;

  return {
    isOn,
    isSteadyOn,
    isStrobeActive,
    strobeMode,
    strobeFrequency,
    hasPermission,
    isAvailable,
    error,
    isTransitioning,
    toggleTorch,
    toggleStrobe,
    setStrobeMode,
    setStrobeFrequency,
    turnOn,
    turnOff,
    startStrobe,
    stopStrobe,
    CameraComponent,
  };
}
