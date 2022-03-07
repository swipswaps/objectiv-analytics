/*
 * Copyright 2022 Objectiv B.V.
 */

/**
 * Recursively walk navigation upwards to build a navigation path.
 */
export const makeNavigationPath = (navigation: any, navigationPath: string[] = []) => {
  const navigationState = navigation.getState();
  const parentNavigationState = navigation.getParent();

  if (navigationState) {
    const navigationName = navigationState.routes[navigationState.index].name;
    navigationPath.unshift(navigationName);
  }

  if (parentNavigationState) {
    makeNavigationPath(parentNavigationState, navigationPath);
  }

  return '/' + navigationPath.join('/');
};
