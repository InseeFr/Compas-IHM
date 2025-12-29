describe("Header", () => {
    beforeEach(() => {
        cy.viewport(1280, 800);
        cy.visit(Cypress.config().baseUrl);
    });

    it("affiche le header", () => {
        cy.getCy("header").should("be.visible");
        cy.getCy("header-logo").should("be.visible");
        cy.getCy("header-title").should("contain.text", "COMPAS");
    });

    it("redirige vers la home au clic sur COMPAS", () => {
        cy.getCy("header-title").click();
        cy.location("href").should("eq", Cypress.config().baseUrl + "/");
    });

    it("ouvre un menu déroulant de la NavBar (DEVOPS indicateur)", () => {
        cy.getCy("navbar-item-1").click();
        cy.getCy("navbar-subitem-1-2").should("be.visible").click();
        cy.location("href").should("eq", Cypress.config().baseUrl + "/indicateur/devopsTable");
    });

    it("le bouton dark mode est cliquable", () => {
        cy.getCy("toggle-darkmode").click();
    });
});
