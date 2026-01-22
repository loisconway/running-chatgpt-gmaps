/**
 * ErrorBoundary component to catch and display errors in the app
 * TODO: Enhance with logging service integration, and a more user-friendly UI that matches the rest of the app
 * I also need to test this
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, Button } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    // TODO: Add some sort of logging service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 8 }}>
            An unexpected error occurred.
          </Text>
          <Text style={{ marginBottom: 16 }}>
            Please try again. If the problem continues, you may need to restart the app or contact support.
          </Text>
          {this.state.error && (
            <Text style={{ fontSize: 12, color: 'gray', marginBottom: 16 }}>
              Error details: {this.state.error.message}
            </Text>
          )}
          <Button
            title="Try Again"
            onPress={() => this.setState({ hasError: false })}
          />
        </View>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;