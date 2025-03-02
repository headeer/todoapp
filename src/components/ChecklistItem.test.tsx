import { render, screen, fireEvent } from "@testing-library/react";
import ChecklistItem from "./ChecklistItem";
import { ChecklistItem as ChecklistItemType } from "@/app/projects/[id]/types";

describe("ChecklistItem", () => {
  const mockItem: ChecklistItemType = {
    id: "test-item-1",
    title: "Test Item",
    text: "Test Item",
    completed: false,
    taskId: "test-task-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultProps = {
    item: mockItem,
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
  };

  it("renders correctly in view mode", () => {
    render(<ChecklistItem {...defaultProps} />);

    expect(screen.getByText(mockItem.title)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("enters edit mode on text click", () => {
    render(<ChecklistItem {...defaultProps} />);

    const textElement = screen.getByText(mockItem.title);
    fireEvent.click(textElement);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(mockItem.title);
  });

  it("handles checkbox toggle", () => {
    const onUpdate = jest.fn();
    render(<ChecklistItem {...defaultProps} onUpdate={onUpdate} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(onUpdate).toHaveBeenCalledWith({
      ...mockItem,
      completed: true,
    });
  });

  it("handles text update", () => {
    const onUpdate = jest.fn();
    render(<ChecklistItem {...defaultProps} onUpdate={onUpdate} />);

    // Enter edit mode
    const textElement = screen.getByText(mockItem.title);
    fireEvent.click(textElement);

    // Update text
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Updated Item" } });
    fireEvent.blur(input);

    expect(onUpdate).toHaveBeenCalledWith({
      ...mockItem,
      title: "Updated Item",
      text: "Updated Item",
    });
  });

  it("handles delete button click", () => {
    const onDelete = jest.fn();
    render(<ChecklistItem {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByRole("button", {
      name: /delete item/i,
    });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockItem.id);
  });

  it("handles enter key press in edit mode", () => {
    const onUpdate = jest.fn();
    render(<ChecklistItem {...defaultProps} onUpdate={onUpdate} />);

    // Enter edit mode
    const textElement = screen.getByText(mockItem.title);
    fireEvent.click(textElement);

    // Update text and press enter
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Updated Item" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledWith({
      ...mockItem,
      title: "Updated Item",
      text: "Updated Item",
    });

    // Should exit edit mode
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("handles escape key press in edit mode", () => {
    render(<ChecklistItem {...defaultProps} />);

    // Enter edit mode
    const textElement = screen.getByText(mockItem.title);
    fireEvent.click(textElement);

    // Update text and press escape
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Updated Item" } });
    fireEvent.keyDown(input, { key: "Escape" });

    // Should exit edit mode and revert changes
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText(mockItem.title)).toBeInTheDocument();
  });
});
