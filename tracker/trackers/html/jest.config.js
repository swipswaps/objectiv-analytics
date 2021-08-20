module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  reporters: ['jest-standard-reporter'],
  collectCoverageFrom: ['src/**.ts'],
  moduleNameMapper: {
    '@objectiv/tracker-core': '<rootDir>/../../core/tracker/src',
    '@objectiv/tracker-web': '<rootDir>/../../trackers/web/src',
    '@objectiv/plugin-(.*)': '<rootDir>/../../plugins/$1/src',
  },
};
