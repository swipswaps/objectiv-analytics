/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { boolean, defaulted, object } from 'superstruct';

/**
 * The definition of the `validate` Tagging Attribute
 */
export const ValidateAttribute = object({
  locationUniqueness: defaulted(boolean(), true),
});

export type ValidateAttribute = {
  locationUniqueness: boolean;
};
