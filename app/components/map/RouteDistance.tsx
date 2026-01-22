/**
 * Component to display the route distance overlay on the map
 * I have stopped using this because I added a different modal for showing route details
 * Will remove at some point
 */

import type React from "react";
import { View, StyleSheet } from "react-native";
import { Navigation } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";

interface RouteDistanceProps {
  distance: string;
  isFullScreen: boolean;
}

const RouteDistance: React.FC<RouteDistanceProps> = ({
  distance,
  isFullScreen,
}) => {
  if (!distance) return null;

  return (
    <View
      style={[
        styles.distanceOverlay,
        isFullScreen
          ? styles.distanceOverlayFullScreen
          : styles.distanceOverlayNormal,
      ]}
    >
      <ThemedText style={styles.distanceText}>
        <Navigation size={14} color="#fff" style={styles.distanceIcon} />{" "}
        {distance}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  distanceOverlay: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  distanceOverlayNormal: {
    top: 16,
    left: 16,
  },
  distanceOverlayFullScreen: {
    top: 70,
    left: 16,
  },
  distanceText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  distanceIcon: {
    marginRight: 4,
  },
});

export default RouteDistance;
