// If you're using Expo, you might need to create or modify webpack.config.js
const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const path = require("path");

module.exports = async (env, argv) => {
  // Set the platform environment variable for conditional imports
  process.env.PLATFORM = "web";

  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add aliases for platform-specific modules
  config.resolve.alias = {
    ...config.resolve.alias,
    "react-native-maps": path.resolve(__dirname, "./empty-module.js"),
  };

  // Add support for .web.js extensions
  config.resolve.extensions = [
    ".web.js",
    ".web.jsx",
    ".web.ts",
    ".web.tsx",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
  ];

  return config;
};
