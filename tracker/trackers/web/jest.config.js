module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  reporters: ['jest-standard-reporter'],
  collectCoverageFrom: ['src/**.ts'],
  setupFiles: ['jest-useragent-mock'],
  moduleNameMapper: {
    '@objectiv/core': '../../../core/src',
    '@objectiv/plugin-(.*)': '../../../plugins/$1/src',
  },
};
