import { render, screen, fireEvent } from "@testing-library/react";
import ChecklistSection from "./ChecklistSection";
import { ChecklistItem } from "@/app/projects/[id]/types";

describe("ChecklistSection", () => {
  const mockItems: ChecklistItem[] = [
    {
      id: "item-1",
      title: "First Item",
      text: "First Item",
      completed: false,
      taskId: "test-task-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "item-2",
      title: "Second Item",
      text: "Second Item",
      completed: true,
      taskId: "test-task-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const defaultProps = {
    items: mockItems,
    taskId: "test-task-1",
    onUpdate: jest.fn(),
  };

  it("renders checklist items correctly", () => {
    render(<ChecklistSection {...defaultProps} />);

    expect(screen.getByText("First Item")).toBeInTheDocument();
    expect(screen.getByText("Second Item")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Add new item...")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("adds a new checklist item", () => {
    const onUpdate = jest.fn();
    render(<ChecklistSection {...defaultProps} onUpdate={onUpdate} />);

    const input = screen.getByPlaceholderText("Add new item...");
    const addButton = screen.getByText("Add");

    fireEvent.change(input, { target: { value: "New Item" } });
    fireEvent.click(addButton);

    // Verify that onUpdate was called with a new item added
    expect(onUpdate).toHaveBeenCalledWith([
      ...mockItems,
      expect.objectContaining({
        title: "New Item",
        text: "New Item",
        completed: false,
        taskId: "test-task-1",
      }),
    ]);
  });

  it("updates an existing checklist item", () => {
    const onUpdate = jest.fn();
    render(<ChecklistSection {...defaultProps} onUpdate={onUpdate} />);

    // Click on the first item to edit it
    const firstItem = screen.getByText("First Item");
    fireEvent.click(firstItem);

    // Find the input and update it
    const input = screen.getAllByRole("textbox")[0];
    fireEvent.change(input, { target: { value: "Updated First Item" } });
    fireEvent.blur(input);

    // Verify that onUpdate was called with the updated item
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "item-1",
          title: "Updated First Item",
          text: "Updated First Item",
        }),
        mockItems[1],
      ])
    );
  });

  it("deletes a checklist item", () => {
    const onUpdate = jest.fn();
    render(<ChecklistSection {...defaultProps} onUpdate={onUpdate} />);

    // Find and click the delete button for the first item
    const deleteButton = screen.getAllByRole("button", {
      name: /delete item/i,
    })[0];
    fireEvent.click(deleteButton);

    // Verify that onUpdate was called with the item removed
    expect(onUpdate).toHaveBeenCalledWith([mockItems[1]]);
  });

  it("toggles item completion", () => {
    const onUpdate = jest.fn();
    render(<ChecklistSection {...defaultProps} onUpdate={onUpdate} />);

    // Find and click the checkbox for the first item
    const checkbox = screen.getAllByRole("checkbox")[0];
    fireEvent.click(checkbox);

    // Verify that onUpdate was called with the item's completed status toggled
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "item-1",
          completed: true,
        }),
        mockItems[1],
      ])
    );
  });

  it("adds item on Enter key press", () => {
    const onUpdate = jest.fn();
    render(<ChecklistSection {...defaultProps} onUpdate={onUpdate} />);

    const input = screen.getByPlaceholderText("Add new item...");
    fireEvent.change(input, { target: { value: "New Item" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledWith([
      ...mockItems,
      expect.objectContaining({
        title: "New Item",
        text: "New Item",
        completed: false,
        taskId: "test-task-1",
      }),
    ]);
  });

  it("handles empty items array", () => {
    render(
      <ChecklistSection items={[]} taskId="test-task-1" onUpdate={jest.fn()} />
    );

    expect(screen.getByText("Checklist")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Add new item...")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeDisabled();
  });
});
