import React, { useState } from 'react';
import { Task } from '../types/gantt';
import { differenceInDays } from '../utils/dateUtils';

interface TaskBarProps {
  task: Task;
  projectStartDate: Date;
  dayWidth: number;
  rowHeight: number;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  showTargetHandles: boolean;
  onStartConnect: (taskId: string, side: 'left' | 'right') => void;
  onPickTarget: (taskId: string) => void;
}

<<<<<<< HEAD
export const TaskBar: React.FC<TaskBarProps> = ({
  task, projectStartDate, dayWidth, rowHeight, onTaskUpdate,
  showTargetHandles, onStartConnect, onPickTarget
}) => {
  const [hover, setHover] = useState(false);

  const startOffset = differenceInDays(task.startDate, projectStartDate);
  const duration = Math.max(1, differenceInDays(task.endDate, task.startDate));
  const left = startOffset * dayWidth;
  const width = duration * dayWidth;
  const height = Math.max(8, rowHeight * 0.55);
  const V_OFFSET = -2;
  const top = (rowHeight - height) / 2 + V_OFFSET;

  const onMouseDownMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const startX = e.clientX;
    const origStart = new Date(task.startDate);
    const origEnd = new Date(task.endDate);
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const days = Math.round(dx / dayWidth);
      if (days !== 0) {
        const ns = new Date(origStart); ns.setDate(ns.getDate() + days);
        const ne = new Date(origEnd);   ne.setDate(ne.getDate() + days);
=======
// Размеры и отступы
const PLUS_SIZE = 24;       // 1.5x больше обычного (~16px)
const PLUS_GAP = 5;         // 5px от края бара
const RESIZE_WIDTH = 6;     // ручки ресайза строго на гранях бара
const HIT_PAD = PLUS_SIZE + PLUS_GAP; // расширяем зону hover, чтобы + не исчезал

export const TaskBar: React.FC<TaskBarProps> = ({
  task,
  projectStartDate,
  dayWidth,
  rowHeight,
  onTaskUpdate,
  showTargetHandles,
  onStartConnect,
  onPickTarget,
}) => {
  const [hover, setHover] = useState(false);

  const barHeight = Math.max(18, Math.round(rowHeight * 0.6));
  const top = Math.round((rowHeight - barHeight) / 2);

  const barLeft = differenceInDays(task.startDate, projectStartDate) * dayWidth;
  const barWidth = (differenceInDays(task.endDate, task.startDate) + 1) * dayWidth;

  // ---- Move whole bar ----
  const onMouseDownMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const initStart = task.startDate;
    const initEnd = task.endDate;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dDays = Math.round(dx / dayWidth);
      if (dDays !== 0) {
        const ns = new Date(initStart);
        ns.setDate(ns.getDate() + dDays);
        const ne = new Date(initEnd);
        ne.setDate(ne.getDate() + dDays);
>>>>>>> fb11fd0 (chore: initial commit)
        onTaskUpdate(task.id, { startDate: ns, endDate: ne });
      }
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

<<<<<<< HEAD
  const onMouseDownResizeRight: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const origEnd = new Date(task.endDate);
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const days = Math.max(0, Math.round(dx / dayWidth));
      const ne = new Date(origEnd); ne.setDate(ne.getDate() + days);
=======
  // ---- Resize left ----
  const onMouseDownResizeLeft: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const initStart = task.startDate;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dDays = Math.round(dx / dayWidth);
      const ns = new Date(initStart);
      ns.setDate(ns.getDate() + dDays);
      // минимум 1 день длительности
      if (ns > task.endDate) return;
      onTaskUpdate(task.id, { startDate: ns });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ---- Resize right ----
  const onMouseDownResizeRight: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const initEnd = task.endDate;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dDays = Math.round(dx / dayWidth);
      const ne = new Date(initEnd);
      ne.setDate(ne.getDate() + dDays);
      if (ne < task.startDate) return;
>>>>>>> fb11fd0 (chore: initial commit)
      onTaskUpdate(task.id, { endDate: ne });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

<<<<<<< HEAD
  const onMouseDownResizeLeft: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const origStart = new Date(task.startDate);
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const days = Math.round(dx / dayWidth);
      const ns = new Date(origStart); ns.setDate(ns.getDate() + days);
      if (ns <= task.endDate) {
        onTaskUpdate(task.id, { startDate: ns });
      }
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div
      className="absolute rounded select-none flex items-center"
      style={{ left, top, width, height, backgroundColor: task.color }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={onMouseDownMove}
    >
      <div onMouseDown={onMouseDownResizeLeft} className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-black/20" />
      <div onMouseDown={onMouseDownResizeRight} className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-black/20" />

      {(hover && !showTargetHandles) && (
        <>
          <button
            className="absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs leading-5"
            onClick={(e) => { e.stopPropagation(); onStartConnect(task.id, 'left'); }}
          >+</button>
          <button
            className="absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs leading-5"
            onClick={(e) => { e.stopPropagation(); onStartConnect(task.id, 'right'); }}
          >+</button>
        </>
      )}

      {showTargetHandles && (
        <button
          className="absolute left-1/2 -translate-x-1/2 -top-3 h-5 px-2 rounded-full bg-secondary text-secondary-foreground text-xs"
          onClick={(e) => { e.stopPropagation(); onPickTarget(task.id); }}
          title="Соединить сюда"
        >+</button>
=======
  return (
    // ОБЁРТКА: расширяем на ширину плюсов, чтобы hover не пропадал
    <div
      className="absolute"
      style={{
        left: barLeft - HIT_PAD,
        top,
        width: barWidth + HIT_PAD * 2,
        height: barHeight,
        overflow: 'visible',
        zIndex: hover ? 5 : 1,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Сам бар */}
      <div
        className="absolute rounded select-none shadow-sm"
        style={{
          left: HIT_PAD,
          top: 0,
          width: barWidth,
          height: barHeight,
          backgroundColor: task.color,
        }}
        onMouseDown={onMouseDownMove}
        role="presentation"
      >
        {/* Ручки ресайза прямо на гранях бара */}
        <div
          onMouseDown={onMouseDownResizeLeft}
          className="absolute top-0 bottom-0 cursor-ew-resize bg-black/20"
          style={{ left: 0, width: RESIZE_WIDTH }}
          title="Сдвинуть начало"
        />
        <div
          onMouseDown={onMouseDownResizeRight}
          className="absolute top-0 bottom-0 cursor-ew-resize bg-black/20"
          style={{ right: 0, width: RESIZE_WIDTH }}
          title="Сдвинуть конец"
        />
      </div>

      {/* Плюсы — внутри обёртки, но визуально вне бара (на 5px) */}
      {hover && !showTargetHandles && (
        <>
          <button
            type="button"
            className="absolute flex items-center justify-center rounded-full"
            style={{
              left: HIT_PAD - (PLUS_GAP + PLUS_SIZE),
              top: '50%',
              width: PLUS_SIZE,
              height: PLUS_SIZE,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(59,130,246,1)',
              color: 'white',
            }}
            onClick={(e) => { e.stopPropagation(); onStartConnect(task.id, 'left'); }}
            title="Создать зависимость (из этой задачи)"
          >
            +
          </button>

          <button
            type="button"
            className="absolute flex items-center justify-center rounded-full"
            style={{
              left: HIT_PAD + barWidth + PLUS_GAP,
              top: '50%',
              width: PLUS_SIZE,
              height: PLUS_SIZE,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(59,130,246,1)',
              color: 'white',
            }}
            onClick={(e) => { e.stopPropagation(); onStartConnect(task.id, 'right'); }}
            title="Создать зависимость (из этой задачи)"
          >
            +
          </button>
        </>
      )}

      {/* Во время выбора цели показываем маркер над целевой колбаской */}
      {showTargetHandles && (
        <button
          type="button"
          className="absolute flex items-center justify-center rounded-full bg-gray-200 text-gray-700"
          style={{
            left: HIT_PAD + barWidth / 2,
            top: -PLUS_SIZE - 6,
            transform: 'translateX(-50%)',
            width: PLUS_SIZE,
            height: PLUS_SIZE,
          }}
          onClick={(e) => { e.stopPropagation(); onPickTarget(task.id); }}
          title="Соединить сюда"
        >
          +
        </button>
>>>>>>> fb11fd0 (chore: initial commit)
      )}
    </div>
  );
};
