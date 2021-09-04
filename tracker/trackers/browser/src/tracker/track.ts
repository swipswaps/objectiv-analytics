import { z } from "zod";
import { trackLocation, TrackParameters } from "./trackLocation";

/**
 * Wrapper around trackLocation calls for error handling
 */
export const track = (trackLocationParameters: z.infer<typeof TrackParameters>, onError: (error: Error) => void) => {
  try {
    return trackLocation(trackLocationParameters)
  } catch (error) {
    if (onError) {
      onError(error)
    }
    return {};
  }
};
