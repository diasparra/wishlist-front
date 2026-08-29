describe('family password gate', () => {
  beforeEach(() => {
    cy.resetDb()
  })

  it('blocks until the right password is entered, then remembers it', () => {
    cy.visit('/')

    cy.findByLabelText('Family password').type('nope')
    cy.findByRole('button', { name: 'Unlock' }).click()
    cy.findByText('Wrong password').should('be.visible')

    cy.findByLabelText('Family password')
      .clear()
      .type(Cypress.env('familyPassword'))
    cy.findByRole('button', { name: 'Unlock' }).click()

    cy.findByRole('heading', { name: 'Who are you?' }).should('be.visible')

    cy.reload()
    cy.findByRole('heading', { name: 'Who are you?' }).should('be.visible')
  })

  it('locks back to the gate', () => {
    cy.bootSession('alice')
    cy.findByRole('button', { name: 'Lock' }).click()
    cy.findByLabelText('Family password').should('be.visible')
  })
})
