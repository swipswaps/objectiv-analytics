import { assign, object, pick, string } from 'superstruct';
import { TagLocationOptions, TagLocationParameters } from '../tagLocation';
import { TrackerErrorHandlerCallback } from './TrackerErrorHandlerCallback';

/**
 * LocationTaggers are shorthands around tagLocation.
 */
export const LocationTaggerParameters = assign(
  pick(TagLocationParameters, ['options', 'onError']),
  object({
    id: string(),
  })
);

export type LocationTaggerParameters = {
  id: string;
  options?: TagLocationOptions;
  onError?: TrackerErrorHandlerCallback;
};
