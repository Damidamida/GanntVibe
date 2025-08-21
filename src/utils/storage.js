const KEY = 'ganttProject';
function serialize(project) {
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
function deserialize(raw) {
    return {
        ...raw,
        startDate: new Date(raw.startDate),
        endDate: new Date(raw.endDate),
        tasks: (raw.tasks || []).map((t) => ({
            ...t,
            startDate: new Date(t.startDate),
            endDate: new Date(t.endDate),
        })),
        milestones: (raw.milestones || []).map((m) => ({
            ...m,
            date: new Date(m.date),
        })),
        dependencies: raw.dependencies || [],
    };
}
export function saveProject(project) {
    try {
        localStorage.setItem(KEY, JSON.stringify(serialize(project)));
    }
    catch { }
}
export function loadProject() {
    try {
        const s = localStorage.getItem(KEY);
        if (!s)
            return null;
        return deserialize(JSON.parse(s));
    }
    catch {
        return null;
    }
}
