import React from "react";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("renders with default progress", () => {
    render(<ProgressBar progress={50} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
  });

  it("renders with 0% progress", () => {
    render(<ProgressBar progress={0} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "0");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders with 100% progress", () => {
    render(<ProgressBar progress={100} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });

  it("clamps progress value between 0 and 100", () => {
    const { rerender } = render(<ProgressBar progress={150} />);
    const highProgressBar = screen.getByRole("progressbar");
    expect(highProgressBar).toHaveAttribute("aria-valuenow", "100");

    rerender(<ProgressBar progress={-50} />);
    expect(highProgressBar).toHaveAttribute("aria-valuenow", "0");
  });

  it("applies custom className when provided", () => {
    render(<ProgressBar progress={50} className="custom-progress" />);
    const container = screen.getByTestId("progress-container");
    expect(container).toHaveClass("custom-progress");
  });
});
