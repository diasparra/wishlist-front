const card = (title: string) => cy.contains('[data-testid="wish-card"]', title)

describe('reserving a gift on someone else’s list', () => {
  beforeEach(() => {
    cy.resetDb()
  })

  it('lets me claim and release my own reservation', () => {
    cy.bootSession('alice', '/list/bob')
    cy.findByRole('heading', { name: "Bob's wishlist" }).should('be.visible')

    card('Wooden chess set')
      .findByRole('button', { name: "I'll get this" })
      .click()
    card('Wooden chess set').findByText('Reserved by you').should('be.visible')

    card('Wooden chess set').findByRole('button', { name: 'Release' }).click()
    card('Wooden chess set')
      .findByRole('button', { name: "I'll get this" })
      .should('be.visible')
  })

  it('shows another person’s claim and offers no release', () => {
    cy.bootSession('alice', '/list/bob')

    card('Noise cancelling headphones')
      .findByText('Reserved by Carol')
      .should('be.visible')
    card('Noise cancelling headphones')
      .findByRole('button', { name: 'Release' })
      .should('not.exist')
    card('Noise cancelling headphones')
      .findByRole('button', { name: "I'll get this" })
      .should('not.exist')
  })
})
