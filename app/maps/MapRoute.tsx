/**
 * Main map route component handling map display, route calculation, and user interactions.
 * Currently only native platform (IOS) is working as expected. Fixing the web version is in the backlog.
 */

import type React from "react";
import { useRef, useState, useEffect, lazy, Suspense } from "react";
import { View, StyleSheet, Platform, SafeAreaView, Alert, TouchableOpacity } from "react-native";
import { Pencil, Check, Timer } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import "react-native-get-random-values";

// Hooks
import useLocation from "../hooks/useLocation";
import useRoutes from "../hooks/useRoutes";
import useSavedRoutes from "../hooks/useSavedRoutes";
import { useGeocoding } from "../hooks/useGeocoding";

// Components that are safe to import directly
import LocationInputs from "../components/map/LocationInputs";
import SaveRouteButton from "../components/map/SaveRouteButton";
import MapControls from "../components/map/MapControls";
import RouteDistance from "../components/map/RouteDistance";
import RouteStatsCard from "../components/map/RouteStatsCard";
import LoadingOverlay from "../components/map/LoadingOverlay";
import SaveRouteModal from "../components/map/SaveRouteModal";
import PaceModal from "../components/map/PaceModal";

// Dynamically import platform-specific map components
const MapWeb = lazy(() => import("../components/map/MapWeb"));
// Only import native components on native platforms
const MapIOS =
  Platform.OS === "ios" ? lazy(() => import("./MapRouteIOS")) : null;
const MapRouteWeb =
  Platform.OS !== "web" ? lazy(() => import("./MapRouteWeb")) : null;

