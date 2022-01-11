/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { TrackedNavigationContext } from '../trackedContexts/TrackedNavigationContext';
import { SingletonTrackedElementProps } from '../types';

/**
 * Generates a TrackedNavigationContext preconfigured with a <footer> Element as Component.
 */
export const TrackedFooter = React.forwardRef<HTMLDivElement, SingletonTrackedElementProps>((props, ref) => (
  <TrackedNavigationContext {...props} id={props.id ?? 'footer'} Component={'footer'} ref={ref} />
));
