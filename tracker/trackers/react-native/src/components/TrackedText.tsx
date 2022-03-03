/*
 * Copyright 2022 Objectiv B.V.
 */

import { getLocationPath, makeIdFromString } from '@objectiv/tracker-core';
import {
  makeTitleFromChildren,
  PressableContextWrapper,
  trackPressEvent,
  useLocationStack,
} from '@objectiv/tracker-react';
import React from 'react';
import { Text, TextProps } from 'react-native';

/**
 * TrackedText has the same props of Text with the addition of an optional `id` prop.
 */
export type TrackedTextProps = TextProps & {
  /**
   * Optional. Auto-generated from `children`. Used to set a PressableContext `id` manually.
   */
  id?: string;
};

/**
 * A Text already wrapped in PressableContext automatically tracking PressEvent.
 */
export const TrackedText = (props: TrackedTextProps) => {
  const { id, ...textProps } = props;

  // Either use the given id or attempt to auto-detect `id` for LinkContext by looking at the `children` prop.
  const pressableTitle = makeTitleFromChildren(props.children);
  const pressableContextId = id ?? makeIdFromString(pressableTitle);

  // If we couldn't generate an `id`, log the issue and return an untracked Component.
  const locationPath = getLocationPath(useLocationStack());
  if (!pressableContextId) {
    console.error(
      `｢objectiv｣ Could not generate a valid id for PressableContext @ ${locationPath}. Please provide the \`id\` property manually.`
    );
    return <Text {...textProps} />;
  }

  return (
    <PressableContextWrapper id={pressableContextId}>
      {(trackingContext) => (
        <Text
          {...textProps}
          onPress={(event) => {
            trackPressEvent(trackingContext);
            props.onPress && props.onPress(event);
          }}
        />
      )}
    </PressableContextWrapper>
  );
};
