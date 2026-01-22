/**
 * Unit tests for useRoutes hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import useRoutes from '../useRoutes';

// Mock Alert before importing
const mockAlert = jest.fn();
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: mockAlert,
  default: {
    alert: mockAlert,
  },
}));

// Import Alert after mocking
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('../../utils/mapUtils', () => ({
  decodePolyline: jest.fn((encoded: string) => [
    { latitude: 51.5, longitude: -0.1 },
    { latitude: 51.51, longitude: -0.11 },
    { latitude: 51.52, longitude: -0.12 },
  ]),
}));

global.fetch = jest.fn();

describe('useRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useRoutes());

    expect(result.current.origin).toBeNull();
    expect(result.current.destination).toBeNull();
    expect(result.current.waypoints).toEqual([]);
    expect(result.current.route).toEqual([]);
    expect(result.current.encodedPolyline).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.routeDistance).toBe('');
    expect(result.current.pace).toBe(6);
  });

  it('should set origin and destination', () => {
    const { result } = renderHook(() => useRoutes());

    act(() => {
      result.current.setOrigin({
        name: 'Start',
        placeId: 'place-1',
        latitude: 51.5,
        longitude: -0.1,
      });
    });

    expect(result.current.origin).toEqual({
      name: 'Start',
      placeId: 'place-1',
      latitude: 51.5,
      longitude: -0.1,
    });

    act(() => {
      result.current.setDestination({
        name: 'End',
        placeId: 'place-2',
        latitude: 51.6,
        longitude: -0.2,
      });
    });

    expect(result.current.destination).toEqual({
      name: 'End',
      placeId: 'place-2',
      latitude: 51.6,
      longitude: -0.2,
    });
  });

  it('should add and remove waypoints', () => {
    const { result } = renderHook(() => useRoutes());

    const waypoint1 = { name: 'Waypoint 1', placeId: 'wp-1', latitude: 51.55, longitude: -0.15 };
    const waypoint2 = { name: 'Waypoint 2', placeId: 'wp-2', latitude: 51.56, longitude: -0.16 };

    act(() => {
      result.current.addWaypoint(waypoint1);
      result.current.addWaypoint(waypoint2);
    });

    expect(result.current.waypoints).toHaveLength(2);
    expect(result.current.waypoints).toContainEqual(waypoint1);
    expect(result.current.waypoints).toContainEqual(waypoint2);

    act(() => {
      result.current.removeWaypoint(0);
    });

    expect(result.current.waypoints).toHaveLength(1);
    expect(result.current.waypoints[0]).toEqual(waypoint2);
  });

  it('should change pace', () => {
    const { result } = renderHook(() => useRoutes());

    act(() => {
      result.current.setPace(5.5);
    });

    expect(result.current.pace).toBe(5.5);
  });

  it('should request route successfully', async () => {
    const mockRouteResponse = {
      routes: [
        {
          polyline: { encodedPolyline: 'test_encoded_polyline' },
          legs: [
            {
              distanceMeters: 5000,
              startLocation: { latLng: { latitude: 51.5, longitude: -0.1 } },
              endLocation: { latLng: { latitude: 51.6, longitude: -0.2 } },
            },
          ],
          viewport: {
            low: { latitude: 51.5, longitude: -0.2 },
            high: { latitude: 51.6, longitude: -0.1 },
          },
        },
      ],
    };

    const mockElevationResponse = {
      status: 'OK',
      results: [
        { elevation: 10 },
        { elevation: 15 },
        { elevation: 20 },
      ],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        // Routes API
        json: async () => mockRouteResponse,
      })
      .mockResolvedValueOnce({
        // Elevation API
        json: async () => mockElevationResponse,
      });

    const { result } = renderHook(() => useRoutes());

    act(() => {
      result.current.setOrigin({
        name: 'Start',
        placeId: 'place-1',
        latitude: 51.5,
        longitude: -0.1,
      });
      result.current.setDestination({
        name: 'End',
        placeId: 'place-2',
        latitude: 51.6,
        longitude: -0.2,
      });
    });

    let routeResult;
    await act(async () => {
      routeResult = await result.current.requestRoute();
    });

    expect(routeResult).toBeDefined();
    expect(result.current.encodedPolyline).toBe('test_encoded_polyline');
    expect(result.current.route).toHaveLength(3); // From mocked decodePolyline
    expect(result.current.routeDistance).toBe('5.00 km');
    expect(result.current.routeStats.distance).toBe('5.00 km');
    expect(result.current.routeStats.elevation).toBe('+10m');
    expect(result.current.loading).toBe(false);
  });

  it('should handle missing origin or destination', async () => {
    const { result } = renderHook(() => useRoutes());

    await act(async () => {
      await result.current.requestRoute();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Missing Information',
      'Please set both origin and destination locations.'
    );
  });

  it('should handle route API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        error: { message: 'API Error' },
      }),
    });

    const { result } = renderHook(() => useRoutes());

    act(() => {
      result.current.setOrigin({
        name: 'Start',
        placeId: 'place-1',
        latitude: 51.5,
        longitude: -0.1,
      });
      result.current.setDestination({
        name: 'End',
        placeId: 'place-2',
        latitude: 51.6,
        longitude: -0.2,
      });
    });

    await act(async () => {
      await result.current.requestRoute();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Route Error', 'API Error');
  });

  it('should handle network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useRoutes());

    act(() => {
      result.current.setOrigin({
        name: 'Start',
        placeId: 'place-1',
        latitude: 51.5,
        longitude: -0.1,
      });
      result.current.setDestination({
        name: 'End',
        placeId: 'place-2',
        latitude: 51.6,
        longitude: -0.2,
      });
    });

    await act(async () => {
      await result.current.requestRoute();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Network Error',
      'Failed to fetch walking route. Please check your internet connection and try again.'
    );
  });

  it('should reset route state', () => {
    const { result } = renderHook(() => useRoutes());

    // Set some values
    act(() => {
      result.current.setOrigin({ name: 'Start', placeId: 'p1', latitude: 51.5, longitude: -0.1 });
      result.current.setDestination({ name: 'End', placeId: 'p2', latitude: 51.6, longitude: -0.2 });
      result.current.addWaypoint({ name: 'WP', placeId: 'wp1', latitude: 51.55, longitude: -0.15 });
      result.current.setPace(5);
    });

    // Reset
    act(() => {
      result.current.resetRoute();
    });

    expect(result.current.origin).toBeNull();
    expect(result.current.destination).toBeNull();
    expect(result.current.waypoints).toEqual([]);
    expect(result.current.route).toEqual([]);
    expect(result.current.encodedPolyline).toBe('');
    expect(result.current.routeDistance).toBe('');
  });

  it('should calculate estimated time correctly', async () => {
    const mockRouteResponse = {
      routes: [
        {
          polyline: { encodedPolyline: 'test_encoded' },
          legs: [
            {
              distanceMeters: 10000, // 10 km
              startLocation: { latLng: { latitude: 51.5, longitude: -0.1 } },
              endLocation: { latLng: { latitude: 51.6, longitude: -0.2 } },
            },
          ],
          viewport: {
            low: { latitude: 51.5, longitude: -0.2 },
            high: { latitude: 51.6, longitude: -0.1 },
          },
        },
      ],
    };

    const mockElevationResponse = {
      status: 'OK',
      results: [{ elevation: 10 }],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ json: async () => mockRouteResponse })
      .mockResolvedValueOnce({ json: async () => mockElevationResponse });

    const { result } = renderHook(() => useRoutes());

    act(() => {
      result.current.setPace(6); // 6 min/km
      result.current.setOrigin({ name: 'Start', placeId: 'p1', latitude: 51.5, longitude: -0.1 });
      result.current.setDestination({ name: 'End', placeId: 'p2', latitude: 51.6, longitude: -0.2 });
    });

    await act(async () => {
      await result.current.requestRoute();
    });

    // 10 km * 6 min/km = 60 minutes = 1h 0m
    expect(result.current.routeStats.estimatedTime).toBe('1h 0m');
  });

  it('should handle routes with waypoints', async () => {
    const mockRouteResponse = {
      routes: [
        {
          polyline: { encodedPolyline: 'test_encoded' },
          legs: [
            {
              distanceMeters: 2000,
              startLocation: { latLng: { latitude: 51.5, longitude: -0.1 } },
              endLocation: { latLng: { latitude: 51.55, longitude: -0.15 } },
            },
            {
              distanceMeters: 3000,
              startLocation: { latLng: { latitude: 51.55, longitude: -0.15 } },
              endLocation: { latLng: { latitude: 51.6, longitude: -0.2 } },
            },
          ],
          viewport: {
            low: { latitude: 51.5, longitude: -0.2 },
            high: { latitude: 51.6, longitude: -0.1 },
          },
        },
      ],
    };

    const mockElevationResponse = {
      status: 'OK',
      results: [{ elevation: 10 }],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ json: async () => mockRouteResponse })
      .mockResolvedValueOnce({ json: async () => mockElevationResponse });

    const { result } = renderHook(() => useRoutes());

    act(() => {
      result.current.setOrigin({ name: 'Start', placeId: 'p1', latitude: 51.5, longitude: -0.1 });
      result.current.addWaypoint({ name: 'WP', placeId: 'wp1', latitude: 51.55, longitude: -0.15 });
      result.current.setDestination({ name: 'End', placeId: 'p2', latitude: 51.6, longitude: -0.2 });
    });

    await act(async () => {
      await result.current.requestRoute();
    });

    expect(result.current.routeDistance).toBe('5.00 km'); // 2km + 3km
  });

  it('should load saved route', () => {
    const { result } = renderHook(() => useRoutes());

    const savedRoute = {
      id: 'route-1',
      name: 'Saved Route',
      originName: 'Origin',
      destinationName: 'Destination',
      originPlaceId: 'place-1',
      destinationPlaceId: 'place-2',
      originLocation: { latitude: 51.5, longitude: -0.1 },
      destinationLocation: { latitude: 51.6, longitude: -0.2 },
      waypoints: [
        { name: 'WP1', placeId: 'wp-1', latitude: 51.55, longitude: -0.15 },
      ],
      polyline: 'saved_encoded_polyline',
      createdAt: Date.now(),
      distance: '5.2 km',
      elevation: '+150m',
      estimatedTime: '31m',
      pace: 6,
    };

    act(() => {
      result.current.loadSavedRoute(savedRoute);
    });

    expect(result.current.origin?.name).toBe('Origin');
    expect(result.current.destination?.name).toBe('Destination');
    expect(result.current.waypoints).toHaveLength(1);
    expect(result.current.encodedPolyline).toBe('saved_encoded_polyline');
    expect(result.current.routeDistance).toBe('5.2 km');
    expect(result.current.pace).toBe(6);
  });
});
