/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import {
  getLocationPath,
  LocationCollision,
  LocationStack,
  makePressableContext,
  makeContentContext,
  TrackerElementLocations,
} from '../src';

describe('TrackerElementLocations', () => {
  beforeAll(() => {
    TrackerElementLocations.clear();
  });

  const rootSectionContext = makeContentContext({ id: 'root' });
  const overlayContext = makePressableContext({ id: 'overlay' });
  const buttonContext = makePressableContext({ id: 'button' });

  it('getLocationPath', () => {
    const testCases: [LocationStack, string][] = [
      [[], ''],
      [[makeContentContext({ id: 'test' })], 'Content:test'],
      [[makeContentContext({ id: 'parent' }), makeContentContext({ id: 'child' })], 'Content:parent / Content:child'],
    ];
    testCases.forEach(([locationStack, locationPath]) => {
      expect(getLocationPath(locationStack)).toMatch(locationPath);
    });
  });

  describe('add', () => {
    const testCases: [locationStack: LocationStack, elementId: string, isUnique: boolean | LocationCollision][] = [
      // First time an Element provides a never-seen Location it should succeed. This location is now claimed by btn-4
      [[rootSectionContext, buttonContext], 'btn-4', true],

      // Subsequent locations from the same Element should be fine as well
      [[rootSectionContext, buttonContext], 'btn-4', true],
      [[rootSectionContext, buttonContext], 'btn-4', true],

      // Another Elements providing an already-seen Location should fail. This location was already claimed by btn-4
      [
        [rootSectionContext, buttonContext],
        'btn-5',
        { collidingElementId: 'btn-5', existingElementId: 'btn-4', locationPath: 'Content:root / Pressable:button' },
      ],

      // An Element can have multiple Locations - in this example the button has been reused in a modal
      [[rootSectionContext, overlayContext, buttonContext], 'btn-4', true],

      // Again, another Element attempting to use the same location should fail the uniqueness check.
      [
        [rootSectionContext, overlayContext, buttonContext],
        'btn-6',
        {
          collidingElementId: 'btn-6',
          existingElementId: 'btn-4',
          locationPath: 'Content:root / Pressable:overlay / Pressable:button',
        },
      ],

      // No Location - this can happen when developers trigger event manually and provide wrong locations
      [[], 'btn-1', true],
      [[], 'btn-2', true],
    ];
    testCases.forEach(([location_stack, elementId, isUnique]) => {
      const locationPath = getLocationPath(location_stack);
      it(`${locationPath} - ${elementId}`, () => {
        expect(TrackerElementLocations.add({ locationPath, elementId })).toStrictEqual(isUnique);
      });
    });
  });

  describe('delete', () => {
    it('returns false if no elementId is specified', () => {
      expect(TrackerElementLocations.delete(null)).toBe(false);
      expect(TrackerElementLocations.delete(undefined)).toBe(false);
      expect(TrackerElementLocations.delete('')).toBe(false);
    });

    beforeEach(() => {
      TrackerElementLocations.elementLocations = new Map([
        [
          'button-1',
          [
            'Content:root.Pressable:button1',
            'Content:root.Overlay:modal1.Pressable:button1',
            'Content:root.Overlay:modal2.Pressable:button1',
          ],
        ],
        [
          'button-2',
          [
            'Content:root.Pressable:button2',
            'Content:root.Overlay:modal2.Pressable:button2',
            'Content:root.Overlay:modal3.Pressable:button2',
          ],
        ],
      ]);
    });

    it('returns false if a non-existing element is provided', () => {
      expect(TrackerElementLocations.delete('button-nope')).toBe(false);
    });

    it('removes button-1 and all of its locations from state', () => {
      expect(TrackerElementLocations.delete('button-1')).toBe(true);
      expect(TrackerElementLocations.elementLocations).toStrictEqual(
        new Map([
          [
            'button-2',
            [
              'Content:root.Pressable:button2',
              'Content:root.Overlay:modal2.Pressable:button2',
              'Content:root.Overlay:modal3.Pressable:button2',
            ],
          ],
        ])
      );
    });

    it('removes button-2 and all of its locations from state', () => {
      expect(TrackerElementLocations.delete('button-2')).toBe(true);
      expect(TrackerElementLocations.elementLocations).toStrictEqual(
        new Map([
          [
            'button-1',
            [
              'Content:root.Pressable:button1',
              'Content:root.Overlay:modal1.Pressable:button1',
              'Content:root.Overlay:modal2.Pressable:button1',
            ],
          ],
        ])
      );
    });
  });
});
