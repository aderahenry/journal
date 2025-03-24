// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Custom command to create a journal entry
Cypress.Commands.add('createEntry', (title: string, content: string, mood?: string) => {
  cy.visit('/entries/new');
  cy.get('input[name="title"]').type(title);
  cy.get('textarea[name="content"]').type(content);
  if (mood) {
    cy.get('select[name="mood"]').select(mood);
  }
  cy.get('button[type="submit"]').click();
});

// Custom command to check if element is visible and contains text
Cypress.Commands.add('shouldBeVisibleAndContain', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).should('be.visible').and('contain', text);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createEntry(title: string, content: string, mood?: string): Chainable<void>;
      shouldBeVisibleAndContain(text: string): Chainable<void>;
    }
  }
} 