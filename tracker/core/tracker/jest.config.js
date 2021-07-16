module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  reporters: ['jest-standard-reporter'],
  collectCoverageFrom: ['src/**.ts'],
  moduleNameMapper: {
    '@objectiv/tracker-core': '<rootDir>../../core/tracker/src',
    '@objectiv/schema': '<rootDir>../../core/schema/src',
    '@objectiv/plugin-(.*)': '<rootDir>../../plugins/$1/src',
  },
};
