const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'node', // Changed to 'node' for server-side API route tests (use 'jsdom' for client-side if needed elsewhere)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^next/link$': require.resolve('next/dist/client/link.js'),
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jose|openid-client)/)', // Added to transform NextAuth dependencies
  ],
};

module.exports = createJestConfig(customJestConfig);