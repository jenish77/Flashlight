# Luma Torch 🔦

**Luma Torch** is a modern, fast, and reliable flashlight utility built with **React Native**, **Expo SDK 58**, and **TypeScript**, following the product architecture detailed in `plan.md` and user-requested enhancements.

---

## 🌟 Key Features

### 1. One-Tap LED Flashlight & Strobe
- **Instant Control:** Controls the physical rear camera LED torch via `expo-camera`.
- **Automatic Navigation Re-Focus:** Returning to the Home screen from Screen Light or Settings automatically selects **LED Torch** mode.
- **Hardware Strobe & SOS:** Adjustable frequency blinking (1 Hz to 10 Hz) and international Morse code SOS signal (`• • • — — — • • •`).
- **Resource Cleanup:** Shuts off the torch and releases camera access immediately when backgrounded or locked.

### 2. Full-Screen RGB Light & Smooth Transitions
- **Interactive RGB Color Wheel:** Touch and drag across a 360° color spectrum to select any custom hue and saturation, with an intuitive selection indicator.
- **Instant "Reset" Button:** Positioned directly above the color wheel (matching the reference layout) to reset color to clean daylight white.
- **Smooth Rainbow Color Cycle:** Automatic, smooth color fade transition through the entire spectrum with adjustable speed (Relaxing / Normal / Fast).
- **Vibrant RGB Palette Swatches:** Quick access to popular neon and warm hues (Ruby Red, Emerald Green, Neon Cyan, Electric Blue, Vivid Magenta, Warm White, Pure White).
- **RGB Screen Blinking & SOS:** Blink or strobe the entire display in the chosen custom color.
- **Brightness Memory & Restoration:** Remembers user's original system brightness and automatically restores it when leaving Screen Light mode.
- **Distraction-Free Mode:** Single tap anywhere hides all controls for an unobstructed light panel.

### 3. Smooth Transitions (Zero White Flashes)
- Native activity and window background locked to `#080C14` via `expo-system-ui`.
- React Navigation dark theme integration and smooth transitions between Home, Screen Light, and Settings.

### 4. Full-Screen Open & Exit Advertisements (AdMob)
- **Launch / App Open Ad:** Non-blocking launch ad opportunity with intelligent 4-hour frequency capping that never delays flashlight availability.
- **Exit Interstitial Ad (Close App):** Triggers a "Do you want to exit?" dialog matching reference designs upon hardware Back press. Tapping "Yes" presents a full-screen interstitial ad before closing the app.
- **Anchored Bottom Banner:** Persistent, adaptive banner displayed safely above the navigation safe area.
- **Bulletproof Fallback:** If ads are unavailable, offline, or running in Expo Go, the app proceeds immediately without lag or crashes.

---

## 📂 Project Architecture

```text
Flashlight/
├── app/                              # Expo Router file-based screens
│   ├── _layout.tsx                   # SystemUI dark background, Stack theme & ad preload
│   ├── index.tsx                     # Main Home screen (Torch, Strobe, BackHandler exit dialog)
│   ├── screen-light.tsx              # RGB Color Wheel, Rainbow Cycle & Screen Strobe
│   └── settings.tsx                  # User preferences, themes & privacy policy
├── src/
│   ├── components/                   # Modular UI components
│   │   ├── TorchButton.tsx           # Tactile power button with glow effect
│   │   ├── ModeSelector.tsx          # Segmented LED vs Screen Light toggle
│   │   ├── RgbColorWheel.tsx         # Interactive SVG 360° RGB wheel with Reset button
│   │   ├── StrobeControl.tsx         # LED Strobe (1-10Hz) & SOS Morse code panel
│   │   ├── BrightnessControl.tsx     # Screen brightness slider with live %
│   │   ├── ColorPresetSelector.tsx   # Color temperature swatch selector
│   │   ├── BatteryIndicator.tsx      # Real-time battery indicator
│   │   └── ads/
│   │       ├── AdBanner.tsx          # Safe adaptive AdMob banner component
│   │       ├── AppOpenAdManager.ts   # App Open & Exit Interstitial ad manager
│   │       └── ExitAppDialog.tsx     # "Do you want to exit?" confirmation modal
│   ├── config/
│   │   └── adConfig.ts               # Independent Open, Exit & Banner Ad unit configuration
│   ├── constants/
│   │   ├── colors.ts                 # Premium dark & light palettes & presets
│   │   └── layout.ts                 # Touch targets & elevation constants
│   ├── hooks/
│   │   ├── useTorch.tsx              # CameraView torch, Strobe & AppState lifecycle hook
│   │   ├── useScreenBrightness.ts    # Screen brightness adjustment & restoration
│   │   ├── useBattery.ts             # Device battery level & state
│   │   └── useThemePreference.ts     # Dark/light theme management & persistence
│   ├── utils/
│   │   ├── colorUtils.ts             # HSV/RGB conversion algorithms & palettes
│   │   ├── environment.ts            # Safe TurboModule & Expo Go runtime detection
│   │   ├── permissions.ts            # Camera permission checks & alerts
│   │   └── storage.ts                # AsyncStorage user settings helpers
│   └── types/
│       └── index.ts                  # TypeScript types & interfaces
├── app.json                          # Expo configuration & native plugins
├── eas.json                          # EAS build profiles (preview APK & production AAB)
├── package.json                      # Project dependencies & scripts
├── tsconfig.json                     # Strict TypeScript configuration
└── plan.md                           # Master development plan & specifications
```

---

## 🚀 Running & Building

```bash
# 1. Start the Expo development server
npx expo start

# 2. Run TypeScript check
npm run typecheck

# 3. Build standalone preview APK (EAS Build)
npx eas build -p android --profile preview

# 4. Build production Google Play bundle (AAB)
npx eas build -p android --profile production
```
