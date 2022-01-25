/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { ValidChildrenTaggingQuery } from '@objectiv/tracker-browser';
import { parseJson } from './parseJson';

/**
 * ChildrenTaggingAttribute parser
 */
export const parseTagChildren = (stringifiedChildrenTaggingAttribute: string | null): ValidChildrenTaggingQuery[] => {
  if (stringifiedChildrenTaggingAttribute === null) {
    throw new Error('Received `null` while attempting to parse Children Tagging Attribute');
  }

  return parseJson(stringifiedChildrenTaggingAttribute);
};
