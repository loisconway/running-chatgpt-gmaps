import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}
type LocationType = {
  name?: string;
  placeId?: string;
  latitude: number;
  longitude: number;
};

type MapProps = {
  route: LocationType[];
};

const MapRouteWeb: React.FC<MapProps> = ({ route }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    const map = new window.google.maps.Map(mapRef.current as HTMLDivElement, {
      center: route[0],
      zoom: 14,
    });

    const path = new window.google.maps.Polyline({
      path: route,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });

    path.setMap(map);
  }, [route]);

  return <div ref={mapRef} style={{ width: "100%", height: "500px" }} />;
};

export default MapRouteWeb;
