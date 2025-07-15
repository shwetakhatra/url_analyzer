/// <reference types="cypress" />

describe('Dashboard Happy Path', () => {
  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/auth/register',
      body: {
        email: 'user@example.com',
        password: 'Test@419Pass',
        name: 'Test User'
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 500 && response.body.errors?.email === "Email is already registered") {
        return;
      }
      if (response.status !== 201 && response.status !== 200) {
        throw new Error(`Registration failed: ${JSON.stringify(response.body)}`);
      }
    });
    cy.fixture('example.json').then((user) => {
      cy.request('POST', 'http://localhost:8080/auth/login', {
        email: user.email,
        password: user.password
      }).then((response) => {
        window.localStorage.setItem('token', response.body.token);
      });
    });
    cy.visit('/dashboard');
  });

  it('should display dashboard and table with records', () => {
    cy.contains('URL Analyzer');
    cy.get('table').should('exist');
    cy.get('thead').contains('Title');
    cy.get('tbody tr').should('have.length.at.least', 1);
  });

  it('should allow crawling a new URL', () => {
    const testUrl = 'https://gmail.com';
    cy.get('input[placeholder="Enter URL to crawl"]').clear().type(testUrl);
    cy.get('button[type="submit"]').click();
    cy.contains('URL submitted successfully!');
    cy.get('table').contains(testUrl);
  });

  it('should allow searching URLs', () => {
    cy.get('input[placeholder*="Search"]', { timeout: 10000 }).should('exist').type('gmail');
    cy.get('table').contains('gmail');
  });

  it('should navigate to detail view and display URL details when row is clicked', () => {
    cy.get('table tbody tr').first().find('td.p-3.align-top').eq(0).click({ force: true });
    cy.url().should('match', /\/detail\/[\w-]+/);
    cy.contains(/url details|detail view/i).should('exist');
    cy.get('[data-testid="detail-title"], h3').should('exist');
  });

  it('should allow selecting and bulk deleting URLs', () => {
    cy.wait(1000);
    cy.get('input[type="checkbox"]').first().check();
    cy.get('select#bulk-action').select('delete');
    cy.get('button.bg-red-600').contains('Delete').should('be.visible').click();
    cy.contains('Selected URLs deleted successfully!', { timeout: 10000 });
  });
});
