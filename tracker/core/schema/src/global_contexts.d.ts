/*
 * Copyright 2022 Objectiv B.V.
 */

import { AbstractGlobalContext } from './abstracts';

/**
 * A GlobalContext describing in which app the event happens, like a website or iOS app.
 * Inheritance: ApplicationContext -> AbstractGlobalContext -> AbstractContext
 */
export interface ApplicationContext extends AbstractGlobalContext {
  /**
   * Typescript discriminator
   */
  readonly _type: 'ApplicationContext';
}

/**
 * Global context with information needed to reconstruct a user session.
 * Inheritance: CookieIdContext -> AbstractGlobalContext -> AbstractContext
 */
export interface CookieIdContext extends AbstractGlobalContext {
  /**
   * Typescript discriminator
   */
  readonly _type: 'CookieIdContext';

  /**
   * Unique identifier from the session cookie
   */
  cookie_id: string;
}

/**
 * A GlobalContext describing meta information about the agent that sent the event.
 * Inheritance: HttpContext -> AbstractGlobalContext -> AbstractContext
 */
export interface HttpContext extends AbstractGlobalContext {
  /**
   * Typescript discriminator
   */
  readonly _type: 'HttpContext';

  /**
   * Full URL to HTTP referrer of the current page.
   */
  referer: string;

  /**
   * User-agent of the agent that sent the event.
   */
  user_agent: string;

  /**
   * (public) IP address of the agent that sent the event.
   */
  remote_address: string;
}

/**
 * A GlobalContext describing the path where the user is when an event is sent.
 * Inheritance: PathContext -> AbstractGlobalContext -> AbstractContext
 */
export interface PathContext extends AbstractGlobalContext {
  /**
   * Typescript discriminator
   */
  readonly _type: 'PathContext';
}

/**
 * A GlobalContext describing meta information about the current session.
 * Inheritance: SessionContext -> AbstractGlobalContext -> AbstractContext
 */
export interface SessionContext extends AbstractGlobalContext {
  /**
   * Typescript discriminator
   */
  readonly _type: 'SessionContext';

  /**
   * Hit counter relative to the current session, this event originated in.
   */
  hit_number: number;
}
