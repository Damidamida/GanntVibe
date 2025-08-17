import React, { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

type NewTaskFields = {
  name: string;
  assignee: string;
  priority: number;
  start: string; // 'YYYY-MM-DD'
  end: string;   // 'YYYY-MM-DD'
  progress: number;
  color: string;
};

function formatDateInput(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function parseDate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

const COLORS = ['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#f97316','#06b6d4','#84cc16'];

export interface NewTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (task: { name: string; assignee?: string; priority?: number; startDate: Date; endDate: Date; progress?: number; color?: string; }) => void;
  task?: { id?: string; name: string; assignee?: string; priority?: number; startDate: Date; endDate: Date; progress?: number; color?: string };
}

export const NewTaskDialog: React.FC<NewTaskDialogProps> = ({ open, onClose, onCreate, task }) => {
  const today = useMemo(() => new Date(), []);
  const [fields, setFields] = useState<NewTaskFields>({
    name: '',
    assignee: '',
    priority: 1,
    start: formatDateInput(today),
    end: formatDateInput(addDays(today, 5)),
    progress: 0,
    color: COLORS[0],
  });

  useEffect(() => {
    if (open) {
      if (task) {
        setFields({
          name: task.name || '',
          assignee: task.assignee || '',
          priority: task.priority ?? 1,
          start: formatDateInput(task.startDate),
          end: formatDateInput(task.endDate),
          progress: task.progress ?? 0,
          color: task.color || COLORS[0],
        });
      } else {
        setFields({
          name: '',
          assignee: '',
          priority: 1,
          start: formatDateInput(today),
          end: formatDateInput(addDays(today, 5)),
          progress: 0,
          color: COLORS[0],
        });
      }
    }
  }, [open, task, today]);

  const valid = fields.name.trim().length > 0 && parseDate(fields.start) <= parseDate(fields.end);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const payload = {
      name: fields.name.trim(),
      assignee: fields.assignee.trim() || undefined,
      priority: Number(fields.priority) || 1,
      startDate: parseDate(fields.start),
      endDate: parseDate(fields.end),
      progress: Math.min(100, Math.max(0, Number(fields.progress) || 0)),
      color: fields.color,
    };
    onCreate(payload);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o)=>{ if(!o) onClose(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Редактирование задачи' : 'Новая задача'}</DialogTitle>
          <DialogDescription>{task ? 'Измените поля и сохраните изменения' : 'Заполните форму для создания новой задачи'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название задачи</Label>
              <Input id="name" placeholder="Введите название задачи" required value={fields.name} onChange={(e)=>setFields({...fields, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assignee">Исполнитель</Label>
                <Input id="assignee" placeholder="Введите имя исполнителя" value={fields.assignee} onChange={(e)=>setFields({...fields, assignee: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Приоритет</Label>
                <Input id="priority" type="number" min={1} max={10} value={fields.priority} onChange={(e)=>setFields({...fields, priority: Number(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Дата начала</Label>
                <Input id="startDate" type="date" required value={fields.start} onChange={(e)=>setFields({...fields, start: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Дата окончания</Label>
                <Input id="endDate" type="date" required value={fields.end} onChange={(e)=>setFields({...fields, end: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="progress">Прогресс (%)</Label>
              <Input id="progress" type="number" min={0} max={100} value={fields.progress} onChange={(e)=>setFields({...fields, progress: Number(e.target.value)})} />
            </div>
            <div className="grid gap-2">
              <Label>Цвет</Label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c} type="button"
                    onClick={()=>setFields({...fields, color: c})}
                    className={"w-6 h-6 rounded-full border-2 " + (fields.color===c ? "border-primary" : "border-transparent")}
                    style={{ backgroundColor: c }}
                    aria-label={"Цвет "+c}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
            <Button type="submit" disabled={!valid}>{task ? 'Сохранить' : 'Создать'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
