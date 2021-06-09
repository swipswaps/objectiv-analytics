import { TrackerEvent } from "@objectiv/core";
import { useTracker } from "./ObjectivProvider";
import { ReactTracker } from "./ReactTracker";
import { useOnMount } from "./useOnMount";

/**
 * A side effect that triggers the given TrackerEvent on mount.
 */
export const useTrackOnMount = (event: TrackerEvent, tracker: ReactTracker = useTracker()) => {
  useOnMount(() => {
    tracker.trackEvent(event)
  })
}
