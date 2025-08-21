import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Edit3, Check, X, Trash2 } from 'lucide-react';
export const ProjectHeader = ({ project, onUpdateProject, unit, onChangeUnit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(project.name);
    const handleSaveName = () => {
        onUpdateProject({ ...project, name: editName });
        setIsEditing(false);
    };
    const handleDeleteAll = () => {
        if (project.tasks.length === 0)
            return;
        const ok = confirm('Удалить все задачи и подзадачи? Действие необратимо.');
        if (!ok)
            return;
        onUpdateProject({ ...project, tasks: [], dependencies: [] });
    };
    return (_jsx("header", { className: "border-b bg-card", children: _jsxs("div", { className: "px-4 py-3 flex items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex items-center gap-2", children: isEditing ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { value: editName, onChange: (e) => setEditName(e.target.value), className: "w-[280px]" }), _jsx(Button, { size: "icon", onClick: handleSaveName, children: _jsx(Check, { className: "h-4 w-4" }) }), _jsx(Button, { size: "icon", variant: "secondary", onClick: () => setIsEditing(false), children: _jsx(X, { className: "h-4 w-4" }) })] })) : (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h1", { className: "text-lg font-medium", children: project.name }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => setIsEditing(true), className: "h-8 w-8 p-0", children: _jsx(Edit3, { className: "h-4 w-4" }) })] })) }), _jsxs(Button, { variant: "destructive", size: "sm", onClick: handleDeleteAll, disabled: project.tasks.length === 0, className: "ml-1 uppercase tracking-wide", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u0441\u0435 \u0437\u0430\u0434\u0430\u0447\u0438", children: [_jsx(Trash2, { className: "w-4 h-4 mr-2" }), " \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u0441\u0451"] })] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground", children: [_jsxs("div", { children: ["\u0417\u0430\u0434\u0430\u0447: ", project.tasks.length] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { children: "\u041C\u0430\u0441\u0448\u0442\u0430\u0431:" }), _jsx("div", { className: "inline-flex rounded-md border overflow-hidden", children: ['day', 'week', 'month'].map((u) => (_jsx("button", { onClick: () => onChangeUnit(u), className: `px-2 py-1 text-xs ${unit === u ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`, children: u === 'day' ? 'День' : u === 'week' ? 'Неделя' : 'Месяц' }, u))) })] })] })] }) }));
};
