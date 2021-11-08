/*
 * Copyright 2021 Objectiv B.V.
 */

import { define } from 'superstruct';
import uuid from 'uuid-random';

/**
 * Struct definition for UUIDs
 */
export const Uuid = define<string>('Uuid', (value: any) => uuid.test(value));
