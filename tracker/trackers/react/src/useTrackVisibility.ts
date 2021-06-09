import { useTracker } from './ObjectivProvider';
import { ReactTracker } from "./ReactTracker";
import { useOnMount, useOnUnmount } from "./helperHooks";

/**
 * A side effect that triggers SectionVisibleEvent and SectionHiddenEvent as the component mounts and unmounts.
 */
export const useTrackVisibility = (tracker: ReactTracker = useTracker()) => {
  useOnMount(() => {
    // TODO need schema
    //tracker.trackEvent(makeSectionVisibleEvent());
    console.log(tracker)
  });

  useOnUnmount(() => {
    // TODO need schema
    //tracker.trackEvent(makeSectionHiddenEvent());
    console.log(tracker)
  });
}
