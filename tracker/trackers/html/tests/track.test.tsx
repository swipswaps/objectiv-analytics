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
import { TrackingAttribute, TrackingAttributeFalse, TrackingAttributeTrue } from '../src/TrackingAttributes';

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
      [TrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'ButtonContext',
        id: 'test-button',
        text: 'Click Me',
      }),
      [TrackingAttribute.trackClicks]: TrackingAttributeTrue,
      [TrackingAttribute.trackBlurs]: TrackingAttributeFalse,
      [TrackingAttribute.trackVisibility]: undefined,
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
      [TrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'SectionContext',
        id: 'test-section',
      }),
      [TrackingAttribute.trackClicks]: TrackingAttributeFalse,
      [TrackingAttribute.trackBlurs]: TrackingAttributeFalse,
      [TrackingAttribute.trackVisibility]: '{"mode":"auto"}',
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
      [TrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'ExpandableSectionContext',
        id: 'test-expandable',
      }),
      [TrackingAttribute.trackClicks]: TrackingAttributeTrue,
      [TrackingAttribute.trackBlurs]: TrackingAttributeFalse,
      [TrackingAttribute.trackVisibility]: '{"mode":"auto"}',
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
      [TrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'InputContext',
        id: 'test-input',
      }),
      [TrackingAttribute.trackClicks]: TrackingAttributeFalse,
      [TrackingAttribute.trackBlurs]: TrackingAttributeTrue,
      [TrackingAttribute.trackVisibility]: undefined,
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
      [TrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'LinkContext',
        id: 'test-link',
        text: 'Click Me',
        href: '/test',
      }),
      [TrackingAttribute.trackClicks]: TrackingAttributeTrue,
      [TrackingAttribute.trackBlurs]: TrackingAttributeFalse,
      [TrackingAttribute.trackVisibility]: undefined,
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
      [TrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'MediaPlayerContext',
        id: 'test-media-player',
      }),
      [TrackingAttribute.trackClicks]: TrackingAttributeFalse,
      [TrackingAttribute.trackBlurs]: TrackingAttributeFalse,
      [TrackingAttribute.trackVisibility]: '{"mode":"auto"}',
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
      [TrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'NavigationContext',
        id: 'test-nav',
      }),
      [TrackingAttribute.trackClicks]: TrackingAttributeFalse,
      [TrackingAttribute.trackBlurs]: TrackingAttributeFalse,
      [TrackingAttribute.trackVisibility]: '{"mode":"auto"}',
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
      [TrackingAttribute.elementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'OverlayContext',
        id: 'test-overlay',
      }),
      [TrackingAttribute.trackClicks]: TrackingAttributeFalse,
      [TrackingAttribute.trackBlurs]: TrackingAttributeFalse,
      [TrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });
});
