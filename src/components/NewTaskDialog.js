import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
function formatDateInput(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function addDays(d, n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}
function parseDate(s) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
}
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];
export const NewTaskDialog = ({ open, onClose, onCreate, task }) => {
    const today = useMemo(() => new Date(), []);
    const [fields, setFields] = useState({
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
            }
            else {
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
    const submit = (e) => {
        e.preventDefault();
        if (!valid)
            return;
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
    return (_jsx(Dialog, { open: open, onOpenChange: (o) => { if (!o)
            onClose(); }, children: _jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: task ? 'Редактирование задачи' : 'Новая задача' }), _jsx(DialogDescription, { children: task ? 'Измените поля и сохраните изменения' : 'Заполните форму для создания новой задачи' })] }), _jsxs("form", { onSubmit: submit, children: [_jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "name", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u0434\u0430\u0447\u0438" }), _jsx(Input, { id: "name", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u0434\u0430\u0447\u0438", required: true, value: fields.name, onChange: (e) => setFields({ ...fields, name: e.target.value }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "assignee", children: "\u0418\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C" }), _jsx(Input, { id: "assignee", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044F", value: fields.assignee, onChange: (e) => setFields({ ...fields, assignee: e.target.value }) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "priority", children: "\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442" }), _jsx(Input, { id: "priority", type: "number", min: 1, max: 10, value: fields.priority, onChange: (e) => setFields({ ...fields, priority: Number(e.target.value) }) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "startDate", children: "\u0414\u0430\u0442\u0430 \u043D\u0430\u0447\u0430\u043B\u0430" }), _jsx(Input, { id: "startDate", type: "date", required: true, value: fields.start, onChange: (e) => setFields({ ...fields, start: e.target.value }) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "endDate", children: "\u0414\u0430\u0442\u0430 \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F" }), _jsx(Input, { id: "endDate", type: "date", required: true, value: fields.end, onChange: (e) => setFields({ ...fields, end: e.target.value }) })] })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "progress", children: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 (%)" }), _jsx(Input, { id: "progress", type: "number", min: 0, max: 100, value: fields.progress, onChange: (e) => setFields({ ...fields, progress: Number(e.target.value) }) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "\u0426\u0432\u0435\u0442" }), _jsx("div", { className: "flex gap-2", children: COLORS.map(c => (_jsx("button", { type: "button", onClick: () => setFields({ ...fields, color: c }), className: "w-6 h-6 rounded-full border-2 " + (fields.color === c ? "border-primary" : "border-transparent"), style: { backgroundColor: c }, "aria-label": "Цвет " + c }, c))) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx(Button, { type: "submit", disabled: !valid, children: task ? 'Сохранить' : 'Создать' })] })] })] }) }));
};
