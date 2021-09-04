import {
  ElementTrackingAttribute,
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

describe('trackLocationHelpers', () => {
  it('trackButton', () => {
    const trackingAttributes = trackButton({ id: 'test-button', text: 'Click Me' });

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

  it('trackElement', () => {
    const trackingAttributes = trackElement({ id: 'test-section' });

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

  it('trackExpandableElement', () => {
    const trackingAttributes = trackExpandableElement({ id: 'test-expandable' });

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

  it('trackInput', () => {
    const trackingAttributes = trackInput({ id: 'test-input' });

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

  it('trackLink', () => {
    const trackingAttributes = trackLink({ id: 'link', text: 'Click Me', href: '/test' });

    const expectedTrackingAttributes = {
      [ElementTrackingAttribute.elementId]: matchElementId,
      [ElementTrackingAttribute.parentElementId]: undefined,
      [ElementTrackingAttribute.context]: JSON.stringify({
        id: 'link',
        _context_type: 'LinkContext',
        text: 'Click Me',
        href: '/test',
      }),
      [ElementTrackingAttribute.trackClicks]: 'true',
      [ElementTrackingAttribute.trackBlurs]: undefined,
      [ElementTrackingAttribute.trackVisibility]: undefined,
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('trackMediaPlayer', () => {
    const trackingAttributes = trackMediaPlayer({ id: 'test-media-player' });

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

  it('trackNavigation', () => {
    const trackingAttributes = trackNavigation({ id: 'test-nav' });

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

  it('trackOverlay', () => {
    const trackingAttributes = trackOverlay({ id: 'test-overlay' });

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
});
