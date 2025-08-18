<<<<<<< HEAD
import React, { useMemo, useState } from 'react';
=======
import React, { useMemo, useState, useRef, useEffect } from 'react';
>>>>>>> fb11fd0 (chore: initial commit)
import { Project, Task, Milestone, TaskDependency, TimelineUnit } from '../types/gantt';
import { Timeline } from './Timeline';
import { TaskBar } from './TaskBar';
import { TaskList } from './TaskList';
import { TaskDependencyLine } from './TaskDependencyLine';
import { addDays, differenceInDays } from '../utils/dateUtils';

<<<<<<< HEAD
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
=======
interface Props {
  project: Project;
  onUpdateProject: (project: Project) => void;
  unit: TimelineUnit;
  onEditTask?: (t: Task) => void;
  onEditMilestone?: (m: Milestone) => void;
}

const ROW_HEIGHT = 32;
const DAY_WIDTHS: Record<TimelineUnit, number> = { day: 24, week: 12, month: 4 };
const HEADER_HEIGHT = 49;

export const GanttChart: React.FC<Props> = ({
  project,
  onUpdateProject,
  unit,
  onEditTask,
  onEditMilestone,
}) => {
  const [listWidth, setListWidth] = useState<number>(360);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [selectedDepId, setSelectedDepId] = useState<string | null>(null);

  const dayWidth = DAY_WIDTHS[unit];

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const barsRef = useRef<HTMLDivElement | null>(null);

  const { start, end, totalDays } = useMemo(() => {
    const tasks = project.tasks || [];
    const milestones = project.milestones || [];

    const today = new Date();
    let minStart: Date | null = null;
    let maxEnd: Date | null = null;

    for (const t of tasks) {
      if (!minStart || t.startDate < minStart) minStart = t.startDate;
      if (!maxEnd || t.endDate > maxEnd) maxEnd = t.endDate;
    }
    for (const m of milestones) {
      if (!minStart || m.date < minStart) minStart = m.date;
      if (!maxEnd || m.date > maxEnd) maxEnd = m.date;
    }

    let s: Date;
    let e: Date;
    if (!minStart || !maxEnd) {
      s = addDays(today, -60);
      e = addDays(today, 30);
    } else {
      s = addDays(minStart, -60);
      e = addDays(maxEnd, 7);
    }

    const capEnd = new Date(2030, 11, 31);
    if (e < capEnd) e = capEnd;

    const days = Math.max(1, differenceInDays(e, s));
    return { start: s, end: e, totalDays: days };
  }, [project.tasks, project.milestones]);

  const contentWidth = totalDays * dayWidth;

  const onTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    const tasks = project.tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t));
    onUpdateProject({ ...project, tasks });
  };

  // Зависимости: запрет петель и дубликатов, сдвиг цели без изменения длительности
  const addDependency = (fromId: string, toId: string) => {
    if (fromId === toId) return;

    const deps = project.dependencies || [];
    if (deps.some(d => d.fromId === toId && d.toId === fromId)) return; // loop
    if (deps.some(d => d.fromId === fromId && d.toId === toId)) return; // duplicate

    let tasks = project.tasks;
    const from = project.tasks.find(t => t.id === fromId);
    const idx = project.tasks.findIndex(t => t.id === toId);

    if (from && idx >= 0) {
      const tgt = project.tasks[idx];
      if (tgt.startDate.getTime() < from.endDate.getTime()) {
        const delta = from.endDate.getTime() - tgt.startDate.getTime();
        const newStart = new Date(tgt.startDate.getTime() + delta);
        const newEnd = new Date(tgt.endDate.getTime() + delta);
        const updated = { ...tgt, startDate: newStart, endDate: newEnd };
        tasks = tasks.map((t, i) => (i === idx ? updated : t));
      }
    }

    const dep: TaskDependency = { id: String(Date.now()), fromId, toId, type: 'fs' };
    onUpdateProject({ ...project, tasks, dependencies: [...deps, dep] });
  };

  const beginConnect = (taskId: string) => setConnectingFrom(taskId);
  const pickTarget = (taskId: string) => {
    if (connectingFrom) addDependency(connectingFrom, taskId);
    setConnectingFrom(null);
  };

  const idToIndex: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    project.tasks.forEach((t, i) => { map[t.id] = i; });
    return map;
  }, [project.tasks]);

  // Центровка бара по клику на задачу слева
  const focusTask = (taskId: string) => {
    const container = scrollRef.current;
    const barsEl = barsRef.current;
    if (!container || !barsEl) return;

    const idx = idToIndex[taskId];
    const task = project.tasks.find(t => t.id === taskId);
    if (idx === undefined || idx === null || !task) return;

    // Горизонталь
    const left = differenceInDays(task.startDate, start) * dayWidth;
    const width = (differenceInDays(task.endDate, task.startDate) + 1) * dayWidth;
    const centerX = left + width / 2;
    const targetLeft = Math.max(0, centerX - container.clientWidth / 2);

    // Вертикаль
    const contRect = container.getBoundingClientRect();
    const barsRect = barsEl.getBoundingClientRect();
    const barsTop = (barsRect.top - contRect.top) + container.scrollTop;
    const centerY = barsTop + idx * ROW_HEIGHT + ROW_HEIGHT / 2;
    const targetTop = Math.max(0, centerY - container.clientHeight / 2);

    try {
      container.scrollTo({ left: targetLeft, top: targetTop, behavior: 'smooth' });
    } catch {
      container.scrollLeft = targetLeft;
      container.scrollTop = targetTop;
    }
  };

  // Удаление выбранной зависимости по Delete/Backspace
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedDepId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const deps = (project.dependencies || []).filter(d => d.id !== selectedDepId);
        onUpdateProject({ ...project, dependencies: deps });
        setSelectedDepId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedDepId, project, onUpdateProject]);

  const onResizeMouseDown: React.MouseEventHandler<HTMLDivElement> = e => {
    const startX = e.clientX;
    const startW = listWidth;
    const onMove = (ev: MouseEvent) => {
      const next = Math.max(220, Math.min(700, startW + (ev.clientX - startX)));
      setListWidth(next);
    };
    const onUp = () => {
>>>>>>> fb11fd0 (chore: initial commit)
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

<<<<<<< HEAD
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
=======
  return (
    <div className="h-full w-full flex">
      {/* Левая панель */}
      <div className="border-r overflow-auto" style={{ width: listWidth }}>
        <div style={{ height: HEADER_HEIGHT }} />
        <TaskList
          tasks={project.tasks}
          milestones={project.milestones}
          onEditTask={onEditTask ?? (() => {})}
          onEditMilestone={onEditMilestone ?? (() => {})}
          onDeleteTask={id =>
            onUpdateProject({ ...project, tasks: project.tasks.filter(t => t.id !== id) })
          }
          onDeleteMilestone={id =>
            onUpdateProject({ ...project, milestones: project.milestones.filter(m => m.id !== id) })
          }
          onReorderTasks={newTasks => onUpdateProject({ ...project, tasks: newTasks })}
          rowHeight={ROW_HEIGHT}
          onFocusTask={focusTask}
        />
      </div>

      {/* Ресайзер */}
      <div
        className="w-1 cursor-col-resize bg-muted/40 hover:bg-muted/60"
        onMouseDown={onResizeMouseDown}
      />

      {/* Правая часть */}
      <div className="flex-1 overflow-auto" ref={scrollRef}>
        <div style={{ minWidth: contentWidth }}>
          <Timeline startDate={start} endDate={end} dayWidth={dayWidth} unit={unit} />

          <div className="relative" style={{ height: project.tasks.length * ROW_HEIGHT }} ref={barsRef}>
            <div className="absolute inset-0">
              {project.tasks.map((t, i) => (
                <div
                  key={t.id}
                  className="absolute left-0 right-0"
                  style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}
                >
                  <TaskBar
                    task={t}
                    projectStartDate={start}
                    dayWidth={dayWidth}
                    rowHeight={ROW_HEIGHT}
                    onTaskUpdate={onTaskUpdate}
                    showTargetHandles={!!connectingFrom && connectingFrom !== t.id}
                    onStartConnect={(((id: string) => beginConnect(id)) as any)}
                    onPickTarget={(((id: string) => pickTarget(id)) as any)}
                  />
                </div>
              ))}

              {(project.dependencies || []).map(d => {
                const fromTask = project.tasks.find(t => t.id === d.fromId);
                const toTask = project.tasks.find(t => t.id === d.toId);
                if (!fromTask || !toTask) return null;
                const fromIndex = idToIndex[fromTask.id] ?? 0;
                const toIndex = idToIndex[toTask.id] ?? 0;
                return (
                  <TaskDependencyLine
                    key={d.id}
                    dependency={d}
                    fromTask={fromTask}
                    toTask={toTask}
                    projectStartDate={start}
                    dayWidth={dayWidth}
                    fromIndex={fromIndex}
                    toIndex={toIndex}
                    rowHeight={ROW_HEIGHT}
                    selected={selectedDepId === d.id}
                    onSelect={(id) => setSelectedDepId(id)}
                  />
                );
              })}
            </div>
          </div>
>>>>>>> fb11fd0 (chore: initial commit)
        </div>
      </div>
    </div>
  );
};
