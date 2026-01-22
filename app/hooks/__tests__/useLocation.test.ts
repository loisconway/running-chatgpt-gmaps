/**
 * Unit tests for useLocation hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import useLocation from '../useLocation';

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
jest.mock('expo-location');

describe('useLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    // Default to non-web platform
    Platform.OS = 'ios';
  });

  describe('iOS/Android Platform', () => {
    it('should initialize with null location', () => {
      // Mock to prevent useEffect from running
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: { latitude: 0, longitude: 0 },
      });

      const { result } = renderHook(() => useLocation());

      expect(result.current.currentLocation).toBeNull();
      // Note: loading may be true initially due to useEffect
    });

    it('should request location permission and get current location on mount', async () => {
      const mockLocation = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
        },
      };

      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce(mockLocation);

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.currentLocation).toEqual({
          latitude: 51.5074,
          longitude: -0.1278,
        });
      });
      expect(result.current.loading).toBe(false);
    });

    it('should handle permission denied', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Permission Denied',
          'Location access is required for the best experience.'
        );
      });
      expect(result.current.currentLocation).toBeNull();
    });

    it('should handle location error', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Location error')
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Location Error',
          'Could not determine your current location.'
        );
      });
      expect(result.current.currentLocation).toBeNull();
    });

    it('should manually get current location', async () => {
      const mockLocation = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      };

      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.currentLocation).toBeTruthy();
      }); // Wait for initial mount

      await act(async () => {
        await result.current.getCurrentLocation();
      });

      await waitFor(() => {
        expect(result.current.currentLocation).toEqual({
          latitude: 40.7128,
          longitude: -74.006,
        });
      });
    });
  });

  describe('Web Platform', () => {
    beforeEach(() => {
      Platform.OS = 'web';
      // Mock navigator.geolocation
      Object.defineProperty(global.navigator, 'geolocation', {
        writable: true,
        value: {
          getCurrentPosition: jest.fn(),
        },
      });
    });

    it('should use browser geolocation on web', async () => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
        },
      };

      (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation(
        (success) => {
          success(mockPosition);
        }
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(result.current.currentLocation).toEqual({
          latitude: 51.5074,
          longitude: -0.1278,
        });
      });
    });

    it('should handle geolocation error on web', async () => {
      (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation(
        (_, error) => {
          error({ code: 1, message: 'Permission denied' });
        }
      );

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Location Error',
          'Could not determine your current location.'
        );
      });
    });

    it('should handle missing geolocation API', async () => {
      // Remove geolocation from navigator
      Object.defineProperty(global.navigator, 'geolocation', {
        writable: true,
        value: undefined,
      });

      const { result } = renderHook(() => useLocation());

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Location Not Available',
          'Geolocation is not supported by this browser.'
        );
      });
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('should set loading to true during fetch', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ status: 'granted' }), 100);
          })
      );
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: { latitude: 51.5074, longitude: -0.1278 },
      });

      const { result } = renderHook(() => useLocation());

      // Initially should start loading
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
