import { Infer, intersection, literal, string, type } from 'superstruct';

export const AbstractContext = type({
  id: string(),
  _context_type: string(),
});
export type AbstractContext = Infer<typeof AbstractContext>;

export const AbstractLocationContext = intersection([
  AbstractContext,
  type({
    __location_context: literal(true),
  }),
]);
export type AbstractLocationContext = Infer<typeof AbstractLocationContext>;
