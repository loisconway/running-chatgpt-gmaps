// This file replaces app.json for more dynamic configuration
import "dotenv/config";

export default {
  expo: {
    name: "Route Planner",
    slug: "expo-running-chatgpt-gmaps",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.walkingplanner",
      config: {
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "This app uses your location to show routes near you.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.yourcompany.walkingplanner",
      config: {
        googleMaps: {
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
plugins: [
  "expo-font",
  "expo-router",
  "expo-web-browser",
  [
    "expo-location",
    {
      locationAlwaysAndWhenInUsePermission:
        "Allow this app to use your location to show routes near you.",
    },
  ],
  [
    "sentry-expo",
    {
      organization: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    },
  ],
],

    extra: {
      eas: {
        projectId: "your-project-id",
      },
    },
  },
};
