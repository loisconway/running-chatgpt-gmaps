/**
 * Unit tests for RouteCard component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RouteCard from '../RouteCard';
import type { SavedRoute } from '../../../services/routeStorage';

describe('RouteCard', () => {
  const mockRoute: SavedRoute = {
    id: 'route-1',
    name: 'Morning Run',
    originName: 'Central Park',
    destinationName: 'Times Square',
    originPlaceId: 'place-1',
    destinationPlaceId: 'place-2',
    originLocation: { latitude: 40.7829, longitude: -73.9654 },
    destinationLocation: { latitude: 40.7580, longitude: -73.9855 },
    distance: '5.2 km',
    polyline: 'encoded_polyline_data',
    createdAt: new Date('2025-01-20').toISOString(),
    waypoints: [],
  };

  const mockOnView = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render route information correctly', () => {
    const { getByText } = render(
      <RouteCard route={mockRoute} onView={mockOnView} onDelete={mockOnDelete} />
    );

    expect(getByText('Morning Run')).toBeTruthy();
    expect(getByText('Central Park')).toBeTruthy();
    expect(getByText('Times Square')).toBeTruthy();
    expect(getByText('5.2 km')).toBeTruthy();
  });

  it('should call onView when View button is pressed', () => {
    const { getByText } = render(
      <RouteCard route={mockRoute} onView={mockOnView} onDelete={mockOnDelete} />
    );

    const viewButton = getByText('View');
    fireEvent.press(viewButton);

    expect(mockOnView).toHaveBeenCalledTimes(1);
    expect(mockOnView).toHaveBeenCalledWith(mockRoute);
  });

  it('should call onDelete when Delete button is pressed', () => {
    const { getByText } = render(
      <RouteCard route={mockRoute} onView={mockOnView} onDelete={mockOnDelete} />
    );

    const deleteButton = getByText('Delete');
    fireEvent.press(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('route-1');
  });

  it('should not render distance badge when distance is not provided', () => {
    const routeWithoutDistance = { ...mockRoute, distance: undefined };
    const { queryByText } = render(
      <RouteCard route={routeWithoutDistance} onView={mockOnView} onDelete={mockOnDelete} />
    );

    expect(queryByText('5.2 km')).toBeNull();
  });

  it('should render route with waypoints', () => {
    const routeWithWaypoints: SavedRoute = {
      ...mockRoute,
      waypoints: [
        {
          placeId: 'waypoint-1',
          name: 'Brooklyn Bridge',
          latitude: 40.7061,
          longitude: -73.9969,
        },
      ],
    };

    const { getByText } = render(
      <RouteCard route={routeWithWaypoints} onView={mockOnView} onDelete={mockOnDelete} />
    );

    expect(getByText('Morning Run')).toBeTruthy();
  });
});
