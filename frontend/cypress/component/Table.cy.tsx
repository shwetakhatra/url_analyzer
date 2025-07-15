import { Table } from '../../src/components/ui/table/Table';
import { mount } from 'cypress/react';

describe('Table.cy', () => {
  const columns = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Age', accessorKey: 'age' },
  ];
  const data = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
  ];

  it('renders table with data', () => {
    mount(<Table columns={columns} data={data} />);
    cy.contains('Alice').should('exist');
    cy.contains('Bob').should('exist');
    cy.contains('30').should('exist');
    cy.contains('25').should('exist');
  });

  it('renders empty state when no data', () => {
    mount(<Table columns={columns} data={[]} />);
    cy.contains(/no data|empty/i).should('exist');
  });
});
