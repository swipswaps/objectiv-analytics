/*
 * Copyright 2021-2022 Objectiv B.V.
 */

/**
 * TODO: move to React Tracker
 * Some extra options that may be useful for special cases, e.g. anchors without texts or external hrefs.
 */
export type ObjectivTrackingOptions = {
  /**
   * Whether to block and wait for the Tracker having sent the event, e.g. an external or a full page refresh link.
   */
  external?: boolean;

  /**
   * The unique id of the LinkContext. Required for links without any title nor text.
   */
  contextId?: string;
};

/**
 * TODO: move to React Tracker
 * The prop containing Objectiv Tracking Options.
 */
export type TrackingOptionsProp = {
  /**
   * All Objectiv tracking related options reside under this prop.
   */
  objectiv?: ObjectivTrackingOptions;
};

/**
 * Some extra options that may be useful for special cases, e.g. anchors without texts or external hrefs.
 */
export type ReactRouterTrackingOptionsProp = {
  /**
   * All Objectiv tracking related options reside under this prop.
   * We omit `external` because ReactRouter Link and NavLink already have a `reloadDocument` with the same meaning.
   */
  objectiv?: Omit<ObjectivTrackingOptions, 'external'>;
};
