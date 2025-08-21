import React from "react";
import type { ColumnDef } from "./registry";
import { DEFAULT_COLUMNS } from "./registry";
import { formatDateRangeDDMMYY } from "../../utils/dateFormatAddons";
import { workingDaysBetween } from "../../utils/workingDays";
import { HOLIDAYS_2025 } from "../../config/holidays";

export interface TaskRow { id: string; title: string; start: Date | string; end: Date | string; }
export interface LeftColumnsGridProps { rows: TaskRow[]; }

const holidaysSet = new Set(HOLIDAYS_2025);
function computeDuration(start: Date | string, end: Date | string): number {
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  return workingDaysBetween(s, e, holidaysSet);
}

export default function LeftColumnsGrid(props: LeftColumnsGridProps) {
  const columns: ColumnDef[] = DEFAULT_COLUMNS;
  const flexible = columns.filter(c => !c.fixedPx);
  const per = flexible.length > 0 ? (100 / flexible.length) : 100;
  const gridTemplate = columns.map(c => c.fixedPx ? `${c.fixedPx}px` : `${per}%`).join(" ");
  return (
    <div data-testid="left-grid" style={{ display: "grid", gridTemplateColumns: gridTemplate, gap: "0 8px" }}>
      {columns.map(c => (
        <div key={c.id} data-testid={`col-header-${c.id}`} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 600 }} title={c.title}>
          {c.title}
        </div>
      ))}
      {props.rows.map(row => (
        <React.Fragment key={row.id}>
          <div data-testid="cell-task" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.title}>{row.title}</div>
          <div data-testid="cell-dates">{formatDateRangeDDMMYY(row.start, row.end)}</div>
          <div data-testid="cell-duration">{computeDuration(row.start, row.end)}</div>
          <div data-testid="cell-plus" style={{ textAlign: "center" }}>…</div>
        </React.Fragment>
      ))}
    </div>
  );
}
