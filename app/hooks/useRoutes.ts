/**
 * Custom hook to manage route calculations using Google Maps API
 */

import { useReducer, useCallback } from "react";
import { Alert } from "react-native";
import { REACT_APP_GOOGLE_MAPS_API_KEY } from "@env";
import { decodePolyline } from "../utils/mapUtils";
import type { LocationType } from "./useLocation";
import type { SavedRoute } from "../services/routeStorage";

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

// Define state structure
type RouteState = {
  origin: LocationType | null;
  destination: LocationType | null;
  waypoints: LocationType[];
  route: LocationType[];
  encodedPolyline: string;
  loading: boolean;
  routeDistance: string;
  routeStats: RouteStats;
  pace: number;
};

// Define action types
type RouteAction =
  | { type: 'SET_ORIGIN'; payload: LocationType | null }
  | { type: 'SET_DESTINATION'; payload: LocationType | null }
  | { type: 'SET_WAYPOINTS'; payload: LocationType[] }
  | { type: 'ADD_WAYPOINT'; payload: LocationType }
  | { type: 'REMOVE_WAYPOINT'; payload: number }
  | { type: 'SET_ROUTE'; payload: LocationType[] }
  | { type: 'SET_ENCODED_POLYLINE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ROUTE_DISTANCE'; payload: string }
  | { type: 'SET_ROUTE_STATS'; payload: RouteStats }
  | { type: 'SET_PACE'; payload: number }
  | { type: 'RESET_ROUTE' }
  | { type: 'LOAD_SAVED_ROUTE'; payload: SavedRoute };

// Initial state
const initialState: RouteState = {
  origin: null,
  destination: null,
  waypoints: [],
  route: [],
  encodedPolyline: "",
  loading: false,
  routeDistance: "",
  routeStats: { distance: "" },
  pace: 6, // min/km, default 6:00 min/km
};

