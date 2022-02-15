/*
 * Copyright 2021-2022 Objectiv B.V.
 */

/**
 * Some extra options that may be useful for special cases, e.g. anchors without texts or external hrefs.
 */
export type TrackingOptions = {
  /**
   * All Objectiv tracking related options reside under this prop.
   */
  objectiv?: {
    /**
     * Whether to block and wait for the Tracker having sent the event, e.g. an external or a full page refresh link.
     */
    external?: boolean;

    /**
     * The unique id of the LinkContext. Required for links without any title nor text.
     */
    contextId?: string;
  };
};
