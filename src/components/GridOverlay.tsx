import React, { useMemo } from 'react';
import { addDays, differenceInDays } from '../utils/dateUtils';
import { TimelineUnit } from '../types/gantt';

interface Props {
  startDate: Date;
  endDate: Date;
  unit: TimelineUnit;
  dayWidth: number;
  height: number; // высота области с барами
}

// Упрощённый список официальных праздников РФ (фиксированные даты).
function isRussianHoliday(d: Date): boolean {
  const m = d.getMonth(); // 0..11
  const day = d.getDate();
  if (m === 0 && day >= 1 && day <= 8) return true; // 1-8 января
  if (m === 1 && day === 23) return true; // 23 февраля
  if (m === 2 && day === 8) return true;  // 8 марта
  if (m === 4 && (day === 1 || day === 9)) return true; // 1, 9 мая
  if (m === 5 && day === 12) return true; // 12 июня
  if (m === 10 && day === 4) return true; // 4 ноября
  return false;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function daysInMonth(d: Date): number {
  return endOfMonth(d).getDate();
}

export const GridOverlay: React.FC<Props> = ({ startDate, endDate, unit, dayWidth, height }) => {
  const totalDays = Math.max(0, differenceInDays(endDate, startDate) + 1);

  // Для Day — используем CSS-повтор для тонких линий + отдельные блоки для выходных и праздников
  const dayLinesStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    // рисуем линию 1px на каждый день
    backgroundImage: 'repeating-linear-gradient(to right, transparent 0, transparent calc(var(--dayw) - 1px), rgba(0,0,0,0.06) calc(var(--dayw) - 1px), rgba(0,0,0,0.06) var(--dayw))',
    ['--dayw' as any]: dayWidth + 'px',
  }), [dayWidth]);

  const weekendHolidayBlocks = useMemo(() => {
    if (unit !== 'day') return null;
    const blocks: JSX.Element[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(startDate, i);
      const dow = d.getDay(); // 0=Вс, 6=Сб
      const weekend = (dow === 0 || dow === 6);
      const holiday = isRussianHoliday(d);
      if (weekend || holiday) {
        blocks.push(
          <div
            key={'w'+i}
            style={{
              position: 'absolute',
              top: 0,
              left: i * dayWidth,
              width: dayWidth,
              height,
              background: 'rgba(148,163,184,0.18)', // слегла серая заливка
              pointerEvents: 'none',
            }}
          />
        );
      }
    }
    return <>{blocks}</>;
  }, [unit, totalDays, startDate, dayWidth, height]);

  // Для недели: 4 равные четверти каждого месяца — вертикальные линии границ четвертей
  const weekQuarterLines = useMemo(() => {
    if (unit !== 'week') return null;
    const lines: JSX.Element[] = [];
    let cursor = startOfMonth(startDate);
    if (cursor < startDate) cursor = startOfMonth(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1));
    const endLimit = endDate;
    const color = 'rgba(0,0,0,0.08)';

    while (cursor <= endLimit) {
      const mStart = startOfMonth(cursor);
      const mEnd = endOfMonth(cursor);
      const monthStart = mStart < startDate ? startDate : mStart;
      const monthEnd = mEnd > endLimit ? endLimit : mEnd;
      const fullMonthDays = daysInMonth(cursor);

      // Позиция начала месяца относительно общего старта
      const monthOffsetDays = differenceInDays(mStart, startDate);

      // Границы четвертей: 1/4, 2/4, 3/4 (последняя — конец месяца)
      for (let q = 1; q <= 3; q++) {
        const dayInMonth = Math.round((fullMonthDays * q) / 4);
        const offset = Math.max(0, monthOffsetDays + dayInMonth);
        lines.push(
          <div
            key={`wk-${cursor.getFullYear()}-${cursor.getMonth()}-${q}`}
            style={{
              position: 'absolute',
              top: 0,
              left: offset * dayWidth,
              width: 1,
              height,
              background: color,
              pointerEvents: 'none',
            }}
          />
        );
      }

      // Следующий месяц
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }

    return <>{lines}</>;
  }, [unit, startDate, endDate, dayWidth, height]);

  // Для месяца: линия по каждому началу месяца
  const monthLines = useMemo(() => {
    if (unit !== 'month') return null;
    const lines: JSX.Element[] = [];
    let cursor = startOfMonth(startDate);
    const color = 'rgba(0,0,0,0.08)';
    while (cursor <= endDate) {
      const offsetDays = Math.max(0, differenceInDays(cursor, startDate));
      lines.push(
        <div
          key={`m-${cursor.getFullYear()}-${cursor.getMonth()}`}
          style={{
            position: 'absolute',
            top: 0,
            left: offsetDays * dayWidth,
            width: 1,
            height,
            background: color,
            pointerEvents: 'none',
          }}
        />
      );
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return <>{lines}</>;
  }, [unit, startDate, endDate, dayWidth, height]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {unit === 'day' && <div style={dayLinesStyle} />}
      {weekendHolidayBlocks}
      {weekQuarterLines}
      {monthLines}
    </div>
  );
};
