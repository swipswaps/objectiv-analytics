/*
 * Copyright 2022 Objectiv B.V.
 */

module.exports = {
  preset: 'react-native',
  reporters: ['jest-standard-reporter'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  moduleNameMapper: {
    '@objectiv/testing-tools': '<rootDir>../../core/testing-tools/src',
    '@objectiv/tracker-core': '<rootDir>../../core/tracker/src',
    '@objectiv/tracker-react': '<rootDir>../../trackers/react/src',
    '@objectiv/tracker-react-native': '<rootDir>../../trackers/react-native/src',
    '@objectiv/plugin-(.*)': '<rootDir>/../../plugins/$1/src',
    '@objectiv/queue-(.*)': '<rootDir>/../../queues/$1/src',
    '@objectiv/transport-(.*)': '<rootDir>/../../transports/$1/src',
  },
};
