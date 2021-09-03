import {
  ContextType,
  ElementTrackingAttribute,
  StringifiedElementTrackingAttributes,
  track,
  trackButton,
  trackElement,
  trackExpandableElement,
  trackInput,
  trackLink,
  trackMediaPlayer,
  trackNavigation,
  trackOverlay
} from '../src';
import matchElementId from "./mocks/matchElementId";

describe('track', () => {
  it('should throw when given invalid parameters', () => {
    // @ts-ignore
    expect(() => track({ id: null })).toThrow();
    // @ts-ignore
    expect(() => track({ id: undefined })).toThrow();
    // @ts-ignore
    expect(() => track({ id: 0 })).toThrow();
    // @ts-ignore
    expect(() => track({ id: false })).toThrow();
    // @ts-ignore
    expect(() => track({ id: true })).toThrow();
    // @ts-ignore
    expect(() => track({ id: {} })).toThrow();
    // @ts-ignore
    expect(() => track({ id: Infinity })).toThrow();
    // @ts-ignore
    expect(() => track({ id: -Infinity })).toThrow();
    // @ts-ignore
    expect(() => track({ id: 'test', type: ContextType.button })).toThrow();
    // @ts-ignore
    expect(() => track({ id: 'test', type: ContextType.button })).toThrow();
    // @ts-ignore
    expect(() => track({ id: 'test', type: ContextType.link })).toThrow();
    // @ts-ignore
    expect(() => track({ id: 'test', type: ContextType.link, extraAttributes: { href: '/path' } })).toThrow();
    // @ts-ignore
    expect(() => track({ id: 'test', type: ContextType.link, extraAttributes: { text: 'some text' } })).toThrow();
    // @ts-ignore
    expect(() => track({ id: 'test', type: 'invalid' })).toThrow();
    // @ts-ignore
    expect(() => track({ id: 'test', options: 'invalid' })).toThrow();
  });

  it('should allow overriding whether to track click, blur and visibility events via options', () => {
    expect(track({ id: 'test' })).toStrictEqual({
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({ _context_type: 'SectionContext', id: 'test' }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    });
    expect(
      track({
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
      [ElementTrackingAttribute.context]: JSON.stringify({ _context_type: 'SectionContext', id: 'test' }),
      [ElementTrackingAttribute.trackClicks]: 'true',
      [ElementTrackingAttribute.trackBlurs]: 'true',
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"manual","isVisible":true}',
    });
  });

  it('should allow overriding parent auto detection via options', () => {
    const parentTracker = track({ id: 'parent' }) as StringifiedElementTrackingAttributes;
    expect(track({ id: 'test' })).toStrictEqual({
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({ _context_type: 'SectionContext', id: 'test' }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    });
    expect(track({ id: 'test', options: { parentTracker: parentTracker } })).toStrictEqual({
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: parentTracker[ElementTrackingAttribute.elementId],
      [ElementTrackingAttribute.context]: JSON.stringify({ _context_type: 'SectionContext', id: 'test' }),
      [ElementTrackingAttribute.trackClicks]: undefined,
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: '{"mode":"auto"}',
    });
  });

  it('should return Button tracking attributes', () => {
    const trackingAttributes1 = track({
      id: 'test-button',
      type: ContextType.button,
      extraAttributes: { text: 'Click Me' },
    });
    const trackingAttributes2 = trackButton({ id: 'test-button', text: 'Click Me' });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
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
  });

  it('should return Element (Section) tracking attributes', () => {
    const trackingAttributes1 = track({ id: 'test-section' });
    const trackingAttributes2 = track({ id: 'test-section', type: ContextType.element });
    const trackingAttributes3 = trackElement({ id: 'test-section' });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
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
  });

  it('should return ExpandableElement (ExpandableSection) tracking attributes', () => {
    const trackingAttributes1 = track({ id: 'test-expandable', type: ContextType.expandableElement });
    const trackingAttributes2 = trackExpandableElement({ id: 'test-expandable' });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
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
  });

  it('should return Input tracking attributes', () => {
    const trackingAttributes1 = track({ id: 'test-input', type: ContextType.input });
    const trackingAttributes2 = trackInput({ id: 'test-input' });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
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
  });

  it('should return Link tracking attributes', () => {
    const trackingAttributes1 = track({
      id: 'test-link',
      type: ContextType.link,
      extraAttributes: { text: 'Click Me', href: '/test' },
    });
    const trackingAttributes2 = trackLink({ id: 'test-link', text: 'Click Me', href: '/test' });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
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
  });

  it('should return MediaPlayer tracking attributes', () => {
    const trackingAttributes1 = track({ id: 'test-media-player', type: ContextType.mediaPlayer });
    const trackingAttributes2 = trackMediaPlayer({ id: 'test-media-player' });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
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
  });

  it('should return Navigation tracking attributes', () => {
    const trackingAttributes1 = track({ id: 'test-nav', type: ContextType.navigation });
    const trackingAttributes2 = trackNavigation({ id: 'test-nav' });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
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
  });

  it('should return Overlay tracking attributes', () => {
    const trackingAttributes1 = track({ id: 'test-overlay', type: ContextType.overlay });
    const trackingAttributes2 = trackOverlay({ id: 'test-overlay' });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
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
  });
});
