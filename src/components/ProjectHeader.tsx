import React, { useState } from 'react';
import { Project } from '../types/gantt';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Edit3, Check, X, Trash2 } from 'lucide-react';
import type { TimelineUnit } from '../types/gantt';

interface ProjectHeaderProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  unit: TimelineUnit;
  onChangeUnit: (u: TimelineUnit) => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onUpdateProject, unit, onChangeUnit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);

  const handleSaveName = () => {
    onUpdateProject({ ...project, name: editName });
    setIsEditing(false);
  };

  
const handleDeleteAll = () => {
  if (project.tasks.length === 0) return;
  const ok = confirm('Удалить все задачи и подзадачи? Действие необратимо.');
  if (!ok) return;
  onUpdateProject({ ...project, tasks: [], dependencies: [] });
};
return (
    <header className="border-b bg-card">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-[280px]" />
              <Button size="icon" onClick={handleSaveName}><Check className="h-4 w-4" /></Button>
              <Button size="icon" variant="secondary" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium">{project.name}</h1>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0">
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAll}
            disabled={project.tasks.length === 0}
            className="ml-1 uppercase tracking-wide"
            title="Удалить все задачи"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Удалить всё
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div>Задач: {project.tasks.length}</div>
          <div className="flex items-center gap-2">
            <span>Масштаб:</span>
            <div className="inline-flex rounded-md border overflow-hidden">
              {(['day','week','month'] as TimelineUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => onChangeUnit(u)}
                  className={`px-2 py-1 text-xs ${unit===u ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                >
                  {u==='day'?'День':u==='week'?'Неделя':'Месяц'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};