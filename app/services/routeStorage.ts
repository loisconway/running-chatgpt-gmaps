/**
 * Service for saving, retrieving, and deleting routes using AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export type SavedRoute = {
  id: string;
  name: string;
  originName: string;
  destinationName: string;
  originPlaceId: string;
  destinationPlaceId: string;
  originLocation: {
    latitude: number;
    longitude: number;
  };
  destinationLocation: {
    latitude: number;
    longitude: number;
  };
  waypoints?: Array<{
    name: string;
    placeId: string;
    latitude: number;
    longitude: number;
  }>;
  polyline: string; // Encoded polyline
  createdAt: number;
  distance: string;
  elevation?: string;
  estimatedTime?: string;
  pace?: number;
};

const ROUTES_STORAGE_KEY = "saved_walking_routes";
const MAX_SAVED_ROUTES = 5;

const saveRoute = async (
  route: Omit<SavedRoute, "id" | "createdAt">
): Promise<SavedRoute> => {
  try {
    // Get existing routes
    const existingRoutes = await getSavedRoutes();

    // Create new route with ID and timestamp
    const newRoute: SavedRoute = {
      ...route,
      id: generateRouteId(),
      createdAt: Date.now(),
    };

    // Add new route and limit to MAX_SAVED_ROUTES
    let updatedRoutes = [newRoute, ...existingRoutes];
    if (updatedRoutes.length > MAX_SAVED_ROUTES) {
      updatedRoutes = updatedRoutes.slice(0, MAX_SAVED_ROUTES);
    }

    // Save updated routes
    await AsyncStorage.setItem(
      ROUTES_STORAGE_KEY,
      JSON.stringify(updatedRoutes)
    );

    return newRoute;
  } catch (error) {
    console.error("Error saving route:", error);
    throw error;
  }
};

export const getSavedRoutes = async (): Promise<SavedRoute[]> => {
  try {
    const routesJson = await AsyncStorage.getItem(ROUTES_STORAGE_KEY);
    if (!routesJson) return [];

    return JSON.parse(routesJson) as SavedRoute[];
  } catch (error) {
    console.error("Error getting saved routes:", error);
    return [];
  }
};

export const deleteRoute = async (routeId: string): Promise<void> => {
  try {
    const routes = await getSavedRoutes();
    const updatedRoutes = routes.filter((route) => route.id !== routeId);
    await AsyncStorage.setItem(
      ROUTES_STORAGE_KEY,
      JSON.stringify(updatedRoutes)
    );
  } catch (error) {
    console.error("Error deleting route:", error);
    throw error;
  }
};

// Helper function to generate a unique ID
const generateRouteId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export default saveRoute;
