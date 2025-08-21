import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { differenceInDays } from '../utils/dateUtils';
import { Diamond } from 'lucide-react';
export const MilestoneBar = ({ milestone, projectStartDate, dayWidth, rowHeight, onMilestoneUpdate }) => {
    const dayOffset = differenceInDays(milestone.date, projectStartDate);
    const leftPosition = dayOffset * dayWidth;
    const topPosition = (rowHeight - 20) / 2; // Center the 20px high milestone
    const handleMouseDown = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startLeft = leftPosition;
        const handleMouseMove = (e) => {
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
    return (_jsxs("div", { className: "absolute flex items-center cursor-move select-none", style: {
            left: leftPosition - 8,
            top: topPosition
        }, onMouseDown: handleMouseDown, title: milestone.name, children: [_jsx(Diamond, { className: "w-4 h-4 drop-shadow-sm", style: {
                    color: milestone.color,
                    fill: milestone.color
                } }), _jsx("span", { className: "ml-2 text-xs truncate max-w-24", style: { color: milestone.color }, children: milestone.name })] }));
};
