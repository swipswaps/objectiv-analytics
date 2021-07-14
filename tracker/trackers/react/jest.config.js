module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  reporters: ['jest-standard-reporter'],
  collectCoverageFrom: ['src/**.{ts,tsx}'],
  setupFiles: ['jest-useragent-mock'],
  moduleNameMapper: {
    '@objectiv/plugin-(.*)': '<rootDir>/../../plugins/$1/src',
    '@objectiv/tracker-core': '<rootDir>/../../core/tracker/src',
    '@objectiv/tracker-web': '<rootDir>/../../trackers/web/src',
  },
  modulePathIgnorePatterns: ['e2e'],
};
