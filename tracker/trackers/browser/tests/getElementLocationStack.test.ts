/*
 * Copyright 2021 Objectiv B.V.
 */

import { PathContextFromURLPlugin } from '@objectiv/plugin-path-context-from-url';
import {
  generateUUID,
  getLocationPath,
  LocationStack,
  makeContentContext,
  TrackerPlugins,
} from '@objectiv/tracker-core';
import { BrowserTracker, getElementLocationStack, TaggableElement } from '../src';
import { makeTaggedElement } from './mocks/makeTaggedElement';

describe('getElementLocationStack', () => {
  const mainSection = makeTaggedElement(generateUUID(), 'main', 'section');
  const div = document.createElement('div');
  const parentSection = makeTaggedElement(generateUUID(), 'parent', 'div');
  const section = document.createElement('section');
  const childSection = makeTaggedElement(generateUUID(), 'child', 'span');
  const button = makeTaggedElement(generateUUID(), 'button', 'button', true);

  mainSection.appendChild(div);
  div.appendChild(parentSection);
  parentSection.appendChild(section);
  section.appendChild(childSection);
  childSection.appendChild(button);

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('errors', () => {
    it('should console.error when invoked with `null`', () => {
      // @ts-ignore
      expect(getElementLocationStack(null)).toHaveLength(0);
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Should reconstruct the Location Stack solely based on the DOM tree', () => {
    const expectedPathsByElement: [TaggableElement, string][] = [
      [mainSection, 'Content:main'],
      [div, 'Content:main'],
      [parentSection, 'Content:main / Content:parent'],
      [section, 'Content:main / Content:parent'],
      [childSection, 'Content:main / Content:parent / Content:child'],
      [button, 'Content:main / Content:parent / Content:child / Pressable:button'],
    ];

    expectedPathsByElement.forEach(([element, expectedLocationPath]) => {
      it(`element: ${element.dataset.objectivElementId}: ${expectedLocationPath}`, () => {
        const locationStack = getElementLocationStack({ element });
        const locationPath = getLocationPath(locationStack);

        expect(locationPath).toBe(expectedLocationPath);
      });
    });
  });

  describe('Should reconstruct the Location Stack including the Plugins', () => {
    const applicationId = 'app';
    const endpoint = 'http://test';
    const plugins: TrackerPlugins = new TrackerPlugins({
      plugins: [new PathContextFromURLPlugin()],
    });
    const tracker = new BrowserTracker({ applicationId, endpoint, plugins });

    const expectedPathsByElement: [TaggableElement, string][] = [
      [mainSection, 'Content:main'],
      [div, 'Content:main'],
      [parentSection, 'Content:main / Content:parent'],
      [section, 'Content:main / Content:parent'],
      [childSection, 'Content:main / Content:parent / Content:child'],
      [button, 'Content:main / Content:parent / Content:child / Pressable:button'],
    ];

    expectedPathsByElement.forEach(([element, expectedLocationPath]) => {
      it(`element: ${element.dataset.objectivElementId}: ${expectedLocationPath}`, () => {
        const locationStack = getElementLocationStack({ element, tracker });
        const locationPath = getLocationPath(locationStack);

        expect(locationPath).toBe(expectedLocationPath);
      });
    });
  });

  describe('Should reconstruct the Location Stack including the Tracker Location Stack and Plugins', () => {
    const applicationId = 'app';
    const endpoint = 'http://test';
    const location_stack: LocationStack = [makeContentContext({ id: 'root' })];
    const plugins: TrackerPlugins = new TrackerPlugins({
      plugins: [new PathContextFromURLPlugin()],
    });
    const tracker = new BrowserTracker({ applicationId, endpoint, plugins, location_stack });

    const expectedPathsByElement: [TaggableElement, string][] = [
      [mainSection, 'Content:root / Content:main'],
      [div, 'Content:root / Content:main'],
      [parentSection, 'Content:root / Content:main / Content:parent'],
      [section, 'Content:root / Content:main / Content:parent'],
      [childSection, 'Content:root / Content:main / Content:parent / Content:child'],
      [button, 'Content:root / Content:main / Content:parent / Content:child / Pressable:button'],
    ];

    expectedPathsByElement.forEach(([element, expectedLocationPath]) => {
      it(`element: ${element.dataset.objectivElementId}: ${expectedLocationPath}`, () => {
        const locationStack = getElementLocationStack({ element, tracker });
        const locationPath = getLocationPath(locationStack);

        expect(locationPath).toBe(expectedLocationPath);
      });
    });
  });
});
