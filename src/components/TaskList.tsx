import React, { useState } from 'react';
import { Task, Milestone } from '../types/gantt';
<<<<<<< HEAD
import { Button } from './ui/button';
import { Pencil, Trash2, Diamond, GripVertical } from 'lucide-react';
=======
import { Pencil, Trash2, GripVertical, Diamond } from 'lucide-react';
>>>>>>> fb11fd0 (chore: initial commit)

interface TaskListProps {
  tasks: Task[];
  milestones: Milestone[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onReorderTasks: (newTasks: Task[]) => void;
  rowHeight: number;
<<<<<<< HEAD
}

const RU_MONTHS = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
const fmtDM = (d: Date | string) => {
  const date = (d instanceof Date) ? d : new Date(d);
  return `${date.getDate()} ${RU_MONTHS[date.getMonth()]}`;
};

=======
  onFocusTask?: (taskId: string) => void;
}

>>>>>>> fb11fd0 (chore: initial commit)
export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  milestones,
  onEditTask,
  onDeleteTask,
  onEditMilestone,
  onDeleteMilestone,
  onReorderTasks,
  rowHeight,
<<<<<<< HEAD
=======
  onFocusTask,
>>>>>>> fb11fd0 (chore: initial commit)
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

<<<<<<< HEAD
  const handleDragStart = (idx: number) => (e: React.DragEvent) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setOverIndex(idx);
  };

  const handleDrop = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) { setDragIndex(null); setOverIndex(null); return; }
    const next = [...tasks];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(idx, 0, moved);
    setDragIndex(null);
    setOverIndex(null);
    onReorderTasks(next);
  };

  const TaskRow = ({ t, i }: { t: Task; i: number }) => (
    <div
      className={`${overIndex===i ? 'bg-accent/30' : ''} flex items-center`}
      style={{ height: rowHeight }}
      draggable
      onDragStart={handleDragStart(i)}
      onDragOver={handleDragOver(i)}
      onDrop={handleDrop(i)}
    >
      <div className="px-2 text-muted-foreground flex items-center cursor-grab"><GripVertical className="h-3 w-3" /></div>
      <div className="flex-1 min-w-0 pr-2">
        <div className="font-medium leading-none truncate">{t.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">
          {t.assignee ? <span className="mr-1">{t.assignee} •</span> : null}
          <span>{fmtDM(t.startDate)} — {fmtDM(t.endDate)}</span>
        </div>
      </div>
      <div className="px-2 flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => onEditTask(t)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => onDeleteTask(t.id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
=======
  const startDragRow = (idx: number) => (e: React.DragEvent<HTMLDivElement>) => {
    setDragIndex(idx);
    try { e.dataTransfer.setData('text/plain', String(idx)); } catch {}
    e.dataTransfer.effectAllowed = 'move';
  };
  const overRow = (idx: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOverIndex(idx);
  };
  const dropRow = (idx: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    const arr = [...tasks];
    const [moved] = arr.splice(dragIndex, 1);
    arr.splice(idx, 0, moved);
    onReorderTasks(arr);
    setDragIndex(null);
    setOverIndex(null);
  };
  const endDrag = () => { setDragIndex(null); setOverIndex(null); };

  const Row: React.FC<{t: Task; i: number}> = ({ t, i }) => (
    <div
      className={"border-b " + (overIndex === i ? 'bg-accent/40' : '')}
      draggable
      onDragStart={startDragRow(i)}
      onDragOver={overRow(i)}
      onDrop={dropRow(i)}
      onDragEnd={endDrag}
      style={{ height: rowHeight }}
    >
      <div
        className="flex items-center gap-2 px-3 h-full cursor-pointer hover:bg-accent/30 transition-colors"
        role="button"
        tabIndex={0}
        onClick={() => onFocusTask && onFocusTask(t.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onFocusTask && onFocusTask(t.id);
          }
        }}
        title="Кликните, чтобы перейти к задаче на таймлайне"
      >
        <div className="p-1 rounded hover:bg-accent shrink-0 cursor-grab active:cursor-grabbing" title="Перетащить задачу">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="text-sm font-medium leading-none truncate">{t.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {t.assignee ? t.assignee + ' • ' : ''}
            {formatShortDate(t.startDate)} — {formatShortDate(t.endDate)}
          </div>
        </div>

        <button
          className="p-1 rounded hover:bg-accent"
          onClick={(e) => { e.stopPropagation(); onEditTask(t); }}
          title="Редактировать"
          type="button"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          className="p-1 rounded hover:bg-accent text-destructive"
          onClick={(e) => { e.stopPropagation(); onDeleteTask(t.id); }}
          title="Удалить"
          type="button"
        >
          <Trash2 className="w-4 h-4" />
        </button>
>>>>>>> fb11fd0 (chore: initial commit)
      </div>
    </div>
  );

<<<<<<< HEAD
  const MilestoneRow = ({ m }: { m: Milestone }) => (
    <div className="flex items-center" style={{ height: rowHeight }}>
      <div className="px-2 text-muted-foreground flex items-center"><Diamond className="h-3 w-3" /></div>
      <div className="flex-1 min-w-0 pr-2">
        <div className="font-medium leading-none truncate">{m.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">
          <span>{fmtDM(m.date)}</span>
        </div>
      </div>
      <div className="px-2 flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => onEditMilestone(m)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => onDeleteMilestone(m.id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
=======
  const MilestoneRow: React.FC<{m: Milestone}> = ({ m }) => (
    <div className="border-b" style={{ height: rowHeight }}>
      <div className="flex items-center gap-2 px-3 h-full">
        <Diamond className="w-4 h-4 text-purple-500 shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-medium leading-none">{m.name}</div>
          <div className="text-xs text-muted-foreground">
            {formatShortDate(m.date)}
          </div>
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
>>>>>>> fb11fd0 (chore: initial commit)
      </div>
    </div>
  );

  return (
    <div className="text-sm select-none">
      {tasks.map((t, i) => (
<<<<<<< HEAD
        <TaskRow key={t.id} t={t} i={i} />
=======
        <Row key={t.id} t={t} i={i} />
>>>>>>> fb11fd0 (chore: initial commit)
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
<<<<<<< HEAD
=======

function formatShortDate(d: Date) {
  try {
    const dt = (d instanceof Date) ? d : new Date(d);
    return dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}
>>>>>>> fb11fd0 (chore: initial commit)
