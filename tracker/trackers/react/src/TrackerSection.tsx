import { makeSectionContext, Tracker } from '@objectiv/tracker-core';
import { ReactNode } from 'react';
import { ReactTracker } from './ReactTracker';
import { TrackerContextProvider, useTracker } from './TrackerContextProvider';

/**
 * Tracker Section wraps a logical section under a new TrackerContextProvider.
 * The resulting provider will return a tracker extended with whatever contexts are already present in ancestor
 * TrackerContextProviders. Unless a tracker instance is provided to override this default behavior.
 *
 * TODO add better docs
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
