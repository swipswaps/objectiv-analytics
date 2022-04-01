/*
 * Copyright 2022 Objectiv B.V.
 */

/**
 * Error codes
 */
import { TrackerPlatform } from '../Tracker';

/**
 * The URL of the docs. Prepended to all URLs in error messages.
 */
export const DOCS_URL = 'https://objectiv.io/docs';

/**
 * All type of context error checks we support
 */
export enum ContextErrorType {
  GLOBAL_CONTEXT_MISSING = 'GLOBAL_CONTEXT_MISSING',
  GLOBAL_CONTEXT_DUPLICATED = 'GLOBAL_CONTEXT_DUPLICATED',
  LOCATION_CONTEXT_MISSING = 'LOCATION_CONTEXT_MISSING',
  LOCATION_CONTEXT_DUPLICATED = 'LOCATION_CONTEXT_DUPLICATED',
  LOCATION_CONTEXT_WRONG_POSITION = 'LOCATION_CONTEXT_WRONG_POSITION',
}

/**
 * Error messages have a `default` fallback message and may have context-specific messages.
 * TODO: possible improvement would be to replace `[context: string]` with a proper set of Context Literals
 */
export type ContextErrorMessage = { default: string; [context: string]: string };

/**
 * Error messages are organized by error type.
 */
export type ContextErrorMessagesByType = { [type in ContextErrorType]: ContextErrorMessage };

/**
 * Error messages are key:value structures where key is a unique Error identifier and value is the message itself.
 */
export type ContextErrorMessages = { [platform in TrackerPlatform]: ContextErrorMessagesByType };

const genericErrorMessagesByType: ContextErrorMessagesByType = {
  [ContextErrorType.GLOBAL_CONTEXT_MISSING]: {
    default:
      '{{contextName}} is missing from Global Contexts.\n' +
      'Taxonomy documentation: {{docsURL}}/taxonomy/reference/global-contexts/{{contextName}}.',
  },
  [ContextErrorType.GLOBAL_CONTEXT_DUPLICATED]: {
    default:
      'Only one {{contextName}} should be present in Global Contexts.\n' +
      'Taxonomy documentation: {{docsURL}}/taxonomy/reference/global-contexts/{{contextName}}.',
  },
  [ContextErrorType.LOCATION_CONTEXT_MISSING]: {
    default:
      '{{contextName}} is missing from Location Stack.\n' +
      'Taxonomy documentation: {{docsURL}}/taxonomy/reference/location-contexts/{{contextName}}.',
  },
  [ContextErrorType.LOCATION_CONTEXT_DUPLICATED]: {
    default:
      'Only one {{contextName}} should be present in Location Stack.\n' +
      'Taxonomy documentation: {{docsURL}}/taxonomy/reference/location-contexts/{{contextName}}.',
  },
  [ContextErrorType.LOCATION_CONTEXT_WRONG_POSITION]: {
    default:
      '{{contextName}} is in the wrong position of the Location Stack.\n' +
      'Taxonomy documentation: {{docsURL}}/taxonomy/reference/location-contexts/{{contextName}}.',
  },
};

/**
 * A global map of all Validation Error Messages per platform.
 */
export const ContextErrorMessages: ContextErrorMessages = {
  [TrackerPlatform.ANGULAR]: {
    ...genericErrorMessagesByType,
    [ContextErrorType.LOCATION_CONTEXT_MISSING]: {
      ...genericErrorMessagesByType.LOCATION_CONTEXT_MISSING,
      RootLocationContext:
        genericErrorMessagesByType.LOCATION_CONTEXT_MISSING.default +
        '\n' +
        'See also:\n' +
        '- Configuring Roots: {{docsURL}}/tracking/angular/how-to-guides/configuring-root-locations.\n' +
        '- tagRootLocation: {{docsURL}}/tracking/angular/api-reference/locationTaggers/tagRootLocation.',
    },
  },
  [TrackerPlatform.CORE]: genericErrorMessagesByType,
  [TrackerPlatform.BROWSER]: {
    ...genericErrorMessagesByType,
    [ContextErrorType.LOCATION_CONTEXT_MISSING]: {
      ...genericErrorMessagesByType.LOCATION_CONTEXT_MISSING,
      RootLocationContext:
        genericErrorMessagesByType.LOCATION_CONTEXT_MISSING.default +
        '\n' +
        'See also:\n' +
        '- Configuring Roots: {{docsURL}}/tracking/browser/how-to-guides/configuring-root-locations.\n' +
        '- tagRootLocation: {{docsURL}}/tracking/browser/api-reference/locationTaggers/tagRootLocation.',
    },
  },
  [TrackerPlatform.REACT]: {
    ...genericErrorMessagesByType,
    [ContextErrorType.LOCATION_CONTEXT_MISSING]: {
      ...genericErrorMessagesByType.LOCATION_CONTEXT_MISSING,
      RootLocationContext:
        genericErrorMessagesByType.LOCATION_CONTEXT_MISSING.default +
        '\n' +
        'See also:\n' +
        '- Configuring Roots: {{docsURL}}/tracking/react/how-to-guides/configuring-root-locations.\n' +
        '- TrackedRootLocationContext: {{docsURL}}/tracking/react/api-reference/trackedContexts/TrackedRootLocationContext.\n' +
        '- RootLocationContextWrapper: {{docsURL}}/tracking/react/api-reference/locationWrappers/RootLocationContextWrapper.',
    },
  },
  [TrackerPlatform.REACT_NATIVE]: {
    ...genericErrorMessagesByType,
    [ContextErrorType.LOCATION_CONTEXT_MISSING]: {
      ...genericErrorMessagesByType.LOCATION_CONTEXT_MISSING,
      RootLocationContext:
        genericErrorMessagesByType.LOCATION_CONTEXT_MISSING.default +
        '\n' +
        'See also:\n' +
        '- React Navigation Plugin: {{docsURL}}/tracking/react-native/plugins/react-navigation.\n' +
        '- RootLocationContextWrapper: {{docsURL}}/tracking/react-native/api-reference/locationWrappers/RootLocationContextWrapper.',
    },
  },
};
