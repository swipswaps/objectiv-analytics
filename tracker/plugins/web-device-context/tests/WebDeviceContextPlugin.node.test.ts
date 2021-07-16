/**
 * @jest-environment node
 */
import { WebDeviceContextPlugin } from '../src';

describe('WebDeviceContextPlugin - node', () => {
  it('should instantiate as unusable', () => {
    const testWebDeviceContextPlugin = new WebDeviceContextPlugin();
    expect(testWebDeviceContextPlugin.isUsable()).toBe(false);
  });
});
