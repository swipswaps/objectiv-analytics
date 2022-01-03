/*
 * Copyright 2022 Objectiv B.V.
 */

import { assign, Infer, literal, object, string, union } from 'superstruct';

/**
 * Abstract Context struct
 */
export const AbstractContext = object({
  id: string(),
  _type: string(),
});

/**
 * AbstractLocationContext struct
 */
export const AbstractLocationContext = assign(
  AbstractContext,
  object({
    __location_context: literal(true),
  })
);

/**
 * AbstractPressableContext struct
 */
export const AbstractPressableContext = assign(
  AbstractLocationContext,
  object({
    __pressable_context: literal(true),
  })
);

/**
 * RootLocationContext struct
 */
export const RootLocationContext = assign(
  AbstractLocationContext,
  object({
    _type: literal('RootLocationContext'),
  })
);

/**
 * ContentContext struct
 */
export const ContentContext = assign(
  AbstractLocationContext,
  object({
    _type: literal('ContentContext'),
  })
);

/**
 * ExpandableContext struct
 */
export const ExpandableContext = assign(
  AbstractLocationContext,
  object({
    _type: literal('ExpandableContext'),
  })
);

/**
 * MediaPlayerContext struct
 */
export const MediaPlayerContext = assign(
  AbstractLocationContext,
  object({
    _type: literal('MediaPlayerContext'),
  })
);

/**
 * NavigationContext struct
 */
export const NavigationContext = assign(
  AbstractLocationContext,
  object({
    _type: literal('NavigationContext'),
  })
);

/**
 * OverlayContext struct
 */
export const OverlayContext = assign(
  AbstractLocationContext,
  object({
    _type: literal('OverlayContext'),
  })
);

/**
 * InputContext struct
 */
export const InputContext = assign(
  AbstractLocationContext,
  object({
    _type: literal('InputContext'),
  })
);

/**
 * OverlayContext struct
 */
export const PressableContext = assign(
  AbstractPressableContext,
  object({
    _type: literal('PressableContext'),
  })
);

/**
 * LinkContext struct
 */
export const LinkContext = assign(
  AbstractPressableContext,
  object({
    _type: literal('LinkContext'),
    href: string(),
  })
);

/**
 * Struct union to match any LocationContext
 */
export const AnyLocationContext = union([
  ContentContext,
  ExpandableContext,
  InputContext,
  LinkContext,
  MediaPlayerContext,
  NavigationContext,
  OverlayContext,
  PressableContext,
  RootLocationContext,
]);

export type AnyLocationContext = Infer<typeof AnyLocationContext>;

/**
 * Struct union to match any PressableContext
 */
export const AnyPressableContext = union([LinkContext, PressableContext]);

export type AnyPressableContext = Infer<typeof AnyPressableContext>;

/**
 * Struct union to match any Clickable Context, that is AnyPressableContext + ExpandableContext
 */
export const AnyClickableContext = union([AnyPressableContext, ExpandableContext]);

export type AnyClickableContext = Infer<typeof AnyClickableContext>;

/**
 * Struct union to match any Showable Context, that is Overlays and ExpandableContext
 */
export const AnyShowableContext = union([OverlayContext, ExpandableContext]);

export type AnyShowableContext = Infer<typeof AnyShowableContext>;
