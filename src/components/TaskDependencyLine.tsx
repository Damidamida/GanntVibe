import React from 'react';
import { Task, TaskDependency } from '../types/gantt';
import { differenceInDays } from '../utils/dateUtils';

interface Props {
  dependency: TaskDependency;
  fromTask: Task;
  toTask: Task;
  projectStartDate: Date;
  dayWidth: number;
  fromIndex: number;
  toIndex: number;
  rowHeight: number;
<<<<<<< HEAD
  headerOffset: number;
}

export const TaskDependencyLine: React.FC<Props> = ({
  dependency, fromTask, toTask, projectStartDate, dayWidth, fromIndex, toIndex, rowHeight, headerOffset
}) => {
  const fromX = differenceInDays(fromTask.endDate, projectStartDate) * dayWidth;
  const toX = differenceInDays(toTask.startDate, projectStartDate) * dayWidth;
  const y1 = headerOffset + fromIndex * rowHeight + rowHeight / 2;
  const y2 = headerOffset + toIndex * rowHeight + rowHeight / 2;

  const midX = (fromX + toX) / 2;
  const path = `M ${fromX} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${toX} ${y2}`;

  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
        </marker>
      </defs>
      <path d={path} fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
=======
  selected?: boolean;
  onSelect?: (id: string) => void;
}

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
  // Geometry
  const xFrom = (differenceInDays(fromTask.endDate, projectStartDate) + 1) * dayWidth;
  const xTo = differenceInDays(toTask.startDate, projectStartDate) * dayWidth;
  const yFrom = fromIndex * rowHeight + rowHeight / 2;
  const yTo = toIndex * rowHeight + rowHeight / 2;

  const H_GAP = 12;
  const L = xFrom + H_GAP;
  const R = xTo - H_GAP;

  let points: Array<[number, number]> = [];
  if (L <= R) {
    const midY = (yFrom + yTo) / 2;
    points = [
      [xFrom, yFrom],
      [L, yFrom],
      [L, midY],
      [R, midY],
      [R, yTo],
      [xTo, yTo],
    ];
  } else {
    const midX = (xFrom + xTo) / 2;
    points = [
      [xFrom, yFrom],
      [xFrom + H_GAP, yFrom],
      [midX, yFrom],
      [midX, yTo],
      [xTo - H_GAP, yTo],
      [xTo, yTo],
    ];
  }

  const stroke = selected ? '#ef4444' : 'rgba(75,85,99,0.9)';
  const strokeWidth = selected ? 2.5 : 2;

  // Arrow
  const AR = 6;
  const arrow = `${xTo},${yTo} ${xTo - AR},${yTo - AR} ${xTo - AR},${yTo + AR}`;

  const handleClick: React.MouseEventHandler<SVGElement> = (e) => {
    e.stopPropagation();
    onSelect && onSelect(dependency.id);
  };

  // Container SVG ignores events; only shapes receive them — so stacked lines don't eat each other
  return (
    <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
      <polyline
        points={points.map(([x,y]) => `${x},${y}`).join(' ')}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="miter"
        strokeLinecap="square"
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        onClick={handleClick}
      />
      <polygon
        points={arrow}
        fill={stroke}
        style={{ pointerEvents: 'all', cursor: 'pointer' }}
        onClick={handleClick}
      />
      <polyline
        points={points.map(([x,y]) => `${x},${y}`).join(' ')}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        style={{ pointerEvents: 'stroke' }}
        onClick={handleClick}
      />
      <circle
        cx={xTo}
        cy={yTo}
        r={10}
        fill="transparent"
        style={{ pointerEvents: 'all', cursor: 'pointer' }}
        onClick={handleClick}
      />
>>>>>>> fb11fd0 (chore: initial commit)
    </svg>
  );
};
