/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { AnyLocationContext } from '../../definitions/LocationContext';
import { stringifyJson } from './stringifyJson';

/**
 * LocationContexts stringifier
 */
export const stringifyLocationContext = (contextObject: AnyLocationContext) => {
  return stringifyJson(contextObject, AnyLocationContext);
};
