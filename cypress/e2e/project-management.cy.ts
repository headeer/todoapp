describe("Project Management", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should create a new project", () => {
    cy.contains("button", "Create Project").click();
    cy.get('input[placeholder*="project name"]').type("Test Project");
    cy.get('textarea[placeholder*="project description"]').type(
      "Test Description"
    );
    cy.contains("button", "Create Project").click();

    cy.contains("Test Project").should("be.visible");
    cy.contains("Test Description").should("be.visible");
  });

  it("should edit a project", () => {
    // Create a project first
    cy.contains("button", "Create Project").click();
    cy.get('input[placeholder*="project name"]').type("Project to Edit");
    cy.get('textarea[placeholder*="project description"]').type(
      "Original Description"
    );
    cy.contains("button", "Create Project").click();

    // Edit the project
    cy.get('[title="Edit project"]').first().click();
    cy.get('input[placeholder*="project name"]').clear().type("Edited Project");
    cy.get('textarea[placeholder*="project description"]')
      .clear()
      .type("Updated Description");
    cy.contains("button", "Save Changes").click();

    cy.contains("Edited Project").should("be.visible");
    cy.contains("Updated Description").should("be.visible");
  });

  it("should delete a project", () => {
    // Create a project first
    cy.contains("button", "Create Project").click();
    cy.get('input[placeholder*="project name"]').type("Project to Delete");
    cy.get('textarea[placeholder*="project description"]').type(
      "To be deleted"
    );
    cy.contains("button", "Create Project").click();

    // Delete the project
    cy.get('[title="Delete project"]').first().click();
    cy.on("window:confirm", () => true);

    cy.contains("Project to Delete").should("not.exist");
  });

  it("should navigate to project details", () => {
    // Create a project first
    cy.contains("button", "Create Project").click();
    cy.get('input[placeholder*="project name"]').type("Project Details Test");
    cy.get('textarea[placeholder*="project description"]').type(
      "Testing navigation"
    );
    cy.contains("button", "Create Project").click();

    // Click on the project card
    cy.contains("Project Details Test").click();

    // Verify we're on the project details page
    cy.url().should("include", "/projects/");
    cy.contains("h1", "Project Details Test").should("be.visible");
    cy.contains("Testing navigation").should("be.visible");
  });
});
