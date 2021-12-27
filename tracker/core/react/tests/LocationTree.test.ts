/*
 * Copyright 2021 Objectiv B.V.
 */

import { LocationTree, makeContentContext } from '../src';

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

  it('should throw if the given parentLocation does not exist', () => {
    // We create two Locations, but we do not add them to the LocationTree, thus parent retrieval will fail
    const location = makeContentContext({ id: 'root' });
    const parentLocation = makeContentContext({ id: 'parent' });

    expect(() => LocationTree.add(location, parentLocation)).toThrow('Parent LocationNode not found.');
  });

  it('should console.error collisions once', () => {
    const rootSection = makeContentContext({ id: 'root' });
    const section1 = makeContentContext({ id: '1' });
    const section2 = makeContentContext({ id: 'oops' });
    const section3 = makeContentContext({ id: 'oops' });
    const section4 = makeContentContext({ id: 'oops' });

    LocationTree.add(rootSection);
    LocationTree.add(section1, rootSection);
    LocationTree.add(section2, rootSection);
    LocationTree.add(section3, rootSection);
    LocationTree.add(section4, rootSection);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      '｢objectiv｣ Location collision detected: Content:root / Content:oops'
    );
  });

  it('should log the Location tree', () => {
    const rootSection = makeContentContext({ id: 'root' });
    const section1 = makeContentContext({ id: '1' });
    const section2 = makeContentContext({ id: '2' });
    const section2a = makeContentContext({ id: '2a' });
    const section2b = makeContentContext({ id: '2b' });
    const section3 = makeContentContext({ id: '3' });
    const section3a = makeContentContext({ id: '3a' });

    LocationTree.add(rootSection);
    LocationTree.add(section1, rootSection);
    LocationTree.add(section2, rootSection);
    LocationTree.add(section2a, section2);
    LocationTree.add(section2b, section2);
    LocationTree.add(section3, rootSection);
    LocationTree.add(section3a, section3);

    jest.spyOn(console, 'log').mockImplementation(() => {});

    LocationTree.log();

    expect(console.log).toHaveBeenCalledTimes(7);
    expect(console.log).toHaveBeenNthCalledWith(1, '  ContentContext:root');
    expect(console.log).toHaveBeenNthCalledWith(2, '    ContentContext:1');
    expect(console.log).toHaveBeenNthCalledWith(3, '    ContentContext:2');
    expect(console.log).toHaveBeenNthCalledWith(4, '      ContentContext:2a');
    expect(console.log).toHaveBeenNthCalledWith(5, '      ContentContext:2b');
    expect(console.log).toHaveBeenNthCalledWith(6, '    ContentContext:3');
    expect(console.log).toHaveBeenNthCalledWith(7, '      ContentContext:3a');
  });
});
