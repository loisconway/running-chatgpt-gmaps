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

export type ElevationPoint = {
  elevation: number;
  distance: number; // cumulative distance in meters
};

type RouteStats = {
  distance: string;
  elevation?: string;
  estimatedTime?: string;
  pace?: number;
  elevationProfile?: ElevationPoint[];
  totalDistanceMeters?: number;
};

const useRoutes = () => {
  const [origin, setOrigin] = useState<LocationType | null>(null);
  const [destination, setDestination] = useState<LocationType | null>(null);
  const [waypoints, setWaypoints] = useState<LocationType[]>([]);
  const [route, setRoute] = useState<LocationType[]>([]);
  const [encodedPolyline, setEncodedPolyline] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [routeDistance, setRouteDistance] = useState<string>("");
  const [routeStats, setRouteStats] = useState<RouteStats>({ distance: "" });
  const [pace, setPace] = useState<number>(6); // min/km, default 6:00 min/km

  // Calculate estimated time based on distance and pace (min/km)
  const calculateEstimatedTime = (distanceMeters: number): string => {
    const distanceKm = distanceMeters / 1000;
    const minutes = Math.round(distanceKm * pace);
    
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h ${m}m`;
    }
  };

  // Calculate elevation gain from decoded polyline using Google Elevation API
  const calculateElevationGain = async (
    decodedPath: LocationType[],
    totalDistanceMeters: number
  ): Promise<{ gain: string; profile: ElevationPoint[] }> => {
    try {
      // Sample points to avoid hitting API limits (max 512 points per request)
      const maxSamples = 100;
      const step = Math.max(1, Math.floor(decodedPath.length / maxSamples));
      const sampledPoints = decodedPath.filter((_, index) => index % step === 0);

      // Build locations string for API
      const locations = sampledPoints
        .map(point => `${point.latitude},${point.longitude}`)
        .join('|');

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${apiKey}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // Calculate elevation gain (sum of positive elevation changes)
        let totalGain = 0;
        const profile: ElevationPoint[] = [];

        for (let i = 0; i < data.results.length; i++) {
          // Calculate cumulative distance for each point
          const distanceRatio = i / (data.results.length - 1);
          const cumulativeDistance = distanceRatio * totalDistanceMeters;

          profile.push({
            elevation: data.results[i].elevation,
            distance: cumulativeDistance,
          });

          // Calculate gain
          if (i > 0) {
            const elevationChange = data.results[i].elevation - data.results[i - 1].elevation;
            if (elevationChange > 0) {
              totalGain += elevationChange;
            }
          }
        }

        return {
          gain: `+${Math.round(totalGain)}m`,
          profile,
        };
      }

      // Fallback if API fails
      return { gain: "Elevation Unknown", profile: [] };
    } catch (error) {
      console.error("Elevation API error:", error);
      return { gain: "Elevation Unknown", profile: [] };
    }
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
      const reqBody: any = {
        origin: buildLocationObject(origin),
        destination: buildLocationObject(destination),
        travelMode: "WALK", // Set travel mode to walking
      };

      // Add waypoints if they exist
      if (waypoints.length > 0) {
        reqBody.intermediates = waypoints.map((waypoint) => buildLocationObject(waypoint));
      }

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

        // Extract and set distance information - sum all legs for total distance
        if (data.routes[0].legs && data.routes[0].legs.length > 0) {
          // Sum distance across all legs (origin -> waypoint(s) -> destination)
          const totalDistanceInMeters = data.routes[0].legs.reduce(
            (sum, leg) => sum + (leg.distanceMeters || 0),
            0
          );
          
          let distanceString = "";
          
          if (totalDistanceInMeters < 1000) {
            distanceString = `${totalDistanceInMeters} m`;
          } else {
            const distanceInKm = (totalDistanceInMeters / 1000).toFixed(2);
            distanceString = `${distanceInKm} km`;
          }
          
          setRouteDistance(distanceString);

          // Calculate additional stats using total distance
          const estimatedTime = calculateEstimatedTime(totalDistanceInMeters);
          const { gain: elevation, profile: elevationProfile } = await calculateElevationGain(
            decodedPath,
            totalDistanceInMeters
          );

          setRouteStats({
            distance: distanceString,
            estimatedTime,
            elevation,
            pace,
            elevationProfile,
            totalDistanceMeters: totalDistanceInMeters,
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
    setWaypoints([]);
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

    // Load waypoints if they exist
    if (savedRoute.waypoints && Array.isArray(savedRoute.waypoints)) {
      setWaypoints(savedRoute.waypoints.map((wp: any) => ({
        placeId: wp.placeId,
        name: wp.name,
        latitude: wp.latitude,
        longitude: wp.longitude,
      })));
    }

    // Set pace if available
    if (savedRoute.pace) {
      setPace(savedRoute.pace);
    }

    // Set the polyline and decode it
    if (savedRoute.polyline) {
      setEncodedPolyline(savedRoute.polyline);
      const decodedPath = decodePolyline(savedRoute.polyline);
      setRoute(decodedPath);

      // Set full route stats if available
      if (savedRoute.distance) {
        setRouteDistance(savedRoute.distance);
        setRouteStats({
          distance: savedRoute.distance,
          elevation: savedRoute.elevation,
          estimatedTime: savedRoute.estimatedTime,
          pace: savedRoute.pace,
          // Note: elevationProfile is not saved to reduce storage size
          // It will be recalculated if needed
        });
      }
    }
  };

  return {
    origin,
    setOrigin,
    destination,
    setDestination,
    waypoints,
    setWaypoints,
    addWaypoint: (waypoint: LocationType) => setWaypoints([...waypoints, waypoint]),
    removeWaypoint: (index: number) => setWaypoints(waypoints.filter((_, i) => i !== index)),
    route,
    encodedPolyline,
    loading,
    routeDistance,
    routeStats,
    pace,
    setPace,
    requestRoute,
    resetRoute,
    loadSavedRoute,
  };
};

export default useRoutes;
