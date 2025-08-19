
import calendar2024 from '../data/ru-calendar-2024.json';
import calendar2025 from '../data/ru-calendar-2025.json';
import calendar2026 from '../data/ru-calendar-2026.json';

type YearData = {
  nonWorking: string[];
  workingWeekends?: string[];
};

const db: Record<number, YearData> = {
  2024: calendar2024 as YearData,
  2025: calendar2025 as YearData,
  2026: calendar2026 as YearData,
};

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getISOWeekNumber(date: Date): number {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

export function isNonWorkingDayRU(date: Date): boolean {
  const year = date.getFullYear();
  const rec = db[year];
  const key = ymd(date);
  if (rec && rec.nonWorking && rec.nonWorking.includes(key)) return true;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  if (isWeekend) {
    if (rec && rec.workingWeekends && rec.workingWeekends.includes(key)) return false;
    return true;
  }
  return false;
}
