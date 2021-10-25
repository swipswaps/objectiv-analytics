import { getLocationPath, LocationPath, LocationStack, makeSectionContext } from '../src';

describe('TrackerState', () => {
  it('getLocationPath', () => {
    const testCases: [LocationStack, LocationPath][] = [
      [[], ''],
      [[makeSectionContext({ id: 'test' })], 'Section:test'],
      [[makeSectionContext({ id: 'parent' }), makeSectionContext({ id: 'child' })], 'Section:parent.Section:child'],
    ]
    testCases.forEach(([locationStack, locationPath]) => {
      expect(getLocationPath(locationStack)).toMatch(locationPath);
    })
  });
});
