/**
 * Custom hook to manage saved routes using local storage
 */

import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import saveRoute, {
  getSavedRoutes,
  deleteRoute,
} from "../services/routeStorage";
import type { SavedRoute } from "../services/routeStorage";

const useSavedRoutes = () => {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [savedRoutesCount, setSavedRoutesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadSavedRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const routes = await getSavedRoutes();
      setSavedRoutes(routes);
      setSavedRoutesCount(routes.length);
    } catch (error) {
      console.error("Error loading saved routes:", error);
      Alert.alert("Error", "Failed to load saved routes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadSavedRoutes();
  }, [loadSavedRoutes]);

  const handleDeleteRoute = useCallback(async (routeId: string) => {
    try {
      await deleteRoute(routeId);
      setSavedRoutes((prevRoutes) => prevRoutes.filter((route) => route.id !== routeId));
      setSavedRoutesCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error deleting route:", error);
      Alert.alert("Error", "Failed to delete route");
    }
  }, []);

  const handleSaveRoute = useCallback(async (
    routeData: Omit<SavedRoute, "id" | "createdAt">
  ) => {
    try {
      const newRoute = await saveRoute(routeData);
      setSavedRoutes((prevRoutes) => [newRoute, ...prevRoutes.slice(0, 4)]); // Keep only 5 routes
      setSavedRoutesCount((prev) => Math.min(prev + 1, 5));
      return true;
    } catch (error) {
      console.error("Error saving route:", error);
      Alert.alert("Error", "Failed to save route. Please try again.");
      return false;
    }
  }, []);

  useEffect(() => {
    loadSavedRoutes();
  }, []);

  return {
    savedRoutes,
    savedRoutesCount,
    loading,
    refreshing,
    loadSavedRoutes,
    handleRefresh,
    handleDeleteRoute,
    handleSaveRoute,
  };
};

export default useSavedRoutes;
