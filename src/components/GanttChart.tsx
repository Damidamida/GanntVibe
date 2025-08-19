import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Project, Task, Milestone, TaskDependency, TimelineUnit } from '../types/gantt';
import { Timeline } from './Timeline';
import { TaskBar } from './TaskBar';
import { TaskList } from './TaskList';
import { TaskDependencyLine } from './TaskDependencyLine';
import { GridOverlay } from './GridOverlay';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
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
const HEADER_HEIGHT = 54;

type LayoutRow =
  | { kind: 'task'; task: Task }
  | { kind: 'addSub'; parentId: string }
  | { kind: 'milestone'; milestone: Milestone }
  | { kind: 'addTask' };

const parentKey = (t: Task) => (t as any).parentId ?? '__root__';

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

  // --- One-time migration: ensure every task has orderIndex within its parent group ---
  const didMigrateRef = useRef(false);
  useEffect(() => {
    if (didMigrateRef.current) return;
    const tasks = [...project.tasks];
    let changed = false;

    const groups = new Map<string, Task[]>();
    for (const t of tasks) {
      const key = parentKey(t);
      const arr = groups.get(key) || [];
      arr.push(t);
      groups.set(key, arr);
    }

    for (const [key, arr] of groups) {
      const hasAny = arr.some(t => (t as any).orderIndex !== undefined && (t as any).orderIndex !== null);
      let sorted = arr.slice();
      if (hasAny) {
        sorted.sort((a,b) => {
          const ai = (a as any).orderIndex;
          const bi = (b as any).orderIndex;
          if (ai == null && bi == null) return 0;
          if (ai == null) return 1;
          if (bi == null) return -1;
          return ai - bi;
        });
      }
      sorted.forEach((t, i) => {
        if ((t as any).orderIndex == null || Number.isNaN((t as any).orderIndex)) {
          (t as any).orderIndex = i;
          changed = true;
        }
      });
    }

    if (changed) {
      onUpdateProject({ ...project, tasks });
    }
    didMigrateRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    for (const [k, arr] of map) {
      arr.sort((a,b) => ((a as any).orderIndex ?? 0) - ((b as any).orderIndex ?? 0));
    }
    return map;
  }, [project.tasks]);

  const roots = useMemo(() => {
    return project.tasks
      .filter(t => !(t as any).parentId)
      .slice()
      .sort((a,b) => ((a as any).orderIndex ?? 0) - ((b as any).orderIndex ?? 0));
  }, [project.tasks]);

  const layoutRows = useMemo(() => {
    const rows: LayoutRow[] = [];
    for (const root of roots) {
      rows.push({ kind: 'task', task: root });
      if (!(root as any).isCollapsed) {
        const kids = childrenByParent.get(root.id) || [];
        for (const k of kids) rows.push({ kind: 'task', task: k });
        rows.push({ kind: 'addSub', parentId: root.id });
      }
    }
    for (const m of project.milestones || []) rows.push({ kind: 'milestone', milestone: m });
    rows.push({ kind: 'addTask' });
    return rows;
  }, [roots, project.milestones, childrenByParent]);

  const taskRowIndex: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    layoutRows.forEach((r, i) => { if (r.kind === 'task') map[r.task.id] = i; });
    return map;
  }, [layoutRows]);

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
    }

    let s: Date;
    if (!minStart) {
      s = addDays(today, -60);
    } else {
      s = addDays(minStart, -60);
    }

    const e = new Date(2030, 11, 31);
    const days = Math.max(1, differenceInDays(e, s));
    return { start: s, end: e, totalDays: days };
  }, []);

  const contentWidth = totalDays * dayWidth;

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
    if (scrollRef.current) snapshotLeftRef.current = scrollRef.current.scrollLeft;
    snapshotStartRef.current = start;
    needCompensateRef.current = true;
    const tasks = project.tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t));
    onUpdateProject({ ...project, tasks });
  };

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const addDependency = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const deps = project.dependencies || [];
    if (deps.some(d => d.fromId === toId && d.toId === fromId)) return;
    if (deps.some(d => d.fromId === fromId && d.toId === toId)) return;

    let tasks = project.tasks;
    const from = project.tasks.find(t => t.id === fromId);
    const idx = project.tasks.findIndex(t => t.id === toId);

    if (from && idx >= 0) {
      const tgt = project.tasks[idx];
      const fromEnd = startOfDay(from.endDate);
      const tgtStart = startOfDay(tgt.startDate);
      if (tgtStart.getTime() <= fromEnd.getTime()) {
        const durationMs = startOfDay(tgt.endDate).getTime() - tgtStart.getTime();
        const newStart = new Date(fromEnd.getTime() + ONE_DAY_MS);
        const newEnd = new Date(newStart.getTime() + durationMs);
        const updated = { ...tgt, startDate: newStart, endDate: newEnd };
        tasks = tasks.map((t, i) => (i === idx ? updated : t));
      }
    }
    const dep: TaskDependency = { id: String(Date.now()), fromId, toId, type: 'fs' };
    onUpdateProject({ ...project, tasks, dependencies: [...deps, dep] });
  };

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

  const focusTask = (taskId: string) => {
    const container = scrollRef.current;
    const barsEl = barsRef.current;
    if (!container || !barsEl) return;

    const idx = taskRowIndex[taskId];
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedDepId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const deps = (project.dependencies || []).filter(d => d.id !== selectedDepId);
        onUpdateProject({ ...project, dependencies: deps });
        setSelectedDepId(null);
      } else if (e.key === 'Escape') {
        e.preventDefault();
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

  const handleDeleteAll = () => {
    if (project.tasks.length === 0) return;
    const ok = confirm('Удалить все задачи и подзадачи? Действие необратимо.');
    if (!ok) return;
    setConnectingFrom(null);
    setSelectedDepId(null);
    onUpdateProject({ ...project, tasks: [], dependencies: [] });
  };

  // --- Build sibling indices for fan-out per fromId ---
  const depsByFrom = useMemo(() => {
    const map = new Map<string, TaskDependency[]>();
    for (const d of project.dependencies || []) {
      const arr = map.get(d.fromId) || [];
      arr.push(d);
      map.set(d.fromId, arr);
    }
    // Sort siblings by toIndex to keep order stable
    for (const [k, arr] of map) {
      arr.sort((a,b) => {
        const ai = taskRowIndex[a.toId] ?? 0;
        const bi = taskRowIndex[b.toId] ?? 0;
        return ai - bi;
      });
    }
    return map;
  }, [project.dependencies, taskRowIndex]);

  const handleDeleteDep = (depId: string) => {
    const deps = (project.dependencies || []).filter(d => d.id !== depId);
    onUpdateProject({ ...project, dependencies: deps });
    if (selectedDepId === depId) setSelectedDepId(null);
  };

  return (
    <div className="h-full w-full flex">
      {/* Левая панель */}
      <div className="border-r overflow-auto" style={{ width: listWidth }}>
        {/* Sticky header с кнопкой Удалить всё */}
        <div
          className="sticky top-0 z-20 bg-background border-b flex items-center px-3"
          style={{ height: HEADER_HEIGHT }}
        >
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAll}
            disabled={project.tasks.length === 0}
            className="uppercase tracking-wide"
            title="Удалить все задачи"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Удалить всё
          </Button>
        </div>

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
          onReorderTasks={newTasks => {
            const tasks = [...project.tasks];
            const byId = new Map(tasks.map(t => [t.id, t]));
            const groups = new Map<string, Task[]>();
            for (const t of newTasks) {
              const orig = byId.get(t.id);
              if (!orig) continue;
              const key = parentKey(orig);
              const arr = groups.get(key) || [];
              arr.push(orig);
              groups.set(key, arr);
            }
            for (const [key, arr] of groups) {
              arr.forEach((t, i) => ((t as any).orderIndex = i));
            }
            onUpdateProject({ ...project, tasks });
          }}
          rowHeight={ROW_HEIGHT}
          onFocusTask={focusTask}
          onCreateTask={(name) => {
            const today = new Date();
            const t: Task = { id: 't-' + Math.random().toString(36).slice(2), name, startDate: today, endDate: addDays(today, 5), progress: 0, priority: 1, assignee: '', color: '#4f46e5' };
            (t as any).orderIndex = Math.max(-1, ...project.tasks.filter(x => !(x as any).parentId).map(x => (x as any).orderIndex ?? -1)) + 1;
            onUpdateProject({ ...project, tasks: [...project.tasks, t] });
          }}
          onCreateSubtask={(parentId, name) => {
            const today = new Date();
            const st = today; const en = addDays(today, 5);
            const t: Task = { id: 't-' + Math.random().toString(36).slice(2), name, startDate: st, endDate: en, progress: 0, priority: 1, assignee: '', color: '#10b981', parentId } as any;
            (t as any).orderIndex = Math.max(-1, ...project.tasks.filter(x => (x as any).parentId === parentId).map(x => (x as any).orderIndex ?? -1)) + 1;
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
      />

      {/* Правая часть */}
      <div className="flex-1 overflow-auto" ref={scrollRef}>
        <div style={{ minWidth: contentWidth }}>
          <Timeline startDate={start} endDate={end} dayWidth={dayWidth} unit={unit} />

          <div className="relative" style={{ height: layoutRows.length * ROW_HEIGHT }} ref={barsRef}>
            <div className="absolute inset-0">
              <GridOverlay
                startDate={start}
                endDate={end}
                unit={unit}
                dayWidth={dayWidth}
                height={layoutRows.length * ROW_HEIGHT}
              />

              {layoutRows.map((row, i) => {
                if (row.kind !== 'task') return null;
                const t = row.task;
                return (
                  <div
                    key={t.id}
                    className="absolute left-0 right-0"
                    style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}
                  >
                    <TaskBar
                      task={t}
                      asThinLine={!!project.tasks.find(x => (x as any).parentId === t.id)}
                      projectStartDate={start}
                      dayWidth={dayWidth}
                      rowHeight={ROW_HEIGHT}
                      onTaskUpdate={onTaskUpdate}
                      hasAnyDependency={(project.dependencies || []).some(d => d.fromId === t.id || d.toId === t.id)}
                      showTargetHandles={!!connectingFrom && connectingFrom !== t.id && !blockedTargets.has(t.id)}
                      onStartConnect={(((id: string) => setConnectingFrom(id)) as any)}
                      onPickTarget={(((id: string) => { if (connectingFrom) addDependency(connectingFrom, id); setConnectingFrom(null); }) as any)}
                      scrollContainer={scrollRef.current as HTMLDivElement | null}
                    />
                  </div>
                );
              })}

              {(project.dependencies || []).map(d => {
                const fromTask = project.tasks.find(t => t.id === d.fromId);
                const toTask = project.tasks.find(t => t.id === d.toId);
                if (!fromTask || !toTask) return null;
                const fromIndex = taskRowIndex[fromTask.id];
                const toIndex = taskRowIndex[toTask.id];
                if (fromIndex === undefined || toIndex === undefined) return null;
                const siblings = depsByFrom.get(d.fromId) || [];
                const siblingIndex = siblings.findIndex(x => x.id === d.id);
                const siblingCount = siblings.length;
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
                    onDelete={handleDeleteDep}
                    siblingIndex={siblingIndex}
                    siblingCount={siblingCount}
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
