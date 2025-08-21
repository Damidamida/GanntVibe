import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
const milestoneColors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
    '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
];
export const MilestoneForm = ({ isOpen, onClose, onSave, milestone }) => {
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
        }
        else {
            const today = new Date();
            setFormData({
                name: '',
                date: today.toISOString().split('T')[0],
                color: milestoneColors[Math.floor(Math.random() * milestoneColors.length)]
            });
        }
    }, [milestone, isOpen]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim())
            return;
        const milestoneData = {
            ...(milestone && { id: milestone.id }),
            name: formData.name.trim(),
            date: new Date(formData.date),
            color: formData.color
        };
        onSave(milestoneData);
        onClose();
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: milestone ? 'Редактировать milestone' : 'Новый milestone' }), _jsx(DialogDescription, { children: milestone ? 'Измените параметры milestone' : 'Заполните форму для создания нового milestone' })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "name", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 milestone" }), _jsx(Input, { id: "name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 milestone", required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "date", children: "\u0414\u0430\u0442\u0430 milestone" }), _jsx(Input, { id: "date", type: "date", value: formData.date, onChange: (e) => setFormData({ ...formData, date: e.target.value }), required: true })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: "\u0426\u0432\u0435\u0442" }), _jsx("div", { className: "flex gap-2", children: milestoneColors.map((color) => (_jsx("button", { type: "button", className: `w-6 h-6 rounded-full border-2 ${formData.color === color ? 'border-primary' : 'border-transparent'}`, style: { backgroundColor: color }, onClick: () => setFormData({ ...formData, color }) }, color))) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx(Button, { type: "submit", children: milestone ? 'Сохранить' : 'Создать' })] })] })] }) }));
};
