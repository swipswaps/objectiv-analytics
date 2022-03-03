/*
 * Copyright 2022 Objectiv B.V.
 */

import { ContentContextWrapper } from '@objectiv/tracker-react';
import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

/**
 * TrackedScrollView has the same props of React Native ScrollView with the addition of a required `id` prop.
 */
export type TrackedScrollViewProps = ScrollViewProps & {
  /**
   * The ContentContext `id`.
   */
  id: string;
};

/**
 * TrackedScrollView is an automatically tracked ScrollView. Wraps ScrollView in ContentContext.
 */
export function TrackedScrollView(props: TrackedScrollViewProps) {
  const { id, ...flatListProps } = props;

  return (
    <ContentContextWrapper id={id}>
      <ScrollView {...flatListProps} />
    </ContentContextWrapper>
  );
}
