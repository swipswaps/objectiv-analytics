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
import superjson from 'superjson';
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
    const trackingAttributes1 = track('test-button', ContextType.button, { text: 'Click Me' });
    const trackingAttributes2 = trackButton('test-button', 'Click Me');
    const trackingAttributes3 = track(makeButtonContext({ id: 'test-button', text: 'Click Me' }));

    const expectedTrackingAttributes = {
      [TrackingAttribute.objectivElementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.objectivContext]: superjson.stringify({
        _context_type: 'ButtonContext',
        id: 'test-button',
        text: 'Click Me',
      }),
      [TrackingAttribute.objectivTrackClicks]: TrackingAttributeTrue,
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Element (Section) tracking attributes', () => {
    const trackingAttributes1 = track('test-section');
    const trackingAttributes2 = track('test-section', ContextType.element);
    const trackingAttributes3 = trackElement('test-section');
    const trackingAttributes4 = track(makeSectionContext({ id: 'test-section' }));

    const expectedTrackingAttributes = {
      [TrackingAttribute.objectivElementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.objectivContext]: superjson.stringify({
        _context_type: 'SectionContext',
        id: 'test-section',
      }),
      [TrackingAttribute.objectivTrackClicks]: TrackingAttributeFalse,
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes4).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return ExpandableElement (ExpandableSection) tracking attributes', () => {
    const trackingAttributes1 = track('test-expandable', ContextType.expandableElement);
    const trackingAttributes2 = trackExpandableElement('test-expandable');
    const trackingAttributes3 = track(makeExpandableSectionContext({ id: 'test-expandable' }));

    const expectedTrackingAttributes = {
      [TrackingAttribute.objectivElementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.objectivContext]: superjson.stringify({
        _context_type: 'ExpandableSectionContext',
        id: 'test-expandable',
      }),
      [TrackingAttribute.objectivTrackClicks]: TrackingAttributeFalse,
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Input tracking attributes', () => {
    const trackingAttributes1 = track('test-input', ContextType.input);
    const trackingAttributes2 = trackInput('test-input');
    const trackingAttributes3 = track(makeInputContext({ id: 'test-input' }));

    const expectedTrackingAttributes = {
      [TrackingAttribute.objectivElementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.objectivContext]: superjson.stringify({
        _context_type: 'InputContext',
        id: 'test-input',
      }),
      [TrackingAttribute.objectivTrackClicks]: TrackingAttributeFalse,
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Link tracking attributes', () => {
    const trackingAttributes1 = track('test-link', ContextType.link, { text: 'Click Me', href: '/test' });
    const trackingAttributes2 = trackLink('test-link', 'Click Me', '/test');
    const trackingAttributes3 = track(makeLinkContext({ id: 'test-link', text: 'Click Me', href: '/test' }));

    const expectedTrackingAttributes = {
      [TrackingAttribute.objectivElementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.objectivContext]: superjson.stringify({
        _context_type: 'LinkContext',
        id: 'test-link',
        text: 'Click Me',
        href: '/test',
      }),
      [TrackingAttribute.objectivTrackClicks]: TrackingAttributeTrue,
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return MediaPlayer tracking attributes', () => {
    const trackingAttributes1 = track('test-media-player', ContextType.mediaPlayer);
    const trackingAttributes2 = trackMediaPlayer('test-media-player');
    const trackingAttributes3 = track(makeMediaPlayerContext({ id: 'test-media-player' }));

    const expectedTrackingAttributes = {
      [TrackingAttribute.objectivElementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.objectivContext]: superjson.stringify({
        _context_type: 'MediaPlayerContext',
        id: 'test-media-player',
      }),
      [TrackingAttribute.objectivTrackClicks]: TrackingAttributeFalse,
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Navigation tracking attributes', () => {
    const trackingAttributes1 = track('test-nav', ContextType.navigation);
    const trackingAttributes2 = trackNavigation('test-nav');
    const trackingAttributes3 = track(makeNavigationContext({ id: 'test-nav' }));

    const expectedTrackingAttributes = {
      [TrackingAttribute.objectivElementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.objectivContext]: superjson.stringify({
        _context_type: 'NavigationContext',
        id: 'test-nav',
      }),
      [TrackingAttribute.objectivTrackClicks]: TrackingAttributeFalse,
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Overlay tracking attributes', () => {
    const trackingAttributes1 = track('test-overlay', ContextType.overlay);
    const trackingAttributes2 = trackOverlay('test-overlay');
    const trackingAttributes3 = track(makeOverlayContext({ id: 'test-overlay' }));

    const expectedTrackingAttributes = {
      [TrackingAttribute.objectivElementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.objectivContext]: superjson.stringify({
        _context_type: 'OverlayContext',
        id: 'test-overlay',
      }),
      [TrackingAttribute.objectivTrackClicks]: TrackingAttributeFalse,
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes2).toStrictEqual(expectedTrackingAttributes);
    expect(trackingAttributes3).toStrictEqual(expectedTrackingAttributes);
  });
});
