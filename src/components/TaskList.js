import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Pencil, Trash2, Diamond, MoreHorizontal, ChevronRight, ChevronDown, Plus } from 'lucide-react';
const formatShortDate = (d) => {
    const date = typeof d === 'string' ? new Date(d) : d;
    try {
        return date.toLocaleDateString();
    }
    catch {
        return String(d);
    }
};
export const TaskList = ({ tasks, milestones, onEditTask, onDeleteTask, onEditMilestone, onDeleteMilestone, onReorderTasks, rowHeight, onFocusTask, onCreateTask, onCreateSubtask, onToggleCollapse, }) => {
    const [addingTask, setAddingTask] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [addingSubParent, setAddingSubParent] = useState(null);
    const [newSubName, setNewSubName] = useState('');
    const childrenOf = (id) => tasks.filter(t => t.parentId === id);
    const hasChildren = (id) => childrenOf(id).length > 0;
    const roots = tasks.filter(t => !t.parentId);
    return (_jsxs("div", { className: "text-sm", children: [roots.map((t) => (_jsxs("div", { children: [_jsxs("div", { className: "grid grid-cols-[auto,1fr,auto,auto,auto] items-center gap-2 hover:bg-accent/30 border-b", style: { height: rowHeight }, onClick: () => onFocusTask && onFocusTask(t.id), children: [childrenOf(t.id).length > 0 ? (_jsx("button", { className: "p-1 rounded hover:bg-accent", onClick: (e) => { e.stopPropagation(); onToggleCollapse(t.id, !t.isCollapsed); }, title: t.isCollapsed ? 'Развернуть' : 'Свернуть', "aria-label": "Toggle collapse", children: t.isCollapsed ? _jsx(ChevronRight, { className: "w-4 h-4" }) : _jsx(ChevronDown, { className: "w-4 h-4" }) })) : _jsx("span", { className: "w-4 h-4" }), _jsxs("div", { className: "min-w-0 py-1", children: [_jsx("div", { className: "text-sm font-medium leading-none truncate", children: t.name }), _jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [t.assignee ? t.assignee + " • " : "", formatShortDate(t.startDate), " \u2014 ", formatShortDate(t.endDate)] })] }), hasChildren(t.id) && (_jsx(Badge, { variant: "secondary", className: "justify-self-end", children: childrenOf(t.id).length })), _jsx("span", { className: "p-1 rounded hover:bg-accent justify-self-end", onClick: (e) => { e.stopPropagation(); onEditTask(t); }, title: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C", children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx("button", { className: "p-1 rounded hover:bg-accent justify-self-end", title: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F", "aria-haspopup": "menu", children: _jsx(MoreHorizontal, { className: "w-4 h-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", sideOffset: 6, className: "w-56 bg-white border border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.18)] rounded-none py-1 z-50", children: [_jsx(DropdownMenuItem, { className: "rounded-none px-3 py-2 cursor-pointer hover:bg-gray-100", onClick: () => setAddingSubParent(t.id), children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043F\u043E\u0434\u0437\u0430\u0434\u0430\u0447\u0443" }), _jsx(DropdownMenuItem, { className: "rounded-none px-3 py-2 cursor-pointer hover:bg-gray-100 text-destructive", onClick: () => {
                                                    // Подтверждение только если у задачи есть подзадачи
                                                    if (hasChildren(t.id)) {
                                                        if (confirm('Удалить задачу и все её подзадачи?'))
                                                            onDeleteTask(t.id);
                                                    }
                                                    else {
                                                        onDeleteTask(t.id);
                                                    }
                                                }, children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" })] })] })] }), !t.isCollapsed && childrenOf(t.id).map((c) => (_jsxs("div", { className: "grid grid-cols-[auto,1fr,auto,auto] items-center gap-2 hover:bg-accent/20 border-b relative", style: { height: rowHeight, paddingLeft: '28px' }, onClick: () => onFocusTask && onFocusTask(c.id), children: [_jsx("span", { className: "absolute left-3 top-0 bottom-0 w-px bg-border pointer-events-none" }), _jsx("div", {}), _jsxs("div", { className: "min-w-0 py-1", children: [_jsx("div", { className: "text-sm leading-none truncate", children: c.name }), _jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [c.assignee ? c.assignee + " • " : "", formatShortDate(c.startDate), " \u2014 ", formatShortDate(c.endDate)] })] }), _jsx("span", { className: "p-1 rounded hover:bg-accent justify-self-end", onClick: (e) => { e.stopPropagation(); onEditTask(c); }, title: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C", children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx("span", { className: "p-1 rounded hover:bg-accent text-destructive justify-self-end", onClick: (e) => { e.stopPropagation(); onDeleteTask(c.id); }, title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, c.id))), addingSubParent === t.id && !t.isCollapsed && (_jsxs("div", { className: "flex items-center gap-2 border-b relative", style: { height: rowHeight, paddingLeft: '28px' }, children: [_jsx("span", { className: "absolute left-3 top-0 bottom-0 w-px bg-border pointer-events-none" }), _jsx(Input, { autoFocus: true, placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043F\u043E\u0434\u0437\u0430\u0434\u0430\u0447\u0438", value: newSubName, onChange: e => setNewSubName(e.target.value), onKeyDown: e => {
                                    if (e.key === 'Enter' && newSubName.trim()) {
                                        onCreateSubtask(t.id, newSubName.trim());
                                        setNewSubName('');
                                        setAddingSubParent(null);
                                    }
                                    if (e.key === 'Escape') {
                                        setNewSubName('');
                                        setAddingSubParent(null);
                                    }
                                } }), _jsx(Button, { onClick: () => { if (newSubName.trim()) {
                                    onCreateSubtask(t.id, newSubName.trim());
                                    setNewSubName('');
                                    setAddingSubParent(null);
                                } }, children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C" })] })), childrenOf(t.id).length > 0 && !t.isCollapsed && (_jsx("div", { className: "flex items-center", style: { height: rowHeight, paddingLeft: '28px' }, children: _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setAddingSubParent(t.id), children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u0434\u0437\u0430\u0434\u0430\u0447\u0443"] }) }))] }, t.id))), milestones.map((m) => (_jsxs("div", { className: "grid grid-cols-[auto,1fr] items-center gap-2 border-b", style: { height: rowHeight }, children: [_jsx(Diamond, { className: "w-4 h-4 ml-1" }), _jsx("div", { className: "text-xs text-muted-foreground truncate", children: m.name })] }, m.id))), addingTask ? (_jsxs("div", { className: "flex items-center gap-2", style: { height: rowHeight }, children: [_jsx(Input, { autoFocus: true, placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u0434\u0430\u0447\u0438", value: newTaskName, onChange: e => setNewTaskName(e.target.value), onKeyDown: e => {
                            if (e.key === 'Enter' && newTaskName.trim()) {
                                onCreateTask(newTaskName.trim());
                                setNewTaskName('');
                                setAddingTask(false);
                            }
                            if (e.key === 'Escape') {
                                setNewTaskName('');
                                setAddingTask(false);
                            }
                        } }), _jsx(Button, { onClick: () => { if (newTaskName.trim()) {
                            onCreateTask(newTaskName.trim());
                            setNewTaskName('');
                            setAddingTask(false);
                        } }, children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C" })] })) : (_jsx("div", { className: "flex items-center", style: { height: rowHeight }, children: _jsxs(Button, { variant: "ghost", onClick: () => setAddingTask(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u0434\u0430\u0447\u0443"] }) }))] }));
};
