/*
 * Copyright 2021-2022 Objectiv B.V.
 */

/**
 * Helper function to determine if we are in development mode.
 * Determines whether Node environment is development and if we are in a browser by checking the window object.
 */
export const isDevMode = () => process.env.NODE_ENV?.startsWith('dev') && typeof window !== 'undefined';
