/*
 * Copyright 2022 Objectiv B.V.
 */

it('should snapshot', () => {
  cy.log('first snapshot')
  cy.wrap({ foo: 42 }).snapshot()
  cy.log('second snapshot')
  cy.wrap({ bar: 101 }).snapshot()
})

it("should load the page", () => {
  cy.visit("/");
  cy.findAllByText(/learn react/i).should("have.length", 1);
});

it("should have triggered 4 events", () => {
  cy.visit("/");
  cy.findAllByText(/click me/i).click().click().click();
  cy.window().then((win) => {
    cy.wrap(win.objectiv.EventRecorder.events).snapshot();
  })
});
