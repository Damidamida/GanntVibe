import React, { useMemo, useRef, useState } from 'react';
import { Task } from '../types/gantt';
import { differenceInDays, addDays } from '../utils/dateUtils';

interface Props {
  task: Task;
  asThinLine?: boolean;
  projectStartDate: Date;
  dayWidth: number;
  rowHeight: number;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  showTargetHandles?: boolean;
  onStartConnect?: (taskId: string) => void;
  onPickTarget?: (taskId: string) => void;
  scrollContainer?: HTMLDivElement | null;
}

type DragMode = 'move' | 'resizeL' | 'resizeR';

const TaskBar: React.FC<Props> = ({
  task,
  asThinLine,
  projectStartDate,
  dayWidth,
  rowHeight,
  onTaskUpdate,
  showTargetHandles,
  onStartConnect,
  onPickTarget,
  scrollContainer,
}) => {
  const { left, width } = useMemo(() => {
    const leftDays = Math.max(0, differenceInDays(task.startDate, projectStartDate));
    const spanDays = Math.max(1, differenceInDays(task.endDate, task.startDate) + 1);
    return { left: leftDays * dayWidth, width: spanDays * dayWidth };
  }, [task.startDate, task.endDate, projectStartDate, dayWidth]);

  const barH = asThinLine ? Math.max(2, Math.round(rowHeight * 0.2)) : Math.round(rowHeight * 0.6);
  const top = Math.max(0, Math.round((rowHeight - barH) / 2));
  const color = (task as any).color || '#4f46e5';

  const [preview, setPreview] = useState<{ dx: number; dwLeft: number; dwRight: number }>({ dx: 0, dwLeft: 0, dwRight: 0 });
  const previewRef = useRef(preview);
  const setPrev = (patch: Partial<typeof preview>) => { previewRef.current = { ...previewRef.current, ...patch }; setPreview(previewRef.current); };

  const dragRef = useRef<{ mode: DragMode; startX: number } | null>(null);

  const startDrag = (mode: DragMode) => (e: React.MouseEvent<HTMLDivElement>) => {
    dragRef.current = { mode, startX: e.clientX };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp, { once: true });
    e.preventDefault();
    e.stopPropagation();
  };

  const onMove = (ev: MouseEvent) => {
    const st = dragRef.current;
    if (!st || !st.mode) return;
    const dxPx = ev.clientX - st.startX;

    if (scrollContainer) {
      const rect = scrollContainer.getBoundingClientRect();
      const edge = Math.min(60, Math.max(24, dayWidth * 2));
      if (ev.clientX > rect.right - edge) scrollContainer.scrollLeft += Math.round(dayWidth / 2);
      else if (ev.clientX < rect.left + edge) scrollContainer.scrollLeft -= Math.round(dayWidth / 2);
    }

    if (st.mode === 'move') setPrev({ dx: dxPx });
    else if (st.mode === 'resizeL') setPrev({ dwLeft: dxPx });
    else if (st.mode === 'resizeR') setPrev({ dwRight: dxPx });
  };

  const resetPreview = () => setPrev({ dx: 0, dwLeft: 0, dwRight: 0 });

  const onUp = () => {
    const st = dragRef.current;
    const cur = previewRef.current;
    if (!st || !st.mode) { resetPreview(); return; }

    const dDays = Math.round(cur.dx / dayWidth);
    const lDays = Math.round(cur.dwLeft / dayWidth);
    const rDays = Math.round(cur.dwRight / dayWidth);

    if (st.mode === 'move' && dDays) {
      onTaskUpdate((task as any).id, {
        startDate: addDays(task.startDate, dDays),
        endDate: addDays(task.endDate, dDays),
      });
    } else if (st.mode === 'resizeL' && lDays) {
      const nextStart = addDays(task.startDate, lDays);
      if (nextStart <= task.endDate) {
        onTaskUpdate((task as any).id, { startDate: nextStart });
      }
    } else if (st.mode === 'resizeR' && rDays) {
      const nextEnd = addDays(task.endDate, rDays);
      if (nextEnd >= task.startDate) {
        onTaskUpdate((task as any).id, { endDate: nextEnd });
      }
    }

    resetPreview();
    dragRef.current = null;
    window.removeEventListener('mousemove', onMove);
  };

  const visualLeft = Math.round(left + preview.dx + (preview.dwLeft || 0));
  const visualWidth = Math.max(1, Math.round(width + (preview.dwRight || 0) - (preview.dwLeft || 0)));

  // Хэндлы фиксированной ширины 10px внутри бара (по требованию)
  const edgeZone = 10;
  const plusOffset = 8;

  const startConnect = (e: React.MouseEvent) => { e.stopPropagation(); onStartConnect && onStartConnect((task as any).id); };
  const pickTarget = (e: React.MouseEvent) => { e.stopPropagation(); onPickTarget && onPickTarget((task as any).id); };

  // Центровка знака “+”
  const plusClass = "flex items-center justify-center text-[11px] leading-none select-none";

  return (
    <div
      className="absolute group"
      style={{ left: visualLeft, width: visualWidth, top, height: barH, zIndex: asThinLine ? 0 : 1 }}
    >
      {/* сам бар */}
      <div
        className={'relative rounded border shadow-sm ' + 'cursor-grab active:cursor-grabbing'}
        style={{ backgroundColor: color, height: '100%', borderColor: 'rgba(0,0,0,0.25)' }}
        title={(task as any).name}
        onMouseDown={startDrag('move')}
        onClick={(e) => { if (showTargetHandles) pickTarget(e); }}
      >
        {/* зоны ресайза — ВНУТРИ бара */}
        <div
          className="absolute top-0 left-0 h-full"
          style={{ width: edgeZone, cursor: 'ew-resize' }}
          onMouseDown={startDrag('resizeL')}
          onClick={(e) => e.stopPropagation()}
        />
        <div
          className="absolute top-0 right-0 h-full"
          style={{ width: edgeZone, cursor: 'ew-resize' }}
          onMouseDown={startDrag('resizeR')}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* "+" для старта связи — остаются как были */}
      {!asThinLine && !showTargetHandles && (
        <>
          <button
            className={`absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 rounded-full border shadow-sm bg-background opacity-0 group-hover:opacity-100 focus:opacity-100 ${plusClass}`}
            style={{ marginLeft: -plusOffset, zIndex: 5 }}
            onClick={startConnect}
            title="Начать связь"
          >+</button>
          <button
            className={`absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 rounded-full border shadow-sm bg-background opacity-0 group-hover:opacity-100 focus:opacity-100 ${plusClass}`}
            style={{ marginRight: -plusOffset, zIndex: 5 }}
            onClick={startConnect}
            title="Начать связь"
          >+</button>
        </>
      )}

      {/* Режим выбора цели — верхний “+” */}
      {!asThinLine && showTargetHandles && (
        <button
          className={`absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border shadow-sm bg-background opacity-70 hover:opacity-100 ${plusClass}`}
          style={{ zIndex: 5 }}
          onClick={pickTarget}
          title="Связать сюда"
        >+</button>
      )}
    </div>
  );
};

// Экспорт и как default, и как именованный — чтобы не менять существующие импорты
export { TaskBar };
export default TaskBar;