// Reducer function
function routeReducer(state: RouteState, action: RouteAction): RouteState {
  switch (action.type) {
    case 'SET_ORIGIN':
      return { ...state, origin: action.payload };
    case 'SET_DESTINATION':
      return { ...state, destination: action.payload };
    case 'SET_WAYPOINTS':
      return { ...state, waypoints: action.payload };
    case 'ADD_WAYPOINT':
      return { ...state, waypoints: [...state.waypoints, action.payload] };
    case 'REMOVE_WAYPOINT':
      return { 
        ...state, 
        waypoints: state.waypoints.filter((_, i) => i !== action.payload) 
      };
    case 'SET_ROUTE':
      return { ...state, route: action.payload };
    case 'SET_ENCODED_POLYLINE':
      return { ...state, encodedPolyline: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ROUTE_DISTANCE':
      return { ...state, routeDistance: action.payload };
    case 'SET_ROUTE_STATS':
      return { ...state, routeStats: action.payload };
    case 'SET_PACE':
      return { ...state, pace: action.payload };
    case 'RESET_ROUTE':
      return {
        ...state,
        origin: null,
        destination: null,
        waypoints: [],
        route: [],
        encodedPolyline: "",
        routeDistance: "",
        routeStats: { distance: "" },
      };
    case 'LOAD_SAVED_ROUTE':
      const savedRoute = action.payload;
      return {
        ...state,
        origin: savedRoute.originPlaceId && savedRoute.originName ? {
          placeId: savedRoute.originPlaceId,
          name: savedRoute.originName,
          latitude: savedRoute.originLocation.latitude,
          longitude: savedRoute.originLocation.longitude,
        } : state.origin,
        destination: savedRoute.destinationPlaceId && savedRoute.destinationName ? {
          placeId: savedRoute.destinationPlaceId,
          name: savedRoute.destinationName,
          latitude: savedRoute.destinationLocation.latitude,
          longitude: savedRoute.destinationLocation.longitude,
        } : state.destination,
        waypoints: savedRoute.waypoints && Array.isArray(savedRoute.waypoints) 
          ? savedRoute.waypoints.map((wp: any) => ({
              placeId: wp.placeId,
              name: wp.name,
              latitude: wp.latitude,
              longitude: wp.longitude,
            }))
          : state.waypoints,
        pace: savedRoute.pace || state.pace,
        encodedPolyline: savedRoute.polyline || state.encodedPolyline,
        route: savedRoute.polyline ? decodePolyline(savedRoute.polyline) : state.route,
        routeDistance: savedRoute.distance || state.routeDistance,
        routeStats: savedRoute.distance ? {
          distance: savedRoute.distance,
          elevation: savedRoute.elevation,
          estimatedTime: savedRoute.estimatedTime,
          pace: savedRoute.pace,
        } : state.routeStats,
      };
    default:
      return state;
  }
}

const useRoutes = () => {
  const [state, dispatch] = useReducer(routeReducer, initialState);

  // Calculate estimated time based on distance and pace (min/km)
  const calculateEstimatedTime = useCallback((distanceMeters: number): string => {
    const distanceKm = distanceMeters / 1000;
    const minutes = Math.round(distanceKm * state.pace);
    
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h ${m}m`;
    }
  }, [state.pace]);

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
        const resultCount = data.results.length;
        const denominator = resultCount > 1 ?  (resultCount - 1) : 1;
        for (let i = 0; i < data.results.length; i++) {
          // Calculate cumulative distance for each point
          const distanceRatio = i / denominator;
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
  const isCoordinateLocation = useCallback((placeId: string | undefined): boolean => {
    return placeId?.includes(",") ?? false;
  }, []);

  // Build location object for API request - handles both placeId and coordinates
  const buildLocationObject = useCallback((
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
  }, [isCoordinateLocation]);

  const requestRoute = useCallback(async () => {
    if (!state.origin?.placeId || !state.destination?.placeId) {
      Alert.alert(
        "Missing Information",
        "Please set both origin and destination locations."
      );
      return null;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const reqBody: any = {
        origin: buildLocationObject(state.origin),
        destination: buildLocationObject(state.destination),
        travelMode: "WALK", // Set travel mode to walking
      };

      // Add waypoints if they exist
      if (state.waypoints.length > 0) {
        reqBody.intermediates = state.waypoints.map((waypoint) => buildLocationObject(waypoint));
      }

      console.log("Request Body:", JSON.stringify(reqBody, null, 2));

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
      console.log(" API Response:", JSON.stringify(data, null, 2));

      // Check for API errors
      if ((data as any).error) {
        console.error("API Error:", (data as any).error);
        Alert.alert(
          "Route Error",
          `${(data as any).error.message || "Failed to calculate route"}`
        );
        return null;
      }

      if (data.routes && data.routes.length > 0) {
        const polyline = data.routes[0].polyline.encodedPolyline;
        dispatch({ type: 'SET_ENCODED_POLYLINE', payload: polyline });
        const decodedPath = decodePolyline(polyline);
        dispatch({ type: 'SET_ROUTE', payload: decodedPath });

        // Extract and set distance information - sum all legs for total distance
        let distanceString = "";
        
        if (data.routes[0].legs && data.routes[0].legs.length > 0) {
          // Sum distance across all legs (origin -> waypoint(s) -> destination)
          const totalDistanceInMeters = data.routes[0].legs.reduce(
            (sum, leg) => sum + (leg.distanceMeters || 0),
            0
          );
          
          if (totalDistanceInMeters < 1000) {
            distanceString = `${totalDistanceInMeters} m`;
          } else {
            const distanceInKm = (totalDistanceInMeters / 1000).toFixed(2);
            distanceString = `${distanceInKm} km`;
          }
          
          dispatch({ type: 'SET_ROUTE_DISTANCE', payload: distanceString });

          // Calculate additional stats using total distance
          const estimatedTime = calculateEstimatedTime(totalDistanceInMeters);
          const { gain: elevation, profile: elevationProfile } = await calculateElevationGain(
            decodedPath,
            totalDistanceInMeters
          );

          dispatch({ 
            type: 'SET_ROUTE_STATS', 
            payload: {
              distance: distanceString,
              estimatedTime,
              elevation,
              pace: state.pace,
              elevationProfile,
              totalDistanceMeters: totalDistanceInMeters,
            }
          });
        }

        return {
          route: decodedPath,
          polyline,
          distance: distanceString,
        };
      } else {
        console.log("No routes in response. Full data:", data);
        Alert.alert(
          "Route Not Found",
          "No walking route could be found between these locations. Please try different locations."
        );
        return null;
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert(
        "Network Error",
        "Failed to fetch walking route. Please check your internet connection and try again."
      );
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.origin, state.destination, state.waypoints, state.pace, buildLocationObject, calculateEstimatedTime]);

  const resetRoute = useCallback(() => {
    dispatch({ type: 'RESET_ROUTE' });
  }, []);

  const loadSavedRoute = useCallback((savedRoute: SavedRoute) => {
    dispatch({ type: 'LOAD_SAVED_ROUTE', payload: savedRoute });
  }, []);

  return {
    origin: state.origin,
    setOrigin: useCallback((location: LocationType | null) => {
      dispatch({ type: 'SET_ORIGIN', payload: location });
    }, []),
    destination: state.destination,
    setDestination: useCallback((location: LocationType | null) => {
      dispatch({ type: 'SET_DESTINATION', payload: location });
    }, []),
    waypoints: state.waypoints,
    setWaypoints: useCallback((waypoints: LocationType[]) => {
      dispatch({ type: 'SET_WAYPOINTS', payload: waypoints });
    }, []),
    addWaypoint: useCallback((waypoint: LocationType) => {
      dispatch({ type: 'ADD_WAYPOINT', payload: waypoint });
    }, []),
    removeWaypoint: useCallback((index: number) => {
      dispatch({ type: 'REMOVE_WAYPOINT', payload: index });
    }, []),
    route: state.route,
    encodedPolyline: state.encodedPolyline,
    loading: state.loading,
    routeDistance: state.routeDistance,
    routeStats: state.routeStats,
    pace: state.pace,
    setPace: useCallback((pace: number) => {
      dispatch({ type: 'SET_PACE', payload: pace });
    }, []),
    requestRoute,
    resetRoute,
    loadSavedRoute,
  };
};

export default useRoutes;
