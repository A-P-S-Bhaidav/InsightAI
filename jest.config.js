const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/tests/e2e/', '<rootDir>/src/__tests__/__mocks__/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^cheerio$': '<rootDir>/src/__tests__/__mocks__/cheerio.js'
  },
  transformIgnorePatterns: ['/node_modules/(?!(cheerio|parse5|parse5-htmlparser2-tree-adapter)/)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/layout.tsx',
  ],
};

module.exports = createJestConfig(customJestConfig);
