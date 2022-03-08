/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { OverlayContextWrapper, trackVisibility, useOnChange } from '@objectiv/tracker-core-react';
import React, { useState } from 'react';
import { TrackedShowableContextProps } from '../types';

/**
 * Generates a new React Element already wrapped in an OverlayContext.
 * Automatically tracks HiddenEvent and VisibleEvent based on the given `isVisible` prop.
 */
export const TrackedOverlayContext = React.forwardRef<HTMLElement, TrackedShowableContextProps>((props, ref) => {
  const [wasVisible, setWasVisible] = useState<boolean>(false);
  const { id, Component, forwardId = false, isVisible = false, ...otherProps } = props;

  useOnChange(isVisible, () => setWasVisible(isVisible));

  const componentProps = {
    ...otherProps,
    ...(ref ? { ref } : {}),
    ...(forwardId ? { id } : {}),
  };

  return (
    <OverlayContextWrapper id={id}>
      {(trackingContext) => {
        if ((wasVisible && !isVisible) || (!wasVisible && isVisible)) {
          trackVisibility({ isVisible, ...trackingContext });
        }
        return React.createElement(Component, componentProps);
      }}
    </OverlayContextWrapper>
  );
});
