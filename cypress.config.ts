import { defineConfig } from 'cypress'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    video: false,
    setupNodeEvents(on) {
      on('task', {
        'db:reset'() {
          copyFileSync(
            resolve('cypress/fixtures/seed.json'),
            resolve('db.json'),
          )
          return null
        },
      })
    },
  },
  env: {
    familyPassword: 'family',
  },
})
