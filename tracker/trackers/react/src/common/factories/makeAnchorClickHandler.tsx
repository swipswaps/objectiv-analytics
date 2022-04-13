/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TrackingContext, trackPressEvent } from '@objectiv/tracker-react-core';
import React from 'react';

/**
 * Anchor click handler factory parameters
 */
export type AnchorClickHandlerParameters = {
  /**
   * TrackingContext can be retrieved either from LocationWrapper render-props or via useTrackingContext.
   */
  trackingContext: TrackingContext;

  /**
   * The anchor href. This is used only when external is set to true, to resume navigation.
   */
  anchorHref: string;

  /**
   * If `true` the handler will cancel the given Event, wait until tracked (best-effort) and then resume navigation.
   */
  waitUntilTracked?: boolean;

  /**
   * Custom onClick handler that may have been passed to the Tracked Component. Will be invoked after tracking.
   */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Anchor click handler factory
 */
export const makeAnchorClickHandler =
  (props: AnchorClickHandlerParameters) => async (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!props.waitUntilTracked) {
      // Track PressEvent: non-blocking.
      trackPressEvent(props.trackingContext);

      // Execute onClick prop, if any.
      props.onClick && props.onClick(event);
    } else {
      // Prevent event from being handled by the user agent.
      event.preventDefault();

      // Track PressEvent: best-effort blocking.
      await trackPressEvent({
        ...props.trackingContext,
        options: {
          // Best-effort: wait for Queue to be empty. Times out to max 1s on very slow networks.
          waitForQueue: true,
          // Regardless whether waiting resulted in PressEvent being tracked, flush the Queue.
          flushQueue: true,
        },
      });

      // Execute onClick prop, if any.
      props.onClick && props.onClick(event);

      // Resume navigation by duplicating the anchor to preserve behavior tied to attributes like
      // `target` and `rel`. During tests in a jsdom environment `currentTarget` doesn't get
      // set so in that case we have to fall back on `target`.
      const originalAnchor = event.currentTarget || event.target;
      const newAnchor = document.createElement('a');
      for (const attribute of originalAnchor.getAttributeNames()) {
        // We know for sure the attribute exists at this point, so we have to convince TypeScript
        newAnchor.setAttribute(attribute, originalAnchor.getAttribute(attribute) as string);
      }

      // Check if the ctrl or meta key was pressed. In this case the user probably wanted to open
      // the link in a new tab, but we can't know for sure since it depends on platform and user
      // preferences. We lost proper behavior when we `preventDefault()`ed so the best we can do is
      // make a guess and hope this is right in most cases.
      if (event.metaKey || event.ctrlKey) {
        newAnchor.setAttribute('target', '_blank');
      }

      newAnchor.click();
    }
  };
