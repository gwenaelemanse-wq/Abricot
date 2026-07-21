/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Chemin vers ton app Next.js pour charger next.config.js et .env
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/Jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}

// createJestConfig est exporté de cette façon pour que next/jest puisse
// charger la config Next.js de façon asynchrone
module.exports = createJestConfig(customJestConfig)