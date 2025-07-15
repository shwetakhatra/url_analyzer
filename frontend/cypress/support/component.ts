import { mount } from 'cypress/react';

// Extend Cypress' Chainable interface to include the 'mount' command
declare global {
  namespace Cypress {
	interface Chainable {
	  mount: typeof mount;
	}
  }
}

// Add the mount command for component testing
Cypress.Commands.add('mount', mount);

// Optionally import global styles or setup code here
// import '../../src/index.css';
