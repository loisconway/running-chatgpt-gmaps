/**
 * Component to display route statistics in a compact or expanded card
 */

import type React from "react";
import { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Clock, Mountain, Route, X } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";
import ElevationProfile from "./ElevationProfile";

interface ElevationPoint {
  elevation: number;
  distance: number;
}

interface RouteStats {
  distance: string;
  elevation?: string;
  estimatedTime?: string;
  pace?: number;
  elevationProfile?: ElevationPoint[];
  totalDistanceMeters?: number;
}

interface RouteStatsCardProps {
  stats: RouteStats;
  isFullScreen: boolean;
}

const RouteStatsCard: React.FC<RouteStatsCardProps> = ({
  stats,
  isFullScreen,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!stats.distance) return null;

  return isExpanded ? (
    // Expanded view
    <View
      style={[
        styles.expandedContainer,
        isFullScreen
          ? styles.expandedContainerFullScreen
          : styles.expandedContainerNormal,
      ]}
    >
      <View style={styles.expandedHeader}>
        <ThemedText style={styles.expandedTitle}>Route Details</ThemedText>
        <Pressable
          onPress={() => setIsExpanded(false)}
          style={styles.closeButton}
        >
          <X size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Distance Stat */}
      <View style={styles.statRow}>
        <Route size={18} color="#4285F4" />
        <View style={styles.statInfo}>
          <ThemedText style={styles.statLabel}>Distance</ThemedText>
          <ThemedText style={styles.statValue}>{stats.distance}</ThemedText>
        </View>
      </View>

      {/* Time Stat */}
      {stats.estimatedTime && (
        <View style={styles.statRow}>
          <Clock size={18} color="#4285F4" />
          <View style={styles.statInfo}>
            <ThemedText style={styles.statLabel}>
              Est. Time {stats.pace && `(${Math.floor(stats.pace)}:${Math.round((stats.pace % 1) * 60).toString().padStart(2, "0")} min/km pace)`}
            </ThemedText>
            <ThemedText style={styles.statValue}>{stats.estimatedTime}</ThemedText>
          </View>
        </View>
      )}

      {/* Elevation Stat */}
      {stats.elevation && (
        <View style={styles.statRow}>
          <Mountain size={18} color="#4285F4" />
          <View style={styles.statInfo}>
            <ThemedText style={styles.statLabel}>Elevation Gain</ThemedText>
            <View style={styles.elevationContent}>
              <ThemedText style={styles.statValue}>{stats.elevation}</ThemedText>
              {stats.elevationProfile && stats.elevationProfile.length > 1 && stats.totalDistanceMeters && (
                <ElevationProfile
                  elevationData={stats.elevationProfile}
                  totalDistance={stats.totalDistanceMeters}
                />
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  ) : (
    // Compact view
    <Pressable
      onPress={() => setIsExpanded(true)}
      style={[
        styles.compactContainer,
        isFullScreen
          ? styles.compactContainerFullScreen
          : styles.compactContainerNormal,
      ]}
    >
      <Route size={16} color="#4285F4" style={styles.compactIcon} />
      <ThemedText style={styles.compactText}>{stats.distance}</ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Compact view styles
  compactContainer: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRadius: 8,
    padding: 10,
    zIndex: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(66, 133, 244, 0.3)",
  },
  compactContainerNormal: {
    bottom: 10,
    right: 12,
  },
  compactContainerFullScreen: {
    bottom: 30,
    alignSelf: "center",
  },
  compactIcon: {
    marginRight: 2,
  },
  compactText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // Expanded view styles
  expandedContainer: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 12,
    padding: 16,
    zIndex: 50,
    borderWidth: 1,
    borderColor: "rgba(66, 133, 244, 0.3)",
  },
  expandedContainerNormal: {
    bottom: 10,
    right: 12,
    left: 12,
    // maxWidth: 280,
  },
  expandedContainerFullScreen: {
    bottom: 24,
    right: 12,
    left: 12,
  },
  expandedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  expandedTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  closeButton: {
    padding: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  statInfo: {
    flex: 1,

  },
  elevationContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
});

export default RouteStatsCard;
