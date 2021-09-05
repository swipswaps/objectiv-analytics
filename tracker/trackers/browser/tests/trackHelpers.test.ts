import {
  trackButton,
  trackElement,
  trackExpandableElement,
  TrackingAttribute,
  trackInput,
  trackLink,
  trackMediaPlayer,
  trackNavigation,
  trackOverlay,
} from '../src';
import matchElementId from './mocks/matchElementId';

describe('trackHelpers', () => {
  it('should return an empty object when error occurs', () => {
    // @ts-ignore
    expect(trackButton()).toBeUndefined();
    // @ts-ignore
    expect(trackButton({ wrong: 'test-button' })).toBeUndefined();
    // @ts-ignore
    expect(trackButton({ id: undefined })).toBeUndefined();
    // @ts-ignore
    expect(trackButton({ id: 0, text: 'test' })).toBeUndefined();
    // @ts-ignore
    expect(trackButton({ id: false, text: 'test' })).toBeUndefined();
    // @ts-ignore
    expect(trackButton({ id: true, text: 'test' })).toBeUndefined();
    // @ts-ignore
    expect(trackButton({ id: {}, text: 'test' })).toBeUndefined();
    // @ts-ignore
    expect(trackButton({ id: Infinity, text: 'test' })).toBeUndefined();
    // @ts-ignore
    expect(trackButton({ id: -Infinity, text: 'test' })).toBeUndefined();
    // @ts-ignore
    expect(trackButton({ id: 'test', text: 'test', options: 'nope' })).toBeUndefined();
  });

  it('trackButton', () => {
    const trackingAttributes = trackButton({ id: 'test-button', text: 'Click Me' });

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

  it('trackElement', () => {
    const trackingAttributes = trackElement({ id: 'test-section' });

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

  it('trackExpandableElement', () => {
    const trackingAttributes = trackExpandableElement({ id: 'test-expandable' });

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

  it('trackInput', () => {
    const trackingAttributes = trackInput({ id: 'test-input' });

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

  it('trackLink', () => {
    const trackingAttributes = trackLink({ id: 'link', text: 'Click Me', href: '/test' });

    const expectedTrackingAttributes = {
      [TrackingAttribute.elementId]: matchElementId,
      [TrackingAttribute.parentElementId]: undefined,
      [TrackingAttribute.context]: JSON.stringify({
        _context_type: 'LinkContext',
        id: 'link',
        text: 'Click Me',
        href: '/test',
      }),
      [TrackingAttribute.trackClicks]: 'true',
      [TrackingAttribute.trackBlurs]: undefined,
      [TrackingAttribute.trackVisibility]: undefined,
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('trackMediaPlayer', () => {
    const trackingAttributes = trackMediaPlayer({ id: 'test-media-player' });

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

  it('trackNavigation', () => {
    const trackingAttributes = trackNavigation({ id: 'test-nav' });

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

  it('trackOverlay', () => {
    const trackingAttributes = trackOverlay({ id: 'test-overlay' });

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
});
