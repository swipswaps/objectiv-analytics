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
import {
  ElementTrackingAttribute,
  track,
  trackButton,
  trackElement,
  trackExpandableElement,
  trackInput,
  trackLink,
  trackMediaPlayer,
  trackNavigation,
  trackOverlay,
} from '../src';
import matchElementId from './mocks/matchElementId';

describe('track', () => {
  it('should throw when given invalid parameters', () => {
    // @ts-ignore
    expect(() => track({ instance: null })).toThrow();
    // @ts-ignore
    expect(() => track({ instance: undefined })).toThrow();
    // @ts-ignore
    expect(() => track({ instance: 0 })).toThrow();
    // @ts-ignore
    expect(() => track({ instance: false })).toThrow();
    // @ts-ignore
    expect(() => track({ instance: true })).toThrow();
    // @ts-ignore
    expect(() => track({ instance: {} })).toThrow();
    // @ts-ignore
    expect(() => track({ instance: Infinity })).toThrow();
    // @ts-ignore
    expect(() => track({ instance: -Infinity })).toThrow();
    // @ts-ignore
    expect(() => track({ instance: 'test' })).toThrow();
    // @ts-ignore
    expect(() => track({ instance: makeSectionContext({ id: 'test' }), options: 'invalid' })).toThrow();
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
      [ElementTrackingAttribute.parentElementId]: parentTracker[ElementTrackingAttribute.elementId],
      [ElementTrackingAttribute.context]: JSON.stringify({ id: 'test', _context_type: 'SectionContext' }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    });
  });

  it('should return Button tracking attributes', () => {
    const trackingAttributes1 = track({ instance: makeButtonContext({ id: 'test-button', text: 'Click Me' }) });
    const trackingAttributes2 = trackButton({ id: 'test-button', text: 'Click Me' });

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

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Element (Section) tracking attributes', () => {
    const trackingAttributes1 = track({ instance: makeSectionContext({ id: 'test-section' }) });
    const trackingAttributes2 = trackElement({ id: 'test-section' });

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

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return ExpandableElement (ExpandableSection) tracking attributes', () => {
    const trackingAttributes1 = track({ instance: makeExpandableSectionContext({ id: 'test-expandable' }) });
    const trackingAttributes2 = trackExpandableElement({ id: 'test-expandable' });

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

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Input tracking attributes', () => {
    const trackingAttributes1 = track({ instance: makeInputContext({ id: 'test-input' }) });
    const trackingAttributes2 = trackInput({ id: 'test-input' });

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

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Link tracking attributes', () => {
    const trackingAttributes1 = track({
      instance: makeLinkContext({
        id: 'test-link',
        text: 'Click Me',
        href: '/test',
      }),
    });
    const trackingAttributes2 = trackLink({ id: 'test-link', text: 'Click Me', href: '/test' });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({
        id: 'test-link',
        _context_type: 'LinkContext',
        text: 'Click Me',
        href: '/test',
      }),
      [ElementTrackingAttribute.trackClicks]: 'true',
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: undefined,
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return MediaPlayer tracking attributes', () => {
    const trackingAttributes1 = track({ instance: makeMediaPlayerContext({id: 'test-media-player'})});
    const trackingAttributes2 = trackMediaPlayer({ id: 'test-media-player' });

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

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Navigation tracking attributes', () => {
    const trackingAttributes1 = track({instance: makeNavigationContext({ id: 'test-nav'})});
    const trackingAttributes2 = trackNavigation({ id: 'test-nav' });

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

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Overlay tracking attributes', () => {
    const trackingAttributes1 = track({ instance: makeOverlayContext({ id: 'test-overlay' })});
    const trackingAttributes2 = trackOverlay({ id: 'test-overlay' });

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

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
  });

  it('should not allow extra attributes', () => {
    const customSectionContext = {...makeSectionContext({ id: 'test-overlay' }), extraMetadata: { test: 123 }}
    const trackingAttributes = track({ instance: customSectionContext});

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
