import { makeOverlayContext, Tracker } from '@objectiv/tracker-core';
import { ReactNode } from 'react';
import { ReactTracker } from './ReactTracker';
import { TrackerContextProvider, useTracker } from './TrackerContextProvider';

/**
 * Tracker Overlay is a SectionProvider meant to wrap around popovers, tooltips, modals and layered content in general.
 * The resulting provider will return a tracker extended with whatever contexts are already present in ancestor
 * TrackerContextProviders. Unless a tracker instance is provided to override this default behavior.
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
