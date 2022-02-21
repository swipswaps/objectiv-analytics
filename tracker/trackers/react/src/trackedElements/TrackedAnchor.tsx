/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { TrackedLinkContext, TrackedLinkContextProps } from '../trackedContexts/TrackedLinkContext';

/**
 * Generates a TrackedAnchorContext preconfigured with an <a> Element as Component.
 */
export const TrackedAnchor = React.forwardRef<HTMLAnchorElement, Omit<TrackedLinkContextProps, 'Component'>>(
  (props, ref) => <TrackedLinkContext {...props} forwardHref={true} Component={'a'} ref={ref} />
);
