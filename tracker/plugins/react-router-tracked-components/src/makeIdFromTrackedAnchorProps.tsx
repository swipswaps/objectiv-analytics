/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { makeIdFromString } from '@objectiv/tracker-core';
import { makeTitleFromChildren } from '@objectiv/tracker-react';
import React from 'react';
import { TrackingOptions } from './types';

/**
 * Attempts to generate an id for LinkContext by looking at `id`, `title`, `children` and `objectiv.contextId` props.
 */
export const makeIdFromTrackedAnchorProps = (props: React.HTMLAttributes<HTMLAnchorElement> & TrackingOptions) =>
  makeIdFromString(props.id ?? props.objectiv?.contextId ?? props.title ?? makeTitleFromChildren(props.children));
