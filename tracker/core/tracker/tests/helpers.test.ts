/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { makeIdFromString, waitForPromise } from '../src';

describe('helpers', () => {
  describe('waitForPromise', () => {
    it('resolves - immediate', () => {
      return expect(
        waitForPromise({
          predicate: () => true,
          intervalMs: 1,
          timeoutMs: 1,
        })
      ).resolves.toBe(true);
    });

    it('resolves - async', () => {
      return expect(
        waitForPromise({
          predicate: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(true),
          intervalMs: 1,
          timeoutMs: 1,
        })
      ).resolves.toBe(true);
    });

    it('rejects - timeout', () => {
      return expect(
        waitForPromise({
          predicate: () => false,
          intervalMs: 1,
          timeoutMs: 1,
        })
      ).resolves.toBe(false);
    });
  });

  describe('makeIdFromString', () => {
    const testCases: [input: string, output: string | null][] = [
      // @ts-ignore
      [undefined, null],
      // @ts-ignore
      [null, null],
      // @ts-ignore
      [0, null],
      // @ts-ignore
      [false, null],
      // @ts-ignore
      [true, null],
      // @ts-ignore
      [[], null],
      // @ts-ignore
      [{}, null],

      ['', null],
      ['_', null],
      ['-', null],
      ['-_', null],
      ['-_a', 'a'],
      ['a_-', 'a'],
      ['a-_a', 'a-_a'],
      ['AbCdE', 'abcde'],
      ['Click Me!', 'click-me'],
      ['X', 'x'],
      ['What - How', 'what-how'],
      ['Quite a "LONG" sentence! (annoying uh?)', 'quite-a-long-sentence-annoying-uh'],
    ];

    testCases.forEach(([input, output]) =>
      it(`${JSON.stringify(input)} -> ${JSON.stringify(output)}`, () => {
        expect(makeIdFromString(input)).toBe(output);
      })
    );
  });
});
