/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { TrackedNavigationContext } from '../trackedContexts/TrackedNavigationContext';
import { SingletonTrackedElementProps } from '../types';

/**
 * Generates a TrackedNavigationContext preconfigured with a <nav> Element as Component.
 */
export const TrackedNav = React.forwardRef<HTMLDivElement, SingletonTrackedElementProps>((props, ref) => (
  <TrackedNavigationContext {...props} id={props.id ?? 'nav'} Component={'nav'} ref={ref} />
));
