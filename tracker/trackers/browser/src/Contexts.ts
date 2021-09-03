import { z } from "zod";

/**
 * AbstractContext
 */
export const AbstractContext = z.object({
  id: z.string(),
  _context_type: z.enum([
    'SectionContext',
    'WebDocumentContext',
    'ScreenContext',
    'ExpandableSectionContext',
    'MediaPlayerContext',
    'NavigationContext',
    'OverlayContext',
    'ItemContext',
    'InputContext',
    'ActionContext',
    'ButtonContext',
    'LinkContext',
  ]),
});
export type AbstractContext = z.infer<typeof AbstractContext>;

/**
 * AbstractLocationContext
 */
export const AbstractLocationContext = AbstractContext.extend({
  __location_context: z.literal(true),
});
export type AbstractLocationContext = z.infer<typeof AbstractLocationContext>;

/**
 * AbstractSectionContext
 */
export const AbstractSectionContext = AbstractLocationContext.extend({
  __section_context: z.literal(true),
  _context_type: z.enum([
    'SectionContext',
    'WebDocumentContext',
    'ScreenContext',
    'ExpandableSectionContext',
    'MediaPlayerContext',
    'NavigationContext',
    'OverlayContext',
  ])
});
export type AbstractSectionContext = z.infer<typeof AbstractLocationContext>;

/**
 * AbstractItemContext
 */
export const AbstractItemContext = AbstractLocationContext.extend({
  __item_context: z.literal(true),
  _context_type: z.enum([
    'ItemContext',
    'InputContext',
    'ActionContext',
    'ButtonContext',
    'LinkContext',
  ])
});
export type AbstractItemContext = z.infer<typeof AbstractItemContext>;

/**
 * AbstractActionContext
 */
export const AbstractActionContext = AbstractItemContext.extend({
  __action_context: z.literal(true),
  _context_type: z.enum([
    'ActionContext',
    'ButtonContext',
    'LinkContext',
  ]),
  text: z.string()
});
export type AbstractActionContext = z.infer<typeof AbstractActionContext>;

/**
 * ElementContext
 */
export const ElementContext = AbstractSectionContext.extend({
  _context_type: z.literal(AbstractSectionContext.shape._context_type.enum.SectionContext),
});
export type SectionContext = z.infer<typeof ElementContext>;

/**
 * WebDocumentContext
 */
export const WebDocumentContext = AbstractSectionContext.extend({
  _context_type: z.literal(AbstractSectionContext.shape._context_type.enum.WebDocumentContext),
});
export type WebDocumentContext = z.infer<typeof WebDocumentContext>;

/**
 * ScreenContext
 */
export const ScreenContext = AbstractSectionContext.extend({
  _context_type: z.literal(AbstractSectionContext.shape._context_type.enum.ScreenContext),
});
export type ScreenContext = z.infer<typeof ScreenContext>;

/**
 * ExpandableSectionContext
 */
export const ExpandableSectionContext = AbstractSectionContext.extend({
  _context_type: z.literal(AbstractSectionContext.shape._context_type.enum.ExpandableSectionContext),
});
export type ExpandableSectionContext = z.infer<typeof ExpandableSectionContext>;

/**
 * MediaPlayerContext
 */
export const MediaPlayerContext = AbstractSectionContext.extend({
  _context_type: z.literal(AbstractSectionContext.shape._context_type.enum.MediaPlayerContext),
});
export type MediaPlayerContext = z.infer<typeof MediaPlayerContext>;

/**
 * NavigationContext
 */
export const NavigationContext = AbstractSectionContext.extend({
  _context_type: z.literal(AbstractSectionContext.shape._context_type.enum.NavigationContext),
});
export type NavigationContext = z.infer<typeof NavigationContext>;

/**
 * OverlayContext
 */
export const OverlayContext = AbstractSectionContext.extend({
  _context_type: z.literal(AbstractSectionContext.shape._context_type.enum.OverlayContext),
});
export type OverlayContext = z.infer<typeof OverlayContext>;

/**
 * InputContext
 */
export const InputContext = AbstractItemContext.extend({
  _context_type: z.literal(AbstractItemContext.shape._context_type.enum.InputContext),
});
export type InputContext = z.infer<typeof InputContext>;

/**
 * ButtonContext
 */
export const ButtonContext = AbstractActionContext.extend({
  _context_type: z.literal(AbstractActionContext.shape._context_type.enum.ButtonContext),
});
export type ButtonContext = z.infer<typeof ButtonContext>;

/**
 * LinkContext
 */
export const LinkContext = AbstractActionContext.extend({
  _context_type: z.literal(AbstractActionContext.shape._context_type.enum.LinkContext),
  href: z.string()
});
export type LinkContext = z.infer<typeof LinkContext>;

/**
 * LocationContext
 */
export const LocationContext = z.union([
  ElementContext,
  WebDocumentContext,
  ScreenContext,
  ExpandableSectionContext,
  MediaPlayerContext,
  NavigationContext,
  OverlayContext,
  InputContext,
  ButtonContext,
  LinkContext,
]);

/**
 * SectionContext
 */
export const SectionContext = z.union([
  ElementContext,
  WebDocumentContext,
  ScreenContext,
  ExpandableSectionContext,
  MediaPlayerContext,
  NavigationContext,
  OverlayContext,
]);

/**
 * ItemContext
 */
export const ItemContext = z.union([
  InputContext,
  ButtonContext,
  LinkContext,
]);

/**
 * ActionContext
 */
export const ActionContext = z.union([
  ButtonContext,
  LinkContext,
]);
