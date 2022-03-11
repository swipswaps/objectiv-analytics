/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { NoopConsoleImplementation, TrackerConsole } from '../src';

describe('TrackerConsole', () => {
  it('should return undefined', () => {
    TrackerConsole.setImplementation(NoopConsoleImplementation);
    expect(TrackerConsole.debug()).toBe(undefined);
    expect(TrackerConsole.error()).toBe(undefined);
    expect(TrackerConsole.group()).toBe(undefined);
    expect(TrackerConsole.groupCollapsed()).toBe(undefined);
    expect(TrackerConsole.groupEnd()).toBe(undefined);
    expect(TrackerConsole.info()).toBe(undefined);
    expect(TrackerConsole.log()).toBe(undefined);
    expect(TrackerConsole.warn()).toBe(undefined);
  });
});
