/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TrackingContext } from '@objectiv/tracker-core-react';
import React from 'react';
import { executeOnce } from '../common/executeOnce';
import { makeIdFromString } from '../common/factories/makeIdFromString';
import { makeTitleFromChildren } from '../common/factories/makeTitleFromChildren';
import { trackPressEventHandler } from '../common/trackPressEventHandler';
import { LinkContextWrapper } from '../locationWrappers/LinkContextWrapper';
import { TrackedPressableProps } from '../types';

/**
 * The props of TrackedLinkContext. Extends TrackedPressableProps with the `href` property.
 */
export type TrackedLinkProps = TrackedPressableProps & {
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
export const TrackedLinkContext = React.forwardRef<HTMLElement, TrackedLinkProps>((props, ref) => {
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

  const handleClick = executeOnce(
    async (event: React.MouseEvent<HTMLElement, MouseEvent>, trackingContext: TrackingContext) => {
      await trackPressEventHandler(event, trackingContext, waitUntilTracked);
      props.onClick && props.onClick(event);
    }
  );

  const componentProps = {
    ...otherProps,
    ...(ref ? { ref } : {}),
    ...(forwardId ? { id } : {}),
    ...(forwardTitle ? { title } : {}),
    ...(forwardHref ? { href } : {}),
  };

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
