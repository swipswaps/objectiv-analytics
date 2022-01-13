/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { TrackedInputContext } from '../trackedContexts/TrackedInputContext';
import { TrackedContextProps } from '../types';

/**
 * Generates a TrackedInputContext preconfigured with a <input> Element as Component.
 */
export const TrackedInput = React.forwardRef<
  HTMLInputElement,
  Omit<TrackedContextProps<HTMLInputElement>, 'Component'>
>((props, ref) => <TrackedInputContext {...props} Component={'input'} ref={ref} />);
