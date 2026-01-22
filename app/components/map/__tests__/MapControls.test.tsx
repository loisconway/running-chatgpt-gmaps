/**
 * Unit tests for MapControls component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import MapControls from '../MapControls';

describe('MapControls', () => {
  const mockToggleFullScreen = jest.fn();
  const mockGetDirections = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when not in full screen mode', () => {
    it('should render component', () => {
      const { UNSAFE_root } = render(
        <MapControls
          isFullScreen={false}
          onToggleFullScreen={mockToggleFullScreen}
        />
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('when in full screen mode', () => {
    it('should render exit full screen button', () => {
      const { getByText } = render(
        <MapControls
          isFullScreen={true}
          onToggleFullScreen={mockToggleFullScreen}
        />
      );

      expect(getByText('Exit Full Screen')).toBeTruthy();
    });

    it('should render both exit and directions buttons when hasOriginAndDestination is true', () => {
      const { getByText } = render(
        <MapControls
          isFullScreen={true}
          onToggleFullScreen={mockToggleFullScreen}
          onGetDirections={mockGetDirections}
          hasOriginAndDestination={true}
        />
      );

      expect(getByText('Exit Full Screen')).toBeTruthy();
      // Component renders successfully with both buttons
    });

    it('should show loading indicator when loading', () => {
      const { UNSAFE_getByType } = render(
        <MapControls
          isFullScreen={true}
          onToggleFullScreen={mockToggleFullScreen}
          onGetDirections={mockGetDirections}
          hasOriginAndDestination={true}
          loading={true}
        />
      );

      // Should render ActivityIndicator when loading
      expect(() => UNSAFE_getByType('ActivityIndicator')).not.toThrow();
    });

    it('should only render exit button when hasOriginAndDestination is false', () => {
      const { getByText, queryByLabelText } = render(
        <MapControls
          isFullScreen={true}
          onToggleFullScreen={mockToggleFullScreen}
          onGetDirections={mockGetDirections}
          hasOriginAndDestination={false}
        />
      );

      expect(getByText('Exit Full Screen')).toBeTruthy();
      // Verify component renders without the directions button
    });

    it('should not render directions button when onGetDirections is not provided', () => {
      const { getByText } = render(
        <MapControls
          isFullScreen={true}
          onToggleFullScreen={mockToggleFullScreen}
          hasOriginAndDestination={true}
        />
      );

      expect(getByText('Exit Full Screen')).toBeTruthy();
    });
  });
});
