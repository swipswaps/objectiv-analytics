/*
 * Copyright 2022 Objectiv B.V.
 */
import { PathContextFromURLPlugin } from '../src';

describe('PathContextFromURLPlugin - node', () => {
  it('should instantiate as unusable', () => {
    const testPathContextFromURLPlugin = new PathContextFromURLPlugin();
    expect(testPathContextFromURLPlugin.isUsable()).toBe(false);
  });
});
