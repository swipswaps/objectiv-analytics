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

/** Creates instance of ApplicationLoadedEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<ApplicationLoadedEvent, 'id'> - non interactive event that is emitted after an application (eg. SPA) has finished loading.
 * 	Contains a `SectionContext`
 */
export const makeApplicationLoadedEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<ApplicationLoadedEvent, 'id'> => ({
  __non_interactive_event: true,
  event: 'ApplicationLoadedEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

/** Creates instance of ClickEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<ClickEvent, 'id'> - Event triggered by a user clicking on an element
 */
export const makeClickEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<ClickEvent, 'id'> => ({
  __interactive_event: true,
  event: 'ClickEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

/** Creates instance of DocumentLoadedEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<DocumentLoadedEvent, 'id'> - A non interactive event that is emitted after a document finishes loading. It should provide a
 * 	`WebDocumentContext` which should describe the state (eg. URL) of the event.
 * 	NOTE: with SPA's this probably only happens once, as page (re)loads don't happen after the initial page load
 */
export const makeDocumentLoadedEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<DocumentLoadedEvent, 'id'> => ({
  __non_interactive_event: true,
  event: 'DocumentLoadedEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

/** Creates instance of InputChangeEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<InputChangeEvent, 'id'> - Event triggered when user input is modified.
 */
export const makeInputChangeEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<InputChangeEvent, 'id'> => ({
  __interactive_event: true,
  event: 'InputChangeEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

/** Creates instance of InteractiveEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<InteractiveEvent, 'id'> - Events that are the direct result of a user interaction. Eg. a Button Click
 */
export const makeInteractiveEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<InteractiveEvent, 'id'> => ({
  __interactive_event: true,
  event: 'InteractiveEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

/** Creates instance of NonInteractiveEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<NonInteractiveEvent, 'id'> - Non interactive events, are events that are not (directly) triggered by an interaction. For example:
 * 	Consider the following flow of events:
 * 	1. press play in a video player -> ButtonEvent -> interactive
 * 	2. Videoplayer starting playback -> MediaStartEvent -> non-interactive
 */
export const makeNonInteractiveEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<NonInteractiveEvent, 'id'> => ({
  __non_interactive_event: true,
  event: 'NonInteractiveEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

/** Creates instance of SectionHiddenEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<SectionHiddenEvent, 'id'> - Non interactive event, emitted after a section (`SectionContext`) has become invisible.
 */
export const makeSectionHiddenEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<SectionHiddenEvent, 'id'> => ({
  __non_interactive_event: true,
  event: 'SectionHiddenEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

/** Creates instance of SectionVisibleEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<SectionVisibleEvent, 'id'> - Non interactive event, emitted after a section (`SectionContext`) has become visible.
 */
export const makeSectionVisibleEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<SectionVisibleEvent, 'id'> => ({
  __non_interactive_event: true,
  event: 'SectionVisibleEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

/** Creates instance of URLChangeEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<URLChangeEvent, 'id'> - non interactive event that is emitted when the URL of a page has changed. Also contains a `WebDocumentContext`
 * 	that details the change.
 */
export const makeURLChangeEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<URLChangeEvent, 'id'> => ({
  __non_interactive_event: true,
  event: 'URLChangeEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

/** Creates instance of VideoEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<VideoEvent, 'id'> - Family of non interactive events triggered by a video player
 */
export const makeVideoEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<VideoEvent, 'id'> => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

/** Creates instance of VideoLoadEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<VideoLoadEvent, 'id'> - Event emitted after a video completes loading.
 */
export const makeVideoLoadEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<VideoLoadEvent, 'id'> => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoLoadEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

/** Creates instance of VideoPauseEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<VideoPauseEvent, 'id'> - Event emitted after a video pauses playback (toggle).
 */
export const makeVideoPauseEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<VideoPauseEvent, 'id'> => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoPauseEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

/** Creates instance of VideoStartEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<VideoStartEvent, 'id'> - Event emitted after a video starts playback.
 */
export const makeVideoStartEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<VideoStartEvent, 'id'> => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoStartEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});

/** Creates instance of VideoStopEvent
 * @param {Object} props - factory properties
 * @param {AbstractLocationContext[]} props.location_stack - The location stack is an ordered list (stack), that contains a hierarchy of location contexts that
 *         deterministically describes where an event took place.
 * @param {AbstractGlobalContext[]} props.global_contexts - Global contexts add global information about the event. They carry information that is not
 *         related to where the Event originated, such as device, platform or business data.
 * @return Omit<VideoStopEvent, 'id'> - Event emitted after a video stops playback.
 */
export const makeVideoStopEvent = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}): Omit<VideoStopEvent, 'id'> => ({
  __non_interactive_event: true,
  __video_event: true,
  event: 'VideoStopEvent',
  location_stack: props?.location_stack ?? [],
  global_contexts: props?.global_contexts ?? [],
});
