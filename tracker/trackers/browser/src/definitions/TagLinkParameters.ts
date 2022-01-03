/*
 * Copyright 2022 Objectiv B.V.
 */

import { assign, object, string } from 'superstruct';
import { LocationTaggerParameters } from './LocationTaggerParameters';

/**
 * tagLink has one extra attribute, `href`, as mandatory parameter.
 */
export const TagLinkParameters = assign(LocationTaggerParameters, object({ href: string() }));
export type TagLinkParameters = LocationTaggerParameters & { href: string };
