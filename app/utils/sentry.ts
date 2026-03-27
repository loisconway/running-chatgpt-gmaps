/**
 * Sentry error tracking configuration
 * Initializes Sentry for error monitoring and performance tracking
 */

import * as Sentry from 'sentry-expo';
import { SENTRY_DSN } from '@env';

export function initSentry() {
  const dsn = SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not found. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    // Disable Sentry in development to avoid noise
    enableInExpoDevelopment: false, // Set to true for testing, false for normal dev
    // Set to true during initial setup to verify it works, then set to false
    debug: false, // Shows Sentry logs in console
    // Sample rate for performance monitoring (5% of transactions)
    tracesSampleRate: 0.05,
    // Environment
    environment: __DEV__ ? 'development' : 'production',
  });
}

export { Sentry };
