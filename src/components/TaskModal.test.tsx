import { render, screen, fireEvent, waitFor } from "../tests/test-utils";
import TaskModal from "./TaskModal";
import { Task, TaskStatus, TaskPriority } from "@/app/projects/[id]/types";

describe("TaskModal", () => {
  const mockTask: Task = {
    id: "test-task-1",
    title: "Test Task",
    description: "Test Description",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    projectId: "test-project-1",
    checklistItems: [],
    plannedDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    projectId: "test-project-1",
    onSave: jest.fn(),
  };

  it("renders correctly with new task form", () => {
    render(<TaskModal {...defaultProps} />);

    expect(screen.getByText("New Task")).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
  });

  it("renders correctly with existing task", () => {
    render(<TaskModal {...defaultProps} task={mockTask} />);

    expect(screen.getByText("Edit Task")).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockTask.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockTask.description)).toBeInTheDocument();
  });

  it("handles form submission correctly", async () => {
    const onSave = jest.fn();
    render(<TaskModal {...defaultProps} onSave={onSave} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const saveButton = screen.getByText(/save/i);

    fireEvent.change(titleInput, { target: { value: "New Test Task" } });
    fireEvent.change(descriptionInput, {
      target: { value: "New Description" },
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Test Task",
          description: "New Description",
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
        })
      );
    });
  });

  it("validates required fields", () => {
    render(<TaskModal {...defaultProps} />);

    const saveButton = screen.getByText(/save/i);
    expect(saveButton).toBeDisabled();

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: "New Test Task" } });
    expect(saveButton).not.toBeDisabled();
  });

  it("calls onClose when cancel button is clicked", () => {
    const onClose = jest.fn();
    render(<TaskModal {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });
});
