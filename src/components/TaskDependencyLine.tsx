import React, { useMemo, useState } from 'react';
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
  onDelete?: (id: string) => void;
  siblingIndex?: number;
  siblingCount?: number;
}

// Локальные «целые» дни — как в барах
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
  onDelete,
}) => {
  const [hovered, setHovered] = useState(false);

  const points = useMemo(() => {
    const yFrom = fromIndex * rowHeight + rowHeight / 2; // без разведения: все выходят из одного места
    const yTo = toIndex * rowHeight + rowHeight / 2;

    const fromLeft = Math.round(diffDaysLocal(fromTask.startDate, projectStartDate) * dayWidth);
    const fromWidth = Math.round((diffDaysLocal(fromTask.endDate, fromTask.startDate) + 1) * dayWidth);
    const xFromRight = fromLeft + fromWidth;

    const xToLeft = Math.round(diffDaysLocal(toTask.startDate, projectStartDate) * dayWidth);

    const gap = 6;
    const x1 = xFromRight;
    const x2 = x1 + gap;
    const yMid = yTo;
    const x4 = xToLeft;

    const cx = (x2 + x4) / 2;
    const cy = yTo;

    return { x1, x2, x4, yFrom, yMid, yTo, cx, cy };
  }, [
    fromTask.startDate, fromTask.endDate, toTask.startDate, projectStartDate,
    dayWidth, fromIndex, toIndex, rowHeight
  ]);

  const color = selected ? '#0ea5e9' : (hovered ? '#64748b' : '#94a3b8');
  const strokeW = selected ? 2.5 : 1.5;

  const handleClick: React.MouseEventHandler<SVGLineElement | SVGPathElement> = (e) => {
    e.stopPropagation();
    onSelect && onSelect(dependency.id);
  };

  return (
    <svg
      className="absolute left-0 top-0"
      style={{ width: '100%', height: '100%', overflow: 'visible', zIndex: 6, pointerEvents: 'none' as const }}
      onMouseLeave={() => setHovered(false)}
    >
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>

      {/* Видимая линия */}
      <line x1={points.x1} y1={points.yFrom} x2={points.x2} y2={points.yFrom} stroke={color} strokeWidth={strokeW} pointerEvents="none" />
      <line x1={points.x2} y1={points.yFrom} x2={points.x2} y2={points.yMid} stroke={color} strokeWidth={strokeW} pointerEvents="none" />
      <line x1={points.x2} y1={points.yTo} x2={points.x4} y2={points.yTo} stroke={color} strokeWidth={strokeW} markerEnd="url(#arrow)" pointerEvents="none" />

      {/* Невидимые широкие хитбоксы ТОЛЬКО на горизонтальных сегментах */}
      <line x1={points.x1} y1={points.yFrom} x2={points.x2} y2={points.yFrom}
            stroke="transparent" strokeWidth={16} pointerEvents="stroke" className="cursor-pointer"
            onMouseEnter={() => setHovered(true)} onClick={handleClick} />
      <line x1={points.x2} y1={points.yTo} x2={points.x4} y2={points.yTo}
            stroke="transparent" strokeWidth={16} pointerEvents="stroke" className="cursor-pointer"
            onMouseEnter={() => setHovered(true)} onClick={handleClick} />

      {/* Мини-кнопка удаления */}
      {(hovered || selected) && onDelete && (
        <foreignObject x={points.cx - 10} y={points.cy - 10} width={20} height={20}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 9999,
              background: 'white',
              border: '1px solid rgba(0,0,0,0.15)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              fontSize: 12,
              lineHeight: '12px',
              userSelect: 'none',
              pointerEvents: 'auto'
            }}
            onClick={(e) => { e.stopPropagation(); onDelete(dependency.id); }}
            title="Удалить связь"
          >
            ×
          </div>
        </foreignObject>
      )}
    </svg>
  );
};

export default TaskDependencyLine;
