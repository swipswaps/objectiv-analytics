import { makeSectionContext } from '@objectiv/tracker-core';
import { ReactNode } from 'react';
import { ReactTracker } from './ReactTracker';
import { TrackerContextProvider, useTracker } from './TrackerContextProvider';

/**
 * Tracker Section wraps a logical section under a new TrackerContext.
 * The resulting tracker will be extended with whatever contexts are already present in ancestor TrackerContexts.
 *
 * TODO add better docs
 *
 */
export const TrackerSection = ({ id, children }: { id: string; children: ReactNode }) => {
  const sectionATracker = new ReactTracker(useTracker(), { locationStack: [makeSectionContext({ id })] });

  return <TrackerContextProvider tracker={sectionATracker}>{children}</TrackerContextProvider>;
};
