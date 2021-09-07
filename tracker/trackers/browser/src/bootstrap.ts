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

/**
 * Helpers to check if we can access global browser objects
 */
export const windowExists = () => typeof window !== 'undefined';

/**
 * Initialized window global namespace, unless already existing
 */
if (windowExists()) {
  window.objectiv = window.objectiv || {
    tracker: null,
  };
}

/**
 * Helper function to get the current Location href
 */
export const getLocationHref = () => {
  if (typeof location === 'undefined') {
    return undefined;
  }

  return location.href;
};
