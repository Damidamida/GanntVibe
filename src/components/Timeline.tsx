
import React, { useMemo } from 'react';
import type { TimelineUnit } from '../types/gantt';

interface TimelineProps {
  startDate: Date;
  endDate: Date;
  dayWidth: number;
  unit: TimelineUnit;
}

const MS = 24*3600*1000;
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function diffDays(a: Date, b: Date) { return Math.round((a.getTime() - b.getTime())/MS); }
function clampDate(d: Date, min: Date, max: Date) { return d < min ? min : (d > max ? max : d); }

export const Timeline: React.FC<TimelineProps> = ({ startDate, endDate, dayWidth, unit }) => {
  const months = useMemo(() => {
    const list: { year: number; month: number; start: Date; end: Date; days: number }[] = [];
    let cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (cur <= endDate) {
      const y = cur.getFullYear(); const m = cur.getMonth();
      const mStart = new Date(y, m, 1);
      const mEnd = new Date(y, m, daysInMonth(y, m));
      const s = clampDate(mStart, startDate, endDate);
      const e = clampDate(mEnd, startDate, endDate);
      list.push({ year: y, month: m, start: s, end: e, days: diffDays(e, s) + 1 });
      cur = new Date(y, m + 1, 1);
    }
    return list;
  }, [startDate, endDate]);

  const years = useMemo(() => {
    const map = new Map<number, number>();
    months.forEach(m => map.set(m.year, (map.get(m.year) ?? 0) + m.days));
    return Array.from(map.entries()).map(([year, days]) => ({ year, days }));
  }, [months]);

  const topRowH = 24;
  const bottomRowH = 28;
  const headerH = topRowH + bottomRowH;

  return (
    <div className="relative w-full" style={{ height: headerH }}>
      {unit === 'month' ? (
        <div className="absolute left-0 right-0 top-0 h-6 bg-muted/30 border-b flex">
          {years.map((y, i) => (
            <div key={i} className="h-full border-r px-2 flex items-center text-xs font-medium whitespace-nowrap" style={{ width: y.days * dayWidth }}>
              {y.year}
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute left-0 right-0 top-0 h-6 bg-muted/30 border-b flex">
          {months.map((m, i) => (
            <div key={i} className="h-full border-r px-2 flex items-center text-xs font-medium whitespace-nowrap" style={{ width: m.days * dayWidth }}>
              {new Date(m.year, m.month, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </div>
          ))}
        </div>
      )}

      <div className="absolute left-0 right-0" style={{ top: topRowH, height: bottomRowH }}>
        {unit === 'day' && (
          <div className="flex">
            {months.map((m, i) => (
              <div key={i} className="flex" style={{ width: m.days * dayWidth }}>
                {Array.from({ length: m.days }).map((_, di) => (
                  <div key={di} className="h-full border-r text-xs flex items-center justify-center" style={{ width: dayWidth }}>
                    {new Date(m.start.getFullYear(), m.start.getMonth(), m.start.getDate() + di).getDate()}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {unit === 'week' && (
          <div className="flex">
            {months.map((m, i) => {
              const total = m.days;
              const w1 = Math.round(total / 4);
              const w2 = Math.round((total - w1) / 3);
              const w3 = Math.round((total - w1 - w2) / 2);
              const w4 = total - w1 - w2 - w3;
              const widths = [w1, w2, w3, w4].map(d => d * dayWidth);
              return (
                <div key={i} className="flex" style={{ width: m.days * dayWidth }}>
                  {widths.map((w, wi) => (
                    <div key={wi} className="h-full border-r text-xs flex items-center justify-center" style={{ width: w }}>
                      {wi + 1}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {unit === 'month' && (
          <div className="flex">
            {months.map((m, i) => (
              <div key={i} className="h-full border-r text-xs flex items-center justify-center" style={{ width: m.days * dayWidth }}>
                {new Date(m.year, m.month, 1).toLocaleDateString('ru-RU', { month: 'short' }).slice(0,3)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
