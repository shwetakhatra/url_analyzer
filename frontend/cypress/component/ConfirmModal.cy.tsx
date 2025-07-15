import ConfirmModal from "../../src/components/ui/modal/ConfirmModal";
import { mount } from "cypress/react";

describe("ConfirmModal.cy", () => {
  it("renders with title and message", () => {
    mount(
      <ConfirmModal
        open={true}
        count={1}
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    cy.contains("Confirm").should("exist");
    cy.contains("Are you sure?").should("exist");
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = cy.stub().as("onConfirm");
    mount(
      <ConfirmModal
        open={true}
        count={1}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />,
    );
    cy.contains("Confirm")
      .parent()
      .find("button")
      .contains(/confirm|yes|ok/i)
      .click({ force: true });
    cy.get("@onConfirm").should("have.been.called");
  });
});
