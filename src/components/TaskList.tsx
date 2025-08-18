import React, { useState } from 'react';
import { Task, Milestone } from '../types/gantt';
import { Pencil, Trash2, GripVertical, Diamond } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  milestones: Milestone[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onReorderTasks: (newTasks: Task[]) => void;
  rowHeight: number;
  onFocusTask?: (taskId: string) => void;
}

/**
 * Разделяет зоны:
 * - перетаскивание задач — ТОЛЬКО за левую "ручку" (GripVertical);
 * - клик по остальной части строки — фокусирует задачу на таймлайне;
 * - зона дропа — вся строка;
 * - никаких визуальных границ.
 */
export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  milestones,
  onEditTask,
  onDeleteTask,
  onEditMilestone,
  onDeleteMilestone,
  onReorderTasks,
  rowHeight,
  onFocusTask,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // Запуск DnD — только с "ручки"
  const startDragHandle = (idx: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    try { e.dataTransfer.setData('text/plain', String(idx)); } catch {}
    e.dataTransfer.effectAllowed = 'move';
    setDragIndex(idx);
  };

  // Подсветка строки как зоны дропа
  const overRow = (idx: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIndex(idx);
  };
  const leaveRow = () => setOverIndex(null);

  const dropRow = (idx: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const raw = (dragIndex !== null) ? String(dragIndex) : (e.dataTransfer.getData('text/plain') || '');
    const from = parseInt(raw, 10);
    if (Number.isNaN(from) || from === idx) { setDragIndex(null); setOverIndex(null); return; }
    const arr = [...tasks];
    const [moved] = arr.splice(from, 1);
    arr.splice(idx, 0, moved);
    onReorderTasks(arr);
    setDragIndex(null);
    setOverIndex(null);
  };
  const endDrag = () => { setDragIndex(null); setOverIndex(null); };

  const Row: React.FC<{t: Task; i: number}> = ({ t, i }) => (
    <div
      className={"border-b " + (overIndex === i ? "bg-accent/40" : "")}
      onDragOver={overRow(i)}
      onDragEnter={overRow(i)}
      onDragLeave={leaveRow}
      onDrop={dropRow(i)}
      style={{ height: rowHeight }}
      role="listitem"
    >
      <div className="flex items-stretch gap-2 px-2 h-full select-none">
        {/* Ручка перетаскивания — единственная draggable-область */}
        <div
          className="w-7 shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing rounded hover:bg-accent"
          title="Перетащить задачу"
          draggable
          onDragStart={startDragHandle(i)}
          onDragEnd={endDrag}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Кликабельная область задачи */}
        <button
          className="flex-1 grid grid-cols-[1fr_auto_auto] items-center gap-2 pr-2 text-left hover:bg-accent/30 rounded transition-colors"
          onClick={() => onFocusTask && onFocusTask(t.id)}
          type="button"
          title="Кликните, чтобы перейти к задаче на таймлайне"
        >
          <div className="min-w-0 py-1">
            <div className="text-sm font-medium leading-none truncate">{t.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {t.assignee ? t.assignee + " • " : ""}
              {formatShortDate(t.startDate)} — {formatShortDate(t.endDate)}
            </div>
          </div>

          <span
            className="p-1 rounded hover:bg-accent justify-self-end"
            onClick={(e) => { e.stopPropagation(); onEditTask(t); }}
            title="Редактировать"
          >
            <Pencil className="w-4 h-4" />
          </span>

          <span
            className="p-1 rounded hover:bg-accent text-destructive justify-self-end"
            onClick={(e) => { e.stopPropagation(); onDeleteTask(t.id); }}
            title="Удалить"
          >
            <Trash2 className="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>
  );

  const MilestoneRow: React.FC<{m: Milestone}> = ({ m }) => (
    <div className="border-b" style={{ height: rowHeight }}>
      <div className="flex items-center gap-2 px-3 h-full">
        <Diamond className="w-4 h-4 text-purple-500 shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-medium leading-none">{m.name}</div>
          <div className="text-xs text-muted-foreground">{formatShortDate(m.date)}</div>
        </div>
        <button
          className="p-1 rounded hover:bg-accent"
          onClick={(e) => { e.stopPropagation(); onEditMilestone(m); }}
          title="Редактировать"
          type="button"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          className="p-1 rounded hover:bg-accent text-destructive"
          onClick={(e) => { e.stopPropagation(); onDeleteMilestone(m.id); }}
          title="Удалить"
          type="button"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="text-sm select-none">
      {tasks.map((t, i) => (
        <Row key={t.id} t={t} i={i} />
      ))}

      {milestones.length > 0 && (
        <div className="mt-2 mb-1 px-3 text-xs text-muted-foreground">Майлстоуны</div>
      )}
      {milestones.map((m) => (
        <MilestoneRow key={m.id} m={m} />
      ))}
    </div>
  );
};

function formatShortDate(d: Date) {
  try {
    const dt = (d instanceof Date) ? d : new Date(d);
    return dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}
