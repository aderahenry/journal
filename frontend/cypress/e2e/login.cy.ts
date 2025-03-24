describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.get('input[name="email"]').should('have.class', 'Mui-error');
    cy.get('input[name="password"]').should('have.class', 'Mui-error');
  });

  it('should successfully login with valid credentials', () => {
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Should show dashboard content
    cy.get('h1').should('contain', 'Dashboard');
  });

  it('should show error message for invalid credentials', () => {
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.get('.MuiAlert-root').should('exist');
    cy.get('.MuiAlert-root').should('contain', 'Invalid credentials');
  });
}); 