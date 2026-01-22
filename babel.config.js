module.exports = (api) => {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Support for react-native-reanimated
      // "react-native-reanimated/plugin",

      // Module resolver for path aliases
      [
        "module-resolver",
        {
          root: ["./"],
          extensions: [
            ".ios.js",
            ".android.js",
            ".native.js",
            ".js",
            ".ios.jsx",
            ".android.jsx",
            ".native.jsx",
            ".jsx",
            ".ios.ts",
            ".android.ts",
            ".native.ts",
            ".ts",
            ".ios.tsx",
            ".android.tsx",
            ".native.tsx",
            ".tsx",
            ".web.js",
            ".web.jsx",
            ".web.ts",
            ".web.tsx",
            ".json",
          ],
          alias: {
            "@": "./",
            // When on web, replace react-native-maps with an empty module
            ...(process.env.PLATFORM === "web"
              ? {
                  "react-native-maps": "./empty-module.js",
                  "@vis.gl/react-google-maps": "./empty-module.js",
                }
              : {}),
          },
        },
      ],

      // Support for environment variables
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
