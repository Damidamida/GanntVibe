import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useRef, useState, useEffect } from 'react';
import { formatCompact } from '../utils/dateUtils';
const toLocalStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const msPerDay = 24 * 60 * 60 * 1000;
const diffDaysLocal = (a, b) => Math.round((toLocalStart(a).getTime() - toLocalStart(b).getTime()) / msPerDay);
const addDaysLocal = (d, n) => {
    const base = toLocalStart(d);
    base.setDate(base.getDate() + n);
    return base;
};
const TaskBar = ({ task, asThinLine, projectStartDate, dayWidth, rowHeight, onTaskUpdate, showTargetHandles, onStartConnect, onPickTarget, scrollContainer, hasAnyDependency = false, }) => {
    const { left, width } = useMemo(() => {
        const leftDays = Math.max(0, diffDaysLocal(task.startDate, projectStartDate));
        const spanDays = Math.max(1, diffDaysLocal(task.endDate, task.startDate) + 1);
        return { left: leftDays * dayWidth, width: spanDays * dayWidth };
    }, [task.startDate, task.endDate, projectStartDate, dayWidth]);
    const barH = asThinLine ? Math.max(2, Math.round(rowHeight * 0.2)) : Math.round(rowHeight * 0.6);
    const top = asThinLine ? Math.max(0, rowHeight - barH) : Math.max(0, Math.round((rowHeight - barH) / 2));
    const color = task.color || '#4f46e5';
    const barRef = useRef(null);
    const [labelColor, setLabelColor] = useState('');
    useEffect(() => { if (barRef.current) {
        const bg = getComputedStyle(barRef.current).backgroundColor;
        setLabelColor(bg);
    } }, [color]);
    const [preview, setPreview] = useState({ dx: 0, dwLeft: 0, dwRight: 0 });
    const previewRef = useRef(preview);
    const setPrev = (patch) => { previewRef.current = { ...previewRef.current, ...patch }; setPreview(previewRef.current); };
    const dragRef = useRef(null);
    const startDrag = (mode) => (e) => {
        dragRef.current = { mode, startX: e.clientX };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp, { once: true });
        e.preventDefault();
        e.stopPropagation();
    };
    const onMove = (ev) => {
        const st = dragRef.current;
        if (!st || !st.mode)
            return;
        const dxPx = ev.clientX - st.startX;
        if (scrollContainer) {
            const rect = scrollContainer.getBoundingClientRect();
            const edge = Math.min(60, Math.max(24, dayWidth * 2));
            if (ev.clientX > rect.right - edge)
                scrollContainer.scrollLeft += Math.round(dayWidth / 2);
            else if (ev.clientX < rect.left + edge)
                scrollContainer.scrollLeft -= Math.round(dayWidth / 2);
        }
        if (st.mode === 'move')
            setPrev({ dx: dxPx });
        else if (st.mode === 'resizeL')
            setPrev({ dwLeft: dxPx });
        else if (st.mode === 'resizeR')
            setPrev({ dwRight: dxPx });
    };
    const resetPreview = () => setPrev({ dx: 0, dwLeft: 0, dwRight: 0 });
    const onUp = () => {
        const st = dragRef.current;
        const cur = previewRef.current;
        if (!st || !st.mode) {
            resetPreview();
            return;
        }
        const dDays = Math.round(cur.dx / dayWidth);
        const lDays = Math.round(cur.dwLeft / dayWidth);
        const rDays = Math.round(cur.dwRight / dayWidth);
        if (st.mode === 'move' && dDays) {
            onTaskUpdate(task.id, {
                startDate: addDaysLocal(task.startDate, dDays),
                endDate: addDaysLocal(task.endDate, dDays),
            });
        }
        else if (st.mode === 'resizeL' && lDays) {
            const nextStart = addDaysLocal(task.startDate, lDays);
            if (nextStart <= task.endDate) {
                onTaskUpdate(task.id, { startDate: nextStart });
            }
        }
        else if (st.mode === 'resizeR' && rDays) {
            const nextEnd = addDaysLocal(task.endDate, rDays);
            if (nextEnd >= task.startDate) {
                onTaskUpdate(task.id, { endDate: nextEnd });
            }
        }
        resetPreview();
        dragRef.current = null;
        window.removeEventListener('mousemove', onMove);
    };
    const visualLeft = Math.round(left + preview.dx + (preview.dwLeft || 0));
    const visualWidth = Math.max(1, Math.round(width + (preview.dwRight || 0) - (preview.dwLeft || 0)));
    const edgeZone = 10;
    const sideOffset = 10; // внешний вылет кружков для связи
    const circleBase = "w-4 h-4 rounded-full border shadow-sm bg-background";
    const circleHover = "opacity-0 group-hover:opacity-100 focus:opacity-100";
    const circlePos = "absolute top-1/2 -translate-y-1/2";
    return (_jsxs("div", { className: "absolute group", style: { left: visualLeft, width: visualWidth, top, height: barH, zIndex: asThinLine ? 0 : 1 }, children: [asThinLine && (_jsxs("div", { className: "absolute left-0 -top-5 whitespace-nowrap pointer-events-none font-medium text-sm", style: { color: labelColor }, children: [task.name, " ", formatCompact(task.startDate), " - ", formatCompact(task.endDate)] })), _jsxs("div", { className: 'relative rounded border shadow-sm ' + 'cursor-grab active:cursor-grabbing', style: { backgroundColor: color, height: '100%', borderColor: 'rgba(0,0,0,0.25)' }, ref: barRef, title: task.name, onMouseDown: startDrag('move'), onClick: () => { }, children: [_jsx("div", { className: "absolute top-0 left-0 h-full", style: { width: edgeZone, cursor: 'ew-resize' }, onMouseDown: startDrag('resizeL'), onClick: (e) => e.stopPropagation() }), _jsx("div", { className: "absolute top-0 right-0 h-full", style: { width: edgeZone, cursor: 'ew-resize' }, onMouseDown: startDrag('resizeR'), onClick: (e) => e.stopPropagation() }), !asThinLine && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center px-2 pointer-events-none", children: _jsx("span", { className: "w-full truncate text-center text-white font-normal leading-none text-sm", title: task.name, children: task.name }) }))] }), !asThinLine && !showTargetHandles && (_jsxs(_Fragment, { children: [!hasAnyDependency && (_jsx("button", { className: `${circlePos} -left-2 ${circleBase} ${circleHover}`, style: { marginLeft: -sideOffset, zIndex: 5 }, onClick: (e) => { e.stopPropagation(); onStartConnect && onStartConnect(task.id); }, title: "\u0421\u0432\u044F\u0437\u0430\u0442\u044C", "aria-label": "\u0421\u0432\u044F\u0437\u0430\u0442\u044C" })), _jsx("button", { className: `${circlePos} -right-2 ${circleBase} ${circleHover}`, style: { marginRight: -sideOffset, zIndex: 5 }, onClick: (e) => { e.stopPropagation(); onStartConnect && onStartConnect(task.id); }, title: "\u0421\u0432\u044F\u0437\u0430\u0442\u044C", "aria-label": "\u0421\u0432\u044F\u0437\u0430\u0442\u044C" })] })), !asThinLine && showTargetHandles && (_jsx("button", { className: `absolute left-1/2 -translate-x-1/2 ${circleBase}`, style: { zIndex: 5, top: -20 }, onClick: (e) => { e.stopPropagation(); onPickTarget && onPickTarget(task.id); }, title: "\u0421\u0432\u044F\u0437\u0430\u0442\u044C \u0441\u044E\u0434\u0430", "aria-label": "\u0421\u0432\u044F\u0437\u0430\u0442\u044C \u0441\u044E\u0434\u0430" }))] }));
};
export { TaskBar };
export default TaskBar;
