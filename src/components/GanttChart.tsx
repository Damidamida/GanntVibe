import React, { useMemo, useState } from 'react';
import { Project, Task, Milestone, TaskDependency, TimelineUnit } from '../types/gantt';
import { Timeline } from './Timeline';
import { TaskBar } from './TaskBar';
import { TaskList } from './TaskList';
import { TaskDependencyLine } from './TaskDependencyLine';
import { addDays, differenceInDays } from '../utils/dateUtils';

interface Props { onEditTask?: (t: Task) => void; onEditMilestone?: (m: Milestone) => void;
  
  project: Project;
  onUpdateProject: (project: Project) => void;
  unit: TimelineUnit;
}

const ROW_HEIGHT = 40;

export const GanttChart: React.FC<Props> = ({ project, onUpdateProject, unit, onEditTask, onEditMilestone }) => {
  const [listWidth, setListWidth] = useState<number>(() => {
    const v = localStorage.getItem('listWidth');
    return v ? Number(v) : 320;
  });
  const [resizing, setResizing] = useState(false);

  const onDragStartDivider: React.MouseEventHandler<HTMLDivElement> = (e) => {
    setResizing(true);
    const startX = e.clientX;
    const startW = listWidth;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const next = Math.min(640, Math.max(220, startW + dx));
      setListWidth(next);
    };
    const onUp = () => {
      setResizing(false);
      localStorage.setItem('listWidth', String(listWidth));
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const [connectingFrom, setConnectingFrom] = useState<{id: string, side: 'left'|'right'} | null>(null);

  // bounds extended to Dec 31, 2030
  const capEnd = new Date(2030, 11, 31);
  const bounds = useMemo(() => {
    const allDates: Date[] = [];
    project.tasks.forEach(t => { allDates.push(t.startDate, t.endDate); });
    project.milestones.forEach(m => allDates.push(m.date));
    let start: Date; let end: Date;
    if (allDates.length === 0) {
      const today = new Date();
      start = addDays(today, -60); end = addDays(today, 30);
    } else {
      const min = new Date(Math.min(...allDates.map(d => d.getTime())));
      const max = new Date(Math.max(...allDates.map(d => d.getTime())));
      start = addDays(min, -60); end = addDays(max, 7);
    }
    if (end < capEnd) end = capEnd;
    return { start, end };
  }, [project.tasks, project.milestones]);

  // scale: month view widened by 1.5x for readability
  const baseDayWidth = unit === 'day' ? 24 : unit === 'week' ? 4 : 1.2;
  const dayWidth = unit === 'month' ? baseDayWidth * 1.5 : baseDayWidth;

  const taskIndex = new Map(project.tasks.map((t, i) => [t.id, i]));

  const onTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    const tasks = project.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    onUpdateProject({ ...project, tasks });
  };

  const onReorderTasks = (tasks: Task[]) => {
    onUpdateProject({ ...project, tasks });
  };

  const addDependency = (fromId: string, toId: string) => {
    if (fromId === toId) return;

    // do not duplicate the exact same edge
    const exists = project.dependencies.some(d => d.fromId === fromId && d.toId === toId);
    if (exists) return;

    const dep: TaskDependency = { id: String(Date.now()), fromId, toId, type: 'fs' };

    // Enforce: target task cannot start before source finishes
    const fromTask = project.tasks.find(t => t.id === fromId);
    const toIdx = project.tasks.findIndex(t => t.id === toId);
    let tasks = project.tasks;
    if (fromTask && toIdx >= 0) {
      const target = project.tasks[toIdx];
      if (target.startDate.getTime() < fromTask.endDate.getTime()) {
        const newStart = new Date(fromTask.endDate);
        const newEnd = (target.endDate.getTime() < newStart.getTime()) ? newStart : target.endDate;
        const updated = { ...target, startDate: newStart, endDate: newEnd };
        tasks = project.tasks.map((t, i) => (i === toIdx ? updated : t));
      }
    }

    onUpdateProject({ ...project, tasks, dependencies: [...project.dependencies, dep] });
  };
    onUpdateProject({ ...project, dependencies: [...project.dependencies, dep] });
  };

  const items = useMemo(() => {
    const ms = [...project.milestones].sort((a, b) => a.date.getTime() - b.date.getTime());
    return { tasks: project.tasks, milestones: ms };
  }, [project.tasks, project.milestones]);

  // header height: two rows always
  const HEADER_HEIGHT = 49;

  return (
    <div className="h-full w-full flex">
      <div className="border-r overflow-auto" style={{ width: listWidth }}>
        <div style={{ height: HEADER_HEIGHT }} />
        <TaskList
          tasks={items.tasks}
          milestones={items.milestones}
          onEditTask={onEditTask ?? (() => {})}
          onDeleteTask={(id) => onUpdateProject({ ...project, tasks: project.tasks.filter(t => t.id !== id) })}
          onEditMilestone={onEditMilestone ?? (() => {})}
          onDeleteMilestone={(id) => onUpdateProject({ ...project, milestones: project.milestones.filter(m => m.id !== id) })}
          onReorderTasks={onReorderTasks}
          rowHeight={40}
        />
      </div>
      <div
        className={`w-1 cursor-col-resize bg-transparent hover:bg-primary/30${resizing ? ' bg-primary/50' : ''}`}
        onMouseDown={onDragStartDivider}
        title="Потяни, чтобы изменить ширину"
      />

      <div className="flex-1 overflow-auto relative">
        <div style={{ width: (differenceInDays(bounds.end, bounds.start) + 1) * dayWidth }}>
          <Timeline startDate={bounds.start} endDate={bounds.end} dayWidth={dayWidth} unit={unit} />

          {project.dependencies.map((d) => {
            const from = project.tasks.find(t => t.id === d.fromId);
            const to = project.tasks.find(t => t.id === d.toId);
            if (!from || !to) return null;
            const fromIdx = taskIndex.get(from.id) ?? 0;
            const toIdx = taskIndex.get(to.id) ?? 0;
            return (
              <TaskDependencyLine
                key={d.id}
                dependency={d}
                fromTask={from}
                toTask={to}
                projectStartDate={bounds.start}
                dayWidth={dayWidth}
                fromIndex={fromIdx}
                toIndex={toIdx}
                rowHeight={40}
                headerOffset={HEADER_HEIGHT}
              />
            );
          })}
{project.tasks.map((t) => (
            <div key={t.id} className="relative" style={{ height: 40 }}>
              <TaskBar
                task={t}
                projectStartDate={bounds.start}
                dayWidth={dayWidth}
                rowHeight={40}
                onTaskUpdate={onTaskUpdate}
                showTargetHandles={!!connectingFrom && connectingFrom.id !== t.id}
                onStartConnect={(id) => setConnectingFrom({ id, side: 'right' })}
                onPickTarget={(id) => { if (connectingFrom) { addDependency(connectingFrom.id, id); setConnectingFrom(null); } }}
              />
            </div>
          ))}

          {project.milestones.map((m) => {
            const x = differenceInDays(m.date, bounds.start) * dayWidth;
            return (
              <div key={m.id} className="absolute" style={{ left: x, top: HEADER_HEIGHT + 6, width: 2, bottom: 0, background: m.color || '#f59e0b' }} />
            );
          })}
        </div>
      </div>
    </div>
  );
};
