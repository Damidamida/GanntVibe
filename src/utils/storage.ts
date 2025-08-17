import { Project } from '../types/gantt';

const KEY = 'ganttProject';

function serialize(project: Project): any {
  return {
    ...project,
    startDate: project.startDate.toISOString(),
    endDate: project.endDate.toISOString(),
    tasks: project.tasks.map(t => ({
      ...t,
      startDate: t.startDate.toISOString(),
      endDate: t.endDate.toISOString(),
    })),
    milestones: project.milestones.map(m => ({
      ...m,
      date: m.date.toISOString(),
    })),
  };
}

function deserialize(raw: any): Project {
  return {
    ...raw,
    startDate: new Date(raw.startDate),
    endDate: new Date(raw.endDate),
    tasks: (raw.tasks || []).map((t: any) => ({
      ...t,
      startDate: new Date(t.startDate),
      endDate: new Date(t.endDate),
    })),
    milestones: (raw.milestones || []).map((m: any) => ({
      ...m,
      date: new Date(m.date),
    })),
    dependencies: raw.dependencies || [],
  } as Project;
}

export function saveProject(project: Project) {
  try {
    localStorage.setItem(KEY, JSON.stringify(serialize(project)));
  } catch {}
}

export function loadProject(): Project | null {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return null;
    return deserialize(JSON.parse(s));
  } catch {
    return null;
  }
}
