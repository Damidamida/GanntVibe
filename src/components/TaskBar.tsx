import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Task } from '../types/gantt';
import { addDays, differenceInDays } from '../utils/dateUtils';

interface Props {
  task: Task;
  asThinLine?: boolean;
  projectStartDate: Date;
  dayWidth: number;
  rowHeight: number;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;

  // dependency UX
  showTargetHandles?: boolean;
  onStartConnect?: (taskId: string) => void;
  onPickTarget?: (taskId: string) => void;

  // автоскролл и «заморозка» окна
  scrollContainer?: HTMLDivElement | null;
  onDragChange?: (dragging: boolean) => void;
}

const MIN_DAYS = 1;

// простая функция затемнения/осветления HEX
function shadeHexColor(hex: string, percent: number): string {
  try {
    const h = hex.replace('#', '');
    const num = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;
    r = Math.min(255, Math.max(0, Math.round(r + (percent / 100) * 255)));
    g = Math.min(255, Math.max(0, Math.round(g + (percent / 100) * 255)));
    b = Math.min(255, Math.max(0, Math.round(b + (percent / 100) * 255)));
    const toHex = (v: number) => v.toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
  } catch {
    return hex; // на всякий случай
  }
}

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
  onDragChange,
}) => {
  const [hover, setHover] = useState(false);
  const barHeight = Math.max(4, rowHeight * (asThinLine ? 0.2 : 0.9));
  const barTopOffset = (rowHeight - barHeight) / 2;


  const [dragging, setDragging] = useState<null | 'move' | 'resize-left' | 'resize-right'>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [origStart, setOrigStart] = useState<Date>(task.startDate);
  const [origEnd, setOrigEnd] = useState<Date>(task.endDate);

  const raf = useRef<number | null>(null);
  const pending = useRef<Partial<Task> | null>(null);

  const barRef = useRef<HTMLDivElement | null>(null);
  const hitboxRef = useRef<HTMLDivElement | null>(null);
  const originLeftPxRef = useRef<number>(0);
  const widthPxRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  // Геометрия бара
  const left = useMemo(() => differenceInDays(task.startDate, projectStartDate) * dayWidth, [task.startDate, projectStartDate, dayWidth]);
  const width = useMemo(() => (differenceInDays(task.endDate, task.startDate) + 1) * dayWidth, [task.endDate, task.startDate, dayWidth]);

  // Константы UI
  const BAR_H = Math.max(20, rowHeight - 10); // бар по центру строки
  const BAR_TOP = (rowHeight - BAR_H) / 2;

  const PLUS_SIZE = 24;    // 1.5x
  const GAP_OUTSIDE = 5;   // отступ от краёв колбаски СНАРУЖИ
  const OUT = PLUS_SIZE + GAP_OUTSIDE;
  const RESIZE_W = 4;      // зона ресайза по краям

  const fill = (task as any).color || '#3b82f6';
  const stroke = shadeHexColor(fill, -25);

  // Хелперы
  const snapDxToDays = (dx: number) => Math.round(dx / dayWidth);

  const queueUpdate = (updates: Partial<Task>) => {
    pending.current = updates;
    if (raf.current == null) {
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        if (pending.current) {
          onTaskUpdate(task.id, pending.current);
          pending.current = null;
        }
      });
    }
  };

  // ===== ВИЗУАЛЬНЫЙ DRAG ДЛЯ ПЕРЕМЕЩЕНИЯ =====
  const applyVisualShift = (dx: number) => {
    if (barRef.current) {
      barRef.current.style.transform = `translate3d(${dx}px,0,0)`;
    }
  };
  const clearVisualShift = () => {
    if (barRef.current) {
      barRef.current.style.transform = '';
    }
  };

  const startMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;
    if (target.dataset.handle === 'resize' || target.closest('[data-role="plus"]')) return;

    setDragging('move');
    onDragChange?.(true);
    setHover(false);
    e.currentTarget.setPointerCapture(e.pointerId);

    setDragStartX(e.clientX);
    setOrigStart(task.startDate);
    setOrigEnd(task.endDate);

    originLeftPxRef.current = differenceInDays(task.startDate, projectStartDate) * dayWidth;
    widthPxRef.current = (differenceInDays(task.endDate, task.startDate) + 1) * dayWidth;

    if (barRef.current) {
      barRef.current.style.willChange = 'transform';
      (barRef.current.style as any)['userSelect'] = 'none';
    }
    e.preventDefault();
  };

  const startResizeLeft: React.PointerEventHandler<HTMLDivElement> = (e) => {
    setDragging('resize-left');
    onDragChange?.(true);
    setHover(false);
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragStartX(e.clientX);
    setOrigStart(task.startDate);
    setOrigEnd(task.endDate);
    e.preventDefault();
    e.stopPropagation();
  };

  const startResizeRight: React.PointerEventHandler<HTMLDivElement> = (e) => {
    setDragging('resize-right');
    onDragChange?.(true);
    setHover(false);
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragStartX(e.clientX);
    setOrigStart(task.startDate);
    setOrigEnd(task.endDate);
    e.preventDefault();
    e.stopPropagation();
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging) return;

    const cont = scrollContainer;
    if (cont) {
      const dx = e.clientX - dragStartX;
      const projectedLeft = originLeftPxRef.current + (dragging === 'move' ? dx : 0);
      const projectedRight = projectedLeft + widthPxRef.current;
      const viewportLeft = cont.scrollLeft;
      const viewportRight = viewportLeft + cont.clientWidth;
      const edge = 24;

      if (projectedRight > viewportRight - edge) {
        cont.scrollLeft += dayWidth;
      } else if (projectedLeft < viewportLeft + edge) {
        cont.scrollLeft -= dayWidth;
      }
    }

    const dx = e.clientX - dragStartX;
    if (dragging === 'move') {
      applyVisualShift(dx);
    } else if (dragging === 'resize-left') {
      const dDays = snapDxToDays(dx);
      const nextStart = addDays(origStart, dDays);
      const minStart = addDays(origEnd, -(MIN_DAYS - 1));
      const clampedStart = nextStart > minStart ? minStart : nextStart;
      queueUpdate({ startDate: clampedStart });
    } else if (dragging === 'resize-right') {
      const dDays = snapDxToDays(dx);
      const nextEnd = addDays(origEnd, dDays);
      const minEnd = addDays(origStart, MIN_DAYS - 1);
      const clampedEnd = nextEnd < minEnd ? minEnd : nextEnd;
      queueUpdate({ endDate: clampedEnd });
    }
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}

    if (dragging === 'move') {
      const dx = e.clientX - dragStartX;
      clearVisualShift();
      const dDays = snapDxToDays(dx);
      if (dDays !== 0) {
        const dur = differenceInDays(origEnd, origStart);
        const nextStart = addDays(origStart, dDays);
        const nextEnd = addDays(nextStart, dur);
        onTaskUpdate(task.id, { startDate: nextStart, endDate: nextEnd });
      }
    }

    setDragging(null);
    onDragChange?.(false);
  };

  const SourcePlus = ({ side }: { side: 'left' | 'right' }) => (
    <button
      type="button"
      data-role="plus"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); onStartConnect && onStartConnect(task.id); }}
      className="absolute rounded-full flex items-center justify-center shadow"
      style={{
        [side]: -(PLUS_SIZE + GAP_OUTSIDE),
        top: (BAR_H - PLUS_SIZE) / 2,
        width: PLUS_SIZE,
        height: PLUS_SIZE,
        background: '#4f8dfa',
        color: '#ffffff',
        lineHeight: 1,
        fontSize: 18,
        zIndex: 50,
        pointerEvents: 'auto',
        border: '1px solid rgba(0,0,0,.08)',
      } as React.CSSProperties}
      title="Связать отсюда"
    >+</button>
  );

  const TargetPlus = () => (
    <button
      type="button"
      data-role="plus"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); onPickTarget && onPickTarget(task.id); }}
      className="absolute rounded-full flex items-center justify-center shadow ring-1"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        top: -(PLUS_SIZE + 8),
        width: PLUS_SIZE,
        height: PLUS_SIZE,
        background: '#E5E7EB',
        color: '#030212',
        lineHeight: 1,
        fontSize: 18,
        zIndex: 60,
        pointerEvents: 'auto',
      } as React.CSSProperties}
      title="Привязать сюда"
    >+</button>
  );

  return (
    <div
      ref={hitboxRef}
      className="absolute"
      style={{
        left: left - OUT,
        width: width + OUT * 2,
        top: BAR_TOP,
        height: BAR_H,
        overflow: 'visible',
        zIndex: 2,
        pointerEvents: 'auto',
        touchAction: 'none' as any,
        userSelect: 'none' as any,
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => { setHover(false); }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div
        ref={barRef}
        className="absolute h-full rounded shadow-sm cursor-grab active:cursor-grabbing"
        style={{ left: OUT, width, top: barTopOffset, background: fill, border: '1px solid ' + stroke }}
        onPointerDown={startMove}
        title={task.name}
      >
        <div
          data-handle="resize"
          className="absolute top-0 left-0 h-full"
          style={{ width: 4, cursor: 'ew-resize' }}
          onPointerDown={startResizeLeft}
          title="Растянуть влево"
        />
        <div
          data-handle="resize"
          className="absolute top-0 right-0 h-full"
          style={{ width: 4, cursor: 'ew-resize' }}
          onPointerDown={startResizeRight}
          title="Растянуть вправо"
        />

        {hover && !dragging && !!onStartConnect && !showTargetHandles && (
          <>
            <SourcePlus side="left" />
            <SourcePlus side="right" />
          </>
        )}

        {!!showTargetHandles && !dragging && !!onPickTarget && <TargetPlus />}
      </div>
    </div>
  );
};
