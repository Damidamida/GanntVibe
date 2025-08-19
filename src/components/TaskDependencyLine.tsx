import React, { useMemo } from 'react';
import { Task, TaskDependency } from '../types/gantt';

interface Props {
  dependency: TaskDependency;
  fromTask: Task;
  toTask: Task;
  projectStartDate: Date;
  dayWidth: number;
  fromIndex: number;
  toIndex: number;
  rowHeight: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

// Локальные «целые» дни — как в TaskBar, чтобы не было расхождений по пикселям
const toLocalStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const diffDaysLocal = (a: Date, b: Date) =>
  Math.round((toLocalStart(a).getTime() - toLocalStart(b).getTime()) / (24 * 60 * 60 * 1000));

export const TaskDependencyLine: React.FC<Props> = ({
  dependency,
  fromTask,
  toTask,
  projectStartDate,
  dayWidth,
  fromIndex,
  toIndex,
  rowHeight,
  selected,
  onSelect,
}) => {
  const points = useMemo(() => {
    const yFrom = fromIndex * rowHeight + rowHeight / 2;
    const yTo = toIndex * rowHeight + rowHeight / 2;

    // Координаты по той же формуле, что и бар
    const fromLeft = Math.round(diffDaysLocal(fromTask.startDate, projectStartDate) * dayWidth);
    const fromWidth = Math.round((diffDaysLocal(fromTask.endDate, fromTask.startDate) + 1) * dayWidth);
    const xFromRight = fromLeft + fromWidth;

    const xToLeft = Math.round(diffDaysLocal(toTask.startDate, projectStartDate) * dayWidth);

    const gap = 6; // небольшой вынос вправо от бара, как было визуально
    const x1 = xFromRight;
    const x2 = x1 + gap;
    const yMid = yTo;
    const x4 = xToLeft;

    return { x1, x2, x4, yFrom, yMid, yTo };
  }, [fromTask.startDate, fromTask.endDate, toTask.startDate, projectStartDate, dayWidth, fromIndex, toIndex, rowHeight]);

  const color = selected ? '#0ea5e9' : '#94a3b8';
  const strokeW = selected ? 2.5 : 1.5;

  const handleClick: React.MouseEventHandler<SVGPathElement | SVGLineElement> = (e) => {
    e.stopPropagation();
    onSelect && onSelect(dependency.id);
  };

  return (
    <svg className="absolute left-0 top-0 pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible', zIndex: 5 }}>
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>

      <line x1={points.x1} y1={points.yFrom} x2={points.x2} y2={points.yFrom} stroke={color} strokeWidth={strokeW} className="pointer-events-auto" onClick={handleClick} />
      <line x1={points.x2} y1={points.yFrom} x2={points.x2} y2={points.yMid} stroke={color} strokeWidth={strokeW} className="pointer-events-auto" onClick={handleClick} />
      <line x1={points.x2} y1={points.yTo} x2={points.x4} y2={points.yTo} stroke={color} strokeWidth={strokeW} markerEnd="url(#arrow)" className="pointer-events-auto" onClick={handleClick} />
    </svg>
  );
};

export default TaskDependencyLine;
