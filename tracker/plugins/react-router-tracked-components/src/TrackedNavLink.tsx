/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { LinkContextWrapperProps } from '@objectiv/tracker-react';
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

/**
 * Wraps NavLink in a LinkContext and automatically instruments tracking PressEvent on click.
 */
export const TrackedNavLink = (props: LinkProps & LinkContextWrapperProps) => <Link {...props} />;
