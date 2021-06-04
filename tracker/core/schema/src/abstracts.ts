export abstract class AbstractContext {
  readonly _context_type: string;
  readonly id: string;

  constructor({ _context_type, id }: AbstractContext) {
    this._context_type = _context_type;
    this.id = id;
  }
}

export abstract class AbstractGlobalContext extends AbstractContext {
  readonly _global = true;
}

export abstract class AbstractLocationContext extends AbstractContext {
  readonly _location = true;
}
