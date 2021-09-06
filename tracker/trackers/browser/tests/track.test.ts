import {
  makeButtonContext,
  makeExpandableSectionContext,
  makeInputContext,
  makeLinkContext,
  makeMediaPlayerContext,
  makeNavigationContext,
  makeOverlayContext,
  makeSectionContext,
} from '@objectiv/tracker-core';
import { StructError } from 'superstruct';
import { track, trackElement, TrackingAttribute } from '../src';
import matchElementId from './mocks/matchElementId';

describe('track', () => {
  it('should return an empty object when error occurs', () => {
    // @ts-ignore
    expect(track()).toBeUndefined();
    // @ts-ignore
    expect(track({})).toBeUndefined();
    // @ts-ignore
    expect(track({ instance: null })).toBeUndefined();
    // @ts-ignore
    expect(track({ instance: undefined })).toBeUndefined();
    // @ts-ignore
    expect(track({ instance: 0 })).toBeUndefined();
    // @ts-ignore
    expect(track({ instance: false })).toBeUndefined();
    // @ts-ignore
    expect(track({ instance: true })).toBeUndefined();
    // @ts-ignore
    expect(track({ instance: {} })).toBeUndefined();
    // @ts-ignore
    expect(track({ instance: Infinity })).toBeUndefined();
    // @ts-ignore
    expect(track({ instance: -Infinity })).toBeUndefined();
    // @ts-ignore
    expect(track({ instance: 'test' })).toBeUndefined();
    // @ts-ignore
    expect(track({ instance: makeSectionContext({ id: 'test' }), options: 'invalid' })).toBeUndefined();
  });

  it('should call `onError` callback when an error occurs', () => {
    const errorCallback = jest.fn();

    // @ts-ignore
    track({ instance: {}, onError: errorCallback });

    expect(errorCallback).toHaveBeenCalledTimes(1);
    expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(StructError);
  });

  it('should call `console.error` when an error occurs and `onError` has not been provided', () => {
    const consoleErrorMock = spyOn(console, 'error');

    // @ts-ignore
    track({ instance: {} });

    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock.calls.first().args[0]).toBeInstanceOf(StructError);
  });

  it('should allow overriding whether to track click, blur and visibility events via options', () => {
    expect(trackElement({ id: 'test' })).toStrictEqual({
      [TrackingAttribute.elementId]: matchElementId,
      [TrackingAttribute.parentElementId]: undefined,
      [TrackingAttribute.context]: JSON.stringify({ _context_type: 'SectionContext', id: 'test' }),
      [TrackingAttribute.trackClicks]: undefined,
      [TrackingAttribute.trackBlurs]: undefined,
      [TrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    });
    expect(
      trackElement({
        id: 'test',
        options: {
          trackClicks: false,
          trackBlurs: true,
          trackVisibility: { mode: 'manual', isVisible: true },
        },
      })
    ).toStrictEqual({
      [TrackingAttribute.elementId]: matchElementId,
      [TrackingAttribute.parentElementId]: undefined,
      [TrackingAttribute.context]: JSON.stringify({ _context_type: 'SectionContext', id: 'test' }),
      [TrackingAttribute.trackClicks]: 'false',
      [TrackingAttribute.trackBlurs]: 'true',
      [TrackingAttribute.trackVisibility]: '{"mode":"manual","isVisible":true}',
    });
  });

  it('should allow overriding parent auto detection via options', () => {
    const parentTracker = trackElement({ id: 'parent' });
    expect(trackElement({ id: 'test' })).toStrictEqual({
      [TrackingAttribute.elementId]: matchElementId,
      [TrackingAttribute.parentElementId]: undefined,
      [TrackingAttribute.context]: JSON.stringify({ _context_type: 'SectionContext', id: 'test' }),
      [TrackingAttribute.trackClicks]: undefined,
      [TrackingAttribute.trackBlurs]: undefined,
      [TrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    });
    expect(trackElement({ id: 'test', options: { parentTracker: parentTracker } })).toStrictEqual({
      [TrackingAttribute.elementId]: matchElementId,
      // @ts-ignore
      [TrackingAttribute.parentElementId]: parentTracker[TrackingAttribute.elementId],
      [TrackingAttribute.context]: JSON.stringify({ _context_type: 'SectionContext', id: 'test' }),
      [TrackingAttribute.trackClicks]: undefined,
      [TrackingAttribute.trackBlurs]: undefined,
      [TrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    });
  });

  it('should return Button tracking attributes', () => {
    const trackingAttributes = track({
      instance: makeButtonContext({ id: 'test-button', text: 'Click Me' }),
    });

    const expectedTrackingAttributes = {
      [TrackingAttribute.elementId]: matchElementId,
      [TrackingAttribute.parentElementId]: undefined,
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'ButtonContext',
        id: 'test-button',
        text: 'Click Me',
      }),
      [TrackingAttribute.trackClicks]: 'true',
      [TrackingAttribute.trackBlurs]: undefined,
      [TrackingAttribute.trackVisibility]: undefined,
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Element (Section) tracking attributes', () => {
    const trackingAttributes = track({ instance: makeSectionContext({ id: 'test-section' }) });

    const expectedTrackingAttributes = {
      [TrackingAttribute.elementId]: matchElementId,
      [TrackingAttribute.parentElementId]: undefined,
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'SectionContext',
        id: 'test-section',
      }),
      [TrackingAttribute.trackClicks]: undefined,
      [TrackingAttribute.trackBlurs]: undefined,
      [TrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return ExpandableElement (ExpandableSection) tracking attributes', () => {
    const trackingAttributes = track({
      instance: makeExpandableSectionContext({ id: 'test-expandable' }),
    });

    const expectedTrackingAttributes = {
      [TrackingAttribute.elementId]: matchElementId,
      [TrackingAttribute.parentElementId]: undefined,
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'ExpandableSectionContext',
        id: 'test-expandable',
      }),
      [TrackingAttribute.trackClicks]: 'true',
      [TrackingAttribute.trackBlurs]: undefined,
      [TrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Input tracking attributes', () => {
    const trackingAttributes = track({ instance: makeInputContext({ id: 'test-input' }) });

    const expectedTrackingAttributes = {
      [TrackingAttribute.elementId]: matchElementId,
      [TrackingAttribute.parentElementId]: undefined,
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'InputContext',
        id: 'test-input',
      }),
      [TrackingAttribute.trackClicks]: undefined,
      [TrackingAttribute.trackBlurs]: 'true',
      [TrackingAttribute.trackVisibility]: undefined,
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Link tracking attributes', () => {
    const trackingAttributes = track({
      instance: makeLinkContext({ id: 'link', text: 'link', href: '/test' }),
    });

    const expectedTrackingAttributes = {
      [TrackingAttribute.elementId]: matchElementId,
      [TrackingAttribute.parentElementId]: undefined,
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'LinkContext',
        id: 'link',
        text: 'link',
        href: '/test',
      }),
      [TrackingAttribute.trackClicks]: 'true',
      [TrackingAttribute.trackBlurs]: undefined,
      [TrackingAttribute.trackVisibility]: undefined,
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return MediaPlayer tracking attributes', () => {
    const trackingAttributes = track({ instance: makeMediaPlayerContext({ id: 'test-media-player' }) });

    const expectedTrackingAttributes = {
      [TrackingAttribute.elementId]: matchElementId,
      [TrackingAttribute.parentElementId]: undefined,
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'MediaPlayerContext',
        id: 'test-media-player',
      }),
      [TrackingAttribute.trackClicks]: undefined,
      [TrackingAttribute.trackBlurs]: undefined,
      [TrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Navigation tracking attributes', () => {
    const trackingAttributes = track({ instance: makeNavigationContext({ id: 'test-nav' }) });

    const expectedTrackingAttributes = {
      [TrackingAttribute.elementId]: matchElementId,
      [TrackingAttribute.parentElementId]: undefined,
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'NavigationContext',
        id: 'test-nav',
      }),
      [TrackingAttribute.trackClicks]: undefined,
      [TrackingAttribute.trackBlurs]: undefined,
      [TrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Overlay tracking attributes', () => {
    const trackingAttributes = track({ instance: makeOverlayContext({ id: 'test-overlay' }) });

    const expectedTrackingAttributes = {
      [TrackingAttribute.elementId]: matchElementId,
      [TrackingAttribute.parentElementId]: undefined,
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'OverlayContext',
        id: 'test-overlay',
      }),
      [TrackingAttribute.trackClicks]: undefined,
      [TrackingAttribute.trackBlurs]: undefined,
      [TrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should not allow extra attributes', () => {
    const customSectionContext = { ...makeSectionContext({ id: 'test-overlay' }), extraMetadata: { test: 123 } };
    const trackingAttributes = track({ instance: customSectionContext, onError: (error: Error) => console.log(error) });

    expect(trackingAttributes).toBeUndefined();
  });
});
