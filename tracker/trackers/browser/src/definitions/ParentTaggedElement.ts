/*
 * Copyright 2021 Objectiv B.V.
 */

import { StringifiedLocationTaggingAttributes } from './StringifiedLocationTaggingAttributes';
import { TaggableElement } from './TaggableElement';
import { TaggingAttribute } from './TaggingAttribute';

/**
 * A ParentTaggedElement is a TaggedElement with the TaggingAttribute.parentElementId
 */
export type ParentTaggedElement = TaggableElement &
  Pick<StringifiedLocationTaggingAttributes, TaggingAttribute.parentElementId>;
