/*
 * Copyright 2021 Objectiv B.V.
 */

import { TrackerConsole } from '@objectiv-analytics/tracker-core';

export const mockConsole: TrackerConsole = {
  debug: jest.fn(),
  error: jest.fn(),
  group: jest.fn(),
  groupCollapsed: jest.fn(),
  groupEnd: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
};
