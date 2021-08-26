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
  ContextType,
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

const UUIDV4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

describe('track', () => {
  it('should return Button tracking attributes', () => {
    const trackingAttributes1 = track({
      id: 'test-button',
      type: ContextType.button,
      extraAttributes: { text: 'Click Me' },
    });
    const trackingAttributes2 = trackButton({ id: 'test-button', text: 'Click Me' });
    const trackingAttributes3 = track({ instance: makeButtonContext({ id: 'test-button', text: 'Click Me' }) });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [ElementTrackingAttribute.context]: JSON.stringify({
        _context_type: 'ButtonContext',
        id: 'test-button',
        text: 'Click Me',
      }),
      [ElementTrackingAttribute.trackClicks]: 'true',
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: undefined,
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Element (Section) tracking attributes', () => {
    const trackingAttributes1 = track({ id: 'test-section' });
    const trackingAttributes2 = track({ id: 'test-section', type: ContextType.element });
    const trackingAttributes3 = trackElement({ id: 'test-section' });
    const trackingAttributes4 = track({ instance: makeSectionContext({ id: 'test-section' }) });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [ElementTrackingAttribute.context]: JSON.stringify({
        _context_type: 'SectionContext',
        id: 'test-section',
      }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes4).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return ExpandableElement (ExpandableSection) tracking attributes', () => {
    const trackingAttributes1 = track({ id: 'test-expandable', type: ContextType.expandableElement });
    const trackingAttributes2 = trackExpandableElement({ id: 'test-expandable' });
    const trackingAttributes3 = track({ instance: makeExpandableSectionContext({ id: 'test-expandable' }) });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [ElementTrackingAttribute.context]: JSON.stringify({
        _context_type: 'ExpandableSectionContext',
        id: 'test-expandable',
      }),
      [ElementTrackingAttribute.trackClicks]: 'true',
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Input tracking attributes', () => {
    const trackingAttributes1 = track({ id: 'test-input', type: ContextType.input });
    const trackingAttributes2 = trackInput({ id: 'test-input' });
    const trackingAttributes3 = track({ instance: makeInputContext({ id: 'test-input' }) });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [ElementTrackingAttribute.context]: JSON.stringify({
        _context_type: 'InputContext',
        id: 'test-input',
      }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: 'true',
      [ElementTrackingAttribute.trackVisibility]: undefined,
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Link tracking attributes', () => {
    const trackingAttributes1 = track({
      id: 'test-link',
      type: ContextType.link,
      extraAttributes: { text: 'Click Me', href: '/test' },
    });
    const trackingAttributes2 = trackLink({ id: 'test-link', text: 'Click Me', href: '/test' });
    const trackingAttributes3 = track({
      instance: makeLinkContext({ id: 'test-link', text: 'Click Me', href: '/test' }),
    });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [ElementTrackingAttribute.context]: JSON.stringify({
        _context_type: 'LinkContext',
        id: 'test-link',
        text: 'Click Me',
        href: '/test',
      }),
      [ElementTrackingAttribute.trackClicks]: 'true',
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: undefined,
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return MediaPlayer tracking attributes', () => {
    const trackingAttributes1 = track({ id: 'test-media-player', type: ContextType.mediaPlayer });
    const trackingAttributes2 = trackMediaPlayer({ id: 'test-media-player' });
    const trackingAttributes3 = track({ instance: makeMediaPlayerContext({ id: 'test-media-player' }) });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [ElementTrackingAttribute.context]: JSON.stringify({
        _context_type: 'MediaPlayerContext',
        id: 'test-media-player',
      }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Navigation tracking attributes', () => {
    const trackingAttributes1 = track({ id: 'test-nav', type: ContextType.navigation });
    const trackingAttributes2 = trackNavigation({ id: 'test-nav' });
    const trackingAttributes3 = track({ instance: makeNavigationContext({ id: 'test-nav' }) });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [ElementTrackingAttribute.context]: JSON.stringify({
        _context_type: 'NavigationContext',
        id: 'test-nav',
      }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Overlay tracking attributes', () => {
    const trackingAttributes1 = track({ id: 'test-overlay', type: ContextType.overlay });
    const trackingAttributes2 = trackOverlay({ id: 'test-overlay' });
    const trackingAttributes3 = track({ instance: makeOverlayContext({ id: 'test-overlay' }) });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [ElementTrackingAttribute.context]: JSON.stringify({
        _context_type: 'OverlayContext',
        id: 'test-overlay',
      }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });
});
