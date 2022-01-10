/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React, { useState } from 'react';
import { trackVisibility } from '../eventTrackers/trackVisibility';
import { useOnChange } from '../hooks/useOnChange';
import { ExpandableContextWrapper } from '../locationWrappers/ExpandableContextWrapper';
import { TrackedContextProps } from '../types';

/**
 * The props of TrackedExpandableContext. Extends TrackedContextProps with then `isVisible` property.
 */
export type TrackedExtendableProps = TrackedContextProps & {
  /**
   * Whether to track visibility events automatically when this prop changes state.
   */
  isVisible?: boolean;
};

/**
 * Generates a new React Element already wrapped in an ExpandableContext.
 * Automatically tracks HiddenEvent and VisibleEvent based on the given `isVisible` prop.
 */
export const TrackedExpandableContext = React.forwardRef<HTMLElement, TrackedExtendableProps>((props, ref) => {
  const [wasVisible, setWasVisible] = useState<boolean>(false);
  const { id, Component, forwardId = false, isVisible = false, ...otherProps } = props;

  useOnChange(isVisible, () => setWasVisible(isVisible));

  const componentProps = {
    ...otherProps,
    ...(ref ? { ref } : {}),
    ...(forwardId ? { id } : {}),
  };

  return (
    <ExpandableContextWrapper id={id}>
      {(trackingContext) => {
        if ((wasVisible && !isVisible) || (!wasVisible && isVisible)) {
          trackVisibility({ isVisible, ...trackingContext });
        }
        return React.createElement(Component, componentProps);
      }}
    </ExpandableContextWrapper>
  );
});
