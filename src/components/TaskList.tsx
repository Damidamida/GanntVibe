import React, { useState } from 'react';
import { Task, Milestone } from '../types/gantt';
import { Button } from './ui/button';
import { Pencil, Trash2, Diamond, GripVertical } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  milestones: Milestone[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onReorderTasks: (newTasks: Task[]) => void;
  rowHeight: number;
}

const RU_MONTHS = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
const fmtDM = (d: Date | string) => {
  const date = (d instanceof Date) ? d : new Date(d);
  return `${date.getDate()} ${RU_MONTHS[date.getMonth()]}`;
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  milestones,
  onEditTask,
  onDeleteTask,
  onEditMilestone,
  onDeleteMilestone,
  onReorderTasks,
  rowHeight,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

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
      </div>
    </div>
  );

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
      </div>
    </div>
  );

  return (
    <div className="text-sm select-none">
      {tasks.map((t, i) => (
        <TaskRow key={t.id} t={t} i={i} />
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
