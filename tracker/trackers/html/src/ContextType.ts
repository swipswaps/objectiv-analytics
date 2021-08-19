/**
 * All the Location Context types `track` supports.
 * Naming note: `Section` contexts are mapped to `Element`. This is to avoid confusion between our SectionContext and
 * the HTML5 <section> tag.
 */
enum ContextType {
  button = 'ButtonContext',
  element = 'SectionContext',
  expandableElement = 'ExpandableSectionContext',
  input = 'InputContext',
  link = 'LinkContext',
  mediaPlayer = 'MediaPlayerContext',
  navigation = 'NavigationContext',
  overlay = 'OverlayContext',
}

export default ContextType;
