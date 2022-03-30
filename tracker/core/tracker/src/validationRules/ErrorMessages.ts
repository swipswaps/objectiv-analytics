/*
 * Copyright 2022 Objectiv B.V.
 */

/**
 * Error codes
 */
import { TrackerPlatform } from '../Tracker';

export enum ErrorCode {
  GLOBAL_CONTEXT_CONTEXT_MISSING = 'GLOBAL_CONTEXT_CONTEXT_MISSING',
  GLOBAL_CONTEXT_CONTEXT_DUPLICATED = 'GLOBAL_CONTEXT_CONTEXT_DUPLICATED',
  LOCATION_CONTEXT_MISSING = 'LOCATION_CONTEXT_MISSING',
  LOCATION_CONTEXT_DUPLICATED = 'LOCATION_CONTEXT_DUPLICATED',
  LOCATION_CONTEXT_WRONG_POSITION = 'LOCATION_CONTEXT_WRONG_POSITION',
}

/**
 * Error messages are key:value structures where key is a unique errorCode and value is the message itself.
 */
export type ErrorMessagesByCode = { [code in ErrorCode]: string };

/**
 * Error messages are key:value structures where key is a unique Error identifier and value is the message itself.
 */
export type ErrorMessages = { [platform in TrackerPlatform]: ErrorMessagesByCode };

/**
 * A global map of all Validation Error Messages per platform.
 */
export const ErrorMessages: ErrorMessages = {
  [TrackerPlatform.ANGULAR]: {
    [ErrorCode.GLOBAL_CONTEXT_CONTEXT_MISSING]: `
      {contextName} is missing from Global Contexts. 
      Taxonomy documentation: {docsURL}/taxonomy/reference/global-contexts/{contextName}.
    `,
    [ErrorCode.GLOBAL_CONTEXT_CONTEXT_DUPLICATED]: `
      Only one {contextName} should be present in Global Contexts.
      Taxonomy documentation: {docsURL}/taxonomy/reference/global-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_MISSING]: `
      {contextName} is missing from Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_DUPLICATED]: `
      Only one {contextName} should be present in Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_WRONG_POSITION]: `
      {contextName} is in the wrong position of the Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
  },

  [TrackerPlatform.CORE]: {
    [ErrorCode.GLOBAL_CONTEXT_CONTEXT_MISSING]: `
      {contextName} is missing from Global Contexts. 
      Taxonomy documentation: {docsURL}/taxonomy/reference/global-contexts/{contextName}.
    `,
    [ErrorCode.GLOBAL_CONTEXT_CONTEXT_DUPLICATED]: `
      Only one {contextName} should be present in Global Contexts.
      Taxonomy documentation: {docsURL}/taxonomy/reference/global-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_MISSING]: `
      {contextName} is missing from Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_DUPLICATED]: `
      Only one {contextName} should be present in Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_WRONG_POSITION]: `
      {contextName} is in the wrong position of the Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
  },

  [TrackerPlatform.BROWSER]: {
    [ErrorCode.GLOBAL_CONTEXT_CONTEXT_MISSING]: `
      {contextName} is missing from Global Contexts. 
      Taxonomy documentation: {docsURL}/taxonomy/reference/global-contexts/{contextName}.
    `,
    [ErrorCode.GLOBAL_CONTEXT_CONTEXT_DUPLICATED]: `
      Only one {contextName} should be present in Global Contexts.
      Taxonomy documentation: {docsURL}/taxonomy/reference/global-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_MISSING]: `
      {contextName} is missing from Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_DUPLICATED]: `
      Only one {contextName} should be present in Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_WRONG_POSITION]: `
      {contextName} is in the wrong position of the Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
  },

  [TrackerPlatform.REACT]: {
    [ErrorCode.GLOBAL_CONTEXT_CONTEXT_MISSING]: `
      {contextName} is missing from Global Contexts. 
      Taxonomy documentation: {docsURL}/taxonomy/reference/global-contexts/{contextName}.
    `,
    [ErrorCode.GLOBAL_CONTEXT_CONTEXT_DUPLICATED]: `
      Only one {contextName} should be present in Global Contexts.
      Taxonomy documentation: {docsURL}/taxonomy/reference/global-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_MISSING]: `
      {contextName} is missing from Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_DUPLICATED]: `
      Only one {contextName} should be present in Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_WRONG_POSITION]: `
      {contextName} is in the wrong position of the Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
  },

  [TrackerPlatform.REACT_NATIVE]: {
    [ErrorCode.GLOBAL_CONTEXT_CONTEXT_MISSING]: `
      {contextName} is missing from Global Contexts. 
      Taxonomy documentation: {docsURL}/taxonomy/reference/global-contexts/{contextName}.
    `,
    [ErrorCode.GLOBAL_CONTEXT_CONTEXT_DUPLICATED]: `
      Only one {contextName} should be present in Global Contexts.
      Taxonomy documentation: {docsURL}/taxonomy/reference/global-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_MISSING]: `
      {contextName} is missing from Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_DUPLICATED]: `
      Only one {contextName} should be present in Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
    [ErrorCode.LOCATION_CONTEXT_WRONG_POSITION]: `
      {contextName} is in the wrong position of the Location Stack.
      Taxonomy documentation: {docsURL}/taxonomy/reference/location-contexts/{contextName}.
    `,
  },
};
