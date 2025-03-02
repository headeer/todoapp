import { render, screen } from "@testing-library/react";
import StatusIcon from "./StatusIcon";
import { TaskStatus } from "@/app/projects/[id]/types";

describe("StatusIcon", () => {
  it("renders TODO status icon correctly", () => {
    render(<StatusIcon status={TaskStatus.TODO} />);
    const icon = screen.getByTestId("status-icon");
    expect(icon).toHaveClass("text-gray-400");
  });

  it("renders IN_PROGRESS status icon correctly", () => {
    render(<StatusIcon status={TaskStatus.IN_PROGRESS} />);
    const icon = screen.getByTestId("status-icon");
    expect(icon).toHaveClass("text-blue-500");
  });

  it("renders DONE status icon correctly", () => {
    render(<StatusIcon status={TaskStatus.DONE} />);
    const icon = screen.getByTestId("status-icon");
    expect(icon).toHaveClass("text-green-500");
  });

  it("applies custom size class when provided", () => {
    render(<StatusIcon status={TaskStatus.TODO} size="lg" />);
    const icon = screen.getByTestId("status-icon");
    expect(icon).toHaveClass("w-6", "h-6");
  });

  it("applies custom className when provided", () => {
    render(<StatusIcon status={TaskStatus.TODO} className="custom-icon" />);
    const icon = screen.getByTestId("status-icon");
    expect(icon).toHaveClass("custom-icon");
  });
});
