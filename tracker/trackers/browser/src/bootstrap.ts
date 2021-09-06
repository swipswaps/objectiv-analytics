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
export const documentExists = () => typeof document !== 'undefined';
export const locationExists = () => typeof location !== 'undefined';
export const mutationObserverExists = () => typeof MutationObserver !== 'undefined';

/**
 * Initialized window global namespace, unless already existing
 */
if (windowExists()) {
  window.objectiv = window.objectiv || {
    tracker: null,
  };
}

export const getDocument = (): Document | null => {
  if (!documentExists()) {
    return null;
  }

  return document;
};

export const getLocation = (): Location | null => {
  if (!locationExists()) {
    return null;
  }

  return location;
};

/**
 * Helper function to get the current Location href
 */
export const getLocationHref = () => {
  if (!locationExists()) {
    return undefined;
  }

  return getLocation()?.href;
};
