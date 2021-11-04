/*
 * Copyright 2021 Objectiv B.V.
 */

import { StringifiedChildrenTaggingAttributes } from './StringifiedChildrenTaggingAttributes';
import { TaggableElement } from './TaggableElement';

/**
 * A TagChildrenElement is a TaggableElement already decorated with our ChildrenTaggingAttributes
 */
export type TagChildrenElement = TaggableElement & StringifiedChildrenTaggingAttributes;
