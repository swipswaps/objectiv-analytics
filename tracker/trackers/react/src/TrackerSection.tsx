import { makeSectionContext, Tracker } from '@objectiv/tracker-core';
import { ReactNode } from 'react';
import { ReactTracker } from './ReactTracker';
import { TrackerContextProvider, useTracker } from './TrackerContextProvider';

/**
 * Tracker Section wraps a logical section under a new TrackerContext.
 * The resulting tracker will be extended with whatever contexts are already present in ancestor TrackerContexts.
 * Unless a tracker instance is provided to override the default behavior.
 *
 * TODO add better docs
 *
 */
export const TrackerSection = ({
  id,
  tracker = useTracker(),
  children,
}: {
  id: string;
  tracker?: Tracker;
  children: ReactNode;
}) => {
  const sectionATracker = new ReactTracker(tracker, { locationStack: [makeSectionContext({ id })] });

  return <TrackerContextProvider tracker={sectionATracker}>{children}</TrackerContextProvider>;
};
