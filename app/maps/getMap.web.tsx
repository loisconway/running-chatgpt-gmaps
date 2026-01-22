"use client";
// DEMO FILE FROM WHEN I FOLLOWED GOOGLE MAPS TUTORIAL FOR WEB
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useState, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { REACT_APP_MAP_ID } from "@env";

// Define types for Google Maps objects
declare global {
  interface Window {
    google: any;
  }
}

type Poi = {
  key: string;
  location: { lat: number; lng: number };
};

const locations: Poi[] = [
  { key: "operaHouse", location: { lat: -33.8567844, lng: 151.213108 } },
  { key: "tarongaZoo", location: { lat: -33.8472767, lng: 151.2188164 } },
  { key: "manlyBeach", location: { lat: -33.8209738, lng: 151.2563253 } },
  { key: "hyderPark", location: { lat: -33.8690081, lng: 151.2052393 } },
  { key: "theRocks", location: { lat: -33.8587568, lng: 151.2058246 } },
  { key: "circularQuay", location: { lat: -33.858761, lng: 151.2055688 } },
  { key: "harbourBridge", location: { lat: -33.852228, lng: 151.2038374 } },
  { key: "kingsCross", location: { lat: -33.8737375, lng: 151.222569 } },
  { key: "botanicGardens", location: { lat: -33.864167, lng: 151.216387 } },
  { key: "museumOfSydney", location: { lat: -33.8636005, lng: 151.2092542 } },
  { key: "maritimeMuseum", location: { lat: -33.869395, lng: 151.198648 } },
  { key: "kingStreetWharf", location: { lat: -33.8665445, lng: 151.1989808 } },
  { key: "aquarium", location: { lat: -33.869627, lng: 151.202146 } },
  { key: "darlingHarbour", location: { lat: -33.87488, lng: 151.1987113 } },
  { key: "barangaroo", location: { lat: -33.8605523, lng: 151.1972205 } },
];

const WebMap = () => {
  const mapId = REACT_APP_MAP_ID;
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the map
  useEffect(() => {
    if (!window.google || !window.google.maps) {
      setError("Google Maps JavaScript API is not loaded");
      return;
    }

    try {
      // Create map container if it doesn't exist
      if (!mapContainerRef.current) {
        mapContainerRef.current = document.createElement("div");
        mapContainerRef.current.style.width = "100%";
        mapContainerRef.current.style.height = "100%";

        // Find the container element and append our map
        const container = document.getElementById("map-container");
        if (container) {
          container.appendChild(mapContainerRef.current);
        }
      }

      // Initialize map
      if (mapContainerRef.current && !mapRef.current) {
        mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
          center: { lat: -33.860664, lng: 151.208138 },
          zoom: 13,
          mapId: mapId,
        });

        // Add markers for POIs
        locations.forEach((poi) => {
          const marker = new window.google.maps.Marker({
            position: poi.location,
            map: mapRef.current,
            title: poi.key,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#FBBC04",
              fillOpacity: 1,
              strokeColor: "#000",
              strokeWeight: 1,
              scale: 8,
            },
          });

          // Add click listener
          marker.addListener("click", () => {
            if (mapRef.current) {
              mapRef.current.panTo(poi.location);

              // Create a circle on click
              new window.google.maps.Circle({
                strokeColor: "#0c4cb3",
                strokeOpacity: 1,
                strokeWeight: 3,
                fillColor: "#3b82f6",
                fillOpacity: 0.3,
                map: mapRef.current,
                center: poi.location,
                radius: 800,
              });
            }
          });
        });

        setIsLoaded(true);
      }
    } catch (err) {
      setError(`Error initializing map: ${err}`);
    }
  }, [mapId]);

  if (error) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div id="map-container" style={{ width: "100%", height: "100%" }} />
      {!isLoaded && (
        <View style={styles.loadingOverlay}>
          <ThemedText>Loading map...</ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});

export default WebMap;
