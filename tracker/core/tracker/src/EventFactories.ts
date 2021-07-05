import {
  ApplicationLoadedEvent,
  ClickEvent,
  DocumentLoadedEvent,
  InputChangeEvent,
  InteractiveEvent,
  NonInteractiveEvent,
  SectionHiddenEvent,
  SectionVisibleEvent,
  URLChangeEvent,
  VideoEvent,
  VideoLoadEvent,
  VideoPauseEvent,
  VideoStartEvent,
  VideoStopEvent,
  AbstractLocationContext,
  AbstractGlobalContext,
} from '@objectiv/schema';

export const makeApplicationLoadedEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<ApplicationLoadedEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __non_interactive_event: true,
  event: 'ApplicationLoadedEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

export const makeClickEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<ClickEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __interactive_event: true,
  event: 'ClickEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

export const makeDocumentLoadedEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<DocumentLoadedEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __non_interactive_event: true,
  event: 'DocumentLoadedEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

export const makeInputChangeEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<InputChangeEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __interactive_event: true,
  event: 'InputChangeEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

export const makeInteractiveEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<InteractiveEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __interactive_event: true,
  event: 'InteractiveEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

export const makeNonInteractiveEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<NonInteractiveEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __non_interactive_event: true,
  event: 'NonInteractiveEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

export const makeSectionHiddenEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<SectionHiddenEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __non_interactive_event: true,
  event: 'SectionHiddenEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

export const makeSectionVisibleEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<SectionVisibleEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __non_interactive_event: true,
  event: 'SectionVisibleEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

export const makeURLChangeEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<URLChangeEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __non_interactive_event: true,
  event: 'URLChangeEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

export const makeVideoEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<VideoEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

export const makeVideoLoadEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<VideoLoadEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoLoadEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

export const makeVideoPauseEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<VideoPauseEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoPauseEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

export const makeVideoStartEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<VideoStartEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoStartEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

export const makeVideoStopEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<VideoStopEvent, 'id' | 'tracking_time' | 'sending_time'> => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoStopEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});
