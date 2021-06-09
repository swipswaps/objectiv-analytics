import { TrackerEvent } from "@objectiv/core";
import { useTracker } from "./ObjectivProvider";
import { ReactTracker } from "./ReactTracker";
import { useOnChange } from "./useOnChange";

/**
 * A side effect that monitors the given `state` and triggers the given TrackerEvent when it changes.
 */
export const useTrackOnChange = <T=unknown>(state: T, event: TrackerEvent, tracker: ReactTracker = useTracker()) => {
  useOnChange<T>(state, () => {
    tracker.trackEvent(event)
  })
}
