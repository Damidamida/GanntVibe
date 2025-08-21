export type ColumnId = "task" | "dates" | "duration" | "plus";
export interface ColumnDef {
  id: ColumnId;
  title: string;
  minPx: number;
  resizable: boolean;
  fixedPx?: number;
  fixedPosition?: "first" | "last";
  visible: boolean;
  order: number;
}
export interface ColumnsState {
  order: ColumnId[];
  widthsPercent: Record<ColumnId, number>;
}
export const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: "task", title: "Задача", minPx: 50, resizable: true, fixedPosition: "first", visible: true, order: 0 },
  { id: "dates", title: "Даты", minPx: 50, resizable: true, visible: true, order: 1 },
  { id: "duration", title: "Длительность", minPx: 50, resizable: true, visible: true, order: 2 },
  { id: "plus", title: "+", minPx: 50, resizable: false, fixedPx: 50, fixedPosition: "last", visible: true, order: 3 },
];
