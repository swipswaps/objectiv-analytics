import { useContext } from 'react';
import { useMount } from 'react-use';
import { ObjectivContext } from './ObjectivProvider';

export default function useTrackApplicationLoaded(tracker) {
  const { tracker: trackerFromContext } = useContext(ObjectivContext);

  const trackerToUse = tracker ?? trackerFromContext;

  useMount(() => {
    trackerToUse.trackEvent({ event: 'ApplicationLoadedEvent' });
  });
}
