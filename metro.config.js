// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add platform-specific extensions
config.resolver.sourceExts = ["js", "jsx", "ts", "tsx", "json"];

// Add platform-specific extensions based on platform
if (process.env.PLATFORM === "web") {
  config.resolver.sourceExts.unshift("web.tsx", "web.ts", "web.jsx", "web.js");
} else {
  config.resolver.sourceExts.unshift(
    "native.tsx",
    "native.ts",
    "native.jsx",
    "native.js",
    "ios.tsx",
    "ios.ts",
    "ios.jsx",
    "ios.js",
    "android.tsx",
    "android.ts",
    "android.jsx",
    "android.js"
  );
}

// Add resolver for platform-specific modules
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// Add resolver for problematic modules
config.resolver.extraNodeModules = {
  "@vis.gl/react-google-maps": path.resolve(__dirname, "./empty-module.js"),
  "@googlemaps/markerclusterer": path.resolve(__dirname, "./empty-module.js"),
};

// Prevent Metro from watching node_modules
config.watchFolders = [path.resolve(__dirname)];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];

module.exports = config;
