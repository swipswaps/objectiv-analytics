import { Infer, literal, string, type, union } from 'superstruct';

export const LocationContextType = union([
  literal('SectionContext'),
  literal('ExpandableSectionContext'),
  literal('MediaPlayerContext'),
  literal('NavigationContext'),
  literal('OverlayContext'),
  literal('InputContext'),
  literal('ButtonContext'),
  literal('LinkContext'),
]);

export const SectionContextType = union([
  literal('SectionContext'),
  literal('ExpandableSectionContext'),
  literal('MediaPlayerContext'),
  literal('NavigationContext'),
  literal('OverlayContext'),
]);

export const AbstractContext = type({
  id: string(),
  _context_type: LocationContextType,
});
export type AbstractContext = Infer<typeof AbstractContext>;

export const AbstractLocationContext = type({
  id: string(),
  _context_type: LocationContextType,
  __location_context: literal(true),
});
export type AbstractLocationContext = Infer<typeof AbstractLocationContext>;

export const AbstractSectionContext = type({
  id: string(),
  _context_type: SectionContextType,
  __location_context: literal(true),
  __section_context: literal(true),
});
export type AbstractSectionContext = Infer<typeof AbstractLocationContext>;

export const SectionContext = type({
  id: string(),
  _context_type: literal('SectionContext'),
  __location_context: literal(true),
  __section_context: literal(true),
});
export type SectionContext = Infer<typeof SectionContext>;

export const ButtonContext = type({
  id: string(),
  _context_type: literal('ButtonContext'),
  __location_context: literal(true),
  __section_context: literal(true),
});
export type ButtonContext = Infer<typeof ButtonContext>;

export const LinkContext = type({
  id: string(),
  _context_type: literal('LinkContext'),
  __location_context: literal(true),
  __section_context: literal(true),
});
export type LinkContext = Infer<typeof ButtonContext>;
