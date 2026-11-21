import { Platform } from 'react-native';
import { ANDROID_BLUR_MIN_API } from './tokens';

/**
 * Platform capability probe for backdrop blur.
 *
 * `BlurView` (expo-blur) renders a real blur on iOS and, on web, through CSS
 * `backdrop-filter` — which React Native Web passes straight to the DOM.
 * Android only ships a real blur through an experimental native path that has
 * known performance and rendering costs, so it is deliberately left disabled
 * there: every glass surface keeps a controlled translucent tint and stays
 * readable and smooth on modest devices.
 */
export const BACKDROP_BLUR_SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'web';

/** True when the running Android version *could* blur (kept for diagnostics). */
export const ANDROID_BLUR_CAPABLE =
  Platform.OS === 'android' && Number(Platform.Version) >= ANDROID_BLUR_MIN_API;
