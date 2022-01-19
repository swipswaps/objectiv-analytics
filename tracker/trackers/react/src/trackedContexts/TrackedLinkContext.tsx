/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { getLocationPath } from '@objectiv/tracker-core';
import React from 'react';
import { executeOnce } from '../common/executeOnce';
import { makeIdFromString } from '../common/factories/makeIdFromString';
import { makeTitleFromChildren } from '../common/factories/makeTitleFromChildren';
import { TrackingContext } from '../common/providers/TrackingContext';
import { trackPressEventHandler } from '../common/trackPressEventHandler';
import { useLocationStack } from '../hooks/consumers/useLocationStack';
import { LinkContextWrapper } from '../locationWrappers/LinkContextWrapper';
import { TrackedPressableContextProps } from '../types';

/**
 * The props of TrackedLinkContext. Extends TrackedPressableProps with the `href` property.
 */
export type TrackedLinkContextProps = TrackedPressableContextProps & {
  /**
   * The destination url.
   */
  href: string;

  /**
   * Whether to forward the given href to the given Component.
   */
  forwardHref?: boolean;
};

/**
 * Generates a new React Element already wrapped in an LinkContext.
 * Automatically tracks PressEvent when the given Component receives an `onClick` SyntheticEvent.
 */
export const TrackedLinkContext = React.forwardRef<HTMLElement, TrackedLinkContextProps>((props, ref) => {
  const {
    Component,
    id,
    title,
    href,
    forwardId = false,
    forwardTitle = false,
    forwardHref = false,
    waitUntilTracked = false,
    ...otherProps
  } = props;

  const linkTitle = title ?? makeTitleFromChildren(props.children);

  const linkId = id ?? makeIdFromString(linkTitle);

  const componentProps = {
    ...otherProps,
    ...(ref ? { ref } : {}),
    ...(forwardId ? { id } : {}),
    ...(forwardTitle ? { title } : {}),
    ...(forwardHref ? { href } : {}),
  };

  if (!linkId) {
    const locationPath = getLocationPath(useLocationStack());
    console.error(
      `｢objectiv｣ Could not generate a valid id for LinkContext @ ${locationPath}. Please provide either the \`title\` or the \`id\` property manually.`
    );
    return React.createElement(Component, componentProps);
  }

  const handleClick = executeOnce(
    async (event: React.MouseEvent<HTMLElement, MouseEvent>, trackingContext: TrackingContext) => {
      await trackPressEventHandler(event, trackingContext, waitUntilTracked);
      props.onClick && props.onClick(event);
    }
  );

  return (
    <LinkContextWrapper id={linkId} href={href}>
      {(trackingContext) =>
        React.createElement(Component, {
          ...componentProps,
          onClick: (event) => handleClick(event, trackingContext),
        })
      }
    </LinkContextWrapper>
  );
});
