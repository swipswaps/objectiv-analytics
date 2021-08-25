import { WebTracker } from '@objectiv/tracker-web';

/**
 * TODO Temporary and probably not needed if we compile to UMD
 */

/**
 * The interface of our namespace which will be extending the Window interface
 */
export interface ObjectivNamespace {
  tracker: WebTracker;
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
