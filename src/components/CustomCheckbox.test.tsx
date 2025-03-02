import { render, screen, fireEvent } from "@testing-library/react";
import CustomCheckbox from "./CustomCheckbox";

describe("CustomCheckbox", () => {
  const defaultProps = {
    checked: false,
    onChange: jest.fn(),
  };

  it("renders unchecked by default", () => {
    render(<CustomCheckbox {...defaultProps} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("renders checked when checked prop is true", () => {
    render(<CustomCheckbox {...defaultProps} checked={true} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("calls onChange handler when clicked", () => {
    const onChange = jest.fn();
    render(<CustomCheckbox {...defaultProps} onChange={onChange} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("applies custom className when provided", () => {
    render(<CustomCheckbox {...defaultProps} className="custom-class" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("custom-class");
  });
});
