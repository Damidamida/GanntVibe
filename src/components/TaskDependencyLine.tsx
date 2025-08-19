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
}

const toLocalStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysBetween = (a: Date, b: Date) =>
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
  // Ховер отслеживаем только для области стрелки
  const [arrowHover, setArrowHover] = useState(false);

  const geom = useMemo(() => {
    const yFrom = fromIndex * rowHeight + rowHeight / 2;
    const yTo = toIndex * rowHeight + rowHeight / 2;

    const fromLeft = Math.round(daysBetween(fromTask.startDate, projectStartDate) * dayWidth);
    const fromWidth = Math.round((daysBetween(fromTask.endDate, fromTask.startDate) + 1) * dayWidth);
    const xFromRight = fromLeft + fromWidth;

    const xToLeft = Math.round(daysBetween(toTask.startDate, projectStartDate) * dayWidth);

    const outGap = 10;
    const enterGap = 8;
    const barHalf = Math.round(rowHeight * 0.3);
    const pad = 6;

    const gapDays = daysBetween(toTask.startDate, toLocalStart(fromTask.endDate));

    const x1 = xFromRight;
    const x2 = x1 + outGap;
    const xEnter = xToLeft - enterGap;

    if (gapDays <= 1) {
      // Сценарий 1 — цель левее или на след. день: опускаемся/поднимаемся за границей источника
      const yMid = yFrom + (yTo >= yFrom ? 1 : -1) * (barHalf + pad);
      return { scenario: 1 as const, x1, x2, xEnter, xToLeft, yFrom, yMid, yTo };
    }

    // Сценарий 2 — цель правее > +1 дня: горизонталь идёт строго на уровне yTo
    const yMid = yTo;
    return { scenario: 2 as const, x1, x2, xEnter, xToLeft, yFrom, yMid, yTo };
  }, [fromIndex, toIndex, rowHeight, dayWidth, projectStartDate, fromTask.startDate, fromTask.endDate, toTask.startDate]);

  // Цвет/толщина: подсветка по selected (клик по линии)
  const color = selected ? '#0ea5e9' : '#94a3b8';
  const strokeW = selected ? 2.5 : 1.5;

  const handleClick: React.MouseEventHandler<SVGLineElement | SVGPathElement> = (e) => {
    e.stopPropagation();
    onSelect && onSelect(dependency.id);
  };

  // Чтобы кружки «о» всегда выигрывали у линий: оставим «дыры» у обоих концов хитбоксов
  const SAFE_NEAR_BARS = 14; // px — не перекрываем область возле бара (где находятся круги связи)

  const hb1Start = Math.min(geom.x2, Math.max(geom.x1, geom.x1 + SAFE_NEAR_BARS));
  const hb1End = geom.x2;
  const hb2Start = Math.min(geom.xEnter - SAFE_NEAR_BARS, Math.max(geom.x2, geom.x2 + 2));
  const hb2End = geom.xEnter;

  const arrowX = geom.xToLeft;
  const arrowY = geom.yTo;

  return (
    <svg
      className="absolute left-0 top-0"
      style={{ width: '100%', height: '100%', overflow: 'visible', zIndex: 3, pointerEvents: 'none' as const }}
    >
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>

      {/* Видимая геометрия (не перехватывает события) */}
      <line x1={geom.x1} y1={geom.yFrom} x2={geom.x2} y2={geom.yFrom} stroke={color} strokeWidth={strokeW} pointerEvents="none" />
      <line x1={geom.x2} y1={geom.yFrom} x2={geom.x2} y2={geom.yMid} stroke={color} strokeWidth={strokeW} pointerEvents="none" />
      <line x1={geom.x2} y1={geom.yMid} x2={geom.xEnter} y2={geom.yMid} stroke={color} strokeWidth={strokeW} pointerEvents="none" />
      <line x1={geom.xEnter} y1={geom.yMid} x2={geom.xEnter} y2={geom.yTo} stroke={color} strokeWidth={strokeW} pointerEvents="none" />
      <line x1={geom.xEnter} y1={geom.yTo} x2={geom.xToLeft} y2={geom.yTo} stroke={color} strokeWidth={strokeW} markerEnd="url(#arrow)" pointerEvents="none" />

      {/* Широкие хитбоксы для выбора линии (c «дырами» у баров) */}
      {(hb1End - hb1Start > 2) && (
        <line x1={hb1Start} y1={geom.yFrom} x2={hb1End} y2={geom.yFrom}
              stroke="transparent" strokeWidth={16} pointerEvents="stroke" className="cursor-pointer"
              onClick={handleClick} />
      )}
      {(hb2End - hb2Start > 2) && (
        <line x1={hb2Start} y1={geom.yMid} x2={hb2End} y2={geom.yMid}
              stroke="transparent" strokeWidth={16} pointerEvents="stroke" className="cursor-pointer"
              onClick={handleClick} />
      )}

      {/* Единая группа ховера у стрелки — чтобы не мигало при переходе на «×» */}
      <g style={{ pointerEvents: 'auto' as const }}
         onMouseEnter={() => setArrowHover(true)}
         onMouseLeave={() => setArrowHover(false)}>
        {/* Зона ховера слева от бара цели */}
        <rect x={arrowX - 22} y={arrowY - 12} width={24} height={24} fill="transparent" />
        {/* Кнопка удаления — появляется только при ховере на группе */}
        {arrowHover && onDelete && (
          <foreignObject x={arrowX - 10} y={arrowY - 10} width={20} height={20}>
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
      </g>
    </svg>
  );
};

export default TaskDependencyLine;
