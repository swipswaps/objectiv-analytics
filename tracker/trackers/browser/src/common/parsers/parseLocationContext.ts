/*
 * Copyright 2022 Objectiv B.V.
 */

import { AnyLocationContext } from '../../definitions/LocationContext';
import { parseJson } from './parseJson';

/**
 * LocationContexts parser
 */
export const parseLocationContext = (stringifiedContext: string | null) => {
  return parseJson(stringifiedContext, AnyLocationContext);
};
