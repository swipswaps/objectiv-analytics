/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { getLocationPath } from '@objectiv/tracker-core';
import { LinkContextWrapper, useLocationStack } from '@objectiv/tracker-react';
import React from 'react';
import { Link, LinkProps, useHref } from 'react-router-dom';
import { makeAnchorClickHandler } from './makeAnchorClickHandler';
import { makeIdFromTrackedAnchorProps } from './makeIdFromTrackedAnchorProps';
import { TrackingOptions } from './types';

/**
 * Wrapped Link will accept all LinkProps and, optionally, TrackingOptions.
 */
export type TrackedLinkProps = LinkProps & TrackingOptions;

/**
 * Wraps Link in a LinkContext and automatically instruments tracking PressEvent on click.
 */
export const TrackedLink = React.forwardRef<HTMLAnchorElement, TrackedLinkProps>((props, ref) => {
  const { objectiv, children, ...otherProps } = props;

  // Retrieve Location Path for this Component, for debugging purposes.
  const locationPath = getLocationPath(useLocationStack());

  // Use ReactRouter hooks to generate the `href` prop.
  const linkContextHref = useHref(props.to);

  // Attempt to generate an id for LinkContext by looking at `id`, `title`, `children` and `objectiv.contextId` props.
  const linkContextId = makeIdFromTrackedAnchorProps(props);

  // If we couldn't generate an `id`, log the issue and return a regular Link component.
  if (!linkContextId) {
    console.error(
      `｢objectiv｣ Could not generate id for LinkContext @ ${locationPath}. Either add the \`title\` prop or specify an id manually via the  \`id\` option of the \`objectiv\` prop.`
    );
    return <Link {...otherProps}>{children}</Link>;
  }

  return (
    <LinkContextWrapper id={linkContextId} href={linkContextHref}>
      {(trackingContext) => (
        <Link
          {...otherProps}
          ref={ref}
          onClick={makeAnchorClickHandler({
            trackingContext,
            anchorHref: linkContextHref,
            external: props.objectiv?.external,
            onClick: props.onClick,
          })}
        >
          {children}
        </Link>
      )}
    </LinkContextWrapper>
  );
});
