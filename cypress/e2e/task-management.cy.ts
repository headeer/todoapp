describe("Task Management", () => {
  beforeEach(() => {
    // Create a project and navigate to it before each test
    cy.visit("/");
    cy.contains("button", "Create Project").click();
    cy.get('input[placeholder*="project name"]').type("Test Project");
    cy.get('textarea[placeholder*="project description"]').type(
      "Test Description"
    );
    cy.contains("button", "Create Project").click();
    cy.contains("Test Project").click();
  });

  it("should create a new task", () => {
    cy.contains("button", "Create Task").click();
    cy.get('input[placeholder*="task title"]').type("Test Task");
    cy.get('textarea[placeholder*="task description"]').type(
      "Task Description"
    );

    // Add a checklist item
    cy.contains("button", "Add Checklist Item").click();
    cy.get('input[placeholder*="checklist item"]').type("Checklist Item 1");

    cy.contains("button", "Create Task").click();

    cy.contains("Test Task").should("be.visible");
    cy.contains("Task Description").should("be.visible");
    cy.contains("Checklist Item 1").should("be.visible");
  });

  it("should edit a task", () => {
    // Create a task first
    cy.contains("button", "Create Task").click();
    cy.get('input[placeholder*="task title"]').type("Task to Edit");
    cy.get('textarea[placeholder*="task description"]').type(
      "Original Task Description"
    );
    cy.contains("button", "Create Task").click();

    // Edit the task
    cy.contains("Task to Edit").click();
    cy.get('input[placeholder*="task title"]').clear().type("Edited Task");
    cy.get('textarea[placeholder*="task description"]')
      .clear()
      .type("Updated Task Description");
    cy.contains("button", "Save Changes").click();

    cy.contains("Edited Task").should("be.visible");
    cy.contains("Updated Task Description").should("be.visible");
  });

  it("should delete a task", () => {
    // Create a task first
    cy.contains("button", "Create Task").click();
    cy.get('input[placeholder*="task title"]').type("Task to Delete");
    cy.get('textarea[placeholder*="task description"]').type("To be deleted");
    cy.contains("button", "Create Task").click();

    // Delete the task
    cy.contains("Task to Delete").click();
    cy.get('[title="Delete task"]').click();
    cy.on("window:confirm", () => true);

    cy.contains("Task to Delete").should("not.exist");
  });

  it("should manage checklist items", () => {
    // Create a task with checklist items
    cy.contains("button", "Create Task").click();
    cy.get('input[placeholder*="task title"]').type("Checklist Task");

    // Add multiple checklist items
    cy.contains("button", "Add Checklist Item").click();
    cy.get('input[placeholder*="checklist item"]').first().type("Item 1");
    cy.contains("button", "Add Checklist Item").click();
    cy.get('input[placeholder*="checklist item"]').last().type("Item 2");

    cy.contains("button", "Create Task").click();

    // Open task and verify checklist items
    cy.contains("Checklist Task").click();
    cy.contains("Item 1").should("be.visible");
    cy.contains("Item 2").should("be.visible");

    // Toggle checklist items
    cy.get('input[type="checkbox"]').first().check();
    cy.get('input[type="checkbox"]').first().should("be.checked");

    // Delete a checklist item
    cy.get('[title="Delete checklist item"]').first().click();
    cy.contains("Item 1").should("not.exist");
  });
});
