/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { InputContextWrapper, TrackingContext, trackInputChangeEvent } from '@objectiv/tracker-react-core';
import React, { FocusEvent, useState } from 'react';
import { TrackedContextProps } from '../types';

/**
 * Generates a new React Element already wrapped in an InputContext.
 * Automatically tracks InputChangeEvent when the given Component receives an `onBlur` SyntheticEvent.
 */
export const TrackedInputContext = React.forwardRef<HTMLInputElement, TrackedContextProps<HTMLInputElement>>(
  (props, ref) => {
    const { id, Component, forwardId = false, defaultValue, ...otherProps } = props;
    const [previousValue, setPreviousValue] = useState<string>(defaultValue ? defaultValue.toString() : '');

    const handleBlur = async (event: FocusEvent<HTMLInputElement>, trackingContext: TrackingContext) => {
      if (previousValue !== event.target.value) {
        setPreviousValue(event.target.value);
        trackInputChangeEvent(trackingContext);
      }

      props.onBlur && props.onBlur(event);
    };

    const componentProps = {
      ...otherProps,
      ...(ref ? { ref } : {}),
      ...(forwardId ? { id } : {}),
      defaultValue,
    };

    return (
      <InputContextWrapper id={id}>
        {(trackingContext) =>
          React.createElement(Component, {
            ...componentProps,
            onBlur: (event) => handleBlur(event, trackingContext),
          })
        }
      </InputContextWrapper>
    );
  }
);
