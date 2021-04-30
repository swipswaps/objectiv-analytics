import { JSDOM } from 'jsdom';
import { documentLoaded } from './documentLoaded';

describe('documentLoaded', () => {
  it('resolves on DOMContentLoaded event', async () => {
    const dom = new JSDOM();
    const document = dom.window.document;

    await expect(documentLoaded(document)).resolves.not.toThrow();
  });

  it('resolves on document readyState', async () => {
    const dom = new JSDOM();
    const document = dom.window.document;

    // wait until document is loaded
    await new Promise((resolve) => {
      setImmediate(resolve);
    });

    await expect(documentLoaded(document)).resolves.not.toThrow();
  });
});
