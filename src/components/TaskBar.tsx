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

type DragMode = 'move' | 'resizeL' | 'resizeR' | null;

export const TaskBar: React.FC<Props> = ({
  task,
  asThinLine = false,
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
  const color = task.color || '#4f46e5';

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

  const onUp = () => {
    const st = dragRef.current;
    const cur = previewRef.current;
    if (!st || !st.mode) { resetPreview(); return; }

    const dDays = Math.round(cur.dx / dayWidth);
    const lDays = Math.round(cur.dwLeft / dayWidth);
    const rDays = Math.round(cur.dwRight / dayWidth);

    if (st.mode === 'move' && dDays !== 0) onTaskUpdate(task.id, { startDate: addDays(task.startDate, dDays), endDate: addDays(task.endDate, dDays) });
    if (st.mode === 'resizeL' && lDays !== 0) {
      const newStart = addDays(task.startDate, lDays);
      onTaskUpdate(task.id, { startDate: newStart > task.endDate ? new Date(task.endDate) : newStart });
    }
    if (st.mode === 'resizeR' && rDays !== 0) {
      const newEnd = addDays(task.endDate, rDays);
      onTaskUpdate(task.id, { endDate: newEnd < task.startDate ? new Date(task.startDate) : newEnd });
    }

    resetPreview();
    dragRef.current = null;
    window.removeEventListener('mousemove', onMove);
  };

  const resetPreview = () => { previewRef.current = { dx: 0, dwLeft: 0, dwRight: 0 }; setPreview(previewRef.current); };

  const visualLeft = left + (dragRef.current?.mode === 'move' ? preview.dx : 0) + (dragRef.current?.mode === 'resizeL' ? preview.dwLeft : 0);
  const visualWidth = Math.max(4, width + (dragRef.current?.mode === 'resizeR' ? preview.dwRight : 0) - (dragRef.current?.mode === 'resizeL' ? preview.dwLeft : 0));

  const edgeZone = Math.max(6, Math.floor(dayWidth / 3));
  const plusOffset = 8;

  const startConnect = (e: React.MouseEvent) => { e.stopPropagation(); onStartConnect && onStartConnect(task.id); };
  const pickTarget = (e: React.MouseEvent) => { e.stopPropagation(); onPickTarget && onPickTarget(task.id); };

  // Общий набор классов для круглых кнопок “+”, чтобы знак был строго по центру
  const plusClass = "flex items-center justify-center text-[11px] leading-none select-none";

  return (
    <div className="absolute group" style={{ left: visualLeft, width: visualWidth, top, height: barH, zIndex: asThinLine ? 0 : 1 }}>
      {/* сам бар */}
      <div
        className={'rounded border shadow-sm ' + 'cursor-grab active:cursor-grabbing'}
        style={{ backgroundColor: color, height: '100%', borderColor: 'rgba(0,0,0,0.25)' }}
        title={task.name}
        onMouseDown={startDrag('move')}
        onClick={(e) => { if (showTargetHandles) pickTarget(e); }}
      />
      {/* зоны ресайза */}
      <div
        className="absolute top-0 left-0 h-full"
        style={{ width: edgeZone, cursor: 'ew-resize' }}
        onMouseDown={startDrag('resizeL')}
      />
      <div
        className="absolute top-0 right-0 h-full"
        style={{ width: edgeZone, cursor: 'ew-resize' }}
        onMouseDown={startDrag('resizeR')}
      />

      {/* "+" для старта связи — на обоих краях, строго по центру круга */}
      {!asThinLine && (
        <>
          <button
            className={`absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 rounded-full border bg-background hover:bg-accent opacity-0 group-hover:opacity-100 focus:opacity-100 ${plusClass}`}
            style={{ marginLeft: -plusOffset, zIndex: 5 }}
            onClick={startConnect}
            title="Начать связь"
          >+</button>
          <button
            className={`absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 rounded-full border bg-background hover:bg-accent opacity-0 group-hover:opacity-100 focus:opacity-100 ${plusClass}`}
            style={{ marginRight: -plusOffset, zIndex: 5 }}
            onClick={startConnect}
            title="Начать связь"
          >+</button>
        </>
      )}

      {/* Режим выбора цели — тусклый "+" сверху центра; тоже центрируем */}
      {!asThinLine && showTargetHandles && (
        <button
          className={`absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border bg-background opacity-70 hover:opacity-100 ${plusClass}`}
          style={{ zIndex: 5 }}
          onClick={pickTarget}
          title="Связать сюда"
        >+</button>
      )}
    </div>
  );
};

export default TaskBar;
