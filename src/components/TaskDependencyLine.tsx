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
    </svg>
  );
};
