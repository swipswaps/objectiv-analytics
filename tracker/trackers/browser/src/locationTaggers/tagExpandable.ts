/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeExpandableContext } from '@objectiv/tracker-core';
import { create } from 'superstruct';
import { trackerErrorHandler } from '../common/trackerErrorHandler';
import { LocationTaggerParameters } from '../definitions/LocationTaggerParameters';
import { TagLocationReturnValue } from '../definitions/TagLocationReturnValue';
import { tagLocation } from './tagLocation';

/**
 * tagExpandable is a shorthand for tagLocation. It eases the tagging of ExpandableContext bound Elements
 */
export const tagExpandable = (parameters: LocationTaggerParameters): TagLocationReturnValue => {
  try {
    const { id, options } = create(parameters, LocationTaggerParameters);
    return tagLocation({ instance: makeExpandableContext({ id }), options, onError: parameters.onError });
  } catch (error) {
    return trackerErrorHandler(error, parameters);
  }
};
