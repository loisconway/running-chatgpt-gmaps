import { Platform } from "react-native";

/**
 * Check if the code is running in a web environment
 */
export const isWeb = Platform.OS === "web";

/**
 * Check if the code is running in a native iOS environment
 */
export const isIOS = Platform.OS === "ios";

/**
 * Check if the code is running in a native Android environment
 */
export const isAndroid = Platform.OS === "android";

/**
 * Check if the code is running in any native environment (iOS or Android)
 */
export const isNative = isIOS || isAndroid;

/**
 * Helps with conditional imports for platform-specific code
 * @param webModule - The module to use on web
 * @param nativeModule - The module to use on native platforms
 */
export function platformSelect<T>(webModule: T, nativeModule: T): T {
  return isWeb ? webModule : nativeModule;
}
