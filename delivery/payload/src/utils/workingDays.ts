export function workingDaysBetween(start: Date, end: Date, holidaysSet: Set<string>): number {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
  if (s > e) return 0;
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const day = cur.getDay(); // 0=Sun,6=Sat
    const iso = cur.toISOString().slice(0, 10);
    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidaysSet.has(iso);
    if (!isWeekend && !isHoliday) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}
