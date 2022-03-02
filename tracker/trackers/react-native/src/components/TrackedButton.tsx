/*
 * Copyright 2022 Objectiv B.V.
 */

import { getLocationPath, makeIdFromString } from '@objectiv/tracker-core';
import { PressableContextWrapper, trackPressEvent, useLocationStack } from '@objectiv/tracker-react';
import React from 'react';
import { Button, ButtonProps } from 'react-native';

/**
 * TrackedButton has the same props of React Native Button with the addition of an optional `id` prop
 */
export type TrackedButtonProps = ButtonProps & {
  /**
   * Optional. Identifiers are automatically generated from the `title`. This prop can override the auto-detected id.
   */
  id?: string
};

/**
 * TrackedButton is a React Native Button that automatically tracks PressEvents.
 */
export const TrackedButton = (props: TrackedButtonProps) => {
  const { id, ...buttonProps } = props;

  // Either use the given id or attempt to auto-detect `id` for LinkContext by looking at the `title` prop.
  const pressableId = id ?? makeIdFromString(props.title);

  // If we couldn't generate an `id`, log the issue and return an untracked Component.
  const locationPath = getLocationPath(useLocationStack());
  if (!pressableId) {
    console.error(
      `｢objectiv｣ Could not generate a valid id for PressableContext @ ${locationPath}. Please provide the \`id\` property manually.`
    );
    return <Button {...buttonProps} />;
  }

  return (
    <PressableContextWrapper id={pressableId}>
      {(trackingContext) => (
        <Button
          {...buttonProps}
          onPress={(event) => {
            trackPressEvent(trackingContext);
            props.onPress && props.onPress(event);
          }}
        />
      )}
    </PressableContextWrapper>
  );
};
