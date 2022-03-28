/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { TrackedContentContext } from '../trackedContexts/TrackedContentContext';
import { SingletonTrackedElementProps } from '../types';

/**
 * Generates a TrackedContentContext preconfigured with a <header> Element as Component.
 */
export const TrackedHeader = React.forwardRef<HTMLDivElement, SingletonTrackedElementProps>((props, ref) => (
  <TrackedContentContext {...props} id={props.id ?? 'header'} Component={'header'} ref={ref} />
));
