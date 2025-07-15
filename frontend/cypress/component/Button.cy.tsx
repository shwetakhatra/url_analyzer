import { Button } from "../../src/components/ui/button/Button";
import { mount } from "cypress/react";

describe("Button.cy", () => {
  it("renders with correct class and text", () => {
    mount(<Button className="bg-red-600">Delete</Button>);
    cy.contains("Delete").should("exist").and("have.class", "bg-red-600");
    cy.contains("Delete").should("exist").and("have.class", "bg-red-600");
  });

  it("calls onClick when clicked", () => {
    const onClick = cy.stub().as("onClick");
    mount(<Button onClick={onClick}>Click Me</Button>);
    cy.contains("Click Me").click();
    cy.get("@onClick").should("have.been.calledOnce");
  });
});
