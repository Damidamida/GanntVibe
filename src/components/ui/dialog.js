"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X as XIcon } from "lucide-react";
import { cn } from "./utils";
function Dialog(props) {
    return _jsx(DialogPrimitive.Root, { "data-slot": "dialog", ...props });
}
function DialogTrigger(props) {
    return _jsx(DialogPrimitive.Trigger, { "data-slot": "dialog-trigger", ...props });
}
function DialogPortal({ className, ...props }) {
    return _jsx(DialogPrimitive.Portal, { "data-slot": "dialog-portal", className: className, ...props });
}
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (_jsx(DialogPrimitive.Overlay, { ref: ref, "data-slot": "dialog-overlay", className: cn("fixed inset-0 z-[9998] bg-black/35 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className), ...props })));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (_jsxs(DialogPortal, { children: [_jsx(DialogOverlay, {}), _jsxs(DialogPrimitive.Content, { ref: ref, "data-slot": "dialog-content", className: cn("fixed z-[9999] left-1/2 top-1/2 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-white text-foreground p-6 shadow-lg sm:max-w-lg opacity-100", className), ...props, children: [children, _jsxs(DialogPrimitive.Close, { className: "absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", children: [_jsx(XIcon, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Close" })] })] })] })));
DialogContent.displayName = DialogPrimitive.Content.displayName;
function DialogHeader({ className, ...props }) {
    return _jsx("div", { "data-slot": "dialog-header", className: cn("flex flex-col gap-2 text-center sm:text-left", className), ...props });
}
function DialogFooter({ className, ...props }) {
    return _jsx("div", { "data-slot": "dialog-footer", className: cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-2", className), ...props });
}
function DialogTitle(props) {
    return _jsx(DialogPrimitive.Title, { "data-slot": "dialog-title", className: cn("text-lg font-semibold leading-none", props.className), ...props });
}
function DialogDescription(props) {
    return _jsx(DialogPrimitive.Description, { "data-slot": "dialog-description", className: cn("text-sm text-muted-foreground", props.className), ...props });
}
function DialogClose(props) {
    return _jsx(DialogPrimitive.Close, { "data-slot": "dialog-close", ...props });
}
export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, };
