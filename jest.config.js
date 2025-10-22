const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
 moduleNameMapper: {
  '^next/link$': require.resolve('next/dist/client/link.js'),
  '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
},
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
 

};

module.exports = createJestConfig(customJestConfig);
