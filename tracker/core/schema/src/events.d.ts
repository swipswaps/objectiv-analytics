import {
  AbstractLocationContext,
  AbstractNonInteractiveEvent,
  AbstractSectionContext,
  AbstractVideoEvent,
} from './abstracts';
import { InputContext, WebDocumentContext } from './location_contexts';

/**
 * Non-Interactive Events
 */
export interface DocumentLoadedEvent extends AbstractNonInteractiveEvent {
  readonly event: 'DocumentLoadedEvent';
  readonly locationStack: [WebDocumentContext, ...AbstractLocationContext[]];
}

export interface URLChangedEvent extends AbstractNonInteractiveEvent {
  readonly event: 'URLChangedEvent';
  readonly locationStack: [WebDocumentContext, ...AbstractLocationContext[]];
}

export interface ApplicationLoadedEvent extends AbstractNonInteractiveEvent {
  readonly event: 'ApplicationLoadedEvent';
  readonly locationStack: [AbstractSectionContext, ...AbstractLocationContext[]];
}

export interface SectionVisibleEvent extends AbstractNonInteractiveEvent {
  readonly event: 'SectionVisibleEvent';
  readonly locationStack: [AbstractSectionContext, ...AbstractLocationContext[]];
}

export interface SectionHiddenEvent extends AbstractNonInteractiveEvent {
  readonly event: 'SectionHiddenEvent';
  readonly locationStack: [AbstractSectionContext, ...AbstractLocationContext[]];
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
  readonly locationStack: [InputContext, ...AbstractLocationContext[]];
}
