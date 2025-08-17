import React, { useState, useEffect } from 'react';
import { Milestone } from '../types/gantt';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';

interface MilestoneFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (milestone: Omit<Milestone, 'id'> & { id?: string }) => void;
  milestone?: Milestone;
}

const milestoneColors = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
  '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
];

export const MilestoneForm: React.FC<MilestoneFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  milestone 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    color: milestoneColors[0]
  });

  useEffect(() => {
    if (milestone) {
      setFormData({
        name: milestone.name,
        date: milestone.date.toISOString().split('T')[0],
        color: milestone.color
      });
    } else {
      const today = new Date();
      
      setFormData({
        name: '',
        date: today.toISOString().split('T')[0],
        color: milestoneColors[Math.floor(Math.random() * milestoneColors.length)]
      });
    }
  }, [milestone, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const milestoneData = {
      ...(milestone && { id: milestone.id }),
      name: formData.name.trim(),
      date: new Date(formData.date),
      color: formData.color
    };

    onSave(milestoneData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {milestone ? 'Редактировать milestone' : 'Новый milestone'}
          </DialogTitle>
          <DialogDescription>
            {milestone ? 'Измените параметры milestone' : 'Заполните форму для создания нового milestone'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название milestone</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название milestone"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Дата milestone</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Цвет</Label>
              <div className="flex gap-2">
                {milestoneColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full border-2 ${
                      formData.color === color ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">
              {milestone ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};