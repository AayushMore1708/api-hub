const nextJest = require('next/jest');

// Create Next.js-aware Jest config
const createJestConfig = nextJest({
  dir: './', // Path to your Next.js app
});

const customJestConfig = {
  // 🧠 Test environment:
  // "jsdom" = browser-like (for React components)
  // "node" = for API routes / backend logic
  testEnvironment: 'node',

  // 🧩 Load setup file
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // 🧩 Polyfills that must load before all else (ensures TextEncoder etc.)
  setupFiles: ['<rootDir>/jest.polyfill.js'],

  // 🧩 Ignore build and dependencies
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],

  // 🧩 Fixes CSS module imports in Next.js
  moduleNameMapper: {
    '^next/link$': require.resolve('next/dist/client/link.js'),
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  },

  // ⏱️ Increase timeout for slow APIs (Gemini, DB, etc.)
  testTimeout: 60000,
};

module.exports = createJestConfig(customJestConfig);
