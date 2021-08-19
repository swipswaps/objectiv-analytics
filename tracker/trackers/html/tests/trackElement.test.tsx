import { makeOverlayContext } from "@objectiv/tracker-core";
import superjson from 'superjson';
import { trackElement, TrackingAttribute } from '../src';
import ContextType from '../src/ContextType';

const UUIDV4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

describe('trackElement', () => {
  it('should return Section tracking attributes', () => {
    const trackingAttributes1 = trackElement('test-section');

    const expectedTrackingAttributes = {
      [TrackingAttribute.objectivElementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.objectivContext]: superjson.stringify({
        __context_type: 'SectionContext',
        id: 'test-section',
      }),
    };

    expect(trackingAttributes1).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Button tracking attributes', () => {
    const trackingAttributes = trackElement('test-button', ContextType.button, { text: 'Click Me' });

    const expectedTrackingAttributes = {
      [TrackingAttribute.objectivElementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.objectivContext]: superjson.stringify({
        __context_type: 'ButtonContext',
        id: 'test-button',
        text: 'Click Me',
      }),
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Link tracking attributes', () => {
    const trackingAttributes = trackElement('test-link', ContextType.link, { text: 'Click Me', href: '/test' });

    const expectedTrackingAttributes = {
      [TrackingAttribute.objectivElementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.objectivContext]: superjson.stringify({
        __context_type: 'LinkContext',
        id: 'test-button',
        text: 'Click Me',
        href: '/test',
      }),
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

  it('should return Overlay tracking attributes', () => {
    const trackingAttributes = trackElement(makeOverlayContext({ id: 'test-overlay' }));

    const expectedTrackingAttributes = {
      [TrackingAttribute.objectivElementId]: expect.stringMatching(UUIDV4_REGEX),
      [TrackingAttribute.objectivContext]: superjson.stringify({
        __context_type: 'OverlayContext',
        id: 'test-overlay',
      }),
    };

    expect(trackingAttributes).toStrictEqual(expectedTrackingAttributes);
  });

});
