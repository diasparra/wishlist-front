describe('choosing who you are', () => {
  beforeEach(() => {
    cy.resetDb()
  })

  it('lists every member and lands on the overview', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('wishlist.unlocked', '1')
      },
    })

    cy.findByRole('heading', { name: 'Who are you?' })
    cy.findByRole('button', { name: 'Bob' })
    cy.findByRole('button', { name: 'Carol' })
    cy.findByRole('button', { name: 'Alice' }).click()

    cy.findByRole('heading', { name: 'Family wishlist' }).should('be.visible')
    cy.contains('Alice (you)').should('be.visible')
    cy.contains('Bob').should('be.visible')
    cy.contains('Carol').should('be.visible')
  })

  it('can switch person from the overview', () => {
    cy.bootSession('alice')
    cy.findByRole('button', { name: 'Switch person' }).click()
    cy.findByRole('heading', { name: 'Who are you?' }).should('be.visible')
  })
})
