/**
 * Unit tests for useSavedRoutes hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import useSavedRoutes from '../useSavedRoutes';
import * as routeStorage from '../../services/routeStorage';

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
jest.mock('../../services/routeStorage');

const mockSavedRoute = {
  id: 'route-1',
  name: 'Test Route',
  originName: 'Start Point',
  destinationName: 'End Point',
  originPlaceId: 'place-1',
  destinationPlaceId: 'place-2',
  originLocation: { latitude: 51.5, longitude: -0.1 },
  destinationLocation: { latitude: 51.6, longitude: -0.2 },
  polyline: 'encoded_polyline_string',
  createdAt: Date.now(),
  distance: '5.2 km',
  elevation: '+150m',
  estimatedTime: '45m',
  pace: 6,
};

describe('useSavedRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    (routeStorage.getSavedRoutes as jest.Mock).mockResolvedValue([]);
  });

  it('should initialize with empty routes', async () => {
    const { result } = renderHook(() => useSavedRoutes());

    // Loading starts as true
    expect(result.current.loading).toBe(true);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.savedRoutes).toEqual([]);
    expect(result.current.savedRoutesCount).toBe(0);
  });

  it('should load saved routes on mount', async () => {
    const mockRoutes = [mockSavedRoute];
    (routeStorage.getSavedRoutes as jest.Mock).mockResolvedValue(mockRoutes);

    const { result } = renderHook(() => useSavedRoutes());

    await waitFor(() => {
      expect(result.current.savedRoutes).toEqual(mockRoutes);
    });

    expect(result.current.savedRoutesCount).toBe(1);
    expect(result.current.loading).toBe(false);
  });

  it('should handle error when loading routes', async () => {
    (routeStorage.getSavedRoutes as jest.Mock).mockRejectedValue(new Error('Load error'));

    const { result } = renderHook(() => useSavedRoutes());

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to load saved routes');
    });

    expect(result.current.savedRoutes).toEqual([]);
  });

  it('should save a new route', async () => {
    const newRouteData = {
      name: 'New Route',
      originName: 'Origin',
      destinationName: 'Destination',
      originPlaceId: 'place-1',
      destinationPlaceId: 'place-2',
      originLocation: { latitude: 51.5, longitude: -0.1 },
      destinationLocation: { latitude: 51.6, longitude: -0.2 },
      polyline: 'encoded_polyline',
      distance: '3.5 km',
    };

    const savedRoute = { ...newRouteData, id: 'route-2', createdAt: Date.now() };

    (routeStorage.default as jest.Mock).mockResolvedValue(savedRoute);

    const { result } = renderHook(() => useSavedRoutes());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let saveResult: boolean = false;
    await act(async () => {
      saveResult = await result.current.handleSaveRoute(newRouteData);
    });

    expect(saveResult).toBe(true);
    expect(result.current.savedRoutes).toContainEqual(savedRoute);
    expect(result.current.savedRoutesCount).toBe(1);
  });

  it('should limit saved routes to 5', async () => {
    const existingRoutes = Array.from({ length: 5 }, (_, i) => ({
      ...mockSavedRoute,
      id: `route-${i}`,
      name: `Route ${i}`,
    }));

    (routeStorage.getSavedRoutes as jest.Mock).mockResolvedValue(existingRoutes);

    const newRouteData = {
      name: 'New Route',
      originName: 'Origin',
      destinationName: 'Destination',
      originPlaceId: 'place-1',
      destinationPlaceId: 'place-2',
      originLocation: { latitude: 51.5, longitude: -0.1 },
      destinationLocation: { latitude: 51.6, longitude: -0.2 },
      polyline: 'encoded_polyline',
      distance: '3.5 km',
    };

    const savedRoute = { ...newRouteData, id: 'route-new', createdAt: Date.now() };
    (routeStorage.default as jest.Mock).mockResolvedValue(savedRoute);

    const { result } = renderHook(() => useSavedRoutes());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.savedRoutes).toHaveLength(5);
    });

    await act(async () => {
      await result.current.handleSaveRoute(newRouteData);
    });

    // Should still be 5 routes max
    expect(result.current.savedRoutesCount).toBe(5);
    expect(result.current.savedRoutes).toHaveLength(5);
  });

  it('should handle error when saving route', async () => {
    (routeStorage.default as jest.Mock).mockRejectedValue(new Error('Save error'));

    const { result } = renderHook(() => useSavedRoutes());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newRouteData = {
      name: 'New Route',
      originName: 'Origin',
      destinationName: 'Destination',
      originPlaceId: 'place-1',
      destinationPlaceId: 'place-2',
      originLocation: { latitude: 51.5, longitude: -0.1 },
      destinationLocation: { latitude: 51.6, longitude: -0.2 },
      polyline: 'encoded_polyline',
      distance: '3.5 km',
    };

    let saveResult: boolean = true;
    await act(async () => {
      saveResult = await result.current.handleSaveRoute(newRouteData);
    });

    expect(saveResult).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Failed to save route. Please try again.'
    );
  });

  it('should delete a route', async () => {
    const mockRoutes = [mockSavedRoute, { ...mockSavedRoute, id: 'route-2' }];
    (routeStorage.getSavedRoutes as jest.Mock).mockResolvedValue(mockRoutes);
    (routeStorage.deleteRoute as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSavedRoutes());

    await waitFor(() => {
      expect(result.current.savedRoutes).toHaveLength(2);
    });

    await act(async () => {
      await result.current.handleDeleteRoute('route-1');
    });

    expect(routeStorage.deleteRoute).toHaveBeenCalledWith('route-1');
    expect(result.current.savedRoutes).toHaveLength(1);
    expect(result.current.savedRoutes[0].id).toBe('route-2');
    expect(result.current.savedRoutesCount).toBe(1);
  });

  it('should handle error when deleting route', async () => {
    (routeStorage.getSavedRoutes as jest.Mock).mockResolvedValue([mockSavedRoute]);
    (routeStorage.deleteRoute as jest.Mock).mockRejectedValue(new Error('Delete error'));

    const { result } = renderHook(() => useSavedRoutes());

    await waitFor(() => {
      expect(result.current.savedRoutes).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleDeleteRoute('route-1');
    });

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to delete route');
  });

  it('should handle refresh', async () => {
    const mockRoutes = [mockSavedRoute];
    (routeStorage.getSavedRoutes as jest.Mock).mockResolvedValue(mockRoutes);

    const { result } = renderHook(() => useSavedRoutes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleRefresh();
    });

    expect(result.current.refreshing).toBe(true);

    await waitFor(() => {
      expect(result.current.refreshing).toBe(false);
    });

    expect(routeStorage.getSavedRoutes).toHaveBeenCalledTimes(2); // Once on mount, once on refresh
  });

  it('should set loading state during initial load', async () => {
    (routeStorage.getSavedRoutes as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([mockSavedRoute]), 100);
        })
    );

    const { result } = renderHook(() => useSavedRoutes());

    // Should be loading initially
    expect(result.current.loading).toBe(true);

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.savedRoutes).toHaveLength(1);
  });
});
