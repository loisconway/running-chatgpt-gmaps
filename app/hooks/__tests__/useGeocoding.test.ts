/**
 * Unit tests for useGeocoding hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useGeocoding } from '../useGeocoding';

// Mock fetch globally
global.fetch = jest.fn();

describe('useGeocoding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return geocoded address for valid coordinates', async () => {
    const mockResponse = {
      address: {
        road: 'Main Street',
        neighbourhood: 'Downtown',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useGeocoding());

    // Use unique coordinates to avoid cache hits
    const address = await result.current.reverseGeocode(51.1234, -0.5678);

    expect(address).toBe('Main Street, Downtown');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('nominatim.openstreetmap.org/reverse'),
      expect.objectContaining({
        headers: { 'User-Agent': 'RunRoutePlanner/1.0' },
      })
    );
  });

  it('should return coordinates as fallback when address is not available', async () => {
    const mockResponse = {
      address: {},
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useGeocoding());

    // Use unique coordinates
    const address = await result.current.reverseGeocode(52.9876, -1.5432);

    expect(address).toBe('52.9876, -1.5432');
  });

  it('should return cached result for same coordinates', async () => {
    const mockResponse = {
      address: {
        road: 'Test Road',
        city: 'Test City',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useGeocoding());

    // Clear mock call count
    (global.fetch as jest.Mock).mockClear();

    // First call - should fetch (use unique coords)
    const address1 = await result.current.reverseGeocode(52.2345, -1.2345);
    expect(address1).toBe('Test Road, Test City');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second call with same coordinates - should use cache
    const address2 = await result.current.reverseGeocode(52.2345, -1.2345);
    expect(address2).toBe('Test Road, Test City');
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  it('should handle fetch errors and return coordinates', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGeocoding());

    // Use unique coordinates
    const address = await result.current.reverseGeocode(53.4567, -2.3456);

    expect(address).toBe('53.4567, -2.3456');
  });

  it('should handle timeout and return coordinates', async () => {
    // Mock fetch to throw an abort error (simulating timeout)
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new DOMException('The operation was aborted', 'AbortError'))
    );

    const { result } = renderHook(() => useGeocoding());

    // Use unique coordinates
    const address = await result.current.reverseGeocode(54.7890, -3.4567);

    expect(address).toBe('54.7890, -3.4567');
  });

  it('should construct correct address from various components', async () => {
    const mockResponse = {
      address: {
        road: 'Oxford Street',
        suburb: 'Westminster',
        city: 'London',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useGeocoding());

    // Use unique coordinates
    const address = await result.current.reverseGeocode(55.1234, -4.5678);

    // Should take first two: road and suburb (not neighbourhood)
    expect(address).toBe('Oxford Street, Westminster');
  });

  it('should limit cache size to 100 entries', async () => {
    const { result } = renderHook(() => useGeocoding());

    // Mock successful responses for the first 101 calls
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          address: {
            road: 'Test Road',
          },
        }),
      })
    );

    // Add 101 entries to force cache eviction
    // Use wider spread to ensure unique cache keys
    for (let i = 0; i < 101; i++) {
      await result.current.reverseGeocode(50 + i * 0.1, -0.1 - i * 0.1);
    }

    // Clear the mock and track new calls
    mockFetch.mockClear();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        address: {
          road: 'Road Again',
        },
      }),
    });

    // The first entry should have been evicted, so fetching it again should call fetch
    await result.current.reverseGeocode(50, -0.1);

    // Should have made a new fetch call (not from cache)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  }, 10000);
});
