/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { makeIdFromString } from '@objectiv/tracker-core';
import React from 'react';
import { TrackingOptionsProp } from '../../types';
import { makeTitleFromChildren } from './makeTitleFromChildren';

/**
 * Attempts to generate an id by looking at `id`, `title`, `children` and `objectiv.contextId` props.
 */
export const makeIdFromTrackedAnchorProps = (
  props: { id?: string; title?: string; children?: React.ReactNode } & TrackingOptionsProp
) => makeIdFromString(props.id ?? props.objectiv?.contextId ?? props.title ?? makeTitleFromChildren(props.children));
