/**
 * Abstract Contexts
 */
export abstract class AbstractContext {
  readonly _context_type: string;
  readonly id: string;
}

export abstract class AbstractGlobalContext extends AbstractContext {
  readonly _global = true;
}

export abstract class AbstractLocationContext extends AbstractContext {
  readonly _location = true;
}

export abstract class AbstractSectionContext extends AbstractLocationContext {
  readonly _section = true;
}

export abstract class AbstractItemContext extends AbstractLocationContext {
  readonly _item = true;
}

export abstract class AbstractActionContext extends AbstractItemContext {
  readonly _action = true;
}

/**
 * Abstract Events
 */
export interface Contexts {
  readonly locationStack: AbstractLocationContext[];
  readonly globalContexts: AbstractGlobalContext[];
}

export abstract class AbstractEvent implements Contexts {
  readonly event: string;
  readonly locationStack: AbstractLocationContext[];
  readonly globalContexts: AbstractGlobalContext[];
}

export abstract class AbstractNonInteractiveEvent extends AbstractEvent {
  readonly _interactive = false;
}

export abstract class AbstractInteractiveEvent extends AbstractEvent {
  readonly _interactive = true;
  readonly locationStack: [AbstractSectionContext, ...AbstractLocationContext[]];
  readonly globalContexts: AbstractGlobalContext[];
}
