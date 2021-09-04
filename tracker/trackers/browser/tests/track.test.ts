import { makeSectionContext, } from '@objectiv/tracker-core';
import { track } from '../src';

describe('track', () => {
  it('should return an empty object when error occurs', () => {
    // @ts-ignore
    expect(track({ instance: null })).toStrictEqual({});
    // @ts-ignore
    expect(track({ instance: undefined })).toStrictEqual({});
    // @ts-ignore
    expect(track({ instance: 0 })).toStrictEqual({});
    // @ts-ignore
    expect(track({ instance: false })).toStrictEqual({});
    // @ts-ignore
    expect(track({ instance: true })).toStrictEqual({});
    // @ts-ignore
    expect(track({ instance: {} })).toStrictEqual({});
    // @ts-ignore
    expect(track({ instance: Infinity })).toStrictEqual({});
    // @ts-ignore
    expect(track({ instance: -Infinity })).toStrictEqual({});
    // @ts-ignore
    expect(track({ instance: 'test' })).toStrictEqual({});
    // @ts-ignore
    expect(track({ instance: makeSectionContext({ id: 'test' }), options: 'invalid' })).toStrictEqual({});
  });

  // TODO test onError callback
});
