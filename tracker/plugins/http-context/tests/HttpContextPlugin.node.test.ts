/*
 * Copyright 2021-2022 Objectiv B.V.
 * @jest-environment node
 */
import { HttpContextPlugin } from '../src';

describe('HttpContextPlugin - node', () => {
  it('should instantiate as unusable', () => {
    const testHttpContextPlugin = new HttpContextPlugin();
    expect(testHttpContextPlugin.isUsable()).toBe(false);
  });
});
