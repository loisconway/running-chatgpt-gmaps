import { Platform, View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";

// This is a placeholder component that will be replaced with platform-specific implementations
const MapForUI = () => {
  // For web, we'll use dynamic import to avoid bundling issues
  if (Platform.OS === "web") {
    // Use require instead of import to avoid bundling issues
    const WebMap = require("./getMap.web").default;
    return <WebMap />;
  }

  // For native platforms, show a placeholder
  return (
    <View style={styles.container}>
      <ThemedText>Map visualization is only available on web.</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default MapForUI;
