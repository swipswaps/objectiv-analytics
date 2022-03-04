/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { getLocationPath, makeIdFromString } from '@objectiv/tracker-core';
import { LinkContextWrapper, makeTitleFromChildren, trackPressEvent, useLocationStack } from '@objectiv/tracker-react';
import { NavigationAction } from '@react-navigation/core';
import { getPathFromState, Link } from '@react-navigation/native';
import { To } from '@react-navigation/native/lib/typescript/src/useLinkTo';
import React from 'react';
import { GestureResponderEvent, TextProps } from 'react-native';

/**
 * The original Props type definition of React Navigation Link.
 */
export type Props<ParamList extends ReactNavigation.RootParamList> = {
  to: To<ParamList>;
  action?: NavigationAction;
  target?: string;
  onPress?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent> | GestureResponderEvent) => void;
} & (TextProps & { children: React.ReactNode });

/**
 * TrackedLink has the same props of Link with an additional optional `id` prop.
 */
export type TrackedLinkProps<ParamList extends ReactNavigation.RootParamList> = Props<ParamList> & {
  /**
   * Optional. Auto-generated from `title`. Used to set a PressableContext `id` manually.
   */
  id?: string;
};

/**
 * A Link already wrapped in PressableContext automatically tracking PressEvent.
 */
export function TrackedLink<ParamList extends ReactNavigation.RootParamList>(props: TrackedLinkProps<ParamList>) {
  const { id, ...linkProps } = props;

  // Either use the given id or attempt to auto-detect `id` for LinkContext by looking at the `children` prop.
  const title = makeTitleFromChildren(props.children);
  const contextId = id ?? makeIdFromString(title);

  // Use React Navigation `getPathFromState` to generate the `href` prop. Unless it was already a string.
  let contextHref: string;
  if (typeof linkProps.to === 'string') {
    contextHref = props.to as string;
  } else {
    contextHref = getPathFromState({
      routes: [
        {
          name: linkProps.to.screen,
          params: linkProps.to.params as {},
        },
      ],
    });
  }

  // If we couldn't generate an `id`, log the issue and return an untracked Component.
  const locationPath = getLocationPath(useLocationStack());
  if (!contextId) {
    console.error(
      `｢objectiv｣ Could not generate a valid id for PressableContext @ ${locationPath}. Please provide the \`id\` property manually.`
    );
    return <Link<ParamList> {...linkProps} />;
  }

  return (
    <LinkContextWrapper id={contextId} href={contextHref}>
      {(trackingContext) => (
        <Link<ParamList>
          {...linkProps}
          onPress={(event) => {
            trackPressEvent(trackingContext);
            props.onPress && props.onPress(event);
          }}
        />
      )}
    </LinkContextWrapper>
  );
}
