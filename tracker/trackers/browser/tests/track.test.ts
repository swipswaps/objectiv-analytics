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
import { z } from "zod";
import { ElementTrackingAttribute, track, trackElement, trackImplementation } from '../src';
import matchElementId from "./mocks/matchElementId";


describe('trackImplementation', () => {
  it('should throw when given invalid parameters', () => {
    // @ts-ignore
    expect(() => trackImplementation({ instance: null })).toThrow();
    // @ts-ignore
    expect(() => trackImplementation({ instance: undefined })).toThrow();
    // @ts-ignore
    expect(() => trackImplementation({ instance: 0 })).toThrow();
    // @ts-ignore
    expect(() => trackImplementation({ instance: false })).toThrow();
    // @ts-ignore
    expect(() => trackImplementation({ instance: true })).toThrow();
    // @ts-ignore
    expect(() => trackImplementation({ instance: {} })).toThrow();
    // @ts-ignore
    expect(() => trackImplementation({ instance: Infinity })).toThrow();
    // @ts-ignore
    expect(() => trackImplementation({ instance: -Infinity })).toThrow();
    // @ts-ignore
    expect(() => trackImplementation({ instance: 'test' })).toThrow();
    // @ts-ignore
    expect(() => trackImplementation({ instance: makeSectionContext({ id: 'test' }), options: 'invalid' })).toThrow();
  });

  it('should allow overriding whether to track click, blur and visibility events via options', () => {
    expect(trackElement({ id: 'test' })).toStrictEqual({
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({ id: 'test', _context_type: 'SectionContext' }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    });
    expect(
      trackElement({
        id: 'test',
        options: {
          trackClicks: true,
          trackBlurs: true,
          trackVisibility: { mode: 'manual', isVisible: true },
        },
      })
    ).toStrictEqual({
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({ id: 'test', _context_type: 'SectionContext' }),
      [ElementTrackingAttribute.trackClicks]: 'true',
      [ElementTrackingAttribute.trackBlurs]: 'true',
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"manual","isVisible":true}',
    });
  });

  it('should allow overriding parent auto detection via options', () => {
    const parentTracker = trackElement({ id: 'parent' });
    expect(trackElement({ id: 'test' })).toStrictEqual({
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({ id: 'test', _context_type: 'SectionContext' }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    });
    expect(trackElement({ id: 'test', options: { parentTracker: parentTracker } })).toStrictEqual({
      [ElementTrackingAttribute.elementId]: matchElementId,
      // @ts-ignore
      [ElementTrackingAttribute.parentElementId]: parentTracker[ElementTrackingAttribute.elementId],
      [ElementTrackingAttribute.context]: JSON.stringify({ id: 'test', _context_type: 'SectionContext' }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    });
  });

  it('should return Button tracking attributes', () => {
    const trackingAttributes = trackImplementation({ instance: makeButtonContext({ id: 'test-button', text: 'Click Me' }) });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({
        id: 'test-button',
        _context_type: 'ButtonContext',
        text: 'Click Me',
      }),
      [ElementTrackingAttribute.trackClicks]: 'true',
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: undefined,
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Element (Section) tracking attributes', () => {
    const trackingAttributes = trackImplementation({ instance: makeSectionContext({ id: 'test-section' }) });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({
        id: 'test-section',
        _context_type: 'SectionContext',
      }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return ExpandableElement (ExpandableSection) tracking attributes', () => {
    const trackingAttributes = trackImplementation({ instance: makeExpandableSectionContext({ id: 'test-expandable' }) });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({
        id: 'test-expandable',
        _context_type: 'ExpandableSectionContext',
      }),
      [ElementTrackingAttribute.trackClicks]: 'true',
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Input tracking attributes', () => {
    const trackingAttributes = trackImplementation({ instance: makeInputContext({ id: 'test-input' }) });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({
        id: 'test-input',
        _context_type: 'InputContext',
      }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: 'true',
      [ElementTrackingAttribute.trackVisibility]: undefined,
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Link tracking attributes', () => {
    const trackingAttributes = trackImplementation({ instance: makeLinkContext({ id: 'link', text: 'link', href: '/test' })});

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({
        id: 'link',
        _context_type: 'LinkContext',
        text: 'link',
        href: '/test',
      }),
      [ElementTrackingAttribute.trackClicks]: 'true',
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: undefined,
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return MediaPlayer tracking attributes', () => {
    const trackingAttributes = trackImplementation({ instance: makeMediaPlayerContext({id: 'test-media-player'})});

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({
        id: 'test-media-player',
        _context_type: 'MediaPlayerContext',
      }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Navigation tracking attributes', () => {
    const trackingAttributes = trackImplementation({instance: makeNavigationContext({ id: 'test-nav'})});

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({
        id: 'test-nav',
        _context_type: 'NavigationContext',
      }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Overlay tracking attributes', () => {
    const trackingAttributes = trackImplementation({ instance: makeOverlayContext({ id: 'test-overlay' })});

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({
        id: 'test-overlay',
        _context_type: 'OverlayContext',
      }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should not allow extra attributes', () => {
    const customSectionContext = {...makeSectionContext({ id: 'test-overlay' }), extraMetadata: { test: 123 }}
    const trackingAttributes = trackImplementation({ instance: customSectionContext});

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({
        id: 'test-overlay',
        _context_type: 'SectionContext',
      }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });
});


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
