/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import React from 'react';
import { executeOnce } from '../common/executeOnce';
import { makeIdFromString } from '../common/factories/makeIdFromString';
import { makeTitleFromChildren } from '../common/factories/makeTitleFromChildren';
import { TrackingContext } from '../common/providers/TrackingContext';
import { trackPressEventHandler } from '../common/trackPressEventHandler';
import { PressableContextWrapper } from '../locationWrappers/PressableContextWrapper';
import { TrackedPressableContextProps } from '../types';

/**
 * Generates a new React Element already wrapped in an PressableContext.
 * Automatically tracks PressEvent when the given Component receives an `onClick` SyntheticEvent.
 */
export const TrackedPressableContext = React.forwardRef<HTMLElement, TrackedPressableContextProps>((props, ref) => {
  const {
    Component,
    id,
    title,
    forwardId = false,
    forwardTitle = false,
    waitUntilTracked = false,
    ...otherProps
  } = props;

  const pressableTitle = title ?? makeTitleFromChildren(props.children);

  const pressableId = id ?? makeIdFromString(pressableTitle);

  const handleClick = executeOnce(
    async (event: React.MouseEvent<HTMLElement, MouseEvent>, trackingContext: TrackingContext) => {
      await trackPressEventHandler(event, trackingContext, waitUntilTracked);
      props.onClick && props.onClick(event);
    }
  );

  const componentProps = {
    ...otherProps,
    ...(ref ? { ref } : {}),
    ...(forwardId ? { id } : {}),
    ...(forwardTitle ? { title } : {}),
  };

  return (
    <PressableContextWrapper id={pressableId}>
      {(trackingContext) =>
        React.createElement(Component, {
          ...componentProps,
          onClick: (event) => handleClick(event, trackingContext),
        })
      }
    </PressableContextWrapper>
  );
});
