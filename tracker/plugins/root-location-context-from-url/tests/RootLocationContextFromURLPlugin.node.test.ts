/*
 * Copyright 2021-2022 Objectiv B.V.
 * @jest-environment node
 */
import { RootLocationContextFromURLPlugin } from '../src';

describe('RootLocationContextFromURLPlugin - node', () => {
  it('should instantiate as unusable', () => {
    const testRootLocationContextFromURLPlugin = new RootLocationContextFromURLPlugin();
    expect(testRootLocationContextFromURLPlugin.isUsable()).toBe(false);
  });
});
