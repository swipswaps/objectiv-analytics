import { documentLoaded } from '../documentLoaded';

export function trackDocumentLoaded(tracker) {
  documentLoaded().then(() => {
    tracker.trackEvent({ event: 'DocumentLoadedEvent' });
  });
}
