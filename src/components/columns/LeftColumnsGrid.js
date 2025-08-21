import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { DEFAULT_COLUMNS } from "./registry";
import { formatDateRangeDDMMYY } from "../../utils/dateFormatAddons";
import { workingDaysBetween } from "../../utils/workingDays";
import { HOLIDAYS_2025 } from "../../config/holidays";
const holidaysSet = new Set(HOLIDAYS_2025);
function computeDuration(start, end) {
    const s = typeof start === "string" ? new Date(start) : start;
    const e = typeof end === "string" ? new Date(end) : end;
    return workingDaysBetween(s, e, holidaysSet);
}
export default function LeftColumnsGrid(props) {
    const columns = DEFAULT_COLUMNS;
    const flexible = columns.filter(c => !c.fixedPx);
    const per = flexible.length > 0 ? (100 / flexible.length) : 100;
    const gridTemplate = columns.map(c => c.fixedPx ? `${c.fixedPx}px` : `${per}%`).join(" ");
    return (_jsxs("div", { "data-testid": "left-grid", style: { display: "grid", gridTemplateColumns: gridTemplate, gap: "0 8px" }, children: [columns.map(c => (_jsx("div", { "data-testid": `col-header-${c.id}`, style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 600 }, title: c.title, children: c.title }, c.id))), props.rows.map(row => (_jsxs(React.Fragment, { children: [_jsx("div", { "data-testid": "cell-task", style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, title: row.title, children: row.title }), _jsx("div", { "data-testid": "cell-dates", children: formatDateRangeDDMMYY(row.start, row.end) }), _jsx("div", { "data-testid": "cell-duration", children: computeDuration(row.start, row.end) }), _jsx("div", { "data-testid": "cell-plus", style: { textAlign: "center" }, children: "\u2026" })] }, row.id)))] }));
}
