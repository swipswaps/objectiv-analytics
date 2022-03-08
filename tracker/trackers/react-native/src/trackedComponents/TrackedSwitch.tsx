/*
 * Copyright 2022 Objectiv B.V.
 */

import { InputContextWrapper, trackInputChangeEvent } from '@objectiv/tracker-core-react';
import React from 'react';
import { Switch, SwitchProps } from 'react-native';

/**
 * TrackedSwitch has the same props of Switch with the addition of a required `id` prop.
 */
export type TrackedSwitchProps = SwitchProps & {
  /**
   * The InputContext `id`.
   */
  id: string;
};

/**
 * A Switch already wrapped in InputContext.
 */
export function TrackedSwitch(props: TrackedSwitchProps) {
  const { id, ...switchProps } = props;

  return (
    <InputContextWrapper id={id}>
      {(trackingContext) => (
        <Switch
          {...switchProps}
          onValueChange={(event) => {
            trackInputChangeEvent(trackingContext);
            props.onValueChange && props.onValueChange(event);
          }}
        />
      )}
    </InputContextWrapper>
  );
}
