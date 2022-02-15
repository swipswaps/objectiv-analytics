/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TrackingContext, trackPressEvent } from '@objectiv/tracker-react';
import React from 'react';

/**
 * TODO: move to React Tracker
 * Anchor click handler factory parameters
 */
type AnchorClickHandlerParameters = {
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
  external?: boolean;

  /**
   * Custom onClick handler that may have been passed to the Tracked Component. Will be invoked after tracking.
   */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * TODO: move to React Tracker
 * Anchor click handler factory
 */
export const makeAnchorClickHandler =
  (props: AnchorClickHandlerParameters) => async (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!props.external) {
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

      // Resume navigation.
      window.location.href = props.anchorHref;
    }
  };
