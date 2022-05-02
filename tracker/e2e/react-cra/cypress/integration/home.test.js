/*
 * Copyright 2022 Objectiv B.V.
 */

it("should track the expected events", () => {
  // Visit home page
  cy.visit("/");

  // Find tracked button and click it three times
  cy.findAllByText(/click me/i).click().click().click();

  // Test against snapshot
  cy.window().its('objectiv.EventRecorder.events').snapshot();
});
