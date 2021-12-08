/*
 * Copyright 2021 Objectiv B.V.
 */

import { generateUUID, makeSectionContext } from '@objectiv/tracker-core';
import { LocationEntry, LocationTree, makeLocationEntry } from '../src';

describe('LocationTree', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    LocationTree.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  it('should not log anything (empty LocationTree)', () => {
    LocationTree.log();

    expect(console.log).not.toHaveBeenCalled();
  });

  it('should not log anything (falsy input)', () => {
    // @ts-ignore
    LocationTree.log(0);

    expect(console.log).not.toHaveBeenCalled();
  });

  it('should throw if the given parentLocationId does not exist', () => {
    // We create two Location entries, but we do not add them to the LocationTree, thus parent retrieval will fail
    const locationEntry = makeLocationEntry(makeSectionContext({ id: 'root' }));
    const parentLocation = makeLocationEntry(makeSectionContext({ id: 'parent' }));

    expect(() => LocationTree.add(locationEntry, parentLocation)).toThrow('Parent LocationEntry Node not found');
  });

  it('should console.error collisions once', () => {
    const locationRootEntry: LocationEntry = {
      id: generateUUID(),
      locationContext: makeSectionContext({ id: 'root' }),
    };
    const locationEntry1 = makeLocationEntry(makeSectionContext({ id: '1' }));
    const locationEntry2 = makeLocationEntry(makeSectionContext({ id: 'oops' }));
    const locationEntry3 = makeLocationEntry(makeSectionContext({ id: 'oops' }));
    const locationEntry4 = makeLocationEntry(makeSectionContext({ id: 'oops' }));

    LocationTree.add(locationRootEntry);
    LocationTree.add(locationEntry1, locationRootEntry);
    LocationTree.add(locationEntry2, locationRootEntry);
    LocationTree.add(locationEntry3, locationRootEntry);
    LocationTree.add(locationEntry4, locationRootEntry);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      '｢objectiv｣ Location collision detected: Section:root / Section:oops'
    );
  });

  it('should log the Location tree', () => {
    const locationRootEntry: LocationEntry = {
      id: generateUUID(),
      locationContext: makeSectionContext({ id: 'root' }),
    };
    const locationEntry1 = makeLocationEntry(makeSectionContext({ id: '1' }));
    const locationEntry2 = makeLocationEntry(makeSectionContext({ id: '2' }));
    const locationEntry2a = makeLocationEntry(makeSectionContext({ id: '2a' }));
    const locationEntry2b = makeLocationEntry(makeSectionContext({ id: '2b' }));
    const locationEntry3 = makeLocationEntry(makeSectionContext({ id: '3' }));
    const locationEntry3a = makeLocationEntry(makeSectionContext({ id: '3a' }));

    LocationTree.add(locationRootEntry);
    LocationTree.add(locationEntry1, locationRootEntry);
    LocationTree.add(locationEntry2, locationRootEntry);
    LocationTree.add(locationEntry2a, locationEntry2);
    LocationTree.add(locationEntry2b, locationEntry2);
    LocationTree.add(locationEntry3, locationRootEntry);
    LocationTree.add(locationEntry3a, locationEntry3);

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
