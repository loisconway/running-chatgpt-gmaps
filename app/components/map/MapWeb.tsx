/**
 * Web implementation of the Map component using Google Maps JavaScript API
 */

"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import type { LocationType } from "../../hooks/useLocation";

// Declare google variable to avoid Typescript errors
declare global {
  interface Window {
    google: any;
  }
}

type MapWebProps = {
  route: LocationType[];
  currentLocation?: LocationType | null;
  origin?: LocationType | null;
  destination?: LocationType | null;
};

const MapWeb: React.FC<MapWebProps> = ({
  route,
  currentLocation,
  origin,
  destination,
}) => {
  // Create refs for elements we'll use
  const containerRef = useRef<View>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Initialize map when component mounts
  useEffect(() => {
    // Check if Google Maps API is available
    if (
      typeof window === "undefined" ||
      !window.google ||
      !window.google.maps
    ) {
      console.error("Google Maps JavaScript API is not loaded");
      return;
    }

    // Create map container element if it doesn't exist
    if (!mapContainerRef.current) {
      mapContainerRef.current = document.createElement("div");
      mapContainerRef.current.style.width = "100%";
      mapContainerRef.current.style.height = "100%";

      // Find the native View and append our map container
      const nativeElement = containerRef.current as any;
      if (nativeElement?._nativeTag) {
        const nativeDomElement = document.querySelector(
          `[data-reactroot][data-testid="${nativeElement._nativeTag}"]`
        );
        if (nativeDomElement) {
          nativeDomElement.appendChild(mapContainerRef.current);
        }
      }
    }

    // Initialize map if not already created
    if (!mapInstanceRef.current && mapContainerRef.current) {
      // Default to a fallback location if none provided
      const center = currentLocation || {
        latitude: 51.5074,
        longitude: -0.1278,
      };

      mapInstanceRef.current = new window.google.maps.Map(
        mapContainerRef.current,
        {
          center: { lat: center.latitude, lng: center.longitude },
          zoom: 14,
          mapTypeControl: false,
          zoomControl: true,
          streetViewControl: false,
        }
      );
    }

    return () => {
      // Clean up polyline and markers
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }

      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  // Update map when route changes
  useEffect(() => {
    if (!mapInstanceRef.current || route.length === 0) return;

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Convert route to google.maps.LatLng array
    const path = route.map((point) => ({
      lat: point.latitude,
      lng: point.longitude,
    }));

    // Create new polyline
    polylineRef.current = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#4285F4",
      strokeOpacity: 1.0,
      strokeWeight: 5,
    });

    // Add polyline to map
    polylineRef.current.setMap(mapInstanceRef.current);

    // Calculate bounds to fit all points
    if (path.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((point) => bounds.extend(point));
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [route]);

  // Update markers when origin/destination change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add origin marker if exists
    if (origin && origin.latitude && origin.longitude) {
      const originMarker = new window.google.maps.Marker({
        position: { lat: origin.latitude, lng: origin.longitude },
        map: mapInstanceRef.current,
        title: origin.name || "Start",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#4CAF50",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
          scale: 8,
        },
      });
      markersRef.current.push(originMarker);
    }

    // Add destination marker if exists
    if (destination && destination.latitude && destination.longitude) {
      const destinationMarker = new window.google.maps.Marker({
        position: { lat: destination.latitude, lng: destination.longitude },
        map: mapInstanceRef.current,
        title: destination.name || "End",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#F44336",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
          scale: 8,
        },
      });
      markersRef.current.push(destinationMarker);
    }

    // If both markers exist, fit bounds to show both
    if (markersRef.current.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach((marker) =>
        bounds.extend(marker.getPosition()!)
      );
      mapInstanceRef.current.fitBounds(bounds);
    }
    // Otherwise, if there's just one marker, center on it
    else if (markersRef.current.length === 1) {
      mapInstanceRef.current.setCenter(markersRef.current[0].getPosition()!);
      mapInstanceRef.current.setZoom(15);
    }
  }, [origin, destination]);

  // Update map center when current location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !currentLocation) return;

    // If no route is showing, center on current location
    if (route.length === 0 && !origin && !destination) {
      mapInstanceRef.current.setCenter({
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      });
      mapInstanceRef.current.setZoom(15);
    }
  }, [currentLocation, route, origin, destination]);

  return (
    <View
      ref={containerRef}
      style={styles.container}
      // @ts-ignore - this is for native web
      data-testid="map-container"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
});

export default MapWeb;
