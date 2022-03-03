/*
 * Copyright 2021 Objectiv B.V.
 */

import { getLocationPath, makeIdFromString } from '@objectiv/tracker-core';
import {
  makeTitleFromChildren,
  PressableContextWrapper,
  trackPressEvent,
  useLocationStack,
} from '@objectiv/tracker-react';
import React from 'react';
import { PressableProps, Pressable } from 'react-native';

/**
 * TrackedPressable has the same props of React Native Pressable with the addition of an obligatory `id` prop.
 */
export type TrackedPressableProps = PressableProps & {
  /**
   * Optional. Auto-generated from `children`. This can be used to set a PressableContext `id` manually.
   */
  id?: string;
};

/**
 * TrackedPressable is an automatically tracked Pressable. Wraps Pressable in PressableContext and tracks PressEvent.
 */
export const TrackedPressable = (props: TrackedPressableProps) => {
  const { id, ...pressableProps } = props;

  // Either use the given id or attempt to auto-detect `id` for LinkContext by looking at the `children` prop.
  const pressableTitle = makeTitleFromChildren(props.children);
  const pressableContextId = id ?? makeIdFromString(pressableTitle);

  // If we couldn't generate an `id`, log the issue and return an untracked Component.
  const locationPath = getLocationPath(useLocationStack());
  if (!pressableContextId) {
    console.error(
      `｢objectiv｣ Could not generate a valid id for PressableContext @ ${locationPath}. Please provide the \`id\` property manually.`
    );
    return <Pressable {...pressableProps} />;
  }

  return (
    <PressableContextWrapper id={pressableContextId}>
      {(trackingContext) => (
        <Pressable
          {...pressableProps}
          onPress={(event) => {
            pressableProps.onPress && pressableProps.onPress(event);
            trackPressEvent(trackingContext);
          }}
        />
      )}
    </PressableContextWrapper>
  );
};
