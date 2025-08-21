import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LeftColumnsGrid from "../src/components/columns/LeftColumnsGrid";

describe("LeftColumnsGrid skeleton", () => {
  it("renders headers and row", () => {
    render(<LeftColumnsGrid rows={[{ id: "1", title: "Тест", start: "2025-08-20", end: "2025-08-21" }]} />);
    expect(screen.getByTestId("col-header-task")).toBeTruthy();
    expect(screen.getByTestId("col-header-dates")).toBeTruthy();
    expect(screen.getByTestId("col-header-duration")).toBeTruthy();
    expect(screen.getByTestId("col-header-plus")).toBeTruthy();
    expect(screen.getByTestId("cell-plus").textContent).toBe("…");
  });
});
