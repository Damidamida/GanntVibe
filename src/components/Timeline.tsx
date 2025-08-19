import React, { useMemo } from 'react';
import type { TimelineUnit } from '../types/gantt';
import { addDays, differenceInDays } from '../utils/dateUtils';
import { getISOWeekNumber, isNonWorkingDayRU } from '../utils/ruCalendar';

interface TimelineProps {
  startDate: Date;
  endDate: Date;
  dayWidth: number;
  unit: TimelineUnit;
}

const H_TOP = 26;     // высота строки месяца
const H_BOTTOM = 28;  // высота строки дат/недель
const HEADER_H = H_TOP + H_BOTTOM;

const MONTH_BG_A = 'rgba(0,0,0,0.04)';
const MONTH_BG_B = 'rgba(0,0,0,0.08)';
const MONTH_DIVIDER = 'rgba(0,0,0,0.45)';
const THIN_LINE = 'rgba(0,0,0,0.28)';
const BORDER_BOTTOM = 'rgba(0,0,0,0.30)';
const WEEKEND_BG = 'rgba(0,0,0,0.06)';
const HOLIDAY_BG = 'rgba(255,0,0,0.10)';

function buildMonthSegments(startDate: Date, endDate: Date) {
  const segs: { start: Date; end: Date; labelYear: number; labelMonth: number }[] = [];
  let cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const endInc = addDays(endDate, 1);
  while (cur < endInc) {
    const monthStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
    const nextMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    const segEnd = nextMonth < endInc ? nextMonth : endInc;
    segs.push({ start: cur, end: segEnd, labelYear: monthStart.getFullYear(), labelMonth: monthStart.getMonth() });
    cur = segEnd;
  }
  return segs;
}

function mondayOnOrAfter(d: Date): Date {
  const res = new Date(d);
  const wd = res.getDay(); // 0=Sun..6=Sat
  const add = wd === 0 ? 1 : (wd === 1 ? 0 : 8 - wd);
  res.setDate(res.getDate() + add);
  return new Date(res.getFullYear(), res.getMonth(), res.getDate());
}

export const Timeline: React.FC<TimelineProps> = ({ startDate, endDate, dayWidth, unit }) => {
  const monthSegs = useMemo(() => buildMonthSegments(startDate, endDate), [startDate, endDate]);

  // ВЕРХНЯЯ СТРОКА: фон + толстые разделители между месяцами
  const topRow = useMemo(() => {
    return monthSegs.map((seg, idx) => {
      const startX = differenceInDays(seg.start, startDate) * dayWidth;
      const endX = differenceInDays(seg.end, startDate) * dayWidth;
      const width = endX - startX;
      const label = new Date(seg.labelYear, seg.labelMonth, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      const text = label.charAt(0).toUpperCase() + label.slice(1);
      const borderLeft = idx === 0 ? undefined : `2px solid ${MONTH_DIVIDER}`;
      return (
        <div key={`m-${seg.labelYear}-${seg.labelMonth}-${startX}`}
             className="flex items-center justify-center text-xs"
             style={{
               width,
               height: H_TOP,
               background: (((seg.labelYear * 12 + seg.labelMonth) % 2) === 0) ? MONTH_BG_A : MONTH_BG_B,
               borderLeft
             }}>
          {text}
        </div>
      );
    });
  }, [monthSegs, startDate, dayWidth]);

  // НИЖНЯЯ СТРОКА: ячейки с собственными границами (без оверлеев)
  const bottomRow = useMemo(() => {
    if (unit === 'day') {
      const total = differenceInDays(endDate, startDate) + 1;
      return Array.from({ length: total }).map((_, i) => {
        const d = addDays(startDate, i);
        const isH = isNonWorkingDayRU(d);
        const isW = d.getDay() === 0 || d.getDay() === 6;
        return (
          <div key={`d-${i}`}
               className="absolute flex items-center justify-center text-xs"
               style={{
                 transform: `translateX(${i * dayWidth}px)`,
                 width: dayWidth,
                 height: H_BOTTOM,
                 top: H_TOP,
                 borderLeft: `1px solid ${THIN_LINE}`,
                 background: isH ? HOLIDAY_BG : (isW ? WEEKEND_BG : undefined)
               }}>
            {d.getDate()}
          </div>
        );
      });
    }
    if (unit === 'week') {
      const nodes: JSX.Element[] = [];
      let cur = mondayOnOrAfter(startDate);
      while (cur <= endDate) {
        const ws = new Date(cur);
        const we = addDays(ws, 6);
        const x = differenceInDays(ws, startDate) * dayWidth;
        const w = 7 * dayWidth;
        nodes.push(
          <div key={`wk-${ws.toISOString()}`}
               className="absolute flex items-center justify-center text-xs"
               style={{
                 transform: `translateX(${x}px)`,
                 width: w,
                 height: H_BOTTOM,
                 top: H_TOP,
                 borderLeft: `1px solid ${THIN_LINE}`
               }}>
            {`${ws.getDate()}–${we.getDate()} (${getISOWeekNumber(ws)}н)`}
          </div>
        );
        cur = addDays(cur, 7);
      }
      return nodes;
    }
    if (unit === 'month') {
      return [];
    }
    return [];
  }, [unit, startDate, endDate, dayWidth]);

  return (
    <div className="relative w-full select-none" style={{ height: HEADER_H, pointerEvents: 'none' }}>
      {/* Верхняя строка месяцев: встроенные толстые разделители */}
      <div className="flex" style={{ height: H_TOP }}>{topRow}</div>

      {/* Горизонтальный разделитель */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: H_TOP - 0.5, height: 0, borderTop: `1px solid ${BORDER_BOTTOM}` }} />

      {/* Нижняя строка (дни/недели) с собственными левыми границами */}
      <div className="absolute left-0 right-0" style={{ top: 0, height: HEADER_H }}>{bottomRow}</div>
    </div>
  );
};
