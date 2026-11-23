# Luma Torch — React Native App Development Plan

> **Project status:** Planning  
> **Target platform:** Android first; keep the codebase iOS-ready  
> **Framework:** React Native with Expo and TypeScript  
> **Monetization:** Google AdMob  
> **Reference app:** [Flashlight by Splend Apps on Google Play](https://play.google.com/store/apps/details?id=com.splendapps.torch)

---

## 1. Product overview

Build a clean, fast, reliable flashlight utility inspired by the simple one-tap experience of the reference app. The app will have its own visual identity and implementation; it must not copy the reference app's name, logo, screenshots, or proprietary assets.

The main purpose is to let users quickly:

1. Turn the phone's rear LED flashlight on and off.
2. Turn the screen into a light source when a device has no usable LED flash.
3. Increase or decrease the phone screen brightness from inside the app.
4. See a small adaptive banner advertisement on the main screen.
5. Optionally see an AdMob App Open ad during the app's loading/splash experience, subject to frequency and availability rules.

**Critical product principle:** A flashlight is often used when a person needs light immediately. The torch must never wait for an ad, network response, or ad close action. If an ad is unavailable, fails, or is not eligible to show, continue directly to the app.

## 2. Reference-app study

The supplied Google Play reference describes a flashlight that uses the device's camera LED and provides a white-screen fallback on devices without a flash. Its listing also describes quick access options. Splend Apps' feature page additionally describes colour screen light, SOS/strobe, quick access and battery indication.

Reference links:
- [Google Play listing](https://play.google.com/store/apps/details?id=com.splendapps.torch)
- [Splend Apps feature page](https://splendapps.com/apps)

### What to take as product inspiration

- One-tap flashlight operation.
- Clear indication of ON and OFF state.
- Screen-light fallback.
- Simple brightness controls.
- A compact, readable interface.
- A banner placement that does not cover the main controls.

### What will be unique in this project

- A modern, calm dark interface with teal, blue and warm amber accents.
- Dedicated LED Torch and Screen Light modes.
- In-app screen-brightness slider with a live percentage.
- Optional warm, neutral and cool screen-light presets.
- AdMob integration with separate test and production configuration.
- Responsive layouts for compact and large Android devices.

Do not implement extra reference features such as SOS, strobe, widgets or notification shortcuts in the first release unless they are separately approved for scope.

## 3. Generated UI concept

The following image is the visual direction for the first version. It is a design reference, not a finished or production-ready screen.

![Luma Torch app UI concept](./luma-torch-ui.png)

### Visual design system

| Element | Direction |
|---|---|
| Overall style | Modern, minimal, premium dark interface |
| Main background | Deep navy / near-black |
| Primary accent | Clear electric blue |
| Secondary accent | Teal |
| Highlight | Warm amber, used sparingly |
| Text | White for primary text; soft grey for secondary text |
| Cards | Slightly lighter navy surfaces with subtle borders |
| Corners | Rounded, consistent corner radius |
| Controls | Large touch targets and clear ON/OFF feedback |
| Motion | Short, subtle transitions; no distracting animations |

Avoid overly saturated backgrounds, flashing effects, harsh gradients, tiny text, and low-contrast labels. The torch button must be the strongest visual element.

## 4. Main screens and user experience

### 4.1 App launch / loading screen

- Display the app logo and a short loading state.
- Initialize app services without blocking the React Native UI.
- If an eligible App Open ad is already loaded and the frequency rules allow it, it may be shown over the loading screen.
- If the ad is not ready, fails, or takes too long, continue to the home screen.
- Do not show an interstitial ad as a substitute for an App Open ad on app launch.

### 4.2 Home screen

The home screen should contain:

1. App title and settings shortcut.
2. Battery percentage, only if the platform API can provide it reliably.
3. Large central torch power button.
4. Text status: `Torch is ON` or `Torch is OFF`.
5. Mode selector: `LED Torch` and `Screen Light`.
6. Screen brightness slider and current percentage.
7. Optional screen-light colour presets: Warm, Neutral and Cool.
8. Anchored adaptive banner ad at the bottom, with safe spacing.

When LED Torch mode is selected, the brightness slider must be clearly labelled as screen brightness and must not imply that it controls the LED flash intensity. Flash intensity control is device- and API-dependent and is not part of the first-release requirement.

### 4.3 Screen Light mode

- Turn the display into a full-screen light surface.
- Apply the selected screen colour.
- Apply the selected screen brightness.
- Provide a visible, easy-to-reach exit/close control.
- Restore the user's previous system brightness when leaving the mode, where supported.
- Do not leave the screen forced to maximum brightness after the user exits.

### 4.4 Settings screen

Initial settings:
- Theme: System / Dark / Light (dark is the default visual direction).
- Restore previous screen brightness when exiting Screen Light: enabled by default.
- App Open ad frequency preference is controlled by app logic, not exposed as a confusing user setting.
- Privacy policy and app version.

## 5. Functional requirements

### FR-01: LED flashlight

- Use the device's rear camera LED torch.
- Provide a single large ON/OFF control.
- Reflect the actual torch state in the UI.
- Handle devices with no flash unit.
- Handle permission denial with a clear explanation and a route to Android app settings where appropriate.
- Release the camera/torch resource when the app is backgrounded or the screen is unmounted.
- Recover safely from camera-in-use errors or hardware failures.
- Never crash if the device does not support a torch.

### FR-02: Screen Light

- Provide a full-screen white or selected-colour light.
- Include Warm, Neutral and Cool presets.
- Make the selected preset visually obvious.
- Provide a clear exit action.
- Restore the prior brightness setting when exiting, if supported.

### FR-03: Screen brightness

- Provide a slider from 1% to 100% (with a sensible minimum for usability).
- Display the selected percentage.
- Apply brightness changes while the user moves the slider.
- Request or explain any platform permission needed to modify system brightness.
- Handle unsupported APIs and permission denial gracefully.
- Save the user's preferred in-app value locally, but do not overwrite the system brightness unexpectedly.

### FR-04: Responsive UI

- Support small, standard and large Android phones.
- Use safe-area insets and flexible layouts.
- Use scrollable content when the available vertical space is short.
- Keep the torch button visible and easy to reach.
- Keep the banner within the bottom safe area without overlapping controls.
- Respect Android navigation bars, status bars, display cutouts and gesture navigation.
- Use scalable spacing and typography rather than fixed screen coordinates.
- Test portrait mode first; landscape should not break the layout.

### FR-05: Reliability and lifecycle

- Torch state must be reconciled when the app returns from background.
- Stop the torch and release camera resources when appropriate.
- Avoid multiple simultaneous camera sessions.
- Prevent rapid repeated taps from causing race conditions.
- Show user-friendly errors rather than raw native error messages.
- Ensure ads cannot block torch controls or cause app startup failure.

## 6. Technology stack

| Area | Proposed technology | Purpose |
|---|---|---|
| App framework | React Native + Expo | Cross-platform app foundation |
| Language | TypeScript | Safer component and API contracts |
| Navigation | Expo Router | Screen navigation |
| Camera / torch | `expo-camera` | Camera permission and LED torch |
| Screen brightness | `expo-brightness` | Read/change screen brightness where supported |
| Local preferences | `@react-native-async-storage/async-storage` | Save theme and preferred brightness |
| Icons | `@expo/vector-icons` or `lucide-react-native` | Consistent icons |
| Ads | `react-native-google-mobile-ads` | AdMob App Open and banner ads |
| Build | EAS Build | Development APK and Play Store AAB |
| Quality | ESLint + TypeScript | Code quality and type checks |

Use Expo-compatible versions via `npx expo install` wherever available. Confirm package compatibility with the selected Expo SDK before installing.

## 7. Expo Go and native-build strategy

The project should use Expo, but **Expo Go cannot load arbitrary native modules**. The supplied AdMob integration guide correctly describes a safe dual-mode approach: do not statically import the AdMob native module in Expo Go; detect the runtime and disable ads there.

### Stage A — Expo Go

Use Expo Go for:
- Building and refining the React Native UI.
- Navigation and responsive layout checks.
- Testing features supported by the Expo Go runtime.
- Developing the app's ad placeholder layout.

AdMob components must render nothing in Expo Go. The app must still work normally.

### Stage B — Development build / preview APK

Use a custom Expo development build for:
- Testing the actual AdMob native SDK.
- Testing banner loading and App Open ad lifecycle.
- Testing native permission and device behaviour.
- Debugging on a physical Android phone.

### Stage C — Production

Create a signed Android App Bundle (AAB) for Google Play using EAS Build. Use production AdMob IDs only after the app and ad units are configured and verified.

**Important:** A working Expo Go session does not prove that native AdMob works. An APK/development build is required to test real AdMob SDK integration.

## 8. AdMob monetization plan

### 8.1 Ad formats

| Placement | AdMob format | Purpose |
|---|---|---|
| App loading screen | App Open Ad | Optional ad opportunity during app launch/resume |
| Bottom of home screen | Anchored Adaptive Banner | Persistent, compact monetization on the main screen |

Do not use a standard interstitial ad on app launch or app exit. Google's guidance says App Open is the format intended for app loading screens, while interstitials should appear only at natural breaks in linear content. A flashlight utility has no natural page/level breaks, so a persistent banner is the safer initial format.

### 8.2 Important expectation about video ads

An AdMob App Open ad can serve text, image, rich media or video creatives. The app cannot force AdMob to return a video every time. The creative type, availability and close behaviour are controlled by AdMob and its demand sources.

The app also cannot promise that every ad will have the same playback duration or an identical close-button timer. App Open ads may have a short delay before the close option appears. The user must be able to dismiss the ad according to the ad format's rules.

If the requirement is to show **your own fixed promotional video** with a custom close button, that is a separate in-app video experience and is not an AdMob App Open ad. Keep those two concepts separate.

### 8.3 Ad placement and user experience rules

- Do not make the torch wait for an ad to load or finish.
- Do not show a banner on top of an App Open ad.
- Do not show an App Open ad after the user has already reached and started using the main screen.
- Do not show an ad on every rapid foreground/background transition.
- Use a frequency/eligibility rule and a short loading fallback.
- Never simulate, overlay, obscure or reposition AdMob's own close button.
- Never encourage users to click ads.
- Never click live ads during development or testing.
- Use Google's test ad IDs or registered test devices during development.

### 8.4 AdMob IDs and configuration

The developer will provide the real AdMob IDs later. Until then, use Google's official test IDs only.

Keep these values separate:
- Android AdMob App ID — configured in the Expo config plugin.
- iOS AdMob App ID — configured if/when iOS is built.
- Android Banner Ad Unit ID.
- Android App Open Ad Unit ID.
- iOS ad unit IDs if/when iOS is built.

Use environment variables or EAS environment variables for configuration. Do not commit private account credentials or production IDs to a public repository. Ad unit IDs are identifiers, not secret passwords, but still keep environment configuration organized.

### 8.5 Safe Expo Go runtime handling

Follow the supplied `CompleteGuideUsingAdMobwithE.txt` architecture:

- Detect Expo Go using `expo-constants` and `ExecutionEnvironment.StoreClient`.
- Avoid a static top-level import from `react-native-google-mobile-ads`.
- Load the native module only in a non-Expo-Go runtime using a guarded `require`.
- If the native module is unavailable, mark ads as unavailable and render no ad component.
- Initialize the SDK asynchronously; never block the app UI.
- Keep ad configuration in one central module.
- Use Google's test IDs in preview/development builds.
- Switch to production IDs only in the production build profile.

The supplied guide is the implementation reference for this dual-mode ad setup. Verify its package and Expo SDK versions against current package documentation before implementation.

## 9. Suggested project structure

```text
luma-torch/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── screen-light.tsx
│   └── settings.tsx
├── src/
│   ├── components/
│   │   ├── TorchButton.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── BrightnessControl.tsx
│   │   ├── ColorPresetSelector.tsx
│   │   └── ads/
│   │       ├── AdBanner.tsx
│   │       └── AppOpenAdManager.ts
│   ├── config/
│   │   └── adConfig.ts
│   ├── hooks/
│   │   ├── useTorch.ts
│   │   └── useScreenBrightness.ts
│   ├── utils/
│   │   ├── environment.ts
│   │   └── permissions.ts
│   ├── constants/
│   │   ├── colors.ts
│   │   └── layout.ts
│   └── types/
│       └── index.ts
├── assets/
│   ├── icon.png
│   ├── splash.png
│   └── images/
├── app.config.ts
├── eas.json
├── package.json
├── tsconfig.json
└── plan.md
```

This is the proposed structure; adjust it if the selected Expo Router or package versions require a different arrangement.

## 10. Development phases and acceptance criteria

### Phase 1 — Project setup

- Create Expo TypeScript project.
- Configure app name, package identifier, icon and splash screen.
- Add navigation and theme constants.
- Confirm the starter app runs in Expo Go.

**Done when:** App launches without errors on a physical Android phone in Expo Go.

### Phase 2 — UI implementation

- Build the home screen from the generated design direction.
- Build LED Torch / Screen Light mode selector.
- Add brightness slider and colour presets.
- Add settings screen.
- Make layout responsive.

**Done when:** UI works across small, medium and large screen sizes and has no clipped or overlapping controls.

### Phase 3 — Torch and brightness functionality

- Integrate `expo-camera` torch functionality.
- Implement permission handling and unsupported-device fallback.
- Integrate `expo-brightness`.
- Restore prior brightness when leaving Screen Light.
- Handle app lifecycle and camera resource cleanup.

**Done when:** LED torch and screen light work on supported physical devices, and permission/device failures do not crash the app.

### Phase 4 — AdMob integration

- Add `react-native-google-mobile-ads` using the Expo config plugin.
- Implement Expo Go runtime detection.
- Add safe SDK initialization.
- Implement adaptive banner.
- Implement App Open ad manager with loading, show, dismiss, failure and frequency handling.
- Configure test IDs in preview builds.

**Done when:** Expo Go works with ads disabled, and a development/preview APK can show Google test ads without crashing.

### Phase 5 — Device and regression testing

Test:
- First launch and repeated launch.
- Offline launch.
- Ad unavailable / ad load failure.
- Ad shown and dismissed.
- Torch on/off repeatedly.
- Permission denied and permission later granted.
- App background/foreground while torch is on.
- Incoming call or camera use by another app.
- Device without a flash.
- Low battery and low-memory conditions.
- Small and large screens.
- Android gesture and three-button navigation.

**Done when:** No known crash or blocking defect remains in the supported test matrix.

### Phase 6 — Release preparation

- Add final icon, splash and store screenshots.
- Add privacy policy URL and support contact.
- Complete Google Play Data safety and app-content declarations accurately.
- Configure production AdMob App ID and ad unit IDs.
- Build signed AAB using EAS.
- Run an internal testing track before production rollout.

**Done when:** Play Console accepts the AAB and internal testers confirm core functionality and ad behaviour.

## 11. Responsive design requirements

- Use `useWindowDimensions()` for responsive decisions.
- Use `SafeAreaView` / safe-area context for device insets.
- Prefer `flex`, percentages and `maxWidth` constraints over hardcoded screen dimensions.
- Use `ScrollView` for short-height devices.
- Keep the main torch control centred in the available content area.
- Keep buttons at least approximately 44–48 dp high/wide where practical.
- Ensure slider labels and values remain readable at larger font scales.
- Keep banner ad space separate from the main content and navigation area.
- Test Android display-size and font-size accessibility settings.

## 12. Permissions, privacy and safety

- Request camera permission only when the user first activates LED Torch, not unnecessarily at app launch.
- Explain why camera access is needed for the LED flash.
- Do not collect camera images or video; the camera is used only to control the torch.
- Request brightness modification capability only when needed by the platform.
- Include a privacy policy describing AdMob and any data processing accurately.
- Integrate consent/privacy messaging required for the regions where the app is distributed.
- Do not claim that no data is collected until the SDK and Play Console declarations have been reviewed.
- Provide a way to use the core flashlight without signing in or sharing personal information.

## 13. Testing commands

Typical project commands (confirm scripts after project creation):

```bash
# Start the Expo development server
npx expo start

# Start with a cleared Metro cache if needed
npx expo start -c

# Check dependency compatibility
npx expo install --check

# Run linting if configured
npm run lint

# Run TypeScript checks if configured
npx tsc --noEmit

# Install EAS CLI / build a development or preview APK
npx eas-cli@latest build -p android --profile preview

# Build the production Android App Bundle
npx eas-cli@latest build -p android --profile production
```

A native AdMob test requires a custom development build or preview APK, not Expo Go.

## 14. Release checklist

- [ ] App name, icon, splash screen and package ID finalized.
- [ ] LED torch works on supported Android devices.
- [ ] Screen Light works and exits correctly.
- [ ] Brightness slider applies and restores brightness correctly.
- [ ] No UI overlap on supported screen sizes.
- [ ] Camera and brightness permissions have clear explanations.
- [ ] Expo Go does not crash when AdMob is unavailable.
- [ ] Preview APK uses Google test ad IDs.
- [ ] Banner ad loads and does not cover app controls.
- [ ] App Open ad appears only when eligible and never blocks torch availability.
- [ ] Ad failure falls back to the app without a crash.
- [ ] Privacy policy and Play Console declarations are ready.
- [ ] Production IDs are configured only for the production build.
- [ ] Signed AAB passes internal testing.

## 15. Decisions to confirm before implementation

1. **App name:** Working name is `Luma Torch`; choose the final Play Store name before release.
2. **Platform:** Android-first. Keep iOS compatibility in mind, but validate iOS-specific torch and brightness behaviour separately.
3. **Extra modes:** SOS, strobe, notification shortcut and home-screen widget are excluded from version 1.
4. **Launch ads:** Use AdMob App Open ads, not interstitial ads, and only when eligible. Do not force a video creative because AdMob chooses the served creative.
5. **Ad IDs:** Use official Google test IDs until the real App ID and ad unit IDs are supplied.

---

## 16. Source material and documentation

### User-provided implementation guide

- `CompleteGuideUsingAdMobwithE.txt` — use its Expo Go detection, guarded native-module loading, safe SDK initialization, test/production ID separation and banner component approach as the starting architecture.

### Reference app

- [Flashlight — Splend Apps on Google Play](https://play.google.com/store/apps/details?id=com.splendapps.torch)
- [Splend Apps feature page](https://splendapps.com/apps)

### Technical and policy references

- [Expo: Development builds FAQ](https://docs.expo.dev/develop/development-builds/faq/)
- [Expo: Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment/)
- [react-native-google-mobile-ads package / Expo setup](https://www.npmjs.com/package/react-native-google-mobile-ads)
- [AdMob: App Open ad guidance and best practices](https://support.google.com/admob/answer/9341964)
- [AdMob: Disallowed interstitial implementations](https://support.google.com/admob/answer/6201362)
- [AdMob: Interstitial ad guidance](https://support.google.com/admob/answer/6066980)

> **Implementation note:** This document is the project plan and acceptance checklist. It is not the app source code. Check current Expo SDK, library compatibility, Android permission behaviour and AdMob policies again at implementation and release time.
