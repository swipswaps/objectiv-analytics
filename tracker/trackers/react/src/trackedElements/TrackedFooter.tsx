/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { TrackedContentContext } from '../trackedContexts/TrackedContentContext';
import { SingletonTrackedElementProps } from '../types';

/**
 * Generates a TrackedContentContext preconfigured with a <footer> Element as Component.
 */
export const TrackedFooter = React.forwardRef<HTMLDivElement, SingletonTrackedElementProps>((props, ref) => (
  <TrackedContentContext {...props} id={props.id ?? 'footer'} Component={'footer'} ref={ref} />
));
