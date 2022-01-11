/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { TrackedLinkContext, TrackedLinkContextProps } from '../trackedContexts/TrackedLinkContext';

/**
 * The props of TrackedAnchor. Makes the `href` property optional because we will attempt to auto-detect it.
 */
export type TrackedAnchorProps = Omit<TrackedLinkContextProps, 'Component'> & {
  /**
   * The destination url.
   */
  href?: string;

  /**
   * Whether to forward the given href to the given Component.
   */
  forwardHref?: boolean;
};

/**
 * Generates a TrackedAnchorContext preconfigured with a HTMLAnchorElement as Component.
 */
export const TrackedAnchor = React.forwardRef<HTMLAnchorElement, TrackedAnchorProps>((props, ref) => (
  <TrackedLinkContext {...props} Component={'a'} href={props.href} ref={ref} />
));
