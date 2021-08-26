import { TrackingAttributeVisibility } from './TrackingAttributes';

/**
 * All the Location Context types `track` supports.
 * Naming note: `Section` contexts are mapped to `Element`. This is to avoid confusion between our SectionContext and
 * the HTML5 <section> tag.
 */
export enum ContextType {
  button = 'ButtonContext',
  element = 'SectionContext',
  expandableElement = 'ExpandableSectionContext',
  input = 'InputContext',
  link = 'LinkContext',
  mediaPlayer = 'MediaPlayerContext',
  navigation = 'NavigationContext',
  overlay = 'OverlayContext',
}

/**
 * Holds for which ContextTypes we will track clicks automatically.
 * This is used as default value for the objectivTrackClicks Tracking Attribute.
 */
export const TrackClicksDefaultValueByContextType: Map<ContextType, boolean> = new Map([
  [ContextType.button, true],
  [ContextType.expandableElement, true],
  [ContextType.link, true],
]);

/**
 * Holds for which ContextTypes we will track blurs automatically.
 * This is used as default value for the objectivTrackBlurs Tracking Attribute.
 */
export const TrackBlursDefaultValueByContextType: Map<ContextType, boolean> = new Map([[ContextType.input, true]]);

/**
 * Holds for which ContextTypes we will track visibility automatically.
 * This is used as default value for the objectivTrackVisibility Tracking Attribute.
 *
 * Developers can always switch to programmatic tracking by specifying the isVisible parameter.
 * When isVisible is given we will not automatically track visibility.
 */
export const TrackVisibilityDefaultValueByContextType: Map<ContextType, TrackingAttributeVisibility> = new Map([
  [ContextType.element, { mode: 'auto' }],
  [ContextType.expandableElement, { mode: 'auto' }],
  [ContextType.mediaPlayer, { mode: 'auto' }],
  [ContextType.navigation, { mode: 'auto' }],
  [ContextType.overlay, { mode: 'auto' }],
]);
