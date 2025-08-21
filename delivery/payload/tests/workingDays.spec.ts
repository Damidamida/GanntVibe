import { describe, it, expect } from "vitest";
import { workingDaysBetween } from "../src/utils/workingDays";

describe("workingDaysBetween", () => {
  it("20.08.25–21.08.25 => 2", () => {
    const res = workingDaysBetween(new Date("2025-08-20"), new Date("2025-08-21"), new Set());
    expect(res).toBe(2);
  });
  it("22.08.25–26.08.25 => 3", () => {
    const res = workingDaysBetween(new Date("2025-08-22"), new Date("2025-08-26"), new Set());
    expect(res).toBe(3);
  });
  it("учитывает праздники", () => {
    const holidays = new Set(["2025-08-20"]);
    const res = workingDaysBetween(new Date("2025-08-20"), new Date("2025-08-21"), holidays);
    expect(res).toBe(1);
  });
  it("start>end => 0", () => {
    const res = workingDaysBetween(new Date("2025-08-22"), new Date("2025-08-20"), new Set());
    expect(res).toBe(0);
  });
});
