import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
const taskColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
];
export const TaskForm = ({ isOpen, onClose, onSave, task }) => {
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        progress: 0,
        priority: 1,
        assignee: '',
        color: taskColors[0]
    });
    useEffect(() => {
        if (task) {
            setFormData({
                name: task.name,
                startDate: task.startDate.toISOString().split('T')[0],
                endDate: task.endDate.toISOString().split('T')[0],
                progress: task.progress,
                priority: task.priority,
                assignee: task.assignee,
                color: task.color
            });
        }
        else {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            setFormData({
                name: '',
                startDate: today.toISOString().split('T')[0],
                endDate: tomorrow.toISOString().split('T')[0],
                progress: 0,
                priority: 1,
                assignee: '',
                color: taskColors[Math.floor(Math.random() * taskColors.length)]
            });
        }
    }, [task, isOpen]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim())
            return;
        const taskData = {
            ...(task && { id: task.id }),
            name: formData.name.trim(),
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            progress: formData.progress,
            priority: formData.priority,
            assignee: formData.assignee.trim(),
            color: formData.color
        };
        onSave(taskData);
        onClose();
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: task ? 'Редактировать задачу' : 'Новая задача' }), _jsx(DialogDescription, { children: task ? 'Измените параметры задачи' : 'Заполните форму для создания новой задачи' })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "name", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u0434\u0430\u0447\u0438" }), _jsx(Input, { id: "name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u0434\u0430\u0447\u0438", required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "assignee", children: "\u0418\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C" }), _jsx(Input, { id: "assignee", value: formData.assignee, onChange: (e) => setFormData({ ...formData, assignee: e.target.value }), placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044F" })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "priority", children: "\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442" }), _jsx(Input, { id: "priority", type: "number", min: "1", max: "10", value: formData.priority, onChange: (e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 }) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "startDate", children: "\u0414\u0430\u0442\u0430 \u043D\u0430\u0447\u0430\u043B\u0430" }), _jsx(Input, { id: "startDate", type: "date", value: formData.startDate, onChange: (e) => setFormData({ ...formData, startDate: e.target.value }), required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "endDate", children: "\u0414\u0430\u0442\u0430 \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F" }), _jsx(Input, { id: "endDate", type: "date", value: formData.endDate, onChange: (e) => setFormData({ ...formData, endDate: e.target.value }), required: true })] })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "progress", children: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 (%)" }), _jsx(Input, { id: "progress", type: "number", min: "0", max: "100", value: formData.progress, onChange: (e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 }) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "\u0426\u0432\u0435\u0442" }), _jsx("div", { className: "flex gap-2", children: taskColors.map((color) => (_jsx("button", { type: "button", className: `w-6 h-6 rounded-full border-2 ${formData.color === color ? 'border-primary' : 'border-transparent'}`, style: { backgroundColor: color }, onClick: () => setFormData({ ...formData, color }) }, color))) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx(Button, { type: "submit", children: task ? 'Сохранить' : 'Создать' })] })] })] }) }));
};
