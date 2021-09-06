import { StructError } from 'superstruct';
import { trackChild, trackElement, TrackingAttribute } from '../src';

describe('trackChild', () => {
  it('should return an empty object when error occurs', () => {
    // @ts-ignore
    expect(trackChild()).toBeUndefined();
    // @ts-ignore
    expect(trackChild([])).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ query: null, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ query: undefined, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ query: 0, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ query: false, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ query: true, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ query: {}, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ query: Infinity, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ query: -Infinity, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ queryAll: null, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ queryAll: undefined, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ queryAll: 0, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ queryAll: false, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ queryAll: true, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ queryAll: {}, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ queryAll: Infinity, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ queryAll: -Infinity, trackAs: trackElement({ id: 'test' }) })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ query: -Infinity, trackAs: undefined })).toBeUndefined();
    // @ts-ignore
    expect(trackChild({ queryAll: -Infinity, trackAs: undefined })).toBeUndefined();
  });

  it('should call `onError` callback when an error occurs', () => {
    const errorCallback = jest.fn();

    // @ts-ignore
    trackChild({ instance: {} }, errorCallback);

    expect(errorCallback).toHaveBeenCalledTimes(1);
    expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(StructError);
  });

  it('should call `console.error` when an error occurs and `onError` has not been provided', () => {
    const consoleErrorMock = spyOn(console, 'error');

    // @ts-ignore
    trackChild({ instance: {} });

    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock.calls.first().args[0]).toBeInstanceOf(StructError);
  });

  it('should return query and trackAs attributes', () => {
    const consoleErrorMock = spyOn(console, 'error');
    const parameters = { query: '#two', trackAs: trackElement({ id: 'element-two' }) };

    const attributes = trackChild(parameters);

    expect(consoleErrorMock).not.toHaveBeenCalled();
    expect(attributes).toStrictEqual({
      [TrackingAttribute.trackChildren]: JSON.stringify([parameters]),
    });
  });
});
