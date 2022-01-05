/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { makeContentContext } from '@objectiv/tracker-core';
import { create } from 'superstruct';
import { trackerErrorHandler } from '../common/trackerErrorHandler';
import { LocationTaggerParameters } from '../definitions/LocationTaggerParameters';
import { TagLocationReturnValue } from '../definitions/TagLocationReturnValue';
import { tagLocation } from './tagLocation';

/**
 * tagContent is a shorthand for tagLocation. It eases the tagging of ContentContext bound Elements.
 */
export const tagContent = (parameters: LocationTaggerParameters): TagLocationReturnValue => {
  try {
    const { id, options } = create(parameters, LocationTaggerParameters);
    return tagLocation({ instance: makeContentContext({ id }), options, onError: parameters.onError });
  } catch (error) {
    return trackerErrorHandler(error, parameters);
  }
};
