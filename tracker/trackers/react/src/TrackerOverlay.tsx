import { makeOverlayContext, Tracker } from '@objectiv/tracker-core';
import { ReactNode } from 'react';
import { ReactTracker } from './ReactTracker';
import { TrackerContextProvider, useTracker } from './TrackerContextProvider';

/**
 * Tracker Overlay is a SectionProvider meant to wrap around popovers, tooltips, modals and layered content in general.
 *
 * TODO add better docs and some examples
 */
export const TrackerOverlay = ({
  id,
  children,
  tracker = useTracker(),
}: {
  id: string;
  children: ReactNode;
  tracker?: Tracker;
}) => {
  const overlayTracker = new ReactTracker(tracker, { locationStack: [makeOverlayContext({ id })] });

  return <TrackerContextProvider tracker={overlayTracker}>{children}</TrackerContextProvider>;
};
