/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { boolean, literal, object, union } from 'superstruct';
import { WaitUntilTrackedOptions } from './WaitUntilTrackedOptions';

/**
 * The definition for the `trackClicks` Tagging Attribute
 */
export const TrackClicksAttribute = union([
  boolean(),
  object({
    waitUntilTracked: union([literal(true), WaitUntilTrackedOptions]),
  }),
]);
export type TrackClicksAttribute =
  | boolean
  | {
      waitUntilTracked: true | WaitUntilTrackedOptions;
    };
