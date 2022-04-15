/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { getLocationPath, LocationStack, makeContentContext } from '../src';

describe('getLocationPath', () => {
  it('should convert Location Stacks to human readable strings', () => {
    const testCases: [LocationStack, string][] = [
      [[], ''],
      [[makeContentContext({ id: 'test' })], 'Content:test'],
      [[makeContentContext({ id: 'parent' }), makeContentContext({ id: 'child' })], 'Content:parent / Content:child'],
    ];
    testCases.forEach(([locationStack, locationPath]) => {
      expect(getLocationPath(locationStack)).toMatch(locationPath);
    });
  });
});
