import { useTracker } from './ObjectivProvider';
import { ReactTracker } from './ReactTracker';

/**
 * Triggers an ApplicationLoadedEvent when the using component mounts for the first time.
 * This hook is meant to be used high up in the Application. Eg: right after initialization and before routing.
 */
export const useTrackApplicationLoaded = (tracker: ReactTracker = useTracker()) => {
  console.log(tracker);
  // TODO need schema
  //useTrackOnMount(makeApplicationLoadedEvent(), tracker)
};
