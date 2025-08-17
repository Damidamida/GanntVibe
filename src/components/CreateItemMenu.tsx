import React from 'react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Plus, Calendar, CheckSquare } from 'lucide-react';

interface CreateItemMenuProps {
  onCreateTask: () => void;
  onCreateMilestone: () => void;
}

export const CreateItemMenu: React.FC<CreateItemMenuProps> = ({
  onCreateTask,
  onCreateMilestone
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 shadow-lg z-50 bg-[#030212] hover:bg-[#030212] text-white"
          aria-label="Добавить"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onCreateTask} className="cursor-pointer">
          <CheckSquare className="mr-2 h-4 w-4" />
          <span>Создать задачу</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateMilestone} className="cursor-pointer">
          <Calendar className="mr-2 h-4 w-4" />
          <span>Создать milestone</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
