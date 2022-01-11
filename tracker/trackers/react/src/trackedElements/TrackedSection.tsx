/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { TrackedContentContext } from '../trackedContexts/TrackedContentContext';
import { TrackedContextProps } from '../types';

/**
 * Generates a TrackedContentContext preconfigured with a <section> Element as Component.
 */
export const TrackedSection = React.forwardRef<HTMLDivElement, Omit<TrackedContextProps, 'Component'>>((props, ref) => (
  <TrackedContentContext {...props} Component={'section'} ref={ref} />
));
