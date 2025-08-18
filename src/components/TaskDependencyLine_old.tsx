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
  const AR = 6;
  const arrow = `${xTo},${yTo} ${xTo - AR},${yTo - AR} ${xTo - AR},${yTo + AR}`;

  const handleClick: React.MouseEventHandler<SVGElement> = (e) => {
    e.stopPropagation();
    onSelect && onSelect(dependency.id);
  };

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
    </svg>
  );
};
