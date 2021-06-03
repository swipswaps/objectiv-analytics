/**
 * All Contexts in Objectiv Taxonomy inherit from this basic type.
 * TODO These should not be defined here but imported from some package shared with the Backend
 */
export type Context = {
  _context_type: string;
  id: string;
};

/**
 * While there's no actual difference between a Location Context and a Global Context, let's define them separately.
 * TODO There are ways of making these definitions differ but it depends on how the JSON with the schema will look like
 */
export type GlobalContext = Context;
export type LocationContext = Context;
