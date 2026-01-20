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
    }>;
    viewport: { low: LocationType; high: LocationType };
  }>;
};

const useRoutes = () => {
  const [origin, setOrigin] = useState<LocationType | null>(null);
  const [destination, setDestination] = useState<LocationType | null>(null);
  const [route, setRoute] = useState<LocationType[]>([]);
  const [encodedPolyline, setEncodedPolyline] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [routeDistance, setRouteDistance] = useState<string>("");

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
        origin: {
          placeId: origin.placeId,
        },
        destination: {
          placeId: destination.placeId,
        },
        travelMode: "WALK", // Set travel mode to walking
      };

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
          if (distanceInMeters < 1000) {
            setRouteDistance(`${distanceInMeters} m`);
          } else {
            const distanceInKm = (distanceInMeters / 1000).toFixed(2);
            setRouteDistance(`${distanceInKm} km`);
          }
        }

        return {
          route: decodedPath,
          polyline,
          distance: routeDistance,
        };
      } else {
        Alert.alert(
          "Route Not Found",
          "No walking route could be found between these locations. Please try different locations."
        );
        return null;
      }
    } catch (error) {
      console.error(error);
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
    requestRoute,
    resetRoute,
    loadSavedRoute,
  };
};

export default useRoutes;
