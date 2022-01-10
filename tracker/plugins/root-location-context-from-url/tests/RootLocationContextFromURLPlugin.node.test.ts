/*
 * Copyright 2021-2022 Objectiv B.V.
 * @jest-environment node
 */
import { RootLocationContextFromURLPlugin } from '../src';

describe('RootLocationContextFromURLPlugin - node', () => {
  it('should instantiate as unusable', () => {
    const testPathContextFromURLPlugin = new RootLocationContextFromURLPlugin();
    expect(testPathContextFromURLPlugin.isUsable()).toBe(false);
  });
});
