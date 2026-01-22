import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Line, Text as SvgText } from "react-native-svg";

interface ElevationPoint {
  elevation: number;
  distance: number; // cumulative distance in meters
}

interface ElevationProfileProps {
  elevationData: ElevationPoint[];
  totalDistance: number; // in meters
}

const ElevationProfile: React.FC<ElevationProfileProps> = ({
  elevationData,
  totalDistance,
}) => {
  if (!elevationData || elevationData.length < 2) return null;

  const width = 240;
  const height = 80;
  const padding = { top: 10, right: 10, bottom: 20, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find min and max elevation
  const elevations = elevationData.map((point) => point.elevation);
  const minElevation = Math.floor(Math.min(...elevations));
  const maxElevation = Math.ceil(Math.max(...elevations));
  const elevationRange = maxElevation - minElevation || 1;

  // Scale functions
  const scaleX = (distance: number) =>
    padding.left + (distance / totalDistance) * chartWidth;
  const scaleY = (elevation: number) =>
    padding.top + chartHeight - ((elevation - minElevation) / elevationRange) * chartHeight;

  // Generate path
  const pathData = elevationData
    .map((point, index) => {
      const x = scaleX(point.distance);
      const y = scaleY(point.elevation);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  // Close the path to create filled area
  const firstX = scaleX(elevationData[0].distance);
  const lastX = scaleX(elevationData[elevationData.length - 1].distance);
  const bottomY = padding.top + chartHeight;
  const filledPath = `${pathData} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

  // Calculate distance markers (start, middle, end)
  const distanceMarkers = [
    { distance: 0, label: "0" },
    { distance: totalDistance / 2, label: (totalDistance / 2000).toFixed(1) },
    { distance: totalDistance, label: (totalDistance / 1000).toFixed(1) },
  ];

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Filled area under the line */}
        <Path
          d={filledPath}
          fill="rgba(66, 133, 244, 0.15)"
          stroke="none"
        />
        
        {/* Elevation line */}
        <Path
          d={pathData}
          fill="none"
          stroke="#4285F4"
          strokeWidth={2}
        />

        {/* Y-axis labels (elevation) */}
        <SvgText
          x={padding.left - 5}
          y={scaleY(maxElevation)}
          fontSize="10"
          fill="#999"
          textAnchor="end"
          alignmentBaseline="middle"
        >
          {maxElevation}m
        </SvgText>
        <SvgText
          x={padding.left - 5}
          y={scaleY(minElevation)}
          fontSize="10"
          fill="#999"
          textAnchor="end"
          alignmentBaseline="middle"
        >
          {minElevation}m
        </SvgText>

        {/* X-axis */}
        <Line
          x1={padding.left}
          y1={bottomY}
          x2={padding.left + chartWidth}
          y2={bottomY}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={1}
        />

        {/* X-axis labels (distance in km) */}
        {distanceMarkers.map((marker, index) => (
          <SvgText
            key={index}
            x={scaleX(marker.distance)}
            y={bottomY + 12}
            fontSize="9"
            fill="#999"
            textAnchor="middle"
          >
            {marker.label}km
          </SvgText>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 4,
  },
});

export default ElevationProfile;
