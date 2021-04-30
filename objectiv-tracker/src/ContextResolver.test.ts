import { Context } from './contexts';
import { ResolvableContext, ContextResolver } from './ContextResolver';

describe('ContextResolver', () => {
  let resolver: ContextResolver;

  beforeEach(() => {
    resolver = new ContextResolver(100);
  });

  it('resolves promises', async () => {
    const contexts: ResolvableContext[] = [
      Promise.resolve<Context>({
        _context_type: 'TestContext',
        foo: 'bar',
      }),
    ];

    await expect(resolver.resolve(contexts)).resolves.toEqual([
      {
        _context_type: 'TestContext',
        foo: 'bar',
      },
    ]);
  });

  it('adds an error context when a promise rejects', async () => {
    const contexts: ResolvableContext[] = [Promise.reject(new Error('kapot'))];

    await expect(resolver.resolve(contexts)).resolves.toEqual([
      {
        _context_type: 'ErrorContext',
        message: 'kapot',
      },
    ]);
  });

  it(`adds an error context describing a timeout when a promise doesn't resolve in time`, async () => {
    const contexts: ResolvableContext[] = [new Promise(() => {})];

    await expect(resolver.resolve(contexts)).resolves.toEqual([
      {
        _context_type: 'ErrorContext',
        message: 'timeout',
      },
    ]);
  });

  it('resolves context factories', async () => {
    const contexts: ResolvableContext[] = [
      () => ({
        _context_type: 'TestContext',
        foo: 'bar',
      }),
    ];

    await expect(resolver.resolve(contexts)).resolves.toEqual([
      {
        _context_type: 'TestContext',
        foo: 'bar',
      },
    ]);
  });

  it('adds an error context when a context factory throws', async () => {
    const contexts: ResolvableContext[] = [
      () => {
        throw new Error('kapot');
      },
    ];

    await expect(resolver.resolve(contexts)).resolves.toEqual([
      {
        _context_type: 'ErrorContext',
        message: 'kapot',
      },
    ]);
  });
});
