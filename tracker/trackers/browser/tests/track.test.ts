import { makeSectionContext, } from '@objectiv/tracker-core';
import { z } from "zod";
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

  it('should call `onError` callback when an error occurs', () => {
    const errorCallback = jest.fn();

    // @ts-ignore
    track({ instance: {} }, errorCallback);

    expect(errorCallback).toHaveBeenCalledTimes(1);
    expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(z.ZodError);
  })

  it('should call `console.error` when an error occurs and `onError` has not been provided', () => {
    const consoleErrorMock = spyOn(console, 'error');

    // @ts-ignore
    track({ instance: {} });

    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock.calls.first().args[0]).toBeInstanceOf(z.ZodError);
  })

});
