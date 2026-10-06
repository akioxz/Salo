---
name: expo-react-native-strict
description: "Strict Expo and React Native guidelines. Enforces Expo Router, Reanimated for motion, native module constraints, and performance budgets for mobile."
trigger: model_decision
---

# Expo & React Native Strict Standards

This rule applies automatically whenever you are working on a mobile app using Expo and React Native.

## 1. Routing & Architecture
- **Expo Router:** Use Expo Router (file-based routing in the `app/` directory) for all navigation. Do not use raw React Navigation configurations unless strictly necessary for a highly custom navigator.
- **Deep Linking:** Ensure all routes support deep linking naturally via Expo Router's automatic path resolution.

## 2. Performance & UI
- **FlashList over FlatList:** Always default to `@shopify/flash-list` for lists containing more than 20 items. Avoid standard `FlatList` or `ScrollView` for unbounded data.
- **Motion & Animations:** Use `react-native-reanimated` (v3+) for all animations. Do not use the legacy React Native `Animated` API, as it blocks the JS thread. Use `layout` animations for mount/unmount transitions.
- **Image Handling:** Use `expo-image` instead of the standard `<Image>` component for aggressive caching, blurhashes, and better memory management.
- **Styling:** Use NativeWind (Tailwind for React Native) or StyleSheet.create. Avoid inline styles `{ margin: 10 }` as they cause unnecessary re-renders.

## 3. Device & Platform Interactions
- **Safe Area:** Always wrap top-level screens in `<SafeAreaView>` from `react-native-safe-area-context` (not the default React Native one) to handle notches and dynamic islands.
- **Platform Specifics:** Use `Platform.OS` or `Platform.select` sparingly. Prefer unified designs. When native modules diverge, extract them into `.ios.tsx` and `.android.tsx` files rather than heavily branching inside components.
- **Keyboard Handling:** Use `KeyboardAvoidingView` or `react-native-keyboard-aware-scroll-view` for all text input screens to prevent the keyboard from obscuring inputs.

## 4. Supabase & State on Mobile
- **AsyncStorage:** Ensure Supabase is configured with a custom storage adapter (like `expo-secure-store` or `AsyncStorage`) for session persistence, as mobile lacks standard browser cookies.
- **Offline States:** Always account for sudden network drops. Provide loading states (`ActivityIndicator` or skeletons) and error boundaries for all data fetching.

## 5. Build & Native Modules
- **Prebuild First:** Prefer Expo Go for pure JS development, but default to Continuous Native Generation (CNG) via `expo prebuild` when custom native code is required. Avoid dropping down to bare React Native workflows manually.
- **EAS Config:** Keep `app.json` clean and maintain different environments (dev, preview, prod) using `eas.json` profiles.
