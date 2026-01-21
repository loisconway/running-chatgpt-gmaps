import type React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = "Loading...",
}) => {
  if (!visible) return null;

  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color="#4285F4" />
      <ThemedText style={styles.loadingText}>{message}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
});

export default LoadingOverlay;
