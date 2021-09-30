import { makeSectionContext, makeSectionVisibleEvent, makeURLChangeEvent } from '@objectiv/tracker-core';
import {
  BrowserTracker,
  makeTracker,
  makeMutationCallback,
  startAutoTracking,
  TaggingAttribute,
  getTracker
} from '../src';
import { makeTaggedElement } from './mocks/makeTaggedElement';

describe('startAutoTracking', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    makeTracker({ applicationId: 'test', endpoint: 'test' });
    expect(getTracker()).toBeInstanceOf(BrowserTracker);
    jest.spyOn(getTracker(), 'trackEvent');
  });

  it('should not track application loaded event', () => {
    const tracker = new BrowserTracker({ endpoint: 'endpoint', applicationId: 'app' });
    jest.spyOn(tracker, 'trackEvent');

    startAutoTracking({ trackApplicationLoaded: false, trackURLChanges: false }, tracker);

    expect(tracker.trackEvent).not.toHaveBeenCalled();
  });
});

describe('makeMutationCallback - url changes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    makeTracker({ applicationId: 'test', endpoint: 'test' });
    expect(getTracker()).toBeInstanceOf(BrowserTracker);
    jest.spyOn(getTracker(), 'trackEvent');
  });

  it('should not track url changes', () => {
    const mutationCallback = makeMutationCallback(false, getTracker());
    const mutationObserver = new MutationObserver(mutationCallback);

    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost/new',
      },
    });
    mutationCallback([], mutationObserver);

    expect(getTracker().trackEvent).not.toHaveBeenCalled();
  });

  it('should track url changes with the global tracker', () => {
    const mutationCallback = makeMutationCallback(true, getTracker());
    const mutationObserver = new MutationObserver(mutationCallback);

    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost/new',
      },
    });
    mutationCallback([], mutationObserver);

    expect(getTracker().trackEvent).toHaveBeenCalledTimes(1);
    expect(getTracker().trackEvent).toHaveBeenNthCalledWith(1, makeURLChangeEvent());
  });
});

describe('makeMutationCallback - new nodes', () => {
  it('should track newly added nodes that are Elements and visibility for existing nodes', () => {
    const tracker = new BrowserTracker({ endpoint: 'endpoint', applicationId: 'app' });
    jest.spyOn(tracker, 'trackEvent');
    const mutationCallback = makeMutationCallback(false, tracker);
    const mutationObserver = new MutationObserver(mutationCallback);

    const sectionContext = makeSectionContext({ id: 'div' });
    const trackedDiv = makeTaggedElement('div', 'div', 'div');
    trackedDiv.setAttribute(TaggingAttribute.trackVisibility, '{"mode":"auto"}');

    const mockedMutationRecord: MutationRecord = {
      // @ts-ignore
      addedNodes: [document.createComment('comment'), trackedDiv],
      // @ts-ignore
      removedNodes: [document.createComment('comment')],
      attributeName: TaggingAttribute.trackVisibility,
      target: trackedDiv,
    };
    mutationCallback([mockedMutationRecord], mutationObserver);

    expect(tracker.trackEvent).toHaveBeenCalledTimes(2);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(
      1,
      makeSectionVisibleEvent({ location_stack: [expect.objectContaining(sectionContext)] })
    );
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(
      2,
      makeSectionVisibleEvent({ location_stack: [expect.objectContaining(sectionContext)] })
    );
  });
});
