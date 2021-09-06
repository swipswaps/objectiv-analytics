import { BrowserTracker } from './tracker/BrowserTracker';

/**
 * The interface of our namespace which will be extending the Window interface
 */

export interface ObjectivNamespace {
  tracker: BrowserTracker;
}

/**
 * Window extension for our namespace
 */
declare global {
  interface Window {
    objectiv: ObjectivNamespace;
  }
}

// Preserve existing namespace or initialize to empty one
window.objectiv = window.objectiv || {
  tracker: null,
};

export const getGlobalTracker = (): BrowserTracker | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (typeof window.objectiv === 'undefined') {
    return null;
  }

  if (typeof window.objectiv.tracker === 'undefined') {
    return null;
  }

  return window.objectiv.tracker;
};

export const getDocument = (): Document | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  return document;
};
