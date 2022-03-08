/*
 * Copyright 2022 Objectiv B.V.
 */

import { InputContextWrapper, trackInputChangeEvent } from '@objectiv/tracker-core-react';
import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

/**
 * TrackedTextInput has the same props of TextInput with the addition of a required `id` prop.
 */
export type TrackedTextInputProps = TextInputProps & {
  /**
   * The InputContext `id`.
   */
  id: string;
};

/**
 * A TextInput already wrapped in InputContext.
 */
export function TrackedTextInput(props: TrackedTextInputProps) {
  const { id, ...switchProps } = props;

  return (
    <InputContextWrapper id={id}>
      {(trackingContext) => (
        <TextInput
          {...switchProps}
          onEndEditing={(event) => {
            trackInputChangeEvent(trackingContext);
            props.onEndEditing && props.onEndEditing(event);
          }}
        />
      )}
    </InputContextWrapper>
  );
}
