"use client";

import type React from "react";
import { useRef, useState, useEffect, lazy, Suspense } from "react";
import { View, StyleSheet, Platform, SafeAreaView, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import "react-native-get-random-values";

// Hooks
import useLocation from "../hooks/useLocation";
import useRoutes from "../hooks/useRoutes";
import useSavedRoutes from "../hooks/useSavedRoutes";

// Components that are safe to import directly
import LocationInputs from "../components/map/LocationInputs";
import SaveRouteButton from "../components/map/SaveRouteButton";
import MapControls from "../components/map/MapControls";
import RouteDistance from "../components/map/RouteDistance";
import LoadingOverlay from "../components/map/LoadingOverlay";
import SaveRouteModal from "../components/map/SaveRouteModal";

// Dynamically import platform-specific map components
const MapWeb = lazy(() => import("../components/map/MapWeb"));
// Only import native components on native platforms
const MapIOS =
  Platform.OS === "ios" ? lazy(() => import("./MapRouteIOS")) : null;
const MapRouteWeb =
  Platform.OS !== "web" ? lazy(() => import("./MapRouteWeb")) : null;

// Types
import type { SavedRoute } from "../services/routeStorage";

interface MapRouteProps {
  savedRoute?: SavedRoute;
}

const MapRoute: React.FC<MapRouteProps> = ({ savedRoute }) => {
  // Hooks
  const { currentLocation, loading: locationLoading } = useLocation();
  const {
    origin,
    setOrigin,
    destination,
    setDestination,
    route,
    encodedPolyline,
    loading: routeLoading,
    routeDistance,
    requestRoute,
    resetRoute,
    loadSavedRoute,
  } = useRoutes();
  const { savedRoutesCount, handleSaveRoute } = useSavedRoutes();

  // Local state
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [saveModalVisible, setSaveModalVisible] = useState<boolean>(false);
  const mapRef = useRef<any>(null);

  // Effects
  useEffect(() => {
    if (savedRoute) {
      loadSavedRoute(savedRoute);
    }
  }, [savedRoute]);

  // Handlers
  const handleGetDirections = async () => {
    const result = await requestRoute();
    if (result && mapRef.current) {
      // Only call fitToCoordinates on native platforms
      if (Platform.OS !== "web" && mapRef.current.fitToCoordinates) {
        mapRef.current.fitToCoordinates(result.route, {
          edgePadding: { top: 80, right: 50, bottom: 80, left: 50 },
          animated: true,
        });
      }
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleSaveRouteClick = () => {
    if (!origin || !destination || !encodedPolyline) {
      Alert.alert("Cannot Save", "Please generate a route first.");
      return;
    }

    if (savedRoutesCount >= 5) {
      Alert.alert(
        "Maximum Routes Reached",
        "You can save up to 5 routes. The oldest route will be replaced.",
        [{ text: "OK", onPress: () => setSaveModalVisible(true) }]
      );
    } else {
      setSaveModalVisible(true);
    }
  };

  const confirmSaveRoute = async (routeName: string) => {
    if (!origin || !destination || !encodedPolyline) return;

    const name = routeName.trim() || `${origin.name} to ${destination.name}`;
    const success = await handleSaveRoute({
      name,
      originName: origin.name || "",
      destinationName: destination.name || "",
      originPlaceId: origin.placeId || "",
      destinationPlaceId: destination.placeId || "",
      originLocation: {
        latitude: origin.latitude,
        longitude: origin.longitude,
      },
      destinationLocation: {
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
      polyline: encodedPolyline,
      distance: routeDistance,
    });

    if (success) {
      setSaveModalVisible(false);
      Alert.alert("Success", "Route saved successfully!");
    }
  };

  // Render map component based on platform
  const renderMap = () => {
    if (Platform.OS === "web") {
      return (
        <Suspense fallback={<LoadingView />}>
          <MapWeb
            route={route}
            currentLocation={currentLocation}
            origin={origin}
            destination={destination}
          />
        </Suspense>
      );
    } else if (Platform.OS === "ios") {
      return (
        <Suspense fallback={<LoadingView />}>
          {MapIOS && (
            <MapIOS
              route={route}
              currentLocation={currentLocation}
              origin={origin}
              destination={destination}
            />
          )}
        </Suspense>
      );
    } else {
      return (
        <Suspense fallback={<LoadingView />}>
          {MapRouteWeb && <MapRouteWeb route={route} />}
        </Suspense>
      );
    }
  };

  // Loading view for Suspense fallback
  const LoadingView = () => (
    <View style={styles.loadingContainer}>
      <ThemedText>Loading map...</ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView
        style={[styles.container, isFullScreen && styles.fullScreenContainer]}
      >
        {!isFullScreen && (
          <>
            <LocationInputs
              origin={origin}
              setOrigin={setOrigin}
              destination={destination}
              setDestination={setDestination}
              onGetDirections={handleGetDirections}
              onReset={resetRoute}
              loading={routeLoading}
            />

            {route.length > 0 && (
              <SaveRouteButton onPress={handleSaveRouteClick} />
            )}
          </>
        )}

        <ThemedView
          style={[
            styles.mapContainer,
            isFullScreen && styles.fullScreenMapContainer,
          ]}
        >
          {renderMap()}

          <LoadingOverlay visible={locationLoading || routeLoading} />
          <RouteDistance distance={routeDistance} isFullScreen={isFullScreen} />

          <MapControls
            isFullScreen={isFullScreen}
            onToggleFullScreen={toggleFullScreen}
            onGetDirections={handleGetDirections}
            loading={routeLoading}
            hasOriginAndDestination={!!(origin && destination)}
          />

          {isFullScreen && route.length > 0 && (
            <SaveRouteButton onPress={handleSaveRouteClick} fullScreen />
          )}
        </ThemedView>

        <SaveRouteModal
          visible={saveModalVisible}
          onClose={() => setSaveModalVisible(false)}
          onSave={confirmSaveRoute}
          origin={origin}
          destination={destination}
        />
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    paddingBottom: 60,
  },
  fullScreenContainer: {
    padding: 0,
  },
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});

export default MapRoute;
