const card = (title: string) => cy.contains('[data-testid="wish-card"]', title)

describe('my own list', () => {
  beforeEach(() => {
    cy.resetDb()
  })

  it('adds, edits and deletes a wish and never shows reservation info', () => {
    cy.bootSession('alice', '/list/alice')
    cy.findByRole('heading', { name: "Alice's wishlist" }).should('be.visible')

    cy.findByLabelText('Title').type('Board game')
    cy.findByLabelText('Link').type('https://example.com/game')
    cy.findByRole('button', { name: 'Save' }).click()
    cy.findByRole('heading', { name: 'Board game' }).should('be.visible')

    card('Board game').findByRole('button', { name: 'Edit' }).click()
    cy.findByLabelText('Title').clear().type('Big board game')
    cy.findByRole('button', { name: 'Save' }).click()
    cy.findByRole('heading', { name: 'Big board game' }).should('be.visible')

    card('Big board game').findByRole('button', { name: 'Delete' }).click()
    cy.findByRole('heading', { name: 'Big board game' }).should('not.exist')

    cy.contains(/reserved/i).should('not.exist')
  })
})
