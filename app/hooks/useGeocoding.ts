/** In order to be able to get addresses of locations rather than lat/long,
 * I use reverse Geocode to fetch the address details.
 * I used this one rather than Google Maps as it wasn't clear if Google Maps would charge for that
 * I had used this in other projects and thought it worked well
 */

// Simple in-memory cache for geocoding results
const geocodeCache = new Map<string, string>();

export const useGeocoding = () => {
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // Create cache key (rounded to 4 decimals ~11m precision)
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    
    // Check cache first
    if (geocodeCache.has(cacheKey)) {
      return geocodeCache.get(cacheKey)!;
    }

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { 
          headers: { "User-Agent": "RunRoutePlanner/1.0" },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Geocoding failed");

      const data = await response.json();
      const addr = data.address;
      const parts: string[] = [];

      if (addr.road) parts.push(addr.road);
      if (addr.neighbourhood) parts.push(addr.neighbourhood);
      else if (addr.suburb) parts.push(addr.suburb);
      else if (addr.village) parts.push(addr.village);
      else if (addr.town) parts.push(addr.town);
      else if (addr.city) parts.push(addr.city);

      const result = parts.length > 0
        ? parts.slice(0, 2).join(", ")
        : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      // Cache the result
      geocodeCache.set(cacheKey, result);
      
      // Limit cache size to prevent memory issues (keep last 100)
      if (geocodeCache.size > 100) {
        const firstKey = geocodeCache.keys().next().value;
        if (firstKey) {
          geocodeCache.delete(firstKey);
        }
      }

      return result;
    } catch (error) {
      // Return coordinates if geocoding fails or times out
      const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      console.log('Geocoding failed:', error instanceof Error ? error.message : 'Unknown error');
      return fallback;
    }
  };

  return { reverseGeocode };
};
