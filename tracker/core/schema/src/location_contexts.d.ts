import { AbstractLocationContext } from './abstracts';

/**
 * Sections
 */
export abstract class AbstractSectionContext extends AbstractLocationContext {
  readonly _section = true;
}

export interface SectionContext extends AbstractSectionContext {
  readonly _context_type: 'SectionContext';
}

export interface WebDocumentContext extends AbstractSectionContext {
  readonly _context_type: 'WebDocumentContext';
  url: string;
}

export interface ScreenContext extends AbstractSectionContext {
  readonly _context_type: 'ScreenContext';
  screen: string;
}

export interface ExpandableSectionContext extends AbstractSectionContext {
  readonly _context_type: 'ExpandableSectionContext';
}

export interface MediaPlayerContext extends AbstractSectionContext {
  readonly _context_type: 'MediaPlayerContext';
}

export interface NavigationContext extends AbstractSectionContext {
  readonly _context_type: 'NavigationContext';
}

export interface OverlayContext extends AbstractSectionContext {
  readonly _context_type: 'OverlayContext';
}

/**
 * Items
 */
export abstract class AbstractItemContext extends AbstractLocationContext {
  readonly _item = true;
}

export interface ItemContext extends AbstractItemContext {
  readonly _context_type: 'ItemContext';
}

export interface InputContext extends AbstractItemContext {
  readonly _context_type: 'InputContext';
}

/**
 * Actions
 */
export abstract class AbstractActionContext extends AbstractItemContext {
  readonly _action = true;
}

export interface ActionContext extends AbstractActionContext {
  readonly _context_type: 'ActionContext';
  path: string;
  text: string;
}

export interface ButtonContext extends AbstractActionContext {
  readonly _context_type: 'ButtonContext';
}

export interface LinkContext extends AbstractActionContext {
  readonly _context_type: 'LinkContext';
}
