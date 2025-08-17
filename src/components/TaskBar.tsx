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

  const onMouseDownResizeRight: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const origEnd = new Date(task.endDate);
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const days = Math.max(0, Math.round(dx / dayWidth));
      const ne = new Date(origEnd); ne.setDate(ne.getDate() + days);
      onTaskUpdate(task.id, { endDate: ne });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

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
      )}
    </div>
  );
};
