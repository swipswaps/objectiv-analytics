/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { makeIdFromString } from '../src';

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
