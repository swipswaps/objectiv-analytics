import {
  getLocationPath,
  LocationPath,
  LocationStack, makeButtonContext,
  makeSectionContext,
  TrackedElement,
  TrackerEvent,
  TrackerState
} from '../src';

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

  it('checkLocation', () => {
    const testCases: [locationStack: LocationStack, element: TrackedElement | undefined, isUnique: boolean][] = [
      // Events without Location, we can't really deduce anything and thus will always be treated as unique
      [[], undefined, true],
      [[], undefined, true],
      [[], undefined, true],

      // An Element without Location, should fail because `empty` location stack has been already registered above
      [[], { id: 'btn-1' }, false],

      // Events with a Location, but no Element specified, same as above, we can't determine much without an Element
      [[makeSectionContext({ id: 'root' })], undefined, true],
      [[makeSectionContext({ id: 'root' })], undefined, true],
      [[makeSectionContext({ id: 'root' })], undefined, true],

      // An Element with an already seen Location, similarly to the previous failure case, it should fail
      [[makeSectionContext({ id: 'root' })], { id: 'btn-2' }, false],

      // Events with a Location and an Element, should be able to trigger as many times it likes
      [[makeSectionContext({ id: 'root' }), makeButtonContext({ id: 'button', text: 'ok' })], { id: 'btn-3' }, true],
      [[makeSectionContext({ id: 'root' }), makeButtonContext({ id: 'button', text: 'ok' })], { id: 'btn-3' }, true],
      [[makeSectionContext({ id: 'root' }), makeButtonContext({ id: 'button', text: 'ok' })], { id: 'btn-3' }, true],

      // Another Element with a different identifier but same location stack as previous case, should fail
      [[makeSectionContext({ id: 'root' }), makeButtonContext({ id: 'button', text: 'ok' })], { id: 'btn-4' }, false],
    ]
    testCases.forEach(([location_stack, element, isUnique]) => {
      const event = new TrackerEvent({ id: 'test', _type: 'test', location_stack });
      expect(TrackerState.checkLocation({ event, element })).toBe(isUnique);
    })
  });
});
