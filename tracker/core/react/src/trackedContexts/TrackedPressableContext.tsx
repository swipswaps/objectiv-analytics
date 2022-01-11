/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TrackingContext } from '@objectiv/tracker-core-react';
import React from 'react';
import { executeOnce } from '../common/executeOnce';
import { makeIdFromString } from '../common/factories/makeIdFromString';
import { makeTitleFromChildren } from '../common/factories/makeTitleFromChildren';
import { trackPressEventHandler } from '../common/trackPressEventHandler';
import { PressableContextWrapper } from '../locationWrappers/PressableContextWrapper';
import { TrackedContextProps } from '../types';

/**
 * The props of TrackedPressableContext. Extends TrackedContextProps with then `isVisible` property.
 */
export type TrackedPressableProps = Omit<TrackedContextProps, 'id'> & {
  /**
   * The unique id of the LocationContext. Optional because we will attempt to auto-detect it.
   */
  id?: string;

  /**
   * The title is used to generate a unique identifier. Optional because we will attempt to auto-detect it.
   */
  title?: string;

  /**
   * Whether to forward the given title to the given Component.
   */
  forwardTitle?: boolean;

  /**
   * Whether to block and wait for the Tracker having sent the event. Eg: a button redirecting to a new location.
   */
  waitUntilTracked?: boolean;
};

/**
 * Generates a new React Element already wrapped in an PressableContext.
 * Automatically tracks PressEvent when the given Component receives an `onClick` SyntheticEvent.
 */
export const TrackedPressableContext = React.forwardRef<HTMLElement, TrackedPressableProps>((props, ref) => {
  const {
    Component,
    id,
    title,
    forwardId = false,
    forwardTitle = false,
    waitUntilTracked = false,
    ...otherProps
  } = props;

  const anchorTitle = title ?? makeTitleFromChildren(props.children);

  const anchorId = id ?? makeIdFromString(anchorTitle);

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

  console.log(componentProps);

  return (
    <PressableContextWrapper id={anchorId}>
      {(trackingContext) =>
        React.createElement(Component, {
          ...componentProps,
          onClick: (event) => handleClick(event, trackingContext),
        })
      }
    </PressableContextWrapper>
  );
});
