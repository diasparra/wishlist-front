// Runs against a read-only `vite preview` build (see `npm run e2e:demo`),
// not the json-server dev stack the other specs use.

describe('read-only GitHub Pages demo', () => {
  it('skips the gate, shows the banner, and exposes no write controls', () => {
    cy.visit('/')

    // No password gate.
    cy.findByLabelText('Family password').should('not.exist')
    cy.contains(/read-only demo/i).should('be.visible')

    // Pick the first family member.
    cy.contains('h5', 'Who are you?')
      .parents('.MuiCard-root')
      .find('button')
      .first()
      .click()

    // Overview, then open the viewer's own list.
    cy.findByRole('heading', { name: 'Family wishlist' }).should('be.visible')
    cy.contains('a', 'Edit my list').click()

    // Own list in read-only mode: no add form, no edit/delete, banner persists.
    cy.contains('Add a wish').should('not.exist')
    cy.get('[aria-label="Edit"]').should('not.exist')
    cy.get('[aria-label="Delete"]').should('not.exist')
    cy.contains(/read-only demo/i).should('be.visible')
  })
})
