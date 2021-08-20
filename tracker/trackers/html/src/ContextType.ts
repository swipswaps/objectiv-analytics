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
 * Holds for which which ContextTypes we will track clicks automatically.
 * This is used as default value for the objectivTrackClicks Tracking Attribute.
 */
export const ClickTrackingByContextType: Map<ContextType, boolean> = new Map([
  [ContextType.button, true],
  [ContextType.element, false],
  [ContextType.expandableElement, false],
  [ContextType.input, false],
  [ContextType.link, true],
  [ContextType.mediaPlayer, false],
  [ContextType.navigation, false],
  [ContextType.overlay, false],
]);

/**
 * Holds for which which ContextTypes we will track blurs automatically.
 * This is used as default value for the objectivTrackBlurs Tracking Attribute.
 */
export const BlurTrackingByContextType: Map<ContextType, boolean> = new Map([
  [ContextType.button, false],
  [ContextType.element, false],
  [ContextType.expandableElement, false],
  [ContextType.input, true],
  [ContextType.link, false],
  [ContextType.mediaPlayer, false],
  [ContextType.navigation, false],
  [ContextType.overlay, false],
]);

/**
 * Holds for which which ContextTypes we will track visibility automatically.
 * This is used as default value for the objectivTrackVisibility Tracking Attribute.
 */
export const VisibilityTrackingByContextType: Map<ContextType, boolean> = new Map([
  [ContextType.button, false],
  [ContextType.element, true],
  [ContextType.expandableElement, true],
  [ContextType.input, false],
  [ContextType.link, false],
  [ContextType.mediaPlayer, true],
  [ContextType.navigation, true],
  [ContextType.overlay, true],
]);
