/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Re-seed json-server from the deterministic fixture. */
      resetDb(): Chainable<void>
      /**
       * Visit the app already unlocked and identified as `memberId`, optionally
       * at a specific hash route (e.g. `/list/bob`).
       */
      bootSession(memberId: string, path?: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('resetDb', () => {
  cy.task('db:reset')
  // json-server --watch needs a beat to reload the file.
  cy.wait(400)
})

Cypress.Commands.add('bootSession', (memberId: string, path = '/') => {
  // The cache-busting query keeps every call a distinct URL so Cypress does a
  // full reload (and re-runs onBeforeLoad) even when only the hash route differs
  // from the previous visit — e.g. switching identity on the same list.
  cy.visit(`/?_boot=${Date.now()}#${path}`, {
    onBeforeLoad(win) {
      win.localStorage.setItem('wishlist.unlocked', '1')
      win.localStorage.setItem('wishlist.memberId', memberId)
    },
  })
})

export {}
