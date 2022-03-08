/*
 * Copyright 2021-2022 Objectiv B.V.
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  reporters: ['jest-standard-reporter'],
  collectCoverageFrom: ['src/**.ts'],
  moduleNameMapper: {
    '@objectiv/testing-tools': '<rootDir>../../core/testing-tools/src',
    '@objectiv/tracker-core-react': '<rootDir>../../core/react/src',
    '@objectiv/tracker-react': '<rootDir>../../trackers/react/src',
  },
  setupFilesAfterEnv: ['jest-extended/all'],
};
