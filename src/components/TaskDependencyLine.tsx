import React, { useMemo } from 'react';
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
  const points = useMemo(() => {
    const yFrom = fromIndex * rowHeight + rowHeight / 2;
    const yTo = toIndex * rowHeight + rowHeight / 2;

    const xFromLeft = differenceInDays(fromTask.startDate, projectStartDate) * dayWidth;
    const xFromRight = (differenceInDays(fromTask.endDate, projectStartDate) + 1) * dayWidth;

    const xToLeft = differenceInDays(toTask.startDate, projectStartDate) * dayWidth;
    // Стратегия FS: выходим из правого края источника, зазор 6px, затем «манхэттеном» к левому краю цели
    const gap = 6;
    const x1 = xFromRight;               // старт по X
    const x2 = x1 + gap;                  // небольшой отход вправо
    const yMid = yTo;                     // вертикальная цель
    const x3 = xToLeft - gap;             // подходим к цели слева
    const x4 = xToLeft;                   // входим в цель

    return { x1, x2, x3, x4, yFrom, yMid, yTo };
  }, [fromTask, toTask, projectStartDate, dayWidth, fromIndex, toIndex, rowHeight]);

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

      {/* Горизонталь от правого края источника */}
      <line x1={points.x1} y1={points.yFrom} x2={points.x2} y2={points.yFrom} stroke={color} strokeWidth={strokeW} className="pointer-events-auto" onClick={handleClick} />
      {/* Вертикаль к строке цели */}
      <line x1={points.x2} y1={points.yFrom} x2={points.x2} y2={points.yMid} stroke={color} strokeWidth={strokeW} className="pointer-events-auto" onClick={handleClick} />
      {/* Горизонталь к левому краю цели со стрелкой */}
      <line x1={points.x2} y1={points.yTo} x2={points.x4} y2={points.yTo} stroke={color} strokeWidth={strokeW} markerEnd="url(#arrow)" className="pointer-events-auto" onClick={handleClick} />
    </svg>
  );
};

export default TaskDependencyLine;
