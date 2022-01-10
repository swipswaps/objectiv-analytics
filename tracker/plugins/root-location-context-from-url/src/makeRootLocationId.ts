/*
 * Copyright 2021-2022 Objectiv B.V.
 */

/**
 * This function is invoked by the Plugin to retrieve the identifier of the RootLocationContext unless a custom one
 * has been specified.
 */
export const makeRootLocationId = () => {
  const pathname = location.pathname;

  return ['/', ''].includes(pathname) ? 'home' : pathname?.split('/')[1].trim().toLowerCase();
}
