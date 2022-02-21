/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { matchUUID, mockConsole } from '@objectiv/testing-tools';
import { generateUUID, makeOverlayContext } from '@objectiv/tracker-core';
import {
  BrowserTracker,
  getTracker,
  getTrackerRepository,
  makeTracker,
  TaggingAttribute,
  tagOverlay,
  tagPressable,
} from '../src';
import { trackNewElements } from '../src/mutationObserver/trackNewElements';
import { makeTaggedElement } from './mocks/makeTaggedElement';

describe('trackNewElements', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    makeTracker({ applicationId: generateUUID(), endpoint: 'test' });
    expect(getTracker()).toBeInstanceOf(BrowserTracker);
    jest.spyOn(getTracker(), 'trackEvent');
  });

  afterEach(() => {
    getTrackerRepository().trackersMap = new Map();
    getTrackerRepository().defaultTracker = undefined;
    jest.resetAllMocks();
  });

  it('should apply tagging attributes to Elements tracked via Children Tracking and track them right away', async () => {
    const div1 = document.createElement('div');
    div1.setAttribute(
      TaggingAttribute.tagChildren,
      JSON.stringify([
        { queryAll: '#button', tagAs: tagPressable({ id: 'button' }) },
        { queryAll: '#child-div', tagAs: tagOverlay({ id: 'child-div' }) },
      ])
    );

    const button = document.createElement('button');
    button.setAttribute('id', 'button');

    const childDiv = document.createElement('div');
    childDiv.setAttribute('id', 'child-div');

    jest.spyOn(div1, 'addEventListener');
    jest.spyOn(button, 'addEventListener');
    jest.spyOn(childDiv, 'addEventListener');

    div1.appendChild(button);
    div1.appendChild(childDiv);

    trackNewElements(div1, getTracker());

    expect(div1.addEventListener).not.toHaveBeenCalled();
    expect(childDiv.addEventListener).not.toHaveBeenCalled();
    expect(button.addEventListener).toHaveBeenCalledTimes(1);
    expect(getTracker().trackEvent).toHaveBeenCalledTimes(1);
    expect(getTracker().trackEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _type: 'VisibleEvent',
        id: matchUUID,
        global_contexts: [],
        location_stack: [makeOverlayContext({ id: 'child-div' })],
      })
    );
  });

  it('should console error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // @ts-ignore
    trackNewElements(null, getTracker());

    expect(getTracker().trackEvent).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  describe('collisions', () => {
    it('should console.error if a collision occurs and both elements still exist', async () => {
      const wrapper = document.createElement('div');
      const div1 = makeTaggedElement('div1', 'div', 'div');
      const div2 = makeTaggedElement('div2', 'div', 'div');
      wrapper.appendChild(div1);
      wrapper.appendChild(div2);

      jest.spyOn(document, 'querySelector').mockReturnValueOnce(div1);
      jest.spyOn(document, 'querySelector').mockReturnValueOnce(div2);

      trackNewElements(wrapper, getTracker(), mockConsole);

      expect(document.querySelector).toHaveBeenCalledTimes(2);
      expect(document.querySelector).toHaveBeenNthCalledWith(1, `[${TaggingAttribute.elementId}='div1']`);
      expect(document.querySelector).toHaveBeenNthCalledWith(2, `[${TaggingAttribute.elementId}='div2']`);
      expect(mockConsole.error).toHaveBeenCalledTimes(2);
      expect(mockConsole.error).toHaveBeenNthCalledWith(1, `Existing Element:`, div1);
      expect(mockConsole.error).toHaveBeenNthCalledWith(2, `Colliding Element:`, div2);
    });

    it('should not console.error if a collision occurs and ExistingElement does not exist', async () => {
      const wrapper = document.createElement('div');
      const div1 = makeTaggedElement('div1', 'div', 'div');
      const div2 = makeTaggedElement('div2', 'div', 'div');
      wrapper.appendChild(div1);
      wrapper.appendChild(div2);

      jest.spyOn(document, 'querySelector').mockReturnValueOnce(null);
      jest.spyOn(document, 'querySelector').mockReturnValueOnce(div2);

      trackNewElements(wrapper, getTracker(), mockConsole);

      expect(document.querySelector).toHaveBeenCalledTimes(2);
      expect(document.querySelector).toHaveBeenNthCalledWith(1, `[${TaggingAttribute.elementId}='div1']`);
      expect(document.querySelector).toHaveBeenNthCalledWith(2, `[${TaggingAttribute.elementId}='div2']`);
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('should not console.error if a collision occurs and CollidingElement does not exist', async () => {
      const wrapper = document.createElement('div');
      const div1 = makeTaggedElement('div1', 'div', 'div');
      const div2 = makeTaggedElement('div2', 'div', 'div');
      wrapper.appendChild(div1);
      wrapper.appendChild(div2);

      jest.spyOn(document, 'querySelector').mockReturnValueOnce(div1);
      jest.spyOn(document, 'querySelector').mockReturnValueOnce(null);

      trackNewElements(wrapper, getTracker(), mockConsole);

      expect(document.querySelector).toHaveBeenCalledTimes(2);
      expect(document.querySelector).toHaveBeenNthCalledWith(1, `[${TaggingAttribute.elementId}='div1']`);
      expect(document.querySelector).toHaveBeenNthCalledWith(2, `[${TaggingAttribute.elementId}='div2']`);
      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });
});
