/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { TrackedPressableContext } from '../trackedContexts/TrackedPressableContext';
import { TrackedPressableContextProps } from '../types';

/**
 * Generates a TrackedPressableContext preconfigured with a HTMLButtonElement as Component.
 */
export const TrackedButton = React.forwardRef<HTMLButtonElement, Omit<TrackedPressableContextProps, 'Component'>>(
  (props, ref) => <TrackedPressableContext {...props} Component={'button'} ref={ref} />
);
