import type React from "react";
import { View, StyleSheet } from "react-native";
import { TouchableOpacity, ActivityIndicator } from "react-native";
import { MapPin } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";

import type { LocationType } from "../../hooks/useLocation";
import GooglePlacesInput from "@/app/maps/GooglePlacesInput";

interface LocationInputsProps {
  origin: LocationType | null;
  setOrigin: React.Dispatch<React.SetStateAction<LocationType | null>>;
  destination: LocationType | null;
  setDestination: React.Dispatch<React.SetStateAction<LocationType | null>>;
  onGetDirections: () => void;
  onReset: () => void;
  loading: boolean;
  onMapTapOrigin?: () => void;
  onMapTapDestination?: () => void;
  mapTapMode?: "origin" | "destination" | null;
}

const LocationInputs: React.FC<LocationInputsProps> = ({
  origin,
  setOrigin,
  destination,
  setDestination,
  onGetDirections,
  onReset,
  loading,
  onMapTapOrigin,
  onMapTapDestination,
  mapTapMode,
}) => {
  return (
    <View style={styles.inputsSection}>
      <View style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          Walking Route Planner
        </ThemedText>
      </View>

      <View style={styles.originWrapper}>
        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <GooglePlacesInput
              location={origin}
              setLocation={setOrigin}
              placeholder="Enter starting point"
              label="Origin"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.mapButton,
              mapTapMode === "origin" && styles.mapButtonActive,
            ]}
            onPress={onMapTapOrigin}
          >
            <MapPin size={18} color={mapTapMode === "origin" ? "#fff" : "#4285F4"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.destinationWrapper}>
        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <GooglePlacesInput
              location={destination}
              setLocation={setDestination}
              placeholder="Enter destination"
              label="Destination"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.mapButton,
              mapTapMode === "destination" && styles.mapButtonActive,
            ]}
            onPress={onMapTapDestination}
          >
            <MapPin size={18} color={mapTapMode === "destination" ? "#fff" : "#4285F4"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={onGetDirections}
          disabled={loading || !origin || !destination}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.buttonText}>
              Get Walking Directions
            </ThemedText>
          )}
        </TouchableOpacity>

        {(origin || destination) && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onReset}
            disabled={loading}
          >
            <ThemedText style={styles.secondaryButtonText}>Reset</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputsSection: {
    marginBottom: 8,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  inputContainer: {
    flex: 1,
  },
  originWrapper: {
    zIndex: 2,
    elevation: 2,
  },
  destinationWrapper: {
    zIndex: 1,
    elevation: 1,
  },
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 0,
    bottom: 6
  },
  mapButtonActive: {
    backgroundColor: "#4285F4",
    borderColor: "#4285F4",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  primaryButton: {
    backgroundColor: "#4285F4",
    flex: 1,
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
});

export default LocationInputs;
