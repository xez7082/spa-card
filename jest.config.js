export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  moduleNameMapper: {
    '^https://unpkg\\.com/lit-element@.*$': '<rootDir>/tests/__mocks__/lit-element.js',
  },
};
