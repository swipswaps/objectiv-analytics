/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { ObjectivTrackingOptions } from '@objectiv/tracker-react';

/**
 * Some extra options that may be useful for special cases, e.g. anchors without texts or external hrefs.
 */
export type ReactRouterTrackingOptionsProp = {
  /**
   * All Objectiv tracking related options reside under this prop.
   * We omit `waitUntilTracked` because ReactRouter Link and NavLink have a `reloadDocument` with the same meaning.
   */
  objectiv?: Omit<ObjectivTrackingOptions, 'waitUntilTracked'>;
};
