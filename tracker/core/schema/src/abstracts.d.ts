export abstract class AbstractContext {
  abstract readonly _context_type: string;
  abstract readonly id: string;
}

export abstract class AbstractGlobalContext extends AbstractContext {
  readonly _global = true;
}

export abstract class AbstractLocationContext extends AbstractContext {
  readonly _location = true;
}
