import { render, screen } from "@testing-library/react";
import Loader from "./Loader";

describe("Loader", () => {
  it("renders the loader with default size", () => {
    render(<Loader />);
    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveClass("w-8", "h-8");
  });

  it("renders the loader with custom size", () => {
    render(<Loader size="lg" />);
    const loader = screen.getByRole("status");
    expect(loader).toHaveClass("w-12", "h-12");
  });

  it("renders with custom className", () => {
    render(<Loader className="custom-loader" />);
    const loader = screen.getByRole("status");
    expect(loader).toHaveClass("custom-loader");
  });

  it("renders with accessible label", () => {
    render(<Loader />);
    const loader = screen.getByRole("status");
    expect(loader).toHaveAttribute("aria-label", "Loading");
  });
});
