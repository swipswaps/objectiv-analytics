/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { getLocationPath, makeIdFromString } from '@objectiv/tracker-core';
import {
  LinkContextWrapper,
  makeTitleFromChildren,
  TrackedLinkContextProps,
  trackPressEvent,
  useLocationStack,
} from '@objectiv/tracker-react';
import React from 'react';
import { Link, LinkProps, useHref } from 'react-router-dom';

/**
 * Wrapped Link will accept all LinkProps and, optionally, any of the LinkContextWrapperProps.
 */
export type TrackedLinkProps = LinkProps & Omit<TrackedLinkContextProps, 'href' | 'forwardHref' | 'Component'>;

/**
 * Wraps Link in a LinkContext and automatically instruments tracking PressEvent on click.
 */
export const TrackedLink = React.forwardRef<HTMLAnchorElement, TrackedLinkProps>((props, ref) => {
  const { id, title, forwardId, forwardTitle, waitUntilTracked, ...otherProps } = props;

  // Retrieve Location Path for this Component, for debugging purposes.
  const locationPath = getLocationPath(useLocationStack());

  // Use ReactRouter hooks to generate the `href` prop.
  const linkHref = useHref(props.to);

  // Attempt to auto-detect `id` for LinkContext by looking at either the `title` or `children` props.
  const linkTitle = props.title ?? makeTitleFromChildren(props.children);
  const linkId = props.id ?? makeIdFromString(linkTitle);

  // Build LinkProps
  const linkProps = {
    ...otherProps,
    ...(ref ? { ref } : {}),
    ...(forwardId ? { id } : {}),
    ...(forwardTitle ? { title } : {}),
  };

  // If we couldn't generate an `id`, log the issue and return a regular Link component.
  if (!linkId) {
    console.error(
      `｢objectiv｣ Could not generate id for LinkContext @ ${locationPath}. Please provide either the \`title\` or the \`id\` property manually.`
    );
    return <Link {...linkProps} />;
  }

  return (
    <LinkContextWrapper id={linkId} href={linkHref}>
      {(trackingContext) => (
        <Link
          {...linkProps}
          ref={ref}
          onClick={async (event) => {
            if (!props.reloadDocument) {
              // Track PressEvent: non-blocking.
              trackPressEvent(trackingContext);

              // Execute onClick prop, if any.
              props.onClick && props.onClick(event);
            } else {
              // Prevent event from being handled by the user agent.
              event.preventDefault();

              // Track PressEvent: best-effort blocking.
              await trackPressEvent({
                ...trackingContext,
                options: {
                  // Best-effort: wait for Queue to be empty. Times out to max 1s on very slow networks.
                  waitForQueue: true,
                  // Regardless whether waiting resulted in PressEvent being tracked, flush the Queue.
                  flushQueue: true,
                },
              });

              // Execute onClick prop, if any.
              props.onClick && props.onClick(event);

              // Resume navigation.
              window.location.href = linkHref;
            }
          }}
        />
      )}
    </LinkContextWrapper>
  );
});
