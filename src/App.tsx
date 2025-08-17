import React, { useEffect, useRef, useState } from 'react';
import { Project } from './types/gantt';
import { GanttChart } from './components/GanttChart';
import { ProjectHeader } from './components/ProjectHeader';
import { NewTaskDialog } from './components/NewTaskDialog';
import { MilestoneForm } from './components/MilestoneForm';
import { CreateItemMenu } from './components/CreateItemMenu';
import { FloatingAdd } from './components/FloatingAdd';
import type { TimelineUnit } from './types/gantt';
import { loadProject, saveProject } from './utils/storage';

const initialProject: Project = {
  id: '1',
  name: 'Новый проект',
  startDate: new Date(),
  endDate: new Date(),
  tasks: [
    { id: '1', name: 'Планирование проекта', startDate: new Date(2025,0,15), endDate: new Date(2025,0,22), progress: 20, priority: 2, assignee:'PM', color:'#60a5fa' },
    { id: '2', name: 'Сбор требований', startDate: new Date(2025,0,20), endDate: new Date(2025,0,28), progress: 50, priority: 3, assignee:'BA', color:'#34d399' },
    { id: '3', name: 'Дизайн', startDate: new Date(2025,0,25), endDate: new Date(2025,1,5), progress: 10, priority: 3, assignee:'UX', color:'#f472b6' },
    { id: '4', name: 'Разработка frontend', startDate: new Date(2025,1,3), endDate: new Date(2025,1,20), progress: 0, priority: 4, assignee:'FE', color:'#f59e0b' },
  ],
  milestones: [
    { id: 'm1', name: 'MVP Freeze', date: new Date(2025,1,10), color:'#ef4444' }
  ],
  dependencies: [],
};

export default function App() {
  const [project, setProject] = useState<Project>(() => loadProject() ?? initialProject);
  const [unit, setUnit] = useState<TimelineUnit>('day');
  const [openNewTask, setOpenNewTask] = useState(false);
  const [openNewMilestone, setOpenNewMilestone] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<any | null>(null);

  const handleCreateMilestone = (payload: { id?: string; name: string; date: Date; color: string; }) => {
    const m = { id: payload.id ?? ('m' + Date.now()), name: payload.name, date: new Date(payload.date), color: payload.color };
    const next = { ...project, milestones: [...project.milestones, m] };
    applyProject(next, true);
  };


  const handleCreateTask = (payload: { name: string; assignee?: string; priority?: number; startDate: Date; endDate: Date; progress?: number; color?: string; }) => {
    const newTask = { id: String(Date.now()), name: payload.name, startDate: payload.startDate, endDate: payload.endDate, progress: payload.progress ?? 0, priority: payload.priority ?? 1, assignee: payload.assignee ?? '', color: payload.color };
    const next = { ...project, tasks: [...project.tasks, newTask] };
    applyProject(next, true);
  };


  const addTask = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start); end.setDate(end.getDate() + 5);
    const newTask = { id: String(Date.now()), name: 'Новая задача', startDate: start, endDate: end, progress: 0, priority: 3, assignee: '', color: '#60a5fa' };
    const next = { ...project, tasks: [...project.tasks, newTask] };
    applyProject(next, true);
  };

  const addMilestone = () => {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate()+7);
    const m = { id: 'm'+Date.now(), name: 'Новый майлстоун', date, color:'#ef4444' };
    const next = { ...project, milestones: [...project.milestones, m] };
    applyProject(next, true);
  };


  // Undo stack
  const historyRef = useRef<Project[]>([]);
  const isUndoingRef = useRef(false);

  const pushHistory = (p: Project) => {
    const hist = historyRef.current.slice(-49); // keep last 49
    hist.push(structuredClone(p));
    historyRef.current = hist;
  };

  const applyProject = (next: Project, pushHist = true) => {
    if (pushHist) pushHistory(project);
    setProject(next);
    saveProject(next);
  };

  const onUpdateProject = (next: Project) => applyProject(next, true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        const hist = historyRef.current;
        const prev = hist.pop();
        if (prev) {
          isUndoingRef.current = true;
          setProject(prev);
          saveProject(prev);
          // do not push into history when setting state from undo
          setTimeout(() => { isUndoingRef.current = false; }, 0);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleStartEditTask = (task: any) => {
    setEditingTask(task);
    setOpenNewTask(true);
  };

  const handleSaveTask = (payload: any) => {
    if (editingTask) {
      const upd = { ...editingTask, ...payload };
      const tasks = project.tasks.map(t => t.id === editingTask.id ? upd : t);
      applyProject({ ...project, tasks }, true);
      setEditingTask(null);
    } else {
      handleCreateTask(payload);
    }
  };

  const handleStartEditMilestone = (m: any) => {
    setEditingMilestone(m);
    setOpenNewMilestone(true);
  };

  const handleSaveMilestone = (payload: { id?: string; name: string; date: Date; color: string; }) => {
    if (editingMilestone) {
      const ms = project.milestones.map(x => x.id === editingMilestone.id ? { ...editingMilestone, ...payload, id: editingMilestone.id } : x);
      applyProject({ ...project, milestones: ms }, true);
      setEditingMilestone(null);
    } else {
      const m = { id: payload.id ?? ('m' + Date.now()), name: payload.name, date: new Date(payload.date), color: payload.color };
      applyProject({ ...project, milestones: [...project.milestones, m] }, true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ProjectHeader project={project} onUpdateProject={(p)=>applyProject(p, true)} unit={unit} onChangeUnit={setUnit} />
      <div className="flex-1 overflow-hidden">
        <GanttChart project={project} onUpdateProject={onUpdateProject} unit={unit} onEditTask={handleStartEditTask} onEditMilestone={handleStartEditMilestone} />
            <div className="fixed bottom-6 right-6">
        <CreateItemMenu onCreateTask={() => setOpenNewTask(true)} onCreateMilestone={() => setOpenNewMilestone(true)} />
      </div>
            <NewTaskDialog open={openNewTask} onClose={() => { setOpenNewTask(false); setEditingTask(null); }} onCreate={handleSaveTask} task={editingTask ?? undefined} />
        <MilestoneForm isOpen={openNewMilestone} onClose={() => { setOpenNewMilestone(false); setEditingMilestone(null); }} milestone={editingMilestone ?? undefined} onSave={handleSaveMilestone} />
      </div>
    </div>
  );
}
