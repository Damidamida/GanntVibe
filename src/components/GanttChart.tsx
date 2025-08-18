import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Project, Task, Milestone, TaskDependency, TimelineUnit } from '../types/gantt';
import { Timeline } from './Timeline';
import { TaskBar } from './TaskBar';
import { TaskList } from './TaskList';
import { TaskDependencyLine } from './TaskDependencyLine';
import { addDays, differenceInDays } from '../utils/dateUtils';

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
  const childrenByParent = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of project.tasks) {
      const pid = (t as any).parentId || null;
      if (pid) {
        const arr = map.get(pid) || [];
        arr.push(t);
        map.set(pid, arr);
      }
    }
    // sort children by orderIndex then startDate
    for (const [k, arr] of map) {
      arr.sort((a,b) => ((a.orderIndex ?? 0) - (b.orderIndex ?? 0)) || a.startDate.getTime() - b.startDate.getTime());
    }
    return map;
  }, [project.tasks]);

  const hasChildren = useMemo(() => {
    const set = new Set<string>();
    for (const [pid, arr] of childrenByParent) {
      if (arr.length) set.add(pid);
    }
    return set;
  }, [childrenByParent]);

  const visibleTasks = useMemo(() => {
    const roots = project.tasks.filter(t => !(t as any).parentId);
    // keep existing order
    const byId = new Map(project.tasks.map(t => [t.id, t]));
    const order = project.tasks.map(t => t.id).filter(id => !byId.get(id)?.parentId);
    const out: Task[] = [];
    for (const id of order) {
      const root = byId.get(id)!;
      out.push(root);
      if (!(root as any).isCollapsed) {
        const kids = childrenByParent.get(root.id) || [];
        for (const k of kids) out.push(k);
      }
    }
    // handle orphans (parent not found)
    for (const t of project.tasks) {
      if ((t as any).parentId && !byId.has((t as any).parentId!)) out.push(t);
    }
    return out;
  }, [project.tasks, childrenByParent]);


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

    // Возможность прокрутки до 31 декабря 2030
    const capEnd = new Date(2030, 11, 31);
    if (e < capEnd) e = capEnd;

    const days = Math.max(1, differenceInDays(e, s));
    return { start: s, end: e, totalDays: days };
  }, [project.tasks, project.milestones]);

  const contentWidth = totalDays * dayWidth;

  // --- Анти-рывок после переноса ---
  const snapshotLeftRef = useRef<number>(0);
  const snapshotStartRef = useRef<Date | null>(null);
  const needCompensateRef = useRef<boolean>(false);
  const prevStartRef = useRef<Date | null>(null);

  useEffect(() => {
    const prev = snapshotStartRef.current ?? prevStartRef.current;
    if (needCompensateRef.current && prev && scrollRef.current) {
      const deltaDays = differenceInDays(start, prev);
      if (deltaDays !== 0) {
        const preserveLeft = snapshotLeftRef.current - deltaDays * dayWidth;
        scrollRef.current.scrollLeft = preserveLeft;
      }
    }
    prevStartRef.current = start;
    needCompensateRef.current = false;
    snapshotStartRef.current = null;
  }, [start, dayWidth]);

  const onTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    if (scrollRef.current) {
      snapshotLeftRef.current = scrollRef.current.scrollLeft;
    }
    snapshotStartRef.current = start;
    needCompensateRef.current = true;

    const tasks = project.tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t));
    onUpdateProject({ ...project, tasks });
  };

  // Добавление зависимости: запрет циклов и дублей; цель не может начинаться раньше конца источника.
  // При необходимости сдвигаем цель вправо, сохраняя её длительность.
  const addDependency = (fromId: string, toId: string) => {
    if (fromId === toId) return;

    const deps = project.dependencies || [];
    if (deps.some(d => d.fromId === toId && d.toId === fromId)) return; // запрет обратной связи (loop)
    if (deps.some(d => d.fromId === fromId && d.toId === toId)) return; // дубликат

    let tasks = project.tasks;
    const from = project.tasks.find(t => t.id === fromId);
    const idx = project.tasks.findIndex(t => t.id === toId);

    if (from && idx >= 0) {
      const tgt = project.tasks[idx];
      if (tgt.startDate.getTime() < from.endDate.getTime()) {
        const shiftMs = from.endDate.getTime() - tgt.startDate.getTime();
        const newStart = new Date(tgt.startDate.getTime() + shiftMs);
        const newEnd = new Date(tgt.endDate.getTime() + shiftMs);
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

  // Индексы строк
  const idToIndex: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    project.tasks.forEach((t, i) => { map[t.id] = i; });
    return map;
  }, [project.tasks]);

  // --- НОВОЕ: скрываем "+" на барах, уже связанных с источником (в любом направлении) ---
  const blockedTargets = useMemo(() => {
    const set = new Set<string>();
    if (!connectingFrom) return set;
    const deps = project.dependencies || [];
    deps.forEach(d => {
      if (d.fromId === connectingFrom) set.add(d.toId);
      if (d.toId === connectingFrom) set.add(d.fromId);
    });
    return set;
  }, [connectingFrom, project.dependencies]);

  // Центровка бара по клику на строку слева
  const focusTask = (taskId: string) => {
    const container = scrollRef.current;
    const barsEl = barsRef.current;
    if (!container || !barsEl) return;

    const idx = idToIndex[taskId];
    const task = project.tasks.find(t => t.id === taskId);
    if (idx === undefined || idx === null || !task) return;

    const left = differenceInDays(task.startDate, start) * dayWidth;
    const width = (differenceInDays(task.endDate, task.startDate) + 1) * dayWidth;
    const centerX = left + width / 2;
    const targetLeft = Math.max(0, centerX - container.clientWidth / 2);

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
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

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
          onDeleteTask={id => {
            const toDelete = new Set<string>([id]);
            for (const t of project.tasks) { if ((t as any).parentId === id) toDelete.add(t.id); }
            onUpdateProject({ ...project, tasks: project.tasks.filter(t => !toDelete.has(t.id)) });
          }}
          onDeleteMilestone={id =>
            onUpdateProject({ ...project, milestones: project.milestones.filter(m => m.id !== id) })
          }
          onReorderTasks={newTasks => onUpdateProject({ ...project, tasks: newTasks })}
          rowHeight={ROW_HEIGHT}
          onFocusTask={focusTask}
                  onCreateTask={(name) => {
            const today = new Date();
            const t: Task = { id: 't-' + Math.random().toString(36).slice(2), name, startDate: today, endDate: addDays(today, 5), progress: 0, priority: 1, assignee: '', color: '#4f46e5' };
            onUpdateProject({ ...project, tasks: [...project.tasks, t] });
          }}
          onCreateSubtask={(parentId, name) => {
            const today = new Date();
            const st = today; const en = addDays(today, 5);
            const t: Task = { id: 't-' + Math.random().toString(36).slice(2), name, startDate: st, endDate: en, progress: 0, priority: 1, assignee: '', color: '#10b981', parentId } as any;
            const parentIdx = project.tasks.findIndex(x => x.id === parentId);
            const parent = parentIdx >=0 ? project.tasks[parentIdx] : undefined;
            const updatedParent = parent ? { ...parent, isCollapsed: false } : undefined;
            const tasks = project.tasks.map(x => x.id === parentId && updatedParent ? (updatedParent as Task) : x);
            onUpdateProject({ ...project, tasks: [...tasks, t] });
          }}
          onToggleCollapse={(taskId, next) => {
            onUpdateProject({ ...project, tasks: project.tasks.map(t => t.id === taskId ? ({ ...t, isCollapsed: next }) : t) });
          }}
        />
      </div>

      {/* Ресайзер */}
      <div
        className="w-1 cursor-col-resize bg-muted/40 hover:bg-muted/60"
        onMouseDown={onResizeMouseDown}
                onCreateTask={(name) => {
            const today = new Date();
            const t: Task = { id: 't-' + Math.random().toString(36).slice(2), name, startDate: today, endDate: addDays(today, 5), progress: 0, priority: 1, assignee: '', color: '#4f46e5' };
            onUpdateProject({ ...project, tasks: [...project.tasks, t] });
          }}
          onCreateSubtask={(parentId, name) => {
            const today = new Date();
            const st = today; const en = addDays(today, 5);
            const t: Task = { id: 't-' + Math.random().toString(36).slice(2), name, startDate: st, endDate: en, progress: 0, priority: 1, assignee: '', color: '#10b981', parentId } as any;
            const parentIdx = project.tasks.findIndex(x => x.id === parentId);
            const parent = parentIdx >=0 ? project.tasks[parentIdx] : undefined;
            const updatedParent = parent ? { ...parent, isCollapsed: false } : undefined;
            const tasks = project.tasks.map(x => x.id === parentId && updatedParent ? (updatedParent as Task) : x);
            onUpdateProject({ ...project, tasks: [...tasks, t] });
          }}
          onToggleCollapse={(taskId, next) => {
            onUpdateProject({ ...project, tasks: project.tasks.map(t => t.id === taskId ? ({ ...t, isCollapsed: next }) : t) });
          }}
        />

      {/* Правая часть */}
      <div className="flex-1 overflow-auto" ref={scrollRef}>
        <div style={{ minWidth: contentWidth }}>
          <Timeline startDate={start} endDate={end} dayWidth={dayWidth} unit={unit} />

          <div className="relative" style={{ height: project.tasksvisibleTasks.length * ROW_HEIGHT }} ref={barsRef}>
            <div className="absolute inset-0">
              {visibleTasks.map((t, i) => (
                <div
                  key={t.id}
                  className="absolute left-0 right-0"
                  style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}
                >
                  <TaskBar
                    task={t}
                    asThinLine={hasChildren.has(t.id)}
                    projectStartDate={start}
                    dayWidth={dayWidth}
                    rowHeight={ROW_HEIGHT}
                    onTaskUpdate={onTaskUpdate}
                    showTargetHandles={!!connectingFrom && connectingFrom !== t.id && !blockedTargets.has(t.id)}
                    onStartConnect={(((id: string) => setConnectingFrom(id)) as any)}
                    onPickTarget={(((id: string) => { if (connectingFrom) addDependency(connectingFrom, id); setConnectingFrom(null); }) as any)}
                    scrollContainer={scrollRef.current as HTMLDivElement | null}
                  />
                </div>
              ))}

              {(project.dependencies || []).map(d => {
                const fromTask = project.tasks.find(t => t.id === d.fromId);
                const toTask = project.tasks.find(t => t.id === d.toId);
                if (!fromTask || !toTask) return null;
                const fromIndex = project.tasks.findIndex(t => t.id === fromTask.id);
                const toIndex = project.tasks.findIndex(t => t.id === toTask.id);
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
        </div>
      </div>
    </div>
  );
};
