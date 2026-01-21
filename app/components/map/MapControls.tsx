import type React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Maximize2, ChevronDown, Navigation } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";
import { ActivityIndicator } from "react-native";

interface MapControlsProps {
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onGetDirections?: () => void;
  loading?: boolean;
  hasOriginAndDestination?: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
  isFullScreen,
  onToggleFullScreen,
  onGetDirections,
  loading = false,
  hasOriginAndDestination = false,
}) => {
  if (!isFullScreen) {
    return (
      <TouchableOpacity
        style={styles.fullScreenButton}
        onPress={onToggleFullScreen}
      >
        <Maximize2 color="#000" size={24} />
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.exitFullScreenButton}
        onPress={onToggleFullScreen}
      >
        <View style={styles.exitButtonContent}>
          <ChevronDown color="#fff" size={20} />
          <ThemedText style={styles.exitButtonText}>
            Exit Full Screen
          </ThemedText>
        </View>
      </TouchableOpacity>

      {hasOriginAndDestination && onGetDirections && (
        <TouchableOpacity
          style={styles.fullScreenRouteButton}
          onPress={onGetDirections}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={styles.routeButtonContent}>
              <Navigation color="#fff" size={20} />
              
            </View>
          )}
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fullScreenButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  exitFullScreenButton: {
    position: "absolute",
    top: 16,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  exitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  exitButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  fullScreenRouteButton: {
    position: "absolute",
    bottom: 30,
    right: 16,
    backgroundColor: "#4285F4",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  routeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  fullScreenButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default MapControls;
