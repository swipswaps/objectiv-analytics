/**
 * AbstractContext
 */
import { assign, Infer, literal, object, string, union } from 'superstruct';

export const AbstractContext = object({
  id: string(),
});
export type AbstractContext = Infer<typeof AbstractContext>;

/**
 * AbstractLocationContext
 */
export const AbstractLocationContext = assign(
  AbstractContext,
  object({
    __location_context: literal(true),
  })
);
export type AbstractLocationContext = Infer<typeof AbstractLocationContext>;

/**
 * AbstractSectionContext
 */
export const AbstractSectionContext = assign(
  AbstractLocationContext,
  object({
    __section_context: literal(true),
  })
);
export type AbstractSectionContext = Infer<typeof AbstractLocationContext>;

/**
 * AbstractItemContext
 */
export const AbstractItemContext = assign(
  AbstractLocationContext,
  object({
    __item_context: literal(true),
  })
);
export type AbstractItemContext = Infer<typeof AbstractItemContext>;

/**
 * AbstractActionContext
 */
export const AbstractActionContext = assign(
  AbstractItemContext,
  object({
    __action_context: literal(true),
    text: string(),
  })
);
export type AbstractActionContext = Infer<typeof AbstractActionContext>;

/**
 * ElementContext aka SectionContext
 */
export const ElementContext = assign(
  AbstractSectionContext,
  object({
    _context_type: literal('SectionContext'),
  })
);
export type SectionContext = Infer<typeof ElementContext>;

/**
 * ExpandableSectionContext
 */
export const ExpandableSectionContext = assign(
  AbstractSectionContext,
  object({
    _context_type: literal('ExpandableSectionContext'),
  })
);
export type ExpandableSectionContext = Infer<typeof ExpandableSectionContext>;

/**
 * MediaPlayerContext
 */
export const MediaPlayerContext = assign(
  AbstractSectionContext,
  object({
    _context_type: literal('MediaPlayerContext'),
  })
);
export type MediaPlayerContext = Infer<typeof MediaPlayerContext>;

/**
 * NavigationContext
 */
export const NavigationContext = assign(
  AbstractSectionContext,
  object({
    _context_type: literal('NavigationContext'),
  })
);
export type NavigationContext = Infer<typeof NavigationContext>;

/**
 * OverlayContext
 */
export const OverlayContext = assign(
  AbstractSectionContext,
  object({
    _context_type: literal('OverlayContext'),
  })
);
export type OverlayContext = Infer<typeof OverlayContext>;

/**
 * InputContext
 */
export const InputContext = assign(
  AbstractItemContext,
  object({
    _context_type: literal('InputContext'),
  })
);
export type InputContext = Infer<typeof InputContext>;

/**
 * ButtonContext
 */
export const ButtonContext = assign(
  AbstractActionContext,
  object({
    _context_type: literal('ButtonContext'),
  })
);
export type ButtonContext = Infer<typeof ButtonContext>;

/**
 * LinkContext
 */
export const LinkContext = assign(
  AbstractActionContext,
  object({
    _context_type: literal('LinkContext'),
    href: string(),
  })
);
export type LinkContext = Infer<typeof LinkContext>;

/**
 * LocationContext
 */
export const LocationContext = union([
  ElementContext, // aka SectionContext
  ExpandableSectionContext,
  MediaPlayerContext,
  NavigationContext,
  OverlayContext,
  InputContext,
  ButtonContext,
  LinkContext,
]);
export type LocationContext = Infer<typeof LocationContext>;

/**
 * SectionContext
 */
export const SectionContext = union([
  ElementContext, // aka SectionContext
  ExpandableSectionContext,
  MediaPlayerContext,
  NavigationContext,
  OverlayContext,
]);

/**
 * ItemContext
 */
export const ItemContext = union([InputContext, ButtonContext, LinkContext]);

/**
 * ActionContext
 */
export const ActionContext = union([ButtonContext, LinkContext]);

/**
 * ClickableContext
 */
export const ClickableContext = union([ActionContext, ExpandableSectionContext]);
