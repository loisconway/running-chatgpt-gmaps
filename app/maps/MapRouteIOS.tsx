"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import type { LocationType } from "../hooks/useLocation";

type MapProps = {
  route: { latitude: number; longitude: number }[];
  currentLocation: LocationType | null;
  origin: LocationType | null;
  destination: LocationType | null;
  waypoints?: LocationType[];
  onMapPress?: (latitude: number, longitude: number) => void;
  onMarkerPress?: (type: "origin" | "destination") => void;
  onWaypointPress?: (index: number) => void;
};

const MapIOS: React.FC<MapProps> = ({
  route,
  origin,
  destination,
  currentLocation,
  waypoints = [],
  onMapPress,
  onMarkerPress,
  onWaypointPress,
}) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (route.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(route, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [route]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation // Disable when recording demo!
        showsMyLocationButton
        showsCompass
        onPress={(e) => {
          if (onMapPress) {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            onMapPress(latitude, longitude);
          }
        }}
        initialRegion={{
          latitude: currentLocation?.latitude || 51.4828,
          longitude: currentLocation?.longitude || 0.00194,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {origin && origin.latitude !== 0 && (
          <Marker
            coordinate={origin}
            title="Start"
            description={origin.name}
            pinColor="#4CAF50"
            onPress={() => onMarkerPress?.("origin")}
          />
        )}

        {destination && destination.latitude !== 0 && (
          <Marker
            coordinate={destination}
            title="End"
            description={destination.name}
            pinColor="#F44336"
            onPress={() => onMarkerPress?.("destination")}
          />
        )}

        {waypoints.map((waypoint, index) => (
          <Marker
            key={`waypoint-${index}`}
            coordinate={waypoint}
            title={`Waypoint ${index + 1}`}
            description={waypoint.name}
            pinColor="#FFA500"
            onPress={() => onWaypointPress?.(index)}
          />
        ))}

        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeWidth={2}
            strokeColor="#4285F4"
            lineDashPattern={[0]}
          
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  fullScreenMapContainer: {
    borderRadius: 0,
    borderWidth: 0,
    marginBottom: 0,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapIOS;