// Types
import type { SavedRoute } from "../services/routeStorage";
import { Pressable } from "react-native";

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
    waypoints,
    addWaypoint,
    removeWaypoint,
    route,
    encodedPolyline,
    loading: routeLoading,
    routeDistance,
    routeStats,
    pace,
    setPace,
    requestRoute,
    resetRoute,
    loadSavedRoute,
  } = useRoutes();
  const { savedRoutesCount, handleSaveRoute } = useSavedRoutes();
  const { reverseGeocode } = useGeocoding();

  // Local state
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [saveModalVisible, setSaveModalVisible] = useState<boolean>(false);
  const [mapTapMode, setMapTapMode] = useState<"origin" | "destination" | null>(null);
  const [routeDrawingMode, setRouteDrawingMode] = useState<boolean>(false);
  const [paceModalVisible, setPaceModalVisible] = useState<boolean>(false);
  const mapRef = useRef<any>(null);

  // Effects
  useEffect(() => {
    if (savedRoute) {
      loadSavedRoute(savedRoute);
    }
  }, [savedRoute]);

  // Auto-recalculate route when origin or destination changes (debounced, not in drawing mode)
  useEffect(() => {
    if (origin && destination && !routeLoading && !routeDrawingMode) {
      const timer = setTimeout(() => {
        handleGetDirections();
      }, 500); // 500ms debounce
      return () => clearTimeout(timer);
    }
  }, [origin?.placeId, destination?.placeId, waypoints.length, routeDrawingMode]);

  // Recalculate stats when pace changes
  useEffect(() => {
    if (route.length > 0 && routeDistance) {
      handleGetDirections();
    }
  }, [pace]);

  // Auto-recalculate route in drawing mode (immediate, no debounce)
  useEffect(() => {
    if (origin && destination && !routeLoading && routeDrawingMode) {
      handleGetDirections();
    }
  }, [origin?.placeId, destination?.placeId, waypoints.length, routeDrawingMode]);

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

  // Other handlers

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleUndoLastPoint = () => {
    if (destination && waypoints.length > 0) {
      // Move the last waypoint back to destination, remove current destination
      const lastWaypoint = waypoints[waypoints.length - 1];
      setDestination(lastWaypoint);
      removeWaypoint(waypoints.length - 1);
    } else if (destination) {
      // Remove destination
      setDestination(null);
    } else if (origin) {
      // Remove origin
      setOrigin(null);
    }
  };

  const handleMapPress = async (latitude: number, longitude: number) => {
    const coordsString = `${latitude},${longitude}`;
    const placeholderName = `Point (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    
    // Route drawing mode logic
    if (routeDrawingMode) {
      if (!origin) {
        // First point: show loading, then set with actual address
        const tempOrigin = {
          name: "Loading address...",
          placeId: coordsString,
          latitude,
          longitude,
        };
        setOrigin(tempOrigin);
        // Get address and update
        reverseGeocode(latitude, longitude)
          .then(placeName => {
            setOrigin({ ...tempOrigin, name: placeName });
          })
          .catch(error => {
            console.error('Error geocoding origin:', error);
            setOrigin({ ...tempOrigin, name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
          });
      } else if (!destination) {
        // Second point: show loading, then set with actual address
        const tempDest = {
          name: "Loading address...",
          placeId: coordsString,
          latitude,
          longitude,
        };
        setDestination(tempDest);
        // Get address and update
        reverseGeocode(latitude, longitude)
          .then(placeName => {
            setDestination({ ...tempDest, name: placeName });
          })
          .catch(error => {
            console.error('Error geocoding destination:', error);
            setDestination({ ...tempDest, name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
          });
      } else {
        // Third+ point: convert current destination to waypoint, set new point as destination
        addWaypoint(destination);
        const tempDest = {
          name: "Loading address...",
          placeId: coordsString,
          latitude,
          longitude,
        };
        setDestination(tempDest);
        // Get address and update
        reverseGeocode(latitude, longitude)
          .then(placeName => {
            setDestination({ ...tempDest, name: placeName });
          })
          .catch(error => {
            console.error('Error geocoding destination:', error);
            setDestination({ ...tempDest, name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
          });
      }
      return;
    }

    // Normal mode logic
    if (mapTapMode === "origin") {
      const tempOrigin = {
        name: "Loading address...",
        placeId: coordsString,
        latitude,
        longitude,
      };
      setOrigin(tempOrigin);
      setMapTapMode(null);
      // Get address and update
      reverseGeocode(latitude, longitude)
        .then(placeName => {
          setOrigin({ ...tempOrigin, name: placeName });
        })
        .catch(error => {
          console.error('Error geocoding origin:', error);
          setOrigin({ ...tempOrigin, name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
        });
    } else if (mapTapMode === "destination") {
      const tempDest = {
        name: "Loading address...",
        placeId: coordsString,
        latitude,
        longitude,
      };
      setDestination(tempDest);
      setMapTapMode(null);
      // Get address and update
      reverseGeocode(latitude, longitude)
        .then(placeName => {
          setDestination({ ...tempDest, name: placeName });
        })
        .catch(error => {
          console.error('Error geocoding destination:', error);
          setDestination({ ...tempDest, name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
        });
    }
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
      waypoints: waypoints.map(wp => ({
        name: wp.name || "",
        placeId: wp.placeId || "",
        latitude: wp.latitude,
        longitude: wp.longitude,
      })),
      polyline: encodedPolyline,
      distance: routeDistance,
      elevation: routeStats.elevation,
      estimatedTime: routeStats.estimatedTime,
      pace,
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
              waypoints={waypoints}
              onMapPress={handleMapPress}
              onMarkerPress={(type) => setMapTapMode(type)}
              onWaypointPress={(index) => {
                Alert.alert(
                  "Remove Waypoint",
                  `Remove ${waypoints[index].name}?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Remove", onPress: () => removeWaypoint(index), style: "destructive" },
                  ]
                );
              }}
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
              onMapTapOrigin={() => setMapTapMode("origin")}
              onMapTapDestination={() => setMapTapMode("destination")}
              mapTapMode={mapTapMode}
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

          {routeDrawingMode && (
            <View style={styles.tapModeOverlay}>
              <ThemedText style={styles.tapModeText}>
                {!origin
                  ? "Tap to set start point"
                  : !destination
                  ? "Tap to set end point"
                  : "Tap to extend route"}
              </ThemedText>
              <View style={styles.drawingModeButtons}>
                {(origin || destination || waypoints.length > 0) && (
                  <Pressable
                    style={[styles.cancelTapButton, styles.undoButton]}
                    onPress={handleUndoLastPoint}
                  >
                    <ThemedText style={styles.cancelTapButtonText}>Undo</ThemedText>
                  </Pressable>
                )}
                <Pressable
                  style={styles.cancelTapButton}
                  onPress={() => setRouteDrawingMode(false)}
                >
                  <ThemedText style={styles.cancelTapButtonText}>Exit Drawing Mode</ThemedText>
                </Pressable>
              </View>
            </View>
          )}

          {mapTapMode && !routeDrawingMode && (
            <View style={styles.tapModeOverlay}>
              <ThemedText style={styles.tapModeText}>
                
                {mapTapMode === "origin"
                  ? ( origin ? "Tap to set new start": "Tap on the map to set start location")
                  : (destination ? "Tap to set new destination" : "Tap on the map to set destination")}
              </ThemedText>
              <Pressable
                style={styles.cancelTapButton}
                onPress={() => setMapTapMode(null)}
              >
                <ThemedText style={styles.cancelTapButtonText}>Cancel</ThemedText>
              </Pressable>
            </View>
          )}

          <LoadingOverlay visible={locationLoading || routeLoading} />
          {/* <RouteDistance distance={routeDistance} isFullScreen={isFullScreen} /> */}
          <RouteStatsCard stats={routeStats} isFullScreen={isFullScreen} />

          <MapControls
            isFullScreen={isFullScreen}
            onToggleFullScreen={toggleFullScreen}
            onGetDirections={handleGetDirections}
            loading={routeLoading}
            hasOriginAndDestination={!!(origin && destination)}
            routeDrawingMode={routeDrawingMode}
          />

          <TouchableOpacity
            style={[styles.drawRouteButton, routeDrawingMode && styles.drawRouteButtonActive]}
            onPress={() => setRouteDrawingMode(!routeDrawingMode)}
          >
            {routeDrawingMode ? (
              <Check size={24} color="#fff" />
            ) : (
              <Pencil size={24} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paceButton}
            onPress={() => setPaceModalVisible(true)}
          >
            <Timer size={20} color="#fff" />
            <ThemedText style={styles.paceButtonText}>
              {Math.floor(pace)}:{Math.round((pace % 1) * 60).toString().padStart(2, "0")}
            </ThemedText>
          </TouchableOpacity>

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

        <PaceModal
          visible={paceModalVisible}
          onClose={() => setPaceModalVisible(false)}
          pace={pace}
          setPace={setPace}
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
    position: "relative",
  },
  fullScreenMapContainer: {
    borderRadius: 0,
    borderWidth: 0,
    marginBottom: 0,
  },
  tapModeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 16,
    zIndex: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tapModeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    flex: 1,
  },
  drawingModeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  cancelTapButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FF6B6B",
    borderRadius: 6,
  },
  undoButton: {
    backgroundColor: "#FFA500",
  },
  cancelTapButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  drawRouteButton: {
    position: "absolute",
    top: 12,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 40,
  },
  drawRouteButtonActive: {
    backgroundColor: "#34A853",
  },
  drawRouteButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  paceButton: {
    position: "absolute",
    top: 20,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#9333EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 40,
  },
  paceButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});

export default MapRoute;
