import { AbstractNonInteractiveEvent, AbstractVideoEvent } from './abstracts';

/**
 * Non-Interactive Events
 */
export interface DocumentLoadedEvent extends AbstractNonInteractiveEvent {
  readonly event: 'DocumentLoadedEvent';
  // TODO implementing this guard requires extensive changes to the Tracker class, for later
  // readonly locationStack: [WebDocumentContext, ...AbstractLocationContext[]];
}

export interface URLChangedEvent extends AbstractNonInteractiveEvent {
  readonly event: 'URLChangedEvent';
  // TODO implementing this guard requires extensive changes to the Tracker class, for later
  // readonly locationStack: [WebDocumentContext, ...AbstractLocationContext[]];
}

export interface ApplicationLoadedEvent extends AbstractNonInteractiveEvent {
  readonly event: 'ApplicationLoadedEvent';
  // TODO implementing this guard requires extensive changes to the Tracker class, for later
  // readonly locationStack: [AbstractSectionContext, ...AbstractLocationContext[]];
}

export interface SectionVisibleEvent extends AbstractNonInteractiveEvent {
  readonly event: 'SectionVisibleEvent';
  // TODO implementing this guard requires extensive changes to the Tracker class, for later
  // readonly locationStack: [AbstractSectionContext, ...AbstractLocationContext[]];
}

export interface SectionHiddenEvent extends AbstractNonInteractiveEvent {
  readonly event: 'SectionHiddenEvent';
  // TODO implementing this guard requires extensive changes to the Tracker class, for later
  //readonly locationStack: [AbstractSectionContext, ...AbstractLocationContext[]];
}

/**
 * Video Events
 */
export interface VideoEvent extends AbstractVideoEvent {
  readonly event: 'VideoEvent';
}

export interface VideoLoadEvent extends AbstractVideoEvent {
  readonly event: 'VideoLoadEvent';
}

export interface VideoStartEvent extends AbstractVideoEvent {
  readonly event: 'VideoStartEvent';
}

export interface VideoStopEvent extends AbstractVideoEvent {
  readonly event: 'VideoStopEvent';
}

export interface VideoPauseEvent extends AbstractVideoEvent {
  readonly event: 'VideoPauseEvent';
}

/**
 * Interactive Events
 */
export interface ClickEvent extends AbstractNonInteractiveEvent {
  readonly _event: 'ClickEvent';
}

export interface InputChangeEvent extends AbstractNonInteractiveEvent {
  readonly _event: 'InputChangeEvent';
  // TODO implementing this guard requires extensive changes to the Tracker class, for later
  // readonly locationStack: [InputContext, ...AbstractLocationContext[]];
}
