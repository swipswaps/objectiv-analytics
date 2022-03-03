/*
 * Copyright 2022 Objectiv B.V.
 */

import { ContentContextWrapper } from '@objectiv/tracker-react';
import React from 'react';
import { View, ViewProps } from 'react-native';

/**
 * TrackedView has the same props of React Native View with the addition of a required `id` prop.
 */
export type TrackedViewProps = ViewProps & {
  /**
   * The ContentContext `id`.
   */
  id: string;
};

/**
 * TrackedView is an automatically tracked View. Wraps View in ContentContext.
 */
export function TrackedView(props: TrackedViewProps) {
  const { id, ...viewProps } = props;

  return (
    <ContentContextWrapper id={id}>
      <View {...viewProps} />
    </ContentContextWrapper>
  );
}
