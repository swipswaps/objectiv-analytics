import { Context, createErrorContextFromError } from './contexts';
import { addTimeoutToPromise } from './addTimeoutToPromise';

// TODO split Context in Location and Global and ResolvableContext accordingly
export type ResolvableContext = Context | Promise<Context> | (() => Context);

function isPromise(context: ResolvableContext): context is Promise<Context> {
  return typeof context['then'] !== 'undefined';
}

export class ContextResolver {
  constructor(private readonly promiseTimeout: number) {}

  async resolve(contexts: ResolvableContext[]): Promise<Context[]> {
    const resolvedPromises = await Promise.all(
      contexts.map((resolvable) => {
        if (!isPromise(resolvable)) {
          return resolvable;
        }

        return addTimeoutToPromise(resolvable, this.promiseTimeout).catch((error) =>
          createErrorContextFromError(error)
        );
      })
    );

    return resolvedPromises.map((resolvable) => {
      if (typeof resolvable !== 'function') {
        return resolvable;
      }

      try {
        return resolvable();
      } catch (error) {
        return createErrorContextFromError(error);
      }
    });
  }
}
