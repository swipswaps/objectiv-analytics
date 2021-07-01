import {
  ApplicationLoadedEvent,
  ClickEvent,
  DocumentLoadedEvent,
  InputChangeEvent,
  SectionHiddenEvent,
  SectionVisibleEvent,
  URLChangeEvent,
  VideoEvent,
  VideoLoadEvent,
  VideoPauseEvent,
  VideoStartEvent,
  VideoStopEvent,
} from '@objectiv/schema';
import { ContextsConfig } from './Context';

/**
 * DocumentLoadedEvent factory
 */
export const makeDocumentLoadedEvent = (props?: ContextsConfig): DocumentLoadedEvent => ({
  __non_interactive_event: true,
  event: 'DocumentLoadedEvent',
  global_contexts: props?.global_contexts ?? [],
  location_stack: props?.location_stack ?? [],
});

/**
 * URLChangedEvent factory
 */
export const makeURLChangeEvent = (props?: ContextsConfig): URLChangeEvent => ({
  __non_interactive_event: true,
  event: 'URLChangeEvent',
  global_contexts: props?.global_contexts ?? [],
  location_stack: props?.location_stack ?? [],
});

/**
 * ApplicationLoadedEvent factory
 */
export const makeApplicationLoadedEvent = (props?: ContextsConfig): ApplicationLoadedEvent => ({
  __non_interactive_event: true,
  event: 'ApplicationLoadedEvent',
  global_contexts: props?.global_contexts ?? [],
  location_stack: props?.location_stack ?? [],
});

/**
 * SectionVisibleEvent factory
 */
export const makeSectionVisibleEvent = (props?: ContextsConfig): SectionVisibleEvent => ({
  __non_interactive_event: true,
  event: 'SectionVisibleEvent',
  global_contexts: props?.global_contexts ?? [],
  location_stack: props?.location_stack ?? [],
});

/**
 * SectionHiddenEvent factory
 */
export const makeSectionHiddenEvent = (props?: ContextsConfig): SectionHiddenEvent => ({
  __non_interactive_event: true,
  event: 'SectionHiddenEvent',
  global_contexts: props?.global_contexts ?? [],
  location_stack: props?.location_stack ?? [],
});

/**
 * VideoEvent factory
 */
export const makeVideoEvent = (props?: ContextsConfig): VideoEvent => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoEvent',
  global_contexts: props?.global_contexts ?? [],
  location_stack: props?.location_stack ?? [],
});

/**
 * VideoLoadEvent factory
 */
export const makeVideoLoadEvent = (props?: ContextsConfig): VideoLoadEvent => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoLoadEvent',
  global_contexts: props?.global_contexts ?? [],
  location_stack: props?.location_stack ?? [],
});

/**
 * VideoStartEvent factory
 */
export const makeVideoStartEvent = (props?: ContextsConfig): VideoStartEvent => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoStartEvent',
  global_contexts: props?.global_contexts ?? [],
  location_stack: props?.location_stack ?? [],
});

/**
 * VideoStopEvent factory
 */
export const makeVideoStopEvent = (props?: ContextsConfig): VideoStopEvent => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoStopEvent',
  global_contexts: props?.global_contexts ?? [],
  location_stack: props?.location_stack ?? [],
});

/**
 * VideoPauseEvent factory
 */
export const makeVideoPauseEvent = (props?: ContextsConfig): VideoPauseEvent => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoPauseEvent',
  global_contexts: props?.global_contexts ?? [],
  location_stack: props?.location_stack ?? [],
});

/**
 * ClickEvent factory
 */
export const makeClickEvent = (props?: ContextsConfig): ClickEvent => ({
  __interactive_event: true,
  event: 'ClickEvent',
  global_contexts: props?.global_contexts ?? [],
  location_stack: props?.location_stack ?? [],
});

/**
 * ClickEvent factory
 */
export const makeInputChangeEvent = (props?: ContextsConfig): InputChangeEvent => ({
  __interactive_event: true,
  event: 'InputChangeEvent',
  global_contexts: props?.global_contexts ?? [],
  location_stack: props?.location_stack ?? [],
});
