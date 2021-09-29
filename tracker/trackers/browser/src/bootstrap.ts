import { windowExists } from './globals';
import { TrackerRepository } from './tracker/TrackerRepository';

/**
 * The interface of our namespace which will be extending the Window interface
 */

export interface ObjectivNamespace {
  trackers: TrackerRepository;
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
 * Initialized window global namespace, unless already existing
 */
if (windowExists()) {
  window.objectiv = window.objectiv || {
    trackers: new TrackerRepository(),
  };
}
