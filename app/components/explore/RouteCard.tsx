import type React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Navigation, Trash2 } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { formatDistanceToNow } from "date-fns";
import type { SavedRoute } from "../../services/routeStorage";

interface RouteCardProps {
  route: SavedRoute;
  onView: (route: SavedRoute) => void;
  onDelete: (routeId: string) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onView, onDelete }) => {
  return (
    <ThemedView style={styles.routeCard}>
      <View style={styles.routeHeader}>
        <ThemedText style={styles.routeName}>{route.name}</ThemedText>
        <ThemedText style={styles.routeDate}>
          {formatDistanceToNow(new Date(route.createdAt), { addSuffix: true })}
        </ThemedText>
      </View>

      <View style={styles.routeDetails}>
        <View style={styles.locationContainer}>
          <View style={styles.locationMarker}>
            <View style={[styles.marker, styles.originMarker]} />
          </View>
          <ThemedText style={styles.locationText} numberOfLines={1}>
            {route.originName}
          </ThemedText>
        </View>

        <View style={styles.routeSeparator}>
          <View style={styles.routeLine} />
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationMarker}>
            <View style={[styles.marker, styles.destinationMarker]} />
          </View>
          <ThemedText style={styles.locationText} numberOfLines={1}>
            {route.destinationName}
          </ThemedText>
        </View>
      </View>

      {route.distance && (
        <View style={styles.distanceBadge}>
          <Navigation size={14} color="#4285F4" />
          <ThemedText style={styles.distanceText}>{route.distance}</ThemedText>
        </View>
      )}

      <View style={styles.routeActions}>
        <TouchableOpacity
          style={[styles.routeButton, styles.viewButton]}
          onPress={() => onView(route)}
        >
          <Navigation size={16} color="#fff" />
          <ThemedText style={styles.buttonText}>View</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.routeButton, styles.deleteButton]}
          onPress={() => onDelete(route.id)}
        >
          <Trash2 size={16} color="#fff" />
          <ThemedText style={styles.buttonText}>Delete</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  routeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  routeName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    color: "#09134d",
  },
  routeDate: {
    fontSize: 12,
    color: "#09134d",
  },
  routeDetails: {
    marginBottom: 16,
    color: "black",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  locationMarker: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  originMarker: {
    backgroundColor: "#4CAF50",
  },
  destinationMarker: {
    backgroundColor: "#F44336",
  },
  locationText: {
    fontSize: 14,
    flex: 1,
    color: "#4285F4",
  },
  routeSeparator: {
    paddingLeft: 12,
    height: 20,
    justifyContent: "center",
  },
  routeLine: {
    height: "100%",
    width: 2,
    backgroundColor: "#ddd",
  },
  routeActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  routeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: "#4285F4",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 12,
    color: "#4285F4",
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default RouteCard;
