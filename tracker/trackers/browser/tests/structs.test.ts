import { makeSectionContext } from '@objectiv/tracker-core';
import { parseBoolean, parseLocationContext, stringifyBoolean, stringifyLocationContext } from '../src';

describe('Custom structs', () => {
  it('Should stringify Section Context', () => {
    const context = makeSectionContext({ id: 'test' });
    const stringifiedElementContext = stringifyLocationContext(context);
    expect(stringifiedElementContext).toStrictEqual(JSON.stringify(context));

    const parsedElementContext = parseLocationContext(stringifiedElementContext);
    expect(parsedElementContext).toStrictEqual(context);
  });

  it('Should not stringify objects that are not Location Contexts', () => {
    // @ts-ignore
    expect(() => stringifyLocationContext({ id: 'not a location context' })).toThrow();
  });

  it('Should not parse objects that are not stringified Location Contexts', () => {
    expect(() => parseLocationContext("{ id: 'not a location context' }")).toThrow();
  });

  it('Should stringify and parse boolean', () => {
    expect(stringifyBoolean(true)).toBe('true');
    expect(stringifyBoolean(false)).toBe('false');
    expect(parseBoolean('true')).toBe(true);
    expect(parseBoolean('false')).toBe(false);
  });

  it('Should not stringify values that are not boolean', () => {
    // @ts-ignore
    expect(() => stringifyBoolean('True')).toThrow();
    // @ts-ignore
    expect(() => stringifyBoolean('False')).toThrow();
    // @ts-ignore
    expect(() => stringifyBoolean('string')).toThrow();
    // @ts-ignore
    expect(() => stringifyBoolean(null)).toThrow();
    // @ts-ignore
    expect(() => stringifyBoolean(undefined)).toThrow();
    // @ts-ignore
    expect(() => stringifyBoolean(0)).toThrow();
    // @ts-ignore
    expect(() => stringifyBoolean(1)).toThrow();
    // @ts-ignore
    expect(() => stringifyBoolean({})).toThrow();
    // @ts-ignore
    expect(() => stringifyBoolean([])).toThrow();
  });

  it('Should not parse values that are not boolean', () => {
    // @ts-ignore
    expect(() => parseBoolean('True')).toThrow();
    // @ts-ignore
    expect(() => parseBoolean('False')).toThrow();
    // @ts-ignore
    expect(() => parseBoolean('string')).toThrow();
    // @ts-ignore
    expect(() => parseBoolean('null')).toThrow();
    // @ts-ignore
    expect(() => parseBoolean('undefined')).toThrow();
    // @ts-ignore
    expect(() => parseBoolean('0')).toThrow();
    // @ts-ignore
    expect(() => parseBoolean('1')).toThrow();
    // @ts-ignore
    expect(() => parseBoolean('{}')).toThrow();
    // @ts-ignore
    expect(() => parseBoolean('[]')).toThrow();
    // @ts-ignore
    expect(() => parseBoolean(null)).toThrow();
    // @ts-ignore
    expect(() => parseBoolean(undefined)).toThrow();
    // @ts-ignore
    expect(() => parseBoolean(0)).toThrow();
    // @ts-ignore
    expect(() => parseBoolean(1)).toThrow();
    // @ts-ignore
    expect(() => parseBoolean({})).toThrow();
    // @ts-ignore
    expect(() => parseBoolean([])).toThrow();
  });
});
