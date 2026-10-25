import nextJest from 'next/jest.js'

// Loads next.config.mjs and .env files for tests, like zandobank does
const createJestConfig = nextJest({ dir: './' })

export default createJestConfig({
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testMatch: ['<rootDir>/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/lib/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', '!**/*.d.ts']
})
