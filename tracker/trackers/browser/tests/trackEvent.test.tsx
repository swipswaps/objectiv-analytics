import { makeClickEvent, makeSectionContext } from '@objectiv/tracker-core';
import { BrowserTracker, configureTracker, ElementTrackingAttribute, trackEvent } from '../src';

describe('trackEvent', () => {
  const testElement = document.createElement('div');
  document.body.appendChild(testElement);

  beforeEach(() => {
    jest.resetAllMocks();
    configureTracker({ applicationId: 'test', endpoint: 'test' });
    expect(window.objectiv.tracker).toBeInstanceOf(BrowserTracker);
    spyOn(window.objectiv.tracker, 'trackEvent');
  });

  it('should throw if a Tracker instance cannot be retrieved and was not provided either', () => {
    // @ts-ignore forcefully wipe the tracker instance
    window.objectiv.tracker = null;
    expect(window.objectiv.tracker).toBe(null);

    expect(() => trackEvent({ eventFactory: makeClickEvent, element: testElement })).toThrow(
      'Tracker not initialized. Provide a tracker instance or setup a global one via `configureTracker`'
    );
  });

  it('should use the global tracker instance if available', () => {
    expect(window.objectiv.tracker.trackEvent).not.toHaveBeenCalled();

    trackEvent({ eventFactory: makeClickEvent, element: testElement });

    expect(window.objectiv.tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(window.objectiv.tracker.trackEvent).toHaveBeenNthCalledWith(1, makeClickEvent());
  });

  it('should use the given tracker instance', () => {
    const trackerOverride = new BrowserTracker({ applicationId: 'override', endpoint: 'override' });
    spyOn(trackerOverride, 'trackEvent');

    expect(window.objectiv.tracker.trackEvent).not.toHaveBeenCalled();
    expect(trackerOverride.trackEvent).not.toHaveBeenCalled();

    trackEvent({ eventFactory: makeClickEvent, element: testElement, tracker: trackerOverride });

    expect(window.objectiv.tracker.trackEvent).not.toHaveBeenCalled();
    expect(trackerOverride.trackEvent).toHaveBeenCalledTimes(1);
    expect(trackerOverride.trackEvent).toHaveBeenNthCalledWith(1, makeClickEvent());
  });

  it('should track Tracked Elements with a location stack', () => {
    const testDivToTrack = document.createElement('div');
    testDivToTrack.setAttribute(ElementTrackingAttribute.context, JSON.stringify(makeSectionContext({ id: 'test' })));

    const div = document.createElement('div');
    div.setAttribute(ElementTrackingAttribute.context, JSON.stringify(makeSectionContext({ id: 'div' })));

    const midSection = document.createElement('section');
    midSection.setAttribute(ElementTrackingAttribute.context, JSON.stringify(makeSectionContext({ id: 'mid' })));

    const untrackedSection = document.createElement('div');

    const topSection = document.createElement('body');
    topSection.setAttribute(ElementTrackingAttribute.context, JSON.stringify(makeSectionContext({ id: 'top' })));

    div.appendChild(testDivToTrack);
    midSection.appendChild(div);
    untrackedSection.appendChild(midSection);
    topSection.appendChild(untrackedSection);
    document.body.appendChild(topSection);

    trackEvent({ eventFactory: makeClickEvent, element: testDivToTrack });

    expect(window.objectiv.tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(window.objectiv.tracker.trackEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        ...makeClickEvent(),
        location_stack: expect.arrayContaining([
          { __location_context: true, __section_context: true, _context_type: 'SectionContext', id: 'top' },
          { __location_context: true, __section_context: true, _context_type: 'SectionContext', id: 'mid' },
          { __location_context: true, __section_context: true, _context_type: 'SectionContext', id: 'div' },
          { __location_context: true, __section_context: true, _context_type: 'SectionContext', id: 'test' },
        ]),
      })
    );
  });

  it('should track regular Elements with a location stack if their parents are Tracked Elements', () => {
    const div = document.createElement('div');
    div.setAttribute(ElementTrackingAttribute.context, JSON.stringify(makeSectionContext({ id: 'div' })));

    const midSection = document.createElement('section');
    midSection.setAttribute(ElementTrackingAttribute.context, JSON.stringify(makeSectionContext({ id: 'mid' })));

    const untrackedSection = document.createElement('div');

    const topSection = document.createElement('body');
    topSection.setAttribute(ElementTrackingAttribute.context, JSON.stringify(makeSectionContext({ id: 'top' })));

    div.appendChild(testElement);
    midSection.appendChild(div);
    untrackedSection.appendChild(midSection);
    topSection.appendChild(untrackedSection);
    document.body.appendChild(topSection);

    trackEvent({ eventFactory: makeClickEvent, element: testElement });

    expect(window.objectiv.tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(window.objectiv.tracker.trackEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        ...makeClickEvent(),
        location_stack: expect.arrayContaining([
          { __location_context: true, __section_context: true, _context_type: 'SectionContext', id: 'top' },
          { __location_context: true, __section_context: true, _context_type: 'SectionContext', id: 'mid' },
          { __location_context: true, __section_context: true, _context_type: 'SectionContext', id: 'div' },
        ]),
      })
    );
  });

  it('should track without a location stack', () => {
    const div = document.createElement('div');
    div.setAttribute(ElementTrackingAttribute.context, JSON.stringify(null));

    div.appendChild(testElement);
    document.body.appendChild(div);

    trackEvent({ eventFactory: makeClickEvent, element: testElement });

    expect(window.objectiv.tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(window.objectiv.tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeClickEvent()));
  });
});
