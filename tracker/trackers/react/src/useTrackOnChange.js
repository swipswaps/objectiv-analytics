import { useContext } from 'react';
import { usePrevious } from 'react-use';
import { ObjectivContext } from './ObjectivProvider';

export default function useTrackOnChange(track, event, parentTracker) {
  const { tracker } = useContext(ObjectivContext);
  const prevTrack = usePrevious(track);

  if (prevTrack === undefined) {
    return;
  }

  if (!track || track === prevTrack) {
    return;
  }

  (parentTracker ?? tracker).trackEvent({ event });
}
