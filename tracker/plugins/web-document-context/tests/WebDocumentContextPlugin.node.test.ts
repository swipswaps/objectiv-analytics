/**
 * @jest-environment node
 */
import { WebDocumentContextPlugin } from '../src';

describe('WebDocumentContextPlugin - node', () => {
  it('should instantiate as unusable', () => {
    const testWebDocumentContextPlugin = new WebDocumentContextPlugin();
    expect(testWebDocumentContextPlugin.isUsable()).toBe(false);
  });
});
