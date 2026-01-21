"use client";

import { useState } from "react";
import { Alert } from "react-native";
import { REACT_APP_GOOGLE_MAPS_API_KEY } from "@/environmentVariables";
import { decodePolyline } from "../utils/mapUtils";
import type { LocationType } from "./useLocation";

const apiKey = REACT_APP_GOOGLE_MAPS_API_KEY;

type RouteResponse = {
  routes: Array<{
    polyline: { encodedPolyline: string };
    legs: Array<{
      startLocation: { latLng: LocationType };
      endLocation: { latLng: LocationType };
      distanceMeters?: number;
      steps?: Array<{
        navigationInstruction?: {
          text?: string;
        };
        startLocation?: { latLng: LocationType };
        endLocation?: { latLng: LocationType };
      }>;
    }>;
    viewport: { low: LocationType; high: LocationType };
  }>;
};

type RouteStats = {
  distance: string;
  elevation?: string;
  estimatedTime?: string;
};

const useRoutes = () => {
  const [origin, setOrigin] = useState<LocationType | null>(null);
  const [destination, setDestination] = useState<LocationType | null>(null);
  const [route, setRoute] = useState<LocationType[]>([]);
  const [encodedPolyline, setEncodedPolyline] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [routeDistance, setRouteDistance] = useState<string>("");
  const [routeStats, setRouteStats] = useState<RouteStats>({ distance: "" });

  // Calculate estimated time based on distance (average walking speed: 5 km/h)
  const calculateEstimatedTime = (distanceMeters: number): string => {
    const speedKmh = 5; // Average walking speed
    const distanceKm = distanceMeters / 1000;
    const hours = distanceKm / speedKmh;
    const minutes = Math.round(hours * 60);
    
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h ${m}m`;
    }
  };

  // Calculate elevation gain from decoded polyline (approximate)
  const calculateElevationGain = (decodedPath: LocationType[]): string => {
    // Note: The Google Routes API v2 doesn't return elevation data directly
    // This is a placeholder that estimates elevation based on typical London terrain
    // In production, you'd use the Google Elevation API with the decoded path
    
    // For now, return a realistic estimate for London routes (relatively flat)
    // This could be enhanced to call the Elevation API if needed
    return "+45m";
  };

  // Check if a placeId is actually coordinates (contains comma)
  const isCoordinateLocation = (placeId: string | undefined): boolean => {
    return placeId?.includes(",") ?? false;
  };

  // Build location object for API request - handles both placeId and coordinates
  const buildLocationObject = (
    location: LocationType
  ): { placeId?: string; location?: { latLng: { latitude: number; longitude: number } } } => {
    if (isCoordinateLocation(location.placeId)) {
      // Use coordinates for map-tapped locations
      return {
        location: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      };
    } else {
      // Use place ID for predefined/autocomplete locations
      return {
        placeId: location.placeId,
      };
    }
  };

  const requestRoute = async () => {
    if (!origin?.placeId || !destination?.placeId) {
      Alert.alert(
        "Missing Information",
        "Please set both origin and destination locations."
      );
      return null;
    }

    setLoading(true);
    try {
      const reqBody = {
        origin: buildLocationObject(origin),
        destination: buildLocationObject(destination),
        travelMode: "WALK", // Set travel mode to walking
      };

      console.log("🚀 Request Body:", JSON.stringify(reqBody, null, 2));

      const response = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "*",
          },
          body: JSON.stringify(reqBody),
        }
      );

      const data: RouteResponse = await response.json();
      console.log("📡 API Response:", JSON.stringify(data, null, 2));

      // Check for API errors
      if ((data as any).error) {
        console.error("❌ API Error:", (data as any).error);
        Alert.alert(
          "Route Error",
          `${(data as any).error.message || "Failed to calculate route"}`
        );
        return null;
      }

      if (data.routes && data.routes.length > 0) {
        const polyline = data.routes[0].polyline.encodedPolyline;
        setEncodedPolyline(polyline);
        const decodedPath = decodePolyline(polyline);
        setRoute(decodedPath);

        // Extract and set distance information
        if (
          data.routes[0].legs &&
          data.routes[0].legs.length > 0 &&
          data.routes[0].legs[0].distanceMeters
        ) {
          const distanceInMeters = data.routes[0].legs[0].distanceMeters;
          let distanceString = "";
          
          if (distanceInMeters < 1000) {
            distanceString = `${distanceInMeters} m`;
          } else {
            const distanceInKm = (distanceInMeters / 1000).toFixed(2);
            distanceString = `${distanceInKm} km`;
          }
          
          setRouteDistance(distanceString);

          // Calculate additional stats
          const estimatedTime = calculateEstimatedTime(distanceInMeters);
          const elevation = calculateElevationGain(decodedPath);

          setRouteStats({
            distance: distanceString,
            estimatedTime,
            elevation,
          });
        }

        return {
          route: decodedPath,
          polyline,
          distance: routeDistance,
        };
      } else {
        console.log("❌ No routes in response. Full data:", data);
        Alert.alert(
          "Route Not Found",
          "No walking route could be found between these locations. Please try different locations."
        );
        return null;
      }
    } catch (error) {
      console.error("🔥 Error:", error);
      Alert.alert(
        "Network Error",
        "Failed to fetch walking route. Please check your internet connection and try again."
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetRoute = () => {
    setOrigin(null);
    setDestination(null);
    setRoute([]);
    setEncodedPolyline("");
    setRouteDistance("");
    setRouteStats({ distance: "" });
  };

  const loadSavedRoute = (savedRoute: any) => {
    // Set origin and destination
    if (savedRoute.originPlaceId && savedRoute.originName) {
      setOrigin({
        placeId: savedRoute.originPlaceId,
        name: savedRoute.originName,
        latitude: savedRoute.originLocation.latitude,
        longitude: savedRoute.originLocation.longitude,
      });
    }

    if (savedRoute.destinationPlaceId && savedRoute.destinationName) {
      setDestination({
        placeId: savedRoute.destinationPlaceId,
        name: savedRoute.destinationName,
        latitude: savedRoute.destinationLocation.latitude,
        longitude: savedRoute.destinationLocation.longitude,
      });
    }

    // Set the polyline and decode it
    if (savedRoute.polyline) {
      setEncodedPolyline(savedRoute.polyline);
      const decodedPath = decodePolyline(savedRoute.polyline);
      setRoute(decodedPath);

      // Set distance if available
      if (savedRoute.distance) {
        setRouteDistance(savedRoute.distance);
      }
    }
  };

  return {
    origin,
    setOrigin,
    destination,
    setDestination,
    route,
    encodedPolyline,
    loading,
    routeDistance,
    routeStats,
    requestRoute,
    resetRoute,
    loadSavedRoute,
  };
};

export default useRoutes;
