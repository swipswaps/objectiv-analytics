/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeRootLocationContext } from '@objectiv/tracker-core';
import { create } from 'superstruct';
import { trackerErrorHandler } from '../common/trackerErrorHandler';
import { LocationTaggerParameters } from '../definitions/LocationTaggerParameters';
import { TagLocationReturnValue } from '../definitions/TagLocationReturnValue';
import { tagLocation } from './tagLocation';

/**
 * tagRootLocation is a shorthand for tagLocation. It eases the tagging of RootLocationContext bound Elements.
 */
export const tagRootLocation = (parameters: LocationTaggerParameters): TagLocationReturnValue => {
  try {
    const { id, options } = create(parameters, LocationTaggerParameters);
    return tagLocation({ instance: makeRootLocationContext({ id }), options, onError: parameters.onError });
  } catch (error) {
    return trackerErrorHandler(error, parameters);
  }
};
