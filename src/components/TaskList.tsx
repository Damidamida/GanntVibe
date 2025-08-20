import React, { useState } from 'react';
import { Task, Milestone } from '../types/gantt';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Pencil, Trash2, Diamond, MoreHorizontal, ChevronRight, ChevronDown, Plus } from 'lucide-react';

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

const formatShortDate = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  try { return date.toLocaleDateString(); } catch { return String(d); }
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
  onFocusTask,
  onCreateTask,
  onCreateSubtask,
  onToggleCollapse,
}) => {
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [addingSubParent, setAddingSubParent] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');

  const childrenOf = (id: string) => tasks.filter(t => (t as any).parentId === id);
  const hasChildren = (id: string) => childrenOf(id).length > 0;
  const roots = tasks.filter(t => !(t as any).parentId);

  return (
    <div className="text-sm">
      {/* Tasks */}
      {roots.map((t) => (
        <div key={t.id}>
          {/* Root row */}
          <div
            className="grid grid-cols-[auto,1fr,auto,auto,auto] items-center gap-2 hover:bg-accent/30 border-b"
            style={{ height: rowHeight }}
            onClick={() => onFocusTask && onFocusTask(t.id)}
          >
            {childrenOf(t.id).length > 0 ? (
<button
              className="p-1 rounded hover:bg-accent"
              onClick={(e) => { e.stopPropagation(); onToggleCollapse(t.id, !(t as any).isCollapsed); }}
              title={(t as any).isCollapsed ? 'Развернуть' : 'Свернуть'}
              aria-label="Toggle collapse"
            >
              {(t as any).isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
) : <span className="w-4 h-4" />}


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
                <button className="p-1 rounded hover:bg-accent justify-self-end" title="Действия" aria-haspopup="menu">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              {/* Меню: белый фон, тень, без скруглений */}
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="w-56 bg-white border border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.18)] rounded-none py-1 z-50"
              >
                <DropdownMenuItem
                  className="rounded-none px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => setAddingSubParent(t.id)}
                >
                  Создать подзадачу
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-none px-3 py-2 cursor-pointer hover:bg-gray-100 text-destructive"
                  onClick={() => {
                    // Подтверждение только если у задачи есть подзадачи
                    if (hasChildren(t.id)) {
                      if (confirm('Удалить задачу и все её подзадачи?')) onDeleteTask(t.id);
                    } else {
                      onDeleteTask(t.id);
                    }
                  }}
                >
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>

          {/* Children */}
          {!(t as any).isCollapsed && childrenOf(t.id).map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-[auto,1fr,auto,auto] items-center gap-2 hover:bg-accent/20 border-b relative"
              style={{ height: rowHeight, paddingLeft: '28px' }}  /* Отступ для подзадач */
              onClick={() => onFocusTask && onFocusTask(c.id)}
            >
              {/* Вертикальная направляющая слева */}
              <span className="absolute left-3 top-0 bottom-0 w-px bg-border pointer-events-none" />
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
            <div className="flex items-center gap-2 border-b relative" style={{ height: rowHeight, paddingLeft: '28px' }}>
              <span className="absolute left-3 top-0 bottom-0 w-px bg-border pointer-events-none" />
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
          {childrenOf(t.id).length > 0 && !(t as any).isCollapsed && (
            <div className="flex items-center" style={{ height: rowHeight, paddingLeft: '28px' }}>
              <Button variant="ghost" size="sm" onClick={() => setAddingSubParent(t.id)}>
                <Plus className="w-4 h-4 mr-1" /> Добавить подзадачу
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Milestones (если используются) */}
      {milestones.map((m) => (
        <div key={m.id} className="grid grid-cols-[auto,1fr] items-center gap-2 border-b" style={{ height: rowHeight }}>
          <Diamond className="w-4 h-4 ml-1" />
          <div className="text-xs text-muted-foreground truncate">{m.name}</div>
        </div>
      ))}

      {/* Add task at bottom */}
      {addingTask ? (
        <div className="flex items-center gap-2" style={{ height: rowHeight }}>
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
        <div className="flex items-center" style={{ height: rowHeight }}>
          <Button variant="ghost" onClick={() => setAddingTask(true)}>
            <Plus className="w-4 h-4 mr-1" /> Добавить задачу
          </Button>
        </div>
      )}
    </div>
  );
};
