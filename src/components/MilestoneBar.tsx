import React from 'react';
import { Milestone } from '../types/gantt';
import { differenceInDays } from '../utils/dateUtils';
import { Diamond } from 'lucide-react';

interface MilestoneBarProps {
  milestone: Milestone;
  projectStartDate: Date;
  dayWidth: number;
  rowHeight: number;
  onMilestoneUpdate: (milestoneId: string, updates: Partial<Milestone>) => void;
}

export const MilestoneBar: React.FC<MilestoneBarProps> = ({ 
  milestone, 
  projectStartDate, 
  dayWidth,
  rowHeight,
  onMilestoneUpdate 
}) => {
  const dayOffset = differenceInDays(milestone.date, projectStartDate);
  const leftPosition = dayOffset * dayWidth;
  const topPosition = (rowHeight - 20) / 2; // Center the 20px high milestone

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startLeft = leftPosition;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newLeft = Math.max(0, startLeft + deltaX);
      const newDayOffset = Math.round(newLeft / dayWidth);
      const newDate = new Date(projectStartDate);
      newDate.setDate(newDate.getDate() + newDayOffset);

      onMilestoneUpdate(milestone.id, {
        date: newDate
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className="absolute flex items-center cursor-move select-none"
      style={{
        left: leftPosition - 8,
        top: topPosition
      }}
      onMouseDown={handleMouseDown}
      title={milestone.name}
    >
      <Diamond 
        className="w-4 h-4 drop-shadow-sm"
        style={{ 
          color: milestone.color,
          fill: milestone.color 
        }}
      />
      <span 
        className="ml-2 text-xs truncate max-w-24"
        style={{ color: milestone.color }}
      >
        {milestone.name}
      </span>
    </div>
  );
};