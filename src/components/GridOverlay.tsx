
import React, { useMemo } from 'react';
import { addDays, differenceInDays } from '../utils/dateUtils';
import type { TimelineUnit } from '../types/gantt';
import { isNonWorkingDayRU } from '../utils/ruCalendar';

interface Props {
  startDate: Date;
  endDate: Date;
  unit: TimelineUnit;
  dayWidth: number;
  height: number;
}

const BORDER = 'rgba(0,0,0,0.10)';
const HOLIDAY_BG = 'rgba(255, 0, 0, 0.06)';
const WEEKEND_BG = 'rgba(0, 0, 0, 0.04)';

function mondayOnOrAfter(d: Date): Date {
  const res = new Date(d);
  const wd = res.getDay();
  const add = wd === 0 ? 1 : (wd === 1 ? 0 : 8 - wd);
  res.setDate(res.getDate() + add);
  return new Date(res.getFullYear(), res.getMonth(), res.getDate());
}

export const GridOverlay: React.FC<Props> = ({ startDate, endDate, unit, dayWidth, height }) => {
  const dayGrid = useMemo(() => {
    if (unit !== 'day') return null;
    const total = differenceInDays(endDate, startDate) + 1;
    const nodes: JSX.Element[] = [];
    for (let i=0;i<total;i++) {
      const d = addDays(startDate, i);
      const x = i*dayWidth;
      const isH = isNonWorkingDayRU(d);
      const isW = d.getDay() === 0 || d.getDay() === 6;
      if (isH) nodes.push(<div key={`h-${i}`} style={{ position:'absolute', left:x, top:0, width:dayWidth, height, background:HOLIDAY_BG, pointerEvents:'none' }}/>);
      else if (isW) nodes.push(<div key={`w-${i}`} style={{ position:'absolute', left:x, top:0, width:dayWidth, height, background:WEEKEND_BG, pointerEvents:'none' }}/>);
      nodes.push(<div key={`l-${i}`} style={{ position:'absolute', left:x, top:0, height, width:0, borderLeft:`1px solid ${BORDER}`, pointerEvents:'none' }}/>);
    }
    return <>{nodes}</>;
  }, [unit, startDate, endDate, dayWidth, height]);

  const weekGrid = useMemo(() => {
    if (unit !== 'week') return null;
    const nodes: JSX.Element[] = [];
    let cur = mondayOnOrAfter(startDate);
    while (cur <= endDate) {
      const x = differenceInDays(cur, startDate) * dayWidth;
      nodes.push(<div key={`w-${cur.toISOString()}`} style={{ position:'absolute', left:x, top:0, height, width:0, borderLeft:`1px solid ${BORDER}`, pointerEvents:'none' }}/>);
      cur.setDate(cur.getDate()+7);
    }
    return <>{nodes}</>;
  }, [unit, startDate, endDate, dayWidth, height]);

  const monthGrid = useMemo(() => {
    if (unit !== 'month') return null;
    const nodes: JSX.Element[] = [];
    let m = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (m <= endDate) {
      const x = differenceInDays(m, startDate) * dayWidth;
      nodes.push(<div key={`m-${m.getFullYear()}-${m.getMonth()}`} style={{ position:'absolute', left:x, top:0, height, width:0, borderLeft:`1px solid ${BORDER}`, pointerEvents:'none' }}/>);
      m = new Date(m.getFullYear(), m.getMonth()+1, 1);
    }
    return <>{nodes}</>;
  }, [unit, startDate, endDate, dayWidth, height]);

  return <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>{dayGrid}{weekGrid}{monthGrid}</div>;
};
