/*
 * Copyright 2022 Objectiv B.V.
 */

import { ComponentType } from 'react';
import { ButtonProps } from 'react-native';

export type Tracked<T> = T & { Component?: ComponentType<T> };

export type RequiredId = { id: string };

export type OptionalId = Partial<RequiredId>;

export type TrackedButtonProps = Tracked<ButtonProps> & OptionalId;
