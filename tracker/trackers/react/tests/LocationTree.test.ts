/*
 * Copyright 2021 Objectiv B.V.
 */

import { generateUUID, makeSectionContext } from '@objectiv/tracker-core';
import { LocationEntry, LocationTree } from '../src';

describe('LocationTree', () => {
  beforeEach(() => {
    LocationTree.clear();
  });

  afterEach(() => {
    LocationTree.clear();
  });

  it('should not log anything (empty LocationTree)', () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    LocationTree.log();

    expect(console.log).not.toHaveBeenCalled();
  });

  it('should not log anything (falsy input)', () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    // @ts-ignore
    LocationTree.log(0);

    expect(console.log).not.toHaveBeenCalled();
  });

  it('should throw if the given parentLocationId does not exist', () => {
    const locationEntry: LocationEntry = { id: generateUUID(), locationContext: makeSectionContext({ id: 'root' }) };

    expect(() => LocationTree.add(locationEntry, 'non-existing-parent-id')).toThrow('Parent not found');
  });

  it('should log the Location tree', () => {
    const locationRootEntry: LocationEntry = {
      id: generateUUID(),
      locationContext: makeSectionContext({ id: 'root' }),
    };
    const locationEntry1: LocationEntry = { id: generateUUID(), locationContext: makeSectionContext({ id: '1' }) };
    const locationEntry2: LocationEntry = { id: generateUUID(), locationContext: makeSectionContext({ id: '2' }) };
    const locationEntry2a: LocationEntry = { id: generateUUID(), locationContext: makeSectionContext({ id: '2a' }) };
    const locationEntry2b: LocationEntry = { id: generateUUID(), locationContext: makeSectionContext({ id: '2b' }) };
    const locationEntry3: LocationEntry = { id: generateUUID(), locationContext: makeSectionContext({ id: '3' }) };
    const locationEntry3a: LocationEntry = { id: generateUUID(), locationContext: makeSectionContext({ id: '3a' }) };

    LocationTree.add(locationRootEntry, null);
    LocationTree.add(locationEntry1, locationRootEntry.id);
    LocationTree.add(locationEntry2, locationRootEntry.id);
    LocationTree.add(locationEntry2a, locationEntry2.id);
    LocationTree.add(locationEntry2b, locationEntry2.id);
    LocationTree.add(locationEntry3, locationRootEntry.id);
    LocationTree.add(locationEntry3a, locationEntry3.id);

    jest.spyOn(console, 'log').mockImplementation(() => {});

    LocationTree.log();

    expect(console.log).toHaveBeenCalledTimes(7);
    expect(console.log).toHaveBeenNthCalledWith(1, '  SectionContext:root');
    expect(console.log).toHaveBeenNthCalledWith(2, '    SectionContext:1');
    expect(console.log).toHaveBeenNthCalledWith(3, '    SectionContext:2');
    expect(console.log).toHaveBeenNthCalledWith(4, '      SectionContext:2a');
    expect(console.log).toHaveBeenNthCalledWith(5, '      SectionContext:2b');
    expect(console.log).toHaveBeenNthCalledWith(6, '    SectionContext:3');
    expect(console.log).toHaveBeenNthCalledWith(7, '      SectionContext:3a');
  });
});
