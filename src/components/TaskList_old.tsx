import React, { useState } from 'react';
import { Task, Milestone } from '../types/gantt';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

import { Pencil, Trash2, GripVertical, Diamond, MoreHorizontal, ChevronRight, ChevronDown, Plus } from 'lucide-react';

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
  onCreateTask: (name: string) => void;
  onCreateSubtask: (parentId: string, name: string) => void;
  onToggleCollapse: (taskId: string, next: boolean) => void;
}

/** Simple short date formatter to avoid import issues */
const formatShortDate = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  try {
    return date.toLocaleDateString();
  } catch {
    return String(d);
  }
};

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
  onCreateTask,
  onCreateSubtask,
  onToggleCollapse,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [addingSubParent, setAddingSubParent] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');

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
  const childrenOf = (id: string) => tasks.filter(t => (t as any).parentId === id);
  const hasChildren = (id: string) => childrenOf(id).length > 0;
  const roots = tasks.filter(t => !(t as any).parentId);


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
    <div className="text-sm">
      {/* Tasks */}
      {roots.map((t, i) => (
        <div key={t.id}>
          <div
            className="grid grid-cols-[auto,1fr,auto,auto,auto] items-center gap-2 hover:bg-accent/30 border-b"
            style={{ height: rowHeight }}
            onClick={() => onFocusTask && onFocusTask(t.id)}
          >
            <button
              className="p-1 rounded hover:bg-accent"
              onClick={(e) => { e.stopPropagation(); onToggleCollapse(t.id, !(t as any).isCollapsed); }}
              title={(t as any).isCollapsed ? 'Развернуть' : 'Свернуть'}
            >
              {(t as any).isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="min-w-0 py-1">
              <div className="text-sm font-medium leading-none truncate">{t.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {t.assignee ? t.assignee + " • " : ""}{formatShortDate(t.startDate)} — {formatShortDate(t.endDate)}
              </div>
            </div>

            {hasChildren(t.id) && (
              <Badge variant="secondary" className="justify-self-end">{childrenOf(t.id).length}</Badge>
            )}

            <span
              className="p-1 rounded hover:bg-accent justify-self-end"
              onClick={(e) => { e.stopPropagation(); onEditTask(t); }}
              title="Редактировать"
            >
              <Pencil className="w-4 h-4" />
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-accent justify-self-end" title="Действия">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setAddingSubParent(t.id)}>
                  Создать подзадачу
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { if (confirm('Удалить задачу и все её подзадачи?')) onDeleteTask(t.id); }} className="text-destructive">
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>

          {/* Children */}
          {!(t as any).isCollapsed && childrenOf(t.id).map((c) => (
            <div key={c.id}
              className="grid grid-cols-[auto,1fr,auto,auto] items-center gap-2 pl-6 hover:bg-accent/20 border-b"
              style={{ height: rowHeight }}
              onClick={() => onFocusTask && onFocusTask(c.id)}
            >
              <div />
              <div className="min-w-0 py-1">
                <div className="text-sm leading-none truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {c.assignee ? c.assignee + " • " : ""}{formatShortDate(c.startDate)} — {formatShortDate(c.endDate)}
                </div>
              </div>
              <span
                className="p-1 rounded hover:bg-accent justify-self-end"
                onClick={(e) => { e.stopPropagation(); onEditTask(c); }}
                title="Редактировать"
              >
                <Pencil className="w-4 h-4" />
              </span>
              <span
                className="p-1 rounded hover:bg-accent text-destructive justify-self-end"
                onClick={(e) => { e.stopPropagation(); onDeleteTask(c.id); }}
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </span>
            </div>
          ))}

          {/* Add subtask inline */}
          {addingSubParent === t.id && !(t as any).isCollapsed && (
            <div className="flex items-center gap-2 pl-6 border-b" style={{ height: rowHeight }}>
              <Input
                autoFocus
                placeholder="Название подзадачи"
                value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newSubName.trim()) {
                    onCreateSubtask(t.id, newSubName.trim());
                    setNewSubName(''); setAddingSubParent(null);
                  }
                  if (e.key === 'Escape') { setNewSubName(''); setAddingSubParent(null); }
                }}
              />
              <Button
                onClick={() => { if (newSubName.trim()) { onCreateSubtask(t.id, newSubName.trim()); setNewSubName(''); setAddingSubParent(null); } }}
              >
                Добавить
              </Button>
            </div>
          )}

          {/* Quick add subtask button */}
          {!(t as any).isCollapsed && (
            <div className="pl-6 py-1">
              <Button variant="ghost" size="sm" onClick={() => setAddingSubParent(t.id)}>
                <Plus className="w-4 h-4 mr-1" /> Добавить подзадачу
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Milestones */}
      {milestones.map((m) => (
        <div key={m.id} className="grid grid-cols-[auto,1fr] items-center gap-2 border-b" style={{ height: rowHeight }}>
          <Diamond className="w-4 h-4 ml-1" />
          <div className="text-xs text-muted-foreground truncate">{m.name}</div>
        </div>
      ))}

      {/* Add task at bottom */}
      <div className="py-2">
        {addingTask ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              placeholder="Название задачи"
              value={newTaskName}
              onChange={e => setNewTaskName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newTaskName.trim()) { onCreateTask(newTaskName.trim()); setNewTaskName(''); setAddingTask(false); }
                if (e.key === 'Escape') { setNewTaskName(''); setAddingTask(false); }
              }}
            />
            <Button onClick={() => { if (newTaskName.trim()) { onCreateTask(newTaskName.trim()); setNewTaskName(''); setAddingTask(false); } }}>
              Добавить
            </Button>
          </div>
        ) : (
          <Button variant="ghost" onClick={() => setAddingTask(true)}>
            <Plus className="w-4 h-4 mr-1" /> Добавить задачу
          </Button>
        )}
      </div>
    </div>
  );
};