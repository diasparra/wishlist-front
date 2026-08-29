const card = (title: string) => cy.contains('[data-testid="wish-card"]', title)

describe('the surprise stays hidden from the owner', () => {
  beforeEach(() => {
    cy.resetDb()
  })

  it('an owner never sees a claim made on their own list', () => {
    // Alice claims one of Bob's wishes.
    cy.bootSession('alice', '/list/bob')
    card('Wooden chess set')
      .findByRole('button', { name: "I'll get this" })
      .click()
    card('Wooden chess set').findByText('Reserved by you').should('be.visible')

    // Bob opens his own list — no claim is visible, not even Carol's existing one.
    cy.bootSession('bob', '/list/bob')
    card('Wooden chess set').should('be.visible')
    card('Noise cancelling headphones').should('be.visible')
    cy.contains(/reserved/i).should('not.exist')
  })
})
