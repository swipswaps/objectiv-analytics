import { useTracker } from './ObjectivProvider';
import { ReactTracker } from "./ReactTracker";

/**
 * A side effect that triggers SectionVisibleEvent and SectionHiddenEvent as the component mounts and unmounts.
 */
export const useTrackVisibility = (tracker: ReactTracker = useTracker()) => {
  console.log(tracker)

  // TODO need schema
  //useTrackOnMount(makeSectionVisibleEvent(), tracker);

  // TODO need schema
  //useTrackOnUnmount(makeSectionHiddenEvent(), tracker);
}
