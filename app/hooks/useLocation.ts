"use client";

import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Alert, Platform } from "react-native";
import React from "react";

export type LocationType = {
  name?: string;
  placeId?: string;
  latitude: number;
  longitude: number;
};

const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationType | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);

  const requestLocationPermission = async () => {
    if (Platform.OS === "web") {
      // Browser-based location handling
      return new Promise<boolean>((resolve) => {
        if (navigator.geolocation) {
          resolve(true);
        } else {
          Alert.alert(
            "Location Not Available",
            "Geolocation is not supported by this browser."
          );
          resolve(false);
        }
      });
    }

    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location access is required for the best experience."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      if (Platform.OS === "web") {
        // Browser-based geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const currentLoc = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              setCurrentLocation(currentLoc);
              setLoading(false);
              return currentLoc;
            },
            (error) => {
              console.error("Browser geolocation error:", error);
              setLoading(false);
              Alert.alert(
                "Location Error",
                "Could not determine your current location."
              );
              return null;
            }
          );
          return null; // Will be updated via callback
        } else {
          Alert.alert(
            "Location Not Available",
            "Geolocation is not supported by this browser."
          );
          setLoading(false);
          return null;
        }
      }

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      const currentLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(currentLoc);
      return currentLoc;
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Location Error",
        "Could not determine your current location."
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    currentLocation,
    loading,
    getCurrentLocation,
  };
};

export default useLocation;
