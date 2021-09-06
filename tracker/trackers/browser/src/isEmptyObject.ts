export const isEmptyObject = (object: Object): object is {} =>
  object && Object.keys(object).length === 0 && typeof object === 'object';
