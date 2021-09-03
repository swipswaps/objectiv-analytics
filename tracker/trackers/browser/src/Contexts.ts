import { Infer, intersection, literal, object, string } from 'superstruct';

export const AbstractContext = object({
  id: string(),
  _context_type: string(),
});
export type AbstractContext = Infer<typeof AbstractContext>;

export const AbstractLocationContext = intersection([
  AbstractContext,
  object({
    __location_context: literal(true),
  }),
]);
export type AbstractLocationContext = Infer<typeof AbstractLocationContext>;
