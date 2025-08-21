import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Plus, Calendar, CheckSquare } from 'lucide-react';
export const CreateItemMenu = ({ onCreateTask, onCreateMilestone }) => {
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { className: "fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 shadow-lg z-50 bg-[#030212] hover:bg-[#030212] text-white", "aria-label": "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C", children: _jsx(Plus, { className: "h-6 w-6" }) }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-48", children: [_jsxs(DropdownMenuItem, { onClick: onCreateTask, className: "cursor-pointer", children: [_jsx(CheckSquare, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430\u0434\u0430\u0447\u0443" })] }), _jsxs(DropdownMenuItem, { onClick: onCreateMilestone, className: "cursor-pointer", children: [_jsx(Calendar, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C milestone" })] })] })] }));
};
