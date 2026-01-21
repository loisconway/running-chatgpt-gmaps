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
  onMapPress?: (latitude: number, longitude: number) => void;
};

const MapIOS: React.FC<MapProps> = ({
  route,
  origin,
  destination,
  currentLocation,
  onMapPress,
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
        showsUserLocation
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
          />
        )}

        {destination && destination.latitude !== 0 && (
          <Marker
            coordinate={destination}
            title="End"
            description={destination.name}
            pinColor="#F44336"
          />
        )}

        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeWidth={5}
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
