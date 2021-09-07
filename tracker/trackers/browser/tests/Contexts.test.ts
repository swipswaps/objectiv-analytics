import { makeSectionContext } from '@objectiv/tracker-core';
import { parseLocationContext, stringifyLocationContext } from '../src';

describe('Contexts', () => {
  it('Generic stringification and parsing', () => {
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
});
