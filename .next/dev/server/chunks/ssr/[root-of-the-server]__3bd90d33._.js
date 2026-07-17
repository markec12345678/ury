module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/hooks/use-toast.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reducer",
    ()=>reducer,
    "toast",
    ()=>toast,
    "useToast",
    ()=>useToast
]);
// Inspired by react-hot-toast library
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST"
};
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}
const toastTimeouts = new Map();
const addToRemoveQueue = (toastId)=>{
    if (toastTimeouts.has(toastId)) {
        return;
    }
    const timeout = setTimeout(()=>{
        toastTimeouts.delete(toastId);
        dispatch({
            type: "REMOVE_TOAST",
            toastId: toastId
        });
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action)=>{
    switch(action.type){
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [
                    action.toast,
                    ...state.toasts
                ].slice(0, TOAST_LIMIT)
            };
        case "UPDATE_TOAST":
            return {
                ...state,
                toasts: state.toasts.map((t)=>t.id === action.toast.id ? {
                        ...t,
                        ...action.toast
                    } : t)
            };
        case "DISMISS_TOAST":
            {
                const { toastId } = action;
                // ! Side effects ! - This could be extracted into a dismissToast() action,
                // but I'll keep it here for simplicity
                if (toastId) {
                    addToRemoveQueue(toastId);
                } else {
                    state.toasts.forEach((toast)=>{
                        addToRemoveQueue(toast.id);
                    });
                }
                return {
                    ...state,
                    toasts: state.toasts.map((t)=>t.id === toastId || toastId === undefined ? {
                            ...t,
                            open: false
                        } : t)
                };
            }
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: []
                };
            }
            return {
                ...state,
                toasts: state.toasts.filter((t)=>t.id !== action.toastId)
            };
    }
};
const listeners = [];
let memoryState = {
    toasts: []
};
function dispatch(action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener)=>{
        listener(memoryState);
    });
}
function toast({ ...props }) {
    const id = genId();
    const update = (props)=>dispatch({
            type: "UPDATE_TOAST",
            toast: {
                ...props,
                id
            }
        });
    const dismiss = ()=>dispatch({
            type: "DISMISS_TOAST",
            toastId: id
        });
    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open)=>{
                if (!open) dismiss();
            }
        }
    });
    return {
        id: id,
        dismiss,
        update
    };
}
function useToast() {
    const [state, setState] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](memoryState);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        listeners.push(setState);
        return ()=>{
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, [
        state
    ]);
    return {
        ...state,
        toast,
        dismiss: (toastId)=>dispatch({
                type: "DISMISS_TOAST",
                toastId
            })
    };
}
;
}),
"[project]/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/src/components/ui/toast.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toast",
    ()=>Toast,
    "ToastAction",
    ()=>ToastAction,
    "ToastClose",
    ()=>ToastClose,
    "ToastDescription",
    ()=>ToastDescription,
    "ToastProvider",
    ()=>ToastProvider,
    "ToastTitle",
    ()=>ToastTitle,
    "ToastViewport",
    ()=>ToastViewport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-toast/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const ToastProvider = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Provider"];
const ToastViewport = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Viewport"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 16,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastViewport.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Viewport"].displayName;
const toastVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full", {
    variants: {
        variant: {
            default: "border bg-background text-foreground",
            destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
const Toast = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, variant, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(toastVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
Toast.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"].displayName;
const ToastAction = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Action"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 62,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastAction.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Action"].displayName;
const ToastClose = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Close"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600", className),
        "toast-close": "",
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/toast.tsx",
            lineNumber: 86,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 77,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastClose.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Close"].displayName;
const ToastTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Title"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm font-semibold [&+div]:text-xs", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 95,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastTitle.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Title"].displayName;
const ToastDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Description"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm opacity-90", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 107,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastDescription.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Description"].displayName;
;
}),
"[project]/src/components/ui/toaster.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toaster",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/toast.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function Toaster() {
    const { toasts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastProvider"], {
        children: [
            toasts.map(function({ id, title, description, action, ...props }) {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toast"], {
                    ...props,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-1",
                            children: [
                                title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastTitle"], {
                                    children: title
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/toaster.tsx",
                                    lineNumber: 22,
                                    columnNumber: 25
                                }, this),
                                description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastDescription"], {
                                    children: description
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/toaster.tsx",
                                    lineNumber: 24,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ui/toaster.tsx",
                            lineNumber: 21,
                            columnNumber: 13
                        }, this),
                        action,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastClose"], {}, void 0, false, {
                            fileName: "[project]/src/components/ui/toaster.tsx",
                            lineNumber: 28,
                            columnNumber: 13
                        }, this)
                    ]
                }, id, true, {
                    fileName: "[project]/src/components/ui/toaster.tsx",
                    lineNumber: 20,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastViewport"], {}, void 0, false, {
                fileName: "[project]/src/components/ui/toaster.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/toaster.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/mock-data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// URY Restaurant Management Evaluation Dashboard - Mock Data
// Restaurant: Spice Garden (Indian Restaurant)
__turbopack_context__.s([
    "CURRENCY",
    ()=>CURRENCY,
    "RESTAURANT_NAME",
    ()=>RESTAURANT_NAME,
    "activeOrders",
    ()=>activeOrders,
    "apiEndpoints",
    ()=>apiEndpoints,
    "backendComponents",
    ()=>backendComponents,
    "dailyPLData",
    ()=>dailyPLData,
    "dashboardMetricsByPeriod",
    ()=>dashboardMetricsByPeriod,
    "docEventHooks",
    ()=>docEventHooks,
    "doctypes",
    ()=>doctypes,
    "expenseBreakdown",
    ()=>expenseBreakdown,
    "frontendApps",
    ()=>frontendApps,
    "hourlyHeatmapData",
    ()=>hourlyHeatmapData,
    "hourlySalesData",
    ()=>hourlySalesData,
    "infrastructureComponents",
    ()=>infrastructureComponents,
    "kotCards",
    ()=>kotCards,
    "kpiData",
    ()=>kpiData,
    "menuCourses",
    ()=>menuCourses,
    "menuItems",
    ()=>menuItems,
    "mockCashiers",
    ()=>mockCashiers,
    "mockShiftInfo",
    ()=>mockShiftInfo,
    "paymentMethodSplit",
    ()=>paymentMethodSplit,
    "plLineItems",
    ()=>plLineItems,
    "plSummary",
    ()=>plSummary,
    "recentOrders",
    ()=>recentOrders,
    "reportDataByPeriod",
    ()=>reportDataByPeriod,
    "rooms",
    ()=>rooms,
    "salesTrendByPeriod",
    ()=>salesTrendByPeriod,
    "tablesData",
    ()=>tablesData,
    "topSellingItems",
    ()=>topSellingItems
]);
const RESTAURANT_NAME = "Gostilna Pri Anici";
const CURRENCY = "€";
const kpiData = {
    dailySales: 2847,
    totalOrders: 87,
    avgBill: 32.70,
    occupiedTables: 10,
    totalTables: 32
};
const hourlySalesData = [
    {
        hour: "11:00",
        dineIn: 120,
        takeaway: 40
    },
    {
        hour: "12:00",
        dineIn: 280,
        takeaway: 105
    },
    {
        hour: "13:00",
        dineIn: 445,
        takeaway: 170
    },
    {
        hour: "14:00",
        dineIn: 360,
        takeaway: 140
    },
    {
        hour: "15:00",
        dineIn: 170,
        takeaway: 60
    },
    {
        hour: "16:00",
        dineIn: 90,
        takeaway: 30
    },
    {
        hour: "17:00",
        dineIn: 110,
        takeaway: 45
    },
    {
        hour: "18:00",
        dineIn: 305,
        takeaway: 125
    },
    {
        hour: "19:00",
        dineIn: 490,
        takeaway: 210
    },
    {
        hour: "20:00",
        dineIn: 560,
        takeaway: 255
    },
    {
        hour: "21:00",
        dineIn: 420,
        takeaway: 190
    },
    {
        hour: "22:00",
        dineIn: 230,
        takeaway: 95
    }
];
const recentOrders = [
    {
        invoice: "INV-2026-0201",
        customer: "Ana Novak",
        type: "Dine-in",
        amount: 36.70,
        status: "Paid",
        time: "21:42"
    },
    {
        invoice: "INV-2026-0202",
        customer: "Marko Kovač",
        type: "Takeaway",
        amount: 25.30,
        status: "Paid",
        time: "21:38"
    },
    {
        invoice: "INV-2026-0203",
        customer: "Maja Zupan",
        type: "Dine-in",
        amount: 94.30,
        status: "Draft",
        time: "21:35"
    },
    {
        invoice: "INV-2026-0204",
        customer: "Luka Horvat",
        type: "Delivery",
        amount: 18.80,
        status: "Paid",
        time: "21:28"
    },
    {
        invoice: "INV-2026-0205",
        customer: "Petra Krajnc",
        type: "Dine-in",
        amount: 22.40,
        status: "Draft",
        time: "21:22"
    },
    {
        invoice: "INV-2026-0206",
        customer: "Dejan Kovačević",
        type: "Takeaway",
        amount: 31.20,
        status: "Paid",
        time: "21:15"
    },
    {
        invoice: "INV-2026-0207",
        customer: "Nataša Potočnik",
        type: "Dine-in",
        amount: 67.90,
        status: "Paid",
        time: "21:08"
    },
    {
        invoice: "INV-2026-0208",
        customer: "Bojan Mlakar",
        type: "Delivery",
        amount: 15.40,
        status: "Cancelled",
        time: "21:02"
    }
];
const rooms = [
    {
        id: "glavna",
        name: "Glavna dvorana",
        tables: 16
    },
    {
        id: "terasa",
        name: "Terasa",
        tables: 8
    },
    {
        id: "vip",
        name: "VIP",
        tables: 4
    },
    {
        id: "bar",
        name: "Bar",
        tables: 4
    }
];
const tablesData = [
    // Glavna dvorana (16 tables)
    {
        id: 1,
        room: "glavna",
        status: "occupied",
        pax: 4,
        occupiedSince: "45",
        customer: "Ana Novak",
        orderItems: [
            "Ocvrti piščanec x2",
            "Krompirjeva solata x2",
            "Laško pivo x2"
        ],
        orderTotal: 36.70
    },
    {
        id: 2,
        room: "glavna",
        status: "free",
        pax: 0
    },
    {
        id: 3,
        room: "glavna",
        status: "occupied",
        pax: 2,
        occupiedSince: "20",
        customer: "Marko Kovač",
        orderItems: [
            "Govena juha x2",
            "Kranjska klobasa"
        ],
        orderTotal: 25.30
    },
    {
        id: 4,
        room: "glavna",
        status: "attention",
        pax: 6,
        occupiedSince: "55",
        customer: "Luka Horvat",
        orderItems: [
            "Bograč x3",
            "Kislo zelje x3"
        ],
        orderTotal: 52.20
    },
    {
        id: 5,
        room: "glavna",
        status: "free",
        pax: 0
    },
    {
        id: 6,
        room: "glavna",
        status: "occupied",
        pax: 4,
        occupiedSince: "15",
        customer: "Maja Zupan",
        orderItems: [
            "Praženi jurčki x2",
            "Rižota z jurčki x2"
        ],
        orderTotal: 41.60
    },
    {
        id: 7,
        room: "glavna",
        status: "free",
        pax: 0
    },
    {
        id: 8,
        room: "glavna",
        status: "occupied",
        pax: 3,
        occupiedSince: "30",
        customer: "Neha Gupta",
        orderItems: [
            "Ajdovi žganci",
            "Ocvirki",
            "Kislo mleko"
        ],
        orderTotal: 15.90
    },
    {
        id: 9,
        room: "glavna",
        status: "free",
        pax: 0
    },
    {
        id: 10,
        room: "glavna",
        status: "occupied",
        pax: 2,
        occupiedSince: "10",
        customer: "Arjun Menon",
        orderItems: [
            "Dunajski zrezek",
            "Krompirjeva solata"
        ],
        orderTotal: 19.40
    },
    {
        id: 11,
        room: "glavna",
        status: "free",
        pax: 0
    },
    {
        id: 12,
        room: "glavna",
        status: "attention",
        pax: 4,
        occupiedSince: "38",
        customer: "Petra Krajnc",
        orderItems: [
            "Čevapčiči x2",
            "Šopska solata x2",
            "Pivo x4"
        ],
        orderTotal: 35.60
    },
    {
        id: 13,
        room: "glavna",
        status: "occupied",
        pax: 2,
        occupiedSince: "25",
        customer: "Dejan Kovačević",
        orderItems: [
            "Kranjska klobasa",
            "Kislo zelje"
        ],
        orderTotal: 15.40
    },
    {
        id: 14,
        room: "glavna",
        status: "free",
        pax: 0
    },
    {
        id: 15,
        room: "glavna",
        status: "occupied",
        pax: 5,
        occupiedSince: "35",
        customer: "Nataša Potočnik",
        orderItems: [
            "Bograč x2",
            "Ocvrti piščanec",
            "Krompirjeva solata x3"
        ],
        orderTotal: 52.00
    },
    {
        id: 16,
        room: "glavna",
        status: "free",
        pax: 0
    },
    // Terasa (8 tables)
    {
        id: 17,
        room: "terasa",
        status: "occupied",
        pax: 4,
        occupiedSince: "22",
        customer: "Žiga Vidmar",
        orderItems: [
            "Pršut z melono x2",
            "Rdeče vino x2"
        ],
        orderTotal: 28.80
    },
    {
        id: 18,
        room: "terasa",
        status: "free",
        pax: 0
    },
    {
        id: 19,
        room: "terasa",
        status: "occupied",
        pax: 2,
        occupiedSince: "18",
        customer: "Katarina Pečar",
        orderItems: [
            "Rižota z jurčki x2",
            "Kava x2"
        ],
        orderTotal: 28.20
    },
    {
        id: 20,
        room: "terasa",
        status: "attention",
        pax: 6,
        occupiedSince: "42",
        customer: "Bojan Mlakar",
        orderItems: [
            "Ocvrti piščanec x3",
            "Krompirjeva solata x3",
            "Pivo x6"
        ],
        orderTotal: 62.10
    },
    {
        id: 21,
        room: "terasa",
        status: "free",
        pax: 0
    },
    {
        id: 22,
        room: "terasa",
        status: "occupied",
        pax: 3,
        occupiedSince: "12",
        customer: "Simona Oblak",
        orderItems: [
            "Štruklji v orehih x3"
        ],
        orderTotal: 22.50
    },
    {
        id: 23,
        room: "terasa",
        status: "free",
        pax: 0
    },
    {
        id: 24,
        room: "terasa",
        status: "occupied",
        pax: 2,
        occupiedSince: "28",
        customer: "Matej Lesjak",
        orderItems: [
            "Ribja pečenka",
            "Belo vino"
        ],
        orderTotal: 20.40
    },
    // VIP (4 tables)
    {
        id: 25,
        room: "vip",
        status: "occupied",
        pax: 8,
        occupiedSince: "50",
        customer: "Podjetje d.o.o. — Srečanje",
        orderItems: [
            "Bograč x4",
            "Ocvrti piščanec x4",
            "Kremšnita x8",
            "Vino x4"
        ],
        orderTotal: 145.60
    },
    {
        id: 26,
        room: "vip",
        status: "occupied",
        pax: 6,
        occupiedSince: "32",
        customer: "Družina Zupan",
        orderItems: [
            "Dunajski zrezek x3",
            "Ocvrti piščanec x3",
            "Pivo x6"
        ],
        orderTotal: 91.20
    },
    {
        id: 27,
        room: "vip",
        status: "free",
        pax: 0
    },
    {
        id: 28,
        room: "vip",
        status: "attention",
        pax: 4,
        occupiedSince: "60",
        customer: "G. Horvat",
        orderItems: [
            "Ribja pečenka x2",
            "Praženi jurčki x2",
            "Premium vino x2"
        ],
        orderTotal: 59.60
    },
    // Bar (4 tables)
    {
        id: 29,
        room: "bar",
        status: "occupied",
        pax: 2,
        occupiedSince: "15",
        customer: "Jan & Maja",
        orderItems: [
            "Kava x4",
            "Prekmurska gibanica x2"
        ],
        orderTotal: 17.80
    },
    {
        id: 30,
        room: "bar",
        status: "free",
        pax: 0
    },
    {
        id: 31,
        room: "bar",
        status: "occupied",
        pax: 3,
        occupiedSince: "25",
        customer: "Tilen & prijatelji",
        orderItems: [
            "Pivo x6",
            "Kobaričica",
            "Šopska solata"
        ],
        orderTotal: 26.90
    },
    {
        id: 32,
        room: "bar",
        status: "free",
        pax: 0
    }
];
const kotCards = [
    {
        id: "KOT-0247",
        orderNo: "#042",
        table: "M1",
        items: [
            {
                name: "Ocvrti piščanec",
                qty: 2,
                course: "Glavne jedi"
            },
            {
                name: "Krompirjeva solata",
                qty: 2,
                course: "Priloge"
            },
            {
                name: "Laško pivo",
                qty: 2,
                course: "Pijače"
            }
        ],
        timePlaced: "21:42",
        elapsed: 3,
        status: "new",
        production: "Kuhinja 1",
        kotType: "New Order"
    },
    {
        id: "KOT-0246",
        orderNo: "#041",
        table: "M4",
        items: [
            {
                name: "Bograč",
                qty: 3,
                course: "Glavne jedi"
            },
            {
                name: "Kislo zelje",
                qty: 3,
                course: "Priloge"
            }
        ],
        timePlaced: "21:35",
        elapsed: 10,
        status: "preparing",
        production: "Kuhinja 1",
        kotType: "New Order"
    },
    {
        id: "KOT-0245",
        orderNo: "#040",
        table: "M3",
        items: [
            {
                name: "Praženi jurčki",
                qty: 1,
                course: "Predjedi",
                comments: "Brez česna"
            },
            {
                name: "Kranjska klobasa",
                qty: 2,
                course: "Glavne jedi"
            }
        ],
        timePlaced: "21:38",
        elapsed: 7,
        status: "modified",
        production: "Kuhinja 2",
        kotType: "Order Modified"
    },
    {
        id: "KOT-0244",
        orderNo: "#039",
        table: "M17",
        items: [
            {
                name: "Pršut z melono",
                qty: 2,
                course: "Predjedi"
            },
            {
                name: "Rdeče vino",
                qty: 2,
                course: "Pijače"
            }
        ],
        timePlaced: "21:22",
        elapsed: 23,
        status: "ready",
        production: "Kuhinja 1",
        kotType: "New Order"
    },
    {
        id: "KOT-0243",
        orderNo: "#038",
        table: "Naročilo",
        items: [
            {
                name: "Dunajski zrezek",
                qty: 3,
                course: "Glavne jedi"
            },
            {
                name: "Kava",
                qty: 3,
                course: "Pijače"
            }
        ],
        timePlaced: "21:28",
        elapsed: 17,
        status: "preparing",
        production: "Kuhinja 2",
        kotType: "New Order"
    },
    {
        id: "KOT-0242",
        orderNo: "#037",
        table: "M25",
        items: [
            {
                name: "Bograč",
                qty: 4,
                course: "Glavne jedi"
            },
            {
                name: "Kremšnita",
                qty: 8,
                course: "Sladice"
            }
        ],
        timePlaced: "21:15",
        elapsed: 30,
        status: "ready",
        production: "Kuhinja 1",
        kotType: "New Order"
    },
    {
        id: "KOT-0241",
        orderNo: "#036",
        table: "M29",
        items: [
            {
                name: "Kava",
                qty: 4,
                course: "Pijače"
            },
            {
                name: "Prekmurska gibanica",
                qty: 2,
                course: "Sladice"
            }
        ],
        timePlaced: "21:35",
        elapsed: 10,
        status: "new",
        production: "Bar",
        kotType: "New Order"
    },
    {
        id: "KOT-0240",
        orderNo: "#035",
        table: "M6",
        items: [
            {
                name: "Ribja pečenka",
                qty: 1,
                course: "Glavne jedi"
            },
            {
                name: "Belo vino",
                qty: 1,
                course: "Pijače"
            }
        ],
        timePlaced: "21:08",
        elapsed: 37,
        status: "cancelled",
        production: "Kuhinja 1",
        kotType: "Partially cancelled"
    }
];
const plSummary = {
    grossSales: 2847,
    cogs: 1281,
    grossProfit: 1566,
    netProfit: 228
};
const dailyPLData = [
    {
        day: "Pon",
        revenue: 2450,
        costs: 1850
    },
    {
        day: "Tor",
        revenue: 2780,
        costs: 2030
    },
    {
        day: "Sre",
        revenue: 2240,
        costs: 1710
    },
    {
        day: "Čet",
        revenue: 2630,
        costs: 1920
    },
    {
        day: "Pet",
        revenue: 3320,
        costs: 2310
    },
    {
        day: "Sob",
        revenue: 3630,
        costs: 2465
    },
    {
        day: "Ned",
        revenue: 2847,
        costs: 2240
    }
];
const expenseBreakdown = [
    {
        name: "COGS",
        value: 45,
        color: "#ef4444"
    },
    {
        name: "Direktni stroški",
        value: 15,
        color: "#f97316"
    },
    {
        name: "Stroški zaposlenih",
        value: 20,
        color: "#eab308"
    },
    {
        name: "Neposredni stroški",
        value: 12,
        color: "#8b5cf6"
    },
    {
        name: "Neto dobiček",
        value: 8,
        color: "#10b981"
    }
];
const plLineItems = [
    {
        label: "Bruto prodaja",
        value: 2847,
        bold: true
    },
    {
        label: "COGS",
        value: -1281,
        bold: false
    },
    {
        label: "Bruto dobiček",
        value: 1566,
        bold: true
    },
    {
        label: "Stroški zaposlenih",
        value: -570,
        bold: false
    },
    {
        label: "Direktni stroški",
        value: -427,
        bold: false
    },
    {
        label: "Neposredni stroški",
        value: -341,
        bold: false
    },
    {
        label: "Neto dobiček / Izguba",
        value: 228,
        bold: true
    }
];
const mockShiftInfo = {
    status: 'open',
    openedAt: '09:00',
    closesAt: '23:00',
    openedBy: 'Jan Oblak',
    openingBalance: 500
};
const mockCashiers = [
    {
        name: "Jan Oblak",
        role: "URY Blagajnik",
        openedAt: "09:00",
        status: "active",
        openingBalance: 200,
        currentTotal: 1420,
        cashPayments: 580,
        cardPayments: 520,
        upiPayments: 320,
        ordersProcessed: 47,
        room: "Glavna dvorana"
    },
    {
        name: "Maja Sever",
        role: "URY Blagajnik",
        openedAt: "09:00",
        status: "active",
        openingBalance: 150,
        currentTotal: 890,
        cashPayments: 380,
        cardPayments: 320,
        upiPayments: 190,
        ordersProcessed: 32,
        room: "Terasa"
    },
    {
        name: "Tomaž Pintar",
        role: "URY Vodja",
        openedAt: "08:30",
        status: "active",
        openingBalance: 150,
        currentTotal: 1680,
        cashPayments: 720,
        cardPayments: 640,
        upiPayments: 320,
        ordersProcessed: 34,
        room: "VIP + Bar"
    }
];
const menuCourses = [
    {
        id: 'predjedi',
        name: 'Predjedi',
        priority: 1,
        itemCount: 5
    },
    {
        id: 'juhe',
        name: 'Juhe',
        priority: 2,
        itemCount: 3
    },
    {
        id: 'glavne-jedi',
        name: 'Glavne jedi',
        priority: 3,
        itemCount: 8
    },
    {
        id: 'priloge',
        name: 'Priloge',
        priority: 4,
        itemCount: 5
    },
    {
        id: 'solate',
        name: 'Solate',
        priority: 5,
        itemCount: 3
    },
    {
        id: 'sladice',
        name: 'Sladice',
        priority: 6,
        itemCount: 4
    },
    {
        id: 'pijace',
        name: 'Pijače',
        priority: 7,
        itemCount: 8
    }
];
const menuItems = [
    // Predjedi
    {
        id: 'MI-001',
        name: 'Praženi jurčki',
        course: 'predjedi',
        courseName: 'Predjedi',
        price: 8.90,
        isVeg: true,
        isAvailable: true,
        description: 'Na žaru praženi jurčki s šetrajem in česnom',
        tags: [
            'popular',
            'lokalno'
        ]
    },
    {
        id: 'MI-002',
        name: 'Štruklji v orehih',
        course: 'predjedi',
        courseName: 'Predjedi',
        price: 7.50,
        isVeg: true,
        isAvailable: true,
        description: 'Tradicionalni štruklji z orehovim nadevom',
        tags: [
            'tradicionalno'
        ]
    },
    {
        id: 'MI-003',
        name: 'Pršut z melono',
        course: 'predjedi',
        courseName: 'Predjedi',
        price: 9.90,
        isVeg: false,
        isAvailable: true,
        description: 'Istrski pršut z zrelo melono',
        tags: [
            'premium'
        ]
    },
    {
        id: 'MI-004',
        name: 'Kobaričica',
        course: 'predjedi',
        courseName: 'Predjedi',
        price: 6.50,
        isVeg: false,
        isAvailable: true,
        description: 'Domača salama s hrenom',
        tags: [
            'lokalno'
        ]
    },
    {
        id: 'MI-005',
        name: 'Kruh s svinjsko mastjo',
        course: 'predjedi',
        courseName: 'Predjedi',
        price: 4.90,
        isVeg: false,
        isAvailable: false,
        description: 'Topel domač kruh s svinjsko mastjo in soljo',
        tags: [
            'tradicionalno'
        ]
    },
    // Juhe
    {
        id: 'MI-006',
        name: 'Gobova juha',
        course: 'juhe',
        courseName: 'Juhe',
        price: 5.90,
        isVeg: true,
        isAvailable: true,
        description: 'Kremna juha iz gozdov z belimi gobami',
        tags: [
            'sezonsko'
        ]
    },
    {
        id: 'MI-007',
        name: 'Govena juha',
        course: 'juhe',
        courseName: 'Juhe',
        price: 6.50,
        isVeg: false,
        isAvailable: true,
        description: 'Bogata goveja juha z rezanci in zelenjavo',
        tags: [
            'popular'
        ]
    },
    {
        id: 'MI-008',
        name: 'Pusta juha',
        course: 'juhe',
        courseName: 'Juhe',
        price: 5.50,
        isVeg: true,
        isAvailable: true,
        description: 'Tradicionalna fasting juha s krompirjem'
    },
    // Glavne jedi
    {
        id: 'MI-009',
        name: 'Ocvrti piščanec',
        course: 'glavne-jedi',
        courseName: 'Glavne jedi',
        price: 12.90,
        isVeg: false,
        isAvailable: true,
        description: 'Hrustljavo ocvrt piščanec s krompirjevo solato',
        tags: [
            'popular',
            'tradicionalno'
        ]
    },
    {
        id: 'MI-010',
        name: 'Dunajski zrezek',
        course: 'glavne-jedi',
        courseName: 'Glavne jedi',
        price: 14.90,
        isVeg: false,
        isAvailable: true,
        description: 'Paniran telečji zrezek s krompirjevo solato',
        tags: [
            'bestseller'
        ]
    },
    {
        id: 'MI-011',
        name: 'Kranjska klobasa',
        course: 'glavne-jedi',
        courseName: 'Glavne jedi',
        price: 11.50,
        isVeg: false,
        isAvailable: true,
        description: 'Kranjska klobasa s kislim zeljem in krompirjem',
        tags: [
            'tradicionalno',
            'popular'
        ]
    },
    {
        id: 'MI-012',
        name: 'Bograč',
        course: 'glavne-jedi',
        courseName: 'Glavne jedi',
        price: 13.50,
        isVeg: false,
        isAvailable: true,
        description: 'Prekmurski bograč — bogata enolončnica z mesom',
        tags: [
            'tradicionalno',
            'lokalno'
        ]
    },
    {
        id: 'MI-013',
        name: 'Ribja pečenka',
        course: 'glavne-jedi',
        courseName: 'Glavne jedi',
        price: 15.90,
        isVeg: false,
        isAvailable: true,
        description: 'Pečena postrv z limono in zelišči',
        tags: [
            'premium'
        ]
    },
    {
        id: 'MI-014',
        name: 'Ajdovi žganci',
        course: 'glavne-jedi',
        courseName: 'Glavne jedi',
        price: 8.90,
        isVeg: true,
        isAvailable: true,
        description: 'Ajdovi žganci z ocvirki in kislim mlekom',
        tags: [
            'tradicionalno'
        ]
    },
    {
        id: 'MI-015',
        name: 'Rižota z jurčki',
        course: 'glavne-jedi',
        courseName: 'Glavne jedi',
        price: 11.90,
        isVeg: true,
        isAvailable: true,
        description: 'Kremna rižota z jurčki in parmezanom',
        tags: [
            'sezonsko'
        ]
    },
    {
        id: 'MI-016',
        name: 'Čevapčiči',
        course: 'glavne-jedi',
        courseName: 'Glavne jedi',
        price: 10.90,
        isVeg: false,
        isAvailable: true,
        description: 'Mleti čevapčiči s puričem in ajvarjem',
        tags: [
            'popular'
        ]
    },
    // Priloge
    {
        id: 'MI-017',
        name: 'Krompirjeva solata',
        course: 'priloge',
        courseName: 'Priloge',
        price: 4.50,
        isVeg: true,
        isAvailable: true,
        description: 'Domača krompirjeva solata'
    },
    {
        id: 'MI-018',
        name: 'Kislo zelje',
        course: 'priloge',
        courseName: 'Priloge',
        price: 3.90,
        isVeg: true,
        isAvailable: true,
        description: 'Tradicionalno kislo zelje'
    },
    {
        id: 'MI-019',
        name: 'Purič',
        course: 'priloge',
        courseName: 'Priloge',
        price: 3.50,
        isVeg: true,
        isAvailable: true,
        description: 'Pečen kruh v listih'
    },
    {
        id: 'MI-020',
        name: 'Žemljice',
        course: 'priloge',
        courseName: 'Priloge',
        price: 2.90,
        isVeg: true,
        isAvailable: true,
        description: 'Mehke kuhane žemljice'
    },
    {
        id: 'MI-021',
        name: 'Ocvirki',
        course: 'priloge',
        courseName: 'Priloge',
        price: 3.50,
        isVeg: false,
        isAvailable: true,
        description: 'Hrustljavi svinjski ocvirki'
    },
    // Solate
    {
        id: 'MI-022',
        name: 'Mešana solata',
        course: 'solate',
        courseName: 'Solate',
        price: 5.50,
        isVeg: true,
        isAvailable: true,
        description: 'Sveža mešana solata s prelivom'
    },
    {
        id: 'MI-023',
        name: 'Šopska solata',
        course: 'solate',
        courseName: 'Solate',
        price: 6.90,
        isVeg: true,
        isAvailable: true,
        description: 'Paradižnik, paprika, čebula in sir',
        tags: [
            'popular'
        ]
    },
    {
        id: 'MI-024',
        name: 'Solata s tuno',
        course: 'solate',
        courseName: 'Solate',
        price: 8.50,
        isVeg: false,
        isAvailable: true,
        description: 'Zelena solata s tuno in jajcem'
    },
    // Sladice
    {
        id: 'MI-025',
        name: 'Prekmurska gibanica',
        course: 'sladice',
        courseName: 'Sladice',
        price: 6.50,
        isVeg: true,
        isAvailable: true,
        description: 'Tradicionalna prekmurska gibanica z orehi in skuto',
        tags: [
            'tradicionalno',
            'bestseller'
        ]
    },
    {
        id: 'MI-026',
        name: 'Kremšnita',
        course: 'sladice',
        courseName: 'Sladice',
        price: 5.90,
        isVeg: true,
        isAvailable: true,
        description: 'Bledska kremšnita — listnato testo z vanilijevo kremo',
        tags: [
            'popular'
        ]
    },
    {
        id: 'MI-027',
        name: 'Pohorski lonec',
        course: 'sladice',
        courseName: 'Sladice',
        price: 6.90,
        isVeg: true,
        isAvailable: true,
        description: 'Čokoladna in orehova plast',
        tags: [
            'tradicionalno'
        ]
    },
    {
        id: 'MI-028',
        name: 'Štrudel z jabolki',
        course: 'sladice',
        courseName: 'Sladice',
        price: 5.50,
        isVeg: true,
        isAvailable: false,
        description: 'Jabolčni štrudel s cimetom',
        tags: [
            'popular'
        ]
    },
    // Pijače
    {
        id: 'MI-029',
        name: 'Laško pivo (0.5L)',
        course: 'pijace',
        courseName: 'Pijače',
        price: 3.50,
        isVeg: true,
        isAvailable: true,
        description: 'Laško pivo — slovenski klasik',
        tags: [
            'pivo'
        ]
    },
    {
        id: 'MI-030',
        name: 'Union pivo (0.5L)',
        course: 'pijace',
        courseName: 'Pijače',
        price: 3.50,
        isVeg: true,
        isAvailable: true,
        description: 'Union pivo iz Ljubljane',
        tags: [
            'pivo'
        ]
    },
    {
        id: 'MI-031',
        name: 'Rdeče vino (2dl)',
        course: 'pijace',
        courseName: 'Pijače',
        price: 4.50,
        isVeg: true,
        isAvailable: true,
        description: 'Domače rdeče vino',
        tags: [
            'vino'
        ]
    },
    {
        id: 'MI-032',
        name: 'Belo vino (2dl)',
        course: 'pijace',
        courseName: 'Pijače',
        price: 4.50,
        isVeg: true,
        isAvailable: true,
        description: 'Domače belo vino',
        tags: [
            'vino'
        ]
    },
    {
        id: 'MI-033',
        name: 'Kava',
        course: 'pijace',
        courseName: 'Pijače',
        price: 2.20,
        isVeg: true,
        isAvailable: true,
        description: 'Turška ali espresso kava',
        tags: [
            'popular'
        ]
    },
    {
        id: 'MI-034',
        name: 'Cedevita',
        course: 'pijace',
        courseName: 'Pijače',
        price: 2.50,
        isVeg: true,
        isAvailable: true,
        description: 'Vitaminsko sadno pijačo',
        tags: [
            'brezalkoholno'
        ]
    },
    {
        id: 'MI-035',
        name: 'Sok (0.2L)',
        course: 'pijace',
        courseName: 'Pijače',
        price: 2.80,
        isVeg: true,
        isAvailable: true,
        description: 'Naravni sadni sok',
        tags: [
            'brezalkoholno'
        ]
    },
    {
        id: 'MI-036',
        name: 'Radenska (0.5L)',
        course: 'pijace',
        courseName: 'Pijače',
        price: 2.50,
        isVeg: true,
        isAvailable: true,
        description: 'Radenska mineralna voda',
        tags: [
            'brezalkoholno'
        ]
    }
];
const activeOrders = [
    {
        id: 'ORD-001',
        invoiceNo: 'INV-2026-0201',
        table: 'M1',
        customer: 'Ana Novak',
        type: 'Dine-in',
        items: [
            {
                name: 'Ocvrti piščanec',
                qty: 2,
                price: 12.90,
                course: 'Glavne jedi',
                status: 'preparing'
            },
            {
                name: 'Krompirjeva solata',
                qty: 2,
                price: 4.50,
                course: 'Priloge',
                status: 'ready'
            },
            {
                name: 'Laško pivo',
                qty: 2,
                price: 3.50,
                course: 'Pijače',
                status: 'ready'
            }
        ],
        status: 'preparing',
        total: 36.70,
        placedAt: '21:42',
        elapsed: 3,
        cashier: 'Jan Oblak'
    },
    {
        id: 'ORD-002',
        invoiceNo: 'INV-2026-0202',
        table: 'M3',
        customer: 'Marko Kovač',
        type: 'Takeaway',
        items: [
            {
                name: 'Govena juha',
                qty: 2,
                price: 6.50,
                course: 'Juhe',
                status: 'ready'
            },
            {
                name: 'Kranjska klobasa',
                qty: 1,
                price: 11.50,
                course: 'Glavne jedi',
                status: 'preparing'
            }
        ],
        status: 'confirmed',
        total: 25.30,
        placedAt: '21:38',
        elapsed: 7,
        cashier: 'Maja Sever'
    },
    {
        id: 'ORD-003',
        invoiceNo: 'INV-2026-0203',
        table: 'M5',
        customer: 'Maja Zupan',
        type: 'Dine-in',
        items: [
            {
                name: 'Pršut z melono',
                qty: 2,
                price: 9.90,
                course: 'Predjedi',
                status: 'preparing'
            },
            {
                name: 'Bograč',
                qty: 3,
                price: 13.50,
                course: 'Glavne jedi',
                status: 'pending'
            },
            {
                name: 'Rižota z jurčki',
                qty: 2,
                price: 11.90,
                course: 'Glavne jedi',
                status: 'pending'
            }
        ],
        status: 'preparing',
        total: 94.30,
        placedAt: '21:35',
        elapsed: 10,
        cashier: 'Jan Oblak'
    },
    {
        id: 'ORD-004',
        invoiceNo: 'INV-2026-0204',
        customer: 'Petra Krajnc',
        type: 'Delivery',
        items: [
            {
                name: 'Dunajski zrezek',
                qty: 1,
                price: 14.90,
                course: 'Glavne jedi',
                status: 'ready'
            },
            {
                name: 'Kava',
                qty: 2,
                price: 2.20,
                course: 'Pijače',
                status: 'ready'
            }
        ],
        status: 'ready',
        total: 18.80,
        placedAt: '21:28',
        elapsed: 17,
        cashier: 'Tomaž Pintar'
    },
    {
        id: 'ORD-005',
        invoiceNo: 'INV-2026-0205',
        table: 'M8',
        customer: 'Luka Horvat',
        type: 'Dine-in',
        items: [
            {
                name: 'Ajdovi žganci',
                qty: 1,
                price: 8.90,
                course: 'Glavne jedi',
                status: 'ready'
            },
            {
                name: 'Ocvirki',
                qty: 1,
                price: 3.50,
                course: 'Priloge',
                status: 'ready'
            }
        ],
        status: 'served',
        total: 15.90,
        placedAt: '21:22',
        elapsed: 23,
        cashier: 'Maja Sever'
    },
    {
        id: 'ORD-006',
        invoiceNo: 'INV-2026-0206',
        table: 'M10',
        customer: 'Dejan Kovačević',
        type: 'Dine-in',
        items: [
            {
                name: 'Čevapčiči',
                qty: 1,
                price: 10.90,
                course: 'Glavne jedi',
                status: 'preparing'
            },
            {
                name: 'Šopska solata',
                qty: 1,
                price: 6.90,
                course: 'Solate',
                status: 'pending'
            }
        ],
        status: 'confirmed',
        total: 22.40,
        placedAt: '21:08',
        elapsed: 37,
        cashier: 'Jan Oblak'
    },
    {
        id: 'ORD-007',
        invoiceNo: 'INV-2026-0207',
        table: 'M25',
        customer: 'Podjetje d.o.o.',
        type: 'Dine-in',
        items: [
            {
                name: 'Bograč',
                qty: 4,
                price: 13.50,
                course: 'Glavne jedi',
                status: 'preparing'
            },
            {
                name: 'Ocvrti piščanec',
                qty: 4,
                price: 12.90,
                course: 'Glavne jedi',
                status: 'ready'
            },
            {
                name: 'Kremšnita',
                qty: 8,
                price: 5.90,
                course: 'Sladice',
                status: 'pending'
            }
        ],
        status: 'preparing',
        total: 145.60,
        placedAt: '21:15',
        elapsed: 30,
        cashier: 'Tomaž Pintar'
    },
    {
        id: 'ORD-008',
        invoiceNo: 'INV-2026-0208',
        table: 'M29',
        customer: 'Nataša Potočnik',
        type: 'Dine-in',
        items: [
            {
                name: 'Kava',
                qty: 4,
                price: 2.20,
                course: 'Pijače',
                status: 'ready'
            },
            {
                name: 'Prekmurska gibanica',
                qty: 2,
                price: 6.50,
                course: 'Sladice',
                status: 'ready'
            }
        ],
        status: 'ready',
        total: 17.80,
        placedAt: '21:35',
        elapsed: 10,
        cashier: 'Tomaž Pintar'
    }
];
const apiEndpoints = [
    // POS API
    {
        method: "getRestaurantMenu",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "pos_profile, room?, order_type?",
        description: "Fetches restaurant menu items with images, rates, and courses based on POS profile, room, or order type",
        paramDetails: [
            {
                name: "pos_profile",
                type: "string",
                required: true,
                description: "Name of the POS Profile"
            },
            {
                name: "room",
                type: "string",
                required: false,
                description: "Room name for room-wise menu"
            },
            {
                name: "order_type",
                type: "string",
                required: false,
                description: "Order type for type-wise menu"
            }
        ],
        exampleResponse: '{ "items": [...], "modified_time": "2026-01-01 12:00:00", "name": "Spice Garden Menu" }'
    },
    {
        method: "getMenuCourses",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Returns all available menu courses (categories) from URY Menu Course doctype"
    },
    {
        method: "getBranch",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Gets the branch name associated with the current logged-in user via URY User mapping"
    },
    {
        method: "getBranchRoom",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Returns branch and room details for the current user"
    },
    {
        method: "getRoom",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Returns all rooms assigned to the current user across branches"
    },
    {
        method: "getModeOfPayment",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Fetches available modes of payment configured in the POS Profile"
    },
    {
        method: "getInvoiceForCashier",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "status, cashier, limit, limit_start",
        description: "Gets POS invoices filtered by status for a specific cashier with pagination",
        paramDetails: [
            {
                name: "status",
                type: "string",
                required: true,
                description: "Draft / Unbilled / Recently Paid / Paid"
            },
            {
                name: "cashier",
                type: "string",
                required: true,
                description: "Cashier user ID"
            },
            {
                name: "limit",
                type: "int",
                required: true,
                description: "Page size"
            },
            {
                name: "limit_start",
                type: "int",
                required: true,
                description: "Offset for pagination"
            }
        ]
    },
    {
        method: "getPosInvoice",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "status, limit, limit_start",
        description: "Gets POS invoices filtered by status for the current branch with pagination"
    },
    {
        method: "searchPosInvoice",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "query, status",
        description: "Searches POS invoices by name, customer, or mobile number with status filter"
    },
    {
        method: "get_select_field_options",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Returns order type options from POS Invoice doctype metadata"
    },
    {
        method: "fav_items",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "customer",
        description: "Returns frequently ordered items for a specific customer based on past invoices",
        paramDetails: [
            {
                name: "customer",
                type: "string",
                required: true,
                description: "Customer name"
            }
        ]
    },
    {
        method: "getCashier",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "room",
        description: "Returns the cashier user assigned to a specific room from POS Opening Entry"
    },
    {
        method: "getPosProfile",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Returns full POS profile configuration including printer settings, cashier, QZ config, and feature flags"
    },
    {
        method: "getPosInvoiceItems",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "invoice",
        description: "Returns item details and tax breakdown for a specific POS Invoice"
    },
    {
        method: "posOpening",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Checks if a POS Opening Entry exists and is open for the current branch"
    },
    {
        method: "getAggregator",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Returns aggregator settings (Swiggy, Zomato etc.) configured for the branch"
    },
    {
        method: "getAggregatorItem",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "aggregator",
        description: "Returns menu items with prices for a specific aggregator's price list"
    },
    {
        method: "getAggregatorMOP",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "aggregator",
        description: "Returns mode of payment configured for a specific aggregator"
    },
    {
        method: "create_customer",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "customer_name, mobile_number, customer_group?, territory?",
        description: "Creates a new customer with phone validation",
        paramDetails: [
            {
                name: "customer_name",
                type: "string",
                required: true,
                description: "Customer name"
            },
            {
                name: "mobile_number",
                type: "string",
                required: true,
                description: "Valid mobile number"
            },
            {
                name: "customer_group",
                type: "string",
                required: false,
                description: "Default: Individual"
            },
            {
                name: "territory",
                type: "string",
                required: false,
                description: "Default: India"
            }
        ]
    },
    {
        method: "validate_pos_close",
        module: "ury_pos/api.py",
        httpMethod: "POST",
        parameters: "pos_profile",
        description: "Validates if previous day's POS opening has been properly closed before allowing new operations"
    },
    // KOT API
    {
        method: "kot_execute",
        module: "ury/api/ury_kot_generate.py",
        httpMethod: "POST",
        parameters: "invoice_id, customer, restaurant_table?, current_items, previous_items, comments?",
        description: "Main KOT generation endpoint - compares current vs previous items, creates new/modified/cancel KOTs per production unit",
        paramDetails: [
            {
                name: "invoice_id",
                type: "string",
                required: true,
                description: "POS Invoice ID"
            },
            {
                name: "customer",
                type: "string",
                required: true,
                description: "Customer name"
            },
            {
                name: "restaurant_table",
                type: "string",
                required: false,
                description: "Table ID"
            },
            {
                name: "current_items",
                type: "JSON",
                required: true,
                description: "Current order items"
            },
            {
                name: "previous_items",
                type: "JSON",
                required: true,
                description: "Previous order items for diff"
            },
            {
                name: "comments",
                type: "string",
                required: false,
                description: "Order comments"
            }
        ]
    },
    {
        method: "get_kot_list",
        module: "ury/api/ury_kot_display.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Returns active KOT list for KDS display with production unit filtering and order type support"
    },
    {
        method: "serve_kot",
        module: "ury/api/ury_kot_display.py",
        httpMethod: "POST",
        parameters: "name, time",
        description: "Marks a KOT as served with production time tracking",
        paramDetails: [
            {
                name: "name",
                type: "string",
                required: true,
                description: "KOT document name"
            },
            {
                name: "time",
                type: "string",
                required: true,
                description: "Serve timestamp"
            }
        ]
    },
    {
        method: "confirm_kot",
        module: "ury/api/ury_kot_display.py",
        httpMethod: "POST",
        parameters: "name, user",
        description: "Confirms/verifies a cancelled KOT by an authorized user"
    },
    {
        method: "get_production_units",
        module: "ury/api/ury_kot_display.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Returns all production units for the current branch"
    },
    {
        method: "ury_kot_reprint",
        module: "ury/api/ury_kot_reprint.py",
        httpMethod: "POST",
        parameters: "invoice_number",
        description: "Reprints a KOT for a given invoice if enabled in POS Profile settings"
    },
    {
        method: "order_delay_notification",
        module: "ury/api/ury_kot_notification.py",
        httpMethod: "POST",
        parameters: "id",
        description: "Sends delay notification to configured recipients when a KOT exceeds the warning time threshold"
    },
    {
        method: "kotValidationThread",
        module: "ury/api/ury_kot_validation.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Scheduled task (cron) that validates and auto-generates missing KOTs for invoices created in the last 5 minutes"
    },
    {
        method: "validate_priority",
        module: "ury/api/ury_menu_course_validation.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Validates that serving priority is unique across menu courses"
    },
    {
        method: "cancel_check",
        module: "ury/api/button_permission.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Checks if the current user has permission to cancel POS Invoices"
    },
    {
        method: "overrided_past_order_list",
        module: "ury/api/pos_extend.py",
        httpMethod: "POST",
        parameters: "search_term, status, limit?",
        description: "Overrides the default past order list with branch and room filtering for URY users"
    },
    // Print API
    {
        method: "network_printing",
        module: "ury/api/ury_print.py",
        httpMethod: "POST",
        parameters: "doctype, name, printer_setting, print_format?, doc?, no_letterhead?, file_path?",
        description: "Sends a document to a network printer via CUPS, handles invoice_printed and table status updates"
    },
    {
        method: "select_network_printer",
        module: "ury/api/ury_print.py",
        httpMethod: "POST",
        parameters: "pos_profile, invoice_id",
        description: "Selects the appropriate network printer (room-based or POS profile-based) for printing an invoice"
    },
    {
        method: "qz_print_update",
        module: "ury/api/ury_print.py",
        httpMethod: "POST",
        parameters: "invoice",
        description: "Updates invoice_printed status and table occupancy after QZ Tray printing"
    },
    {
        method: "print_pos_page",
        module: "ury/api/ury_print.py",
        httpMethod: "POST",
        parameters: "doctype, name, print_format",
        description: "Publishes print job via Frappe realtime (WebSocket) channel for browser-based printing"
    },
    {
        method: "qz_certificate",
        module: "ury/api/ury_print.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Returns the QZ Tray certificate from site config for secure printing"
    },
    {
        method: "signature_promise",
        module: "ury/api/ury_print.py",
        httpMethod: "POST",
        parameters: "none",
        description: "Returns the QZ Tray private key from site config for signing print requests"
    }
];
const frontendApps = [
    {
        name: "POS React",
        tech: "React + Vite",
        path: "ury/pos/",
        description: "Modern POS interface built with React, TypeScript, and Vite"
    },
    {
        name: "KOT Mosaic Vue",
        tech: "Vue 3 + Vite",
        path: "ury/URYMosaic/",
        description: "Kitchen Display System (KDS) built with Vue 3 for real-time KOT management"
    },
    {
        name: "POS v1 Vue",
        tech: "Vue 3 + Vite",
        path: "ury/urypos/",
        description: "Legacy POS interface built with Vue 3 for order management"
    }
];
const backendComponents = [
    {
        name: "Frappe/ERPNext",
        description: "Core backend framework providing REST API, database ORM, authentication, and doctype management"
    }
];
const infrastructureComponents = [
    {
        name: "MariaDB",
        description: "Primary database for all Frappe/ERPNext data"
    },
    {
        name: "Socket.io",
        description: "Real-time communication for KOT updates and print jobs"
    },
    {
        name: "QZ Tray",
        description: "Desktop utility for direct thermal printer communication"
    }
];
const doctypes = [
    "URY Restaurant",
    "URY Room",
    "URY Table",
    "URY Menu",
    "URY Menu Item",
    "URY Menu Course",
    "URY Order",
    "URY Order Item",
    "URY KOT",
    "URY KOT Items",
    "URY KOT Error Log",
    "URY Production Unit",
    "URY Production Item Groups",
    "URY User",
    "URY Printer Settings",
    "URY Daily P&L",
    "URY P&L Breakup",
    "URY Cost of Goods",
    "URY Materials",
    "URY P&L Materials",
    "URY Fixed Expenses",
    "URY Variable Expenses",
    "URY Report Settings",
    "URY Notification Recipient",
    "Aggregator Settings",
    "Item Add On",
    "Menu for Room",
    "Multiple Rooms",
    "Order Type Menu",
    "POS Item Variants",
    "Role Permitted",
    "Sub POS Invoices",
    "Sub POS Closing",
    "Sub POS Closing Payment",
    "KDS Order Type"
];
const docEventHooks = [
    {
        doctype: "POS Invoice",
        events: [
            "before_insert",
            "validate",
            "after_insert",
            "before_submit",
            "on_cancel",
            "on_trash"
        ]
    },
    {
        doctype: "POS Profile",
        events: [
            "validate"
        ]
    },
    {
        doctype: "Sales Invoice",
        events: [
            "before_insert",
            "on_update"
        ]
    },
    {
        doctype: "Item",
        events: [
            "validate"
        ]
    },
    {
        doctype: "POS Opening Entry",
        events: [
            "validate",
            "before_save",
            "before_insert"
        ]
    },
    {
        doctype: "POS Closing Entry",
        events: [
            "before_save",
            "validate"
        ]
    },
    {
        doctype: "URY Menu Course",
        events: [
            "validate"
        ]
    }
];
const dashboardMetricsByPeriod = {
    today: {
        totalRevenue: 124580,
        totalOrders: 187,
        avgOrderValue: 667,
        occupancyRate: 75,
        revenueGrowth: 12.5,
        ordersGrowth: 8.3,
        avgOrderGrowth: -2.1,
        occupancyGrowth: 5.2
    },
    yesterday: {
        totalRevenue: 110740,
        totalOrders: 172,
        avgOrderValue: 644,
        occupancyRate: 70,
        revenueGrowth: -3.2,
        ordersGrowth: -1.5,
        avgOrderGrowth: -1.8,
        occupancyGrowth: -2.0
    },
    week: {
        totalRevenue: 785600,
        totalOrders: 1243,
        avgOrderValue: 632,
        occupancyRate: 68,
        revenueGrowth: 9.8,
        ordersGrowth: 6.4,
        avgOrderGrowth: 3.1,
        occupancyGrowth: 4.7
    },
    month: {
        totalRevenue: 3250000,
        totalOrders: 5180,
        avgOrderValue: 627,
        occupancyRate: 65,
        revenueGrowth: 15.3,
        ordersGrowth: 11.7,
        avgOrderGrowth: 2.9,
        occupancyGrowth: 7.1
    },
    quarter: {
        totalRevenue: 9450000,
        totalOrders: 15200,
        avgOrderValue: 622,
        occupancyRate: 63,
        revenueGrowth: 18.6,
        ordersGrowth: 14.2,
        avgOrderGrowth: 3.5,
        occupancyGrowth: 8.4
    }
};
const salesTrendByPeriod = {
    today: [
        {
            label: '11:00',
            revenue: 3200,
            orders: 5
        },
        {
            label: '12:00',
            revenue: 7700,
            orders: 12
        },
        {
            label: '13:00',
            revenue: 12300,
            orders: 18
        },
        {
            label: '14:00',
            revenue: 10000,
            orders: 15
        },
        {
            label: '15:00',
            revenue: 4600,
            orders: 7
        },
        {
            label: '16:00',
            revenue: 2400,
            orders: 4
        },
        {
            label: '17:00',
            revenue: 3100,
            orders: 5
        },
        {
            label: '18:00',
            revenue: 8600,
            orders: 14
        },
        {
            label: '19:00',
            revenue: 14000,
            orders: 21
        },
        {
            label: '20:00',
            revenue: 18000,
            orders: 26
        },
        {
            label: '21:00',
            revenue: 15400,
            orders: 22
        },
        {
            label: '22:00',
            revenue: 9200,
            orders: 14
        },
        {
            label: '23:00',
            revenue: 5080,
            orders: 8
        }
    ],
    yesterday: [
        {
            label: '11:00',
            revenue: 2800,
            orders: 4
        },
        {
            label: '12:00',
            revenue: 6500,
            orders: 10
        },
        {
            label: '13:00',
            revenue: 10800,
            orders: 16
        },
        {
            label: '14:00',
            revenue: 9200,
            orders: 14
        },
        {
            label: '15:00',
            revenue: 3900,
            orders: 6
        },
        {
            label: '16:00',
            revenue: 2100,
            orders: 3
        },
        {
            label: '17:00',
            revenue: 2700,
            orders: 4
        },
        {
            label: '18:00',
            revenue: 7800,
            orders: 12
        },
        {
            label: '19:00',
            revenue: 12600,
            orders: 19
        },
        {
            label: '20:00',
            revenue: 16200,
            orders: 24
        },
        {
            label: '21:00',
            revenue: 13800,
            orders: 20
        },
        {
            label: '22:00',
            revenue: 8400,
            orders: 12
        },
        {
            label: '23:00',
            revenue: 4700,
            orders: 7
        }
    ],
    week: [
        {
            label: 'Pon',
            revenue: 112000,
            orders: 178
        },
        {
            label: 'Tor',
            revenue: 98400,
            orders: 156
        },
        {
            label: 'Sre',
            revenue: 124000,
            orders: 196
        },
        {
            label: 'Čet',
            revenue: 105600,
            orders: 168
        },
        {
            label: 'Pet',
            revenue: 142000,
            orders: 224
        },
        {
            label: 'Sob',
            revenue: 128000,
            orders: 204
        },
        {
            label: 'Ned',
            revenue: 75600,
            orders: 117
        }
    ],
    month: [
        {
            label: 'Teden 1',
            revenue: 812000,
            orders: 1295
        },
        {
            label: 'Teden 2',
            revenue: 785000,
            orders: 1243
        },
        {
            label: 'Teden 3',
            revenue: 845000,
            orders: 1348
        },
        {
            label: 'Teden 4',
            revenue: 808000,
            orders: 1294
        }
    ],
    quarter: [
        {
            label: 'April',
            revenue: 3050000,
            orders: 4860
        },
        {
            label: 'Maj',
            revenue: 3150000,
            orders: 5020
        },
        {
            label: 'Junij',
            revenue: 3250000,
            orders: 5180
        }
    ]
};
const topSellingItems = [
    {
        id: 'mi-1',
        name: 'Butter Chicken',
        quantity: 47,
        revenue: 23500,
        course: 'main',
        isVeg: false
    },
    {
        id: 'mi-3',
        name: 'Paneer Tikka',
        quantity: 38,
        revenue: 15200,
        course: 'starters',
        isVeg: true
    },
    {
        id: 'mi-5',
        name: 'Dal Makhani',
        quantity: 34,
        revenue: 11900,
        course: 'main',
        isVeg: true
    },
    {
        id: 'mi-8',
        name: 'Chicken Biryani',
        quantity: 31,
        revenue: 18600,
        course: 'rice',
        isVeg: false
    },
    {
        id: 'mi-2',
        name: 'Chicken Tikka',
        quantity: 29,
        revenue: 14500,
        course: 'starters',
        isVeg: false
    },
    {
        id: 'mi-12',
        name: 'Naan',
        quantity: 86,
        revenue: 8600,
        course: 'bread',
        isVeg: true
    },
    {
        id: 'mi-10',
        name: 'Gulab Jamun',
        quantity: 24,
        revenue: 4800,
        course: 'desserts',
        isVeg: true
    },
    {
        id: 'mi-7',
        name: 'Veg Fried Rice',
        quantity: 22,
        revenue: 7700,
        course: 'rice',
        isVeg: true
    }
];
const paymentMethodSplit = [
    {
        method: 'Gotovina',
        count: 68,
        amount: 42500,
        color: '#059669'
    },
    {
        method: 'Kartica',
        count: 72,
        amount: 53200,
        color: '#3b82f6'
    },
    {
        method: 'UPI',
        count: 47,
        amount: 28880,
        color: '#f59e0b'
    }
];
const hourlyHeatmapData = (()=>{
    const days = [
        'Pon',
        'Tor',
        'Sre',
        'Čet',
        'Pet',
        'Sob',
        'Ned'
    ];
    const data = [];
    for (const day of days){
        for(let h = 10; h <= 23; h++){
            const isWeekend = day === 'Sob' || day === 'Ned';
            const isPeak = h >= 12 && h <= 14 || h >= 19 && h <= 21;
            const base = isPeak ? isWeekend ? 8000 : 6000 : isWeekend ? 4000 : 2500;
            const value = Math.round(base * (0.7 + Math.random() * 0.6));
            data.push({
                day,
                hour: h,
                value
            });
        }
    }
    return data;
})();
const reportDataByPeriod = {
    daily: {
        period: 'daily',
        periodLabel: '30. junij 2026',
        dateFrom: '2026-06-30',
        dateTo: '2026-06-30',
        totalRevenue: 124580,
        totalOrders: 187,
        avgOrderValue: 667,
        totalDiscounts: 4200,
        totalCancellations: 3,
        netRevenue: 120380,
        topItems: topSellingItems.slice(0, 5),
        dailyBreakdown: salesTrendByPeriod.today,
        paymentSplit: paymentMethodSplit,
        orderTypeSplit: [
            {
                type: 'Dine-in',
                count: 112,
                revenue: 74500
            },
            {
                type: 'Takeaway',
                count: 52,
                revenue: 32800
            },
            {
                type: 'Dostava',
                count: 23,
                revenue: 17280
            }
        ],
        courseRevenue: [
            {
                course: 'Predjedi',
                revenue: 28400,
                items: 67
            },
            {
                course: 'Glavne jedi',
                revenue: 48200,
                items: 58
            },
            {
                course: 'Riž in kruh',
                revenue: 22100,
                items: 42
            },
            {
                course: 'Sladice',
                revenue: 8600,
                items: 24
            },
            {
                course: 'Pijača',
                revenue: 17280,
                items: 38
            }
        ]
    },
    weekly: {
        period: 'weekly',
        periodLabel: '23. – 29. junij 2026',
        dateFrom: '2026-06-23',
        dateTo: '2026-06-29',
        totalRevenue: 785600,
        totalOrders: 1243,
        avgOrderValue: 632,
        totalDiscounts: 24800,
        totalCancellations: 18,
        netRevenue: 760800,
        topItems: topSellingItems,
        dailyBreakdown: salesTrendByPeriod.week,
        paymentSplit: [
            {
                method: 'Gotovina',
                count: 452,
                amount: 268000,
                color: '#059669'
            },
            {
                method: 'Kartica',
                count: 478,
                amount: 342000,
                color: '#3b82f6'
            },
            {
                method: 'UPI',
                count: 313,
                amount: 175600,
                color: '#f59e0b'
            }
        ],
        orderTypeSplit: [
            {
                type: 'Dine-in',
                count: 748,
                revenue: 472000
            },
            {
                type: 'Takeaway',
                count: 342,
                revenue: 213600
            },
            {
                type: 'Dostava',
                count: 153,
                revenue: 100000
            }
        ],
        courseRevenue: [
            {
                course: 'Predjedi',
                revenue: 178000,
                items: 412
            },
            {
                course: 'Glavne jedi',
                revenue: 302000,
                items: 386
            },
            {
                course: 'Riž in kruh',
                revenue: 138000,
                items: 284
            },
            {
                course: 'Sladice',
                revenue: 54600,
                items: 158
            },
            {
                course: 'Pijača',
                revenue: 113000,
                items: 247
            }
        ]
    },
    monthly: {
        period: 'monthly',
        periodLabel: 'Junij 2026',
        dateFrom: '2026-06-01',
        dateTo: '2026-06-30',
        totalRevenue: 3250000,
        totalOrders: 5180,
        avgOrderValue: 627,
        totalDiscounts: 98400,
        totalCancellations: 72,
        netRevenue: 3151600,
        topItems: topSellingItems,
        dailyBreakdown: salesTrendByPeriod.month,
        paymentSplit: [
            {
                method: 'Gotovina',
                count: 1860,
                amount: 1105000,
                color: '#059669'
            },
            {
                method: 'Kartica',
                count: 1980,
                amount: 1410000,
                color: '#3b82f6'
            },
            {
                method: 'UPI',
                count: 1340,
                amount: 735000,
                color: '#f59e0b'
            }
        ],
        orderTypeSplit: [
            {
                type: 'Dine-in',
                count: 3108,
                revenue: 1945000
            },
            {
                type: 'Takeaway',
                count: 1420,
                revenue: 884000
            },
            {
                type: 'Dostava',
                count: 652,
                revenue: 421000
            }
        ],
        courseRevenue: [
            {
                course: 'Predjedi',
                revenue: 738000,
                items: 1720
            },
            {
                course: 'Glavne jedi',
                revenue: 1254000,
                items: 1610
            },
            {
                course: 'Riž in kruh',
                revenue: 572000,
                items: 1180
            },
            {
                course: 'Sladice',
                revenue: 226000,
                items: 658
            },
            {
                course: 'Pijača',
                revenue: 460000,
                items: 1012
            }
        ]
    }
};
}),
"[project]/src/lib/frappe-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// URY Frappe REST API Client
// Typed client for connecting to any Frappe/ERPNext backend running URY
__turbopack_context__.s([
    "FrappeClient",
    ()=>FrappeClient,
    "clearConfig",
    ()=>clearConfig,
    "getFrappeClient",
    ()=>getFrappeClient,
    "loadConfig",
    ()=>loadConfig,
    "resetFrappeClient",
    ()=>resetFrappeClient,
    "saveConfig",
    ()=>saveConfig
]);
// ── Persistence ──────────────────────────────────────────
const CONFIG_KEY = 'ury_frappe_config';
function saveConfig(config) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function loadConfig() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
function clearConfig() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
const DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryableStatuses: [
        408,
        429,
        500,
        502,
        503,
        504
    ]
};
/**
 * Sleep for a given number of milliseconds.
 */ function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
/**
 * Calculate delay for retry attempt with exponential backoff + jitter.
 * Formula: min(maxDelay, baseDelay * backoffFactor^attempt) + random jitter
 */ function getRetryDelay(attempt, config) {
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffFactor, attempt);
    const cappedDelay = Math.min(config.maxDelay, exponentialDelay);
    // Add jitter: random 0-30% of the delay to prevent thundering herd
    const jitter = cappedDelay * 0.3 * Math.random();
    return cappedDelay + jitter;
}
/**
 * Determines if an error/response should trigger a retry.
 * Retries on: network errors, 408 (timeout), 429 (rate limit), 5xx (server errors).
 * Does NOT retry on: 4xx client errors (400, 401, 403, 404, etc.).
 */ function isRetryable(status, error) {
    // Network error (no status code)
    if (status === null && error !== null) return true;
    if (status === null) return false;
    return DEFAULT_RETRY_CONFIG.retryableStatuses.includes(status);
}
/**
 * Fetch with automatic retry and exponential backoff.
 * Only retries on transient failures (network errors, rate limits, server errors).
 * Idempotent methods (GET) are always safe to retry.
 * Non-idempotent methods (POST, PUT, DELETE) only retry on network errors,
 * not on server errors, to avoid duplicate operations.
 */ async function fetchWithRetry(url, options, retryConfig = {}) {
    const config = {
        ...DEFAULT_RETRY_CONFIG,
        ...retryConfig
    };
    const isIdempotent = !options.method || options.method === 'GET' || options.method === 'HEAD';
    let lastError = null;
    let lastStatus = null;
    for(let attempt = 0; attempt <= config.maxRetries; attempt++){
        try {
            const response = await fetch(url, options);
            // If response is OK or a non-retryable client error, return immediately
            if (response.ok || !isRetryable(response.status, null)) {
                return response;
            }
            // For non-idempotent methods, don't retry server errors (avoid duplicates)
            if (!isIdempotent && response.status >= 500) {
                return response;
            }
            lastStatus = response.status;
            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        } catch (err) {
            lastError = err;
            lastStatus = null;
        }
        // Don't wait after the last attempt
        if (attempt < config.maxRetries) {
            const delay = getRetryDelay(attempt, config);
            console.warn(`[FrappeClient] Retry ${attempt + 1}/${config.maxRetries} after ${Math.round(delay)}ms ` + `(${lastStatus ? `HTTP ${lastStatus}` : 'network error'}): ${url}`);
            await sleep(delay);
        }
    }
    // All retries exhausted — throw the last error
    if (lastStatus !== null) {
        // Re-fetch to get the actual response object for the caller to handle
        try {
            return await fetch(url, options);
        } catch  {
            throw lastError;
        }
    }
    throw lastError;
}
class FrappeClient {
    config;
    retryConfig;
    constructor(config, retryConfig){
        this.config = config;
        this.retryConfig = retryConfig ?? {};
    }
    updateConfig(config) {
        this.config = config;
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        };
        if (this.config.apiKey && this.config.apiSecret) {
            headers['Authorization'] = `token ${this.config.apiKey}:${this.config.apiSecret}`;
        }
        if (this.config.cookie) {
            headers['Cookie'] = this.config.cookie;
        }
        return headers;
    }
    getBaseUrl() {
        return this.config.baseUrl.replace(/\/+$/, '');
    }
    // ── Core Methods ──────────────────────────────────────
    async ping() {
        try {
            const res = await fetchWithRetry(`${this.getBaseUrl()}/api/method/ping`, {
                headers: this.getHeaders(),
                credentials: 'include'
            }, {
                maxRetries: 1,
                baseDelay: 500,
                ...this.retryConfig
            });
            return res.ok;
        } catch  {
            return false;
        }
    }
    async login(username, password) {
        const res = await fetchWithRetry(`${this.getBaseUrl()}/api/method/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                usr: username,
                pwd: password
            })
        }, {
            maxRetries: 1,
            ...this.retryConfig
        }); // Login: only 1 retry to avoid lockouts
        if (!res.ok) {
            const error = await res.json().catch(()=>({
                    message: 'Login failed'
                }));
            throw new Error(error.message || 'Login failed');
        }
        return res.json();
    }
    async getLoggedInUser() {
        try {
            const res = await fetchWithRetry(`${this.getBaseUrl()}/api/method/frappe.auth.get_logged_user`, {
                headers: this.getHeaders(),
                credentials: 'include'
            }, this.retryConfig);
            if (!res.ok) return null;
            const data = await res.json();
            return data.message;
        } catch  {
            return null;
        }
    }
    // ── Frappe Call (whitelisted API) ─────────────────────
    async call(params) {
        const res = await fetchWithRetry(`${this.getBaseUrl()}/api/method/${params.method}`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(params.args || {})
        }, this.retryConfig);
        if (!res.ok) {
            const error = await res.json().catch(()=>({
                    message: `API call failed: ${params.method}`
                }));
            throw new Error(error.message || error.exc || `API error: ${params.method}`);
        }
        return res.json();
    }
    // ── Document Operations ───────────────────────────────
    async getDocList(params) {
        const queryParams = new URLSearchParams();
        queryParams.set('doctype', params.doctype);
        if (params.fields?.length) {
            queryParams.set('fields', JSON.stringify(params.fields));
        }
        if (params.filters) {
            queryParams.set('filters', JSON.stringify(params.filters));
        }
        if (params.order_by) {
            queryParams.set('order_by', params.order_by);
        }
        if (params.limit) {
            queryParams.set('limit_page_length', String(params.limit));
        }
        if (params.limit_start) {
            queryParams.set('limit_start', String(params.limit_start));
        }
        const res = await fetchWithRetry(`${this.getBaseUrl()}/api/resource/${params.doctype}?${queryParams.toString()}`, {
            headers: this.getHeaders(),
            credentials: 'include'
        }, this.retryConfig);
        if (!res.ok) {
            throw new Error(`Failed to fetch ${params.doctype} list`);
        }
        return res.json();
    }
    async getDoc(doctype, name) {
        const res = await fetchWithRetry(`${this.getBaseUrl()}/api/resource/${doctype}/${name}`, {
            headers: this.getHeaders(),
            credentials: 'include'
        }, this.retryConfig);
        if (!res.ok) {
            throw new Error(`Failed to fetch ${doctype} ${name}`);
        }
        return res.json();
    }
    async createDoc(doctype, data) {
        const res = await fetchWithRetry(`${this.getBaseUrl()}/api/resource/${doctype}`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data)
        }, {
            maxRetries: 1,
            ...this.retryConfig
        } // Create: only 1 retry to avoid duplicates
        );
        if (!res.ok) {
            const error = await res.json().catch(()=>({
                    message: `Failed to create ${doctype}`
                }));
            throw new Error(error.message || `Failed to create ${doctype}`);
        }
        return res.json();
    }
    async updateDoc(doctype, name, data) {
        const res = await fetchWithRetry(`${this.getBaseUrl()}/api/resource/${doctype}/${name}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data)
        }, {
            maxRetries: 1,
            ...this.retryConfig
        } // Update: only 1 retry to avoid duplicates
        );
        if (!res.ok) {
            throw new Error(`Failed to update ${doctype} ${name}`);
        }
        return res.json();
    }
    async deleteDoc(doctype, name) {
        const res = await fetchWithRetry(`${this.getBaseUrl()}/api/resource/${doctype}/${name}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
            credentials: 'include'
        }, {
            maxRetries: 1,
            ...this.retryConfig
        } // Delete: only 1 retry to avoid duplicates
        );
        if (!res.ok) {
            throw new Error(`Failed to delete ${doctype} ${name}`);
        }
    }
    // ── URY-Specific API Methods ──────────────────────────
    async getRestaurantMenu(posProfile, room, orderType) {
        return this.call({
            method: 'ury.ury_pos.api.getRestaurantMenu',
            args: {
                pos_profile: posProfile,
                room,
                order_type: orderType
            }
        });
    }
    async getMenuCourses() {
        return this.call({
            method: 'ury.ury_pos.api.getMenuCourses'
        });
    }
    async getRooms() {
        return this.call({
            method: 'ury.ury_pos.api.getRoom'
        });
    }
    async getBranch() {
        return this.call({
            method: 'ury.ury_pos.api.getBranch'
        });
    }
    async getBranchRoom() {
        return this.call({
            method: 'ury.ury_pos.api.getBranchRoom'
        });
    }
    async getModeOfPayment() {
        return this.call({
            method: 'ury.ury_pos.api.getModeOfPayment'
        });
    }
    async getPosProfile() {
        return this.call({
            method: 'ury.ury_pos.api.getPosProfile'
        });
    }
    async posOpening() {
        return this.call({
            method: 'ury.ury_pos.api.posOpening'
        });
    }
    async getCashier(room) {
        return this.call({
            method: 'ury.ury_pos.api.getCashier',
            args: {
                room
            }
        });
    }
    async getInvoiceForCashier(status, cashier, limit, limitStart) {
        return this.call({
            method: 'ury.ury_pos.api.getInvoiceForCashier',
            args: {
                status,
                cashier,
                limit,
                limit_start: limitStart
            }
        });
    }
    async getKOTList() {
        return this.call({
            method: 'ury.api.ury_kot_display.get_kot_list'
        });
    }
    async serveKOT(name, time) {
        return this.call({
            method: 'ury.api.ury_kot_display.serve_kot',
            args: {
                name,
                time
            }
        });
    }
    async confirmKOT(name, user) {
        return this.call({
            method: 'ury.api.ury_kot_display.confirm_kot',
            args: {
                name,
                user
            }
        });
    }
    async getProductionUnits() {
        return this.call({
            method: 'ury.api.ury_kot_display.get_production_units'
        });
    }
    async searchPosInvoice(query, status) {
        return this.call({
            method: 'ury.ury_pos.api.searchPosInvoice',
            args: {
                query,
                status
            }
        });
    }
    // ── URY Doctypes ──────────────────────────────────────
    async getRestaurants() {
        return this.getDocList({
            doctype: 'URY Restaurant',
            fields: [
                '*'
            ]
        });
    }
    async getRestaurantRooms(restaurant) {
        const filters = {};
        if (restaurant) filters['restaurant'] = restaurant;
        return this.getDocList({
            doctype: 'URY Room',
            fields: [
                '*'
            ],
            filters
        });
    }
    async getRestaurantTables(room) {
        const filters = {};
        if (room) filters['room'] = room;
        return this.getDocList({
            doctype: 'URY Table',
            fields: [
                '*'
            ],
            filters
        });
    }
    async getDailyPL(date) {
        const filters = {};
        if (date) filters['date'] = date;
        return this.getDocList({
            doctype: 'URY Daily P&L',
            fields: [
                '*'
            ],
            filters,
            limit: 30
        });
    }
    // ── Shift & Cashier Methods ──────────────────────────
    async getPOSOpeningEntry(status) {
        const filters = {};
        if (status) filters['status'] = status;
        return this.getDocList({
            doctype: 'POS Opening Entry',
            fields: [
                '*'
            ],
            filters,
            order_by: 'creation desc',
            limit: 5
        });
    }
    async getPOSClosingEntry(openingEntry) {
        const filters = {};
        if (openingEntry) filters['pos_opening_entry'] = openingEntry;
        return this.getDocList({
            doctype: 'POS Closing Entry',
            fields: [
                '*'
            ],
            filters,
            order_by: 'creation desc',
            limit: 5
        });
    }
    async createPOSOpening(data) {
        return this.createDoc('POS Opening Entry', data);
    }
    async createPOSClosing(data) {
        return this.createDoc('POS Closing Entry', data);
    }
}
// ── Singleton ────────────────────────────────────────────
let clientInstance = null;
function getFrappeClient() {
    if (!clientInstance) {
        const config = loadConfig() || {
            baseUrl: ''
        };
        clientInstance = new FrappeClient(config);
    }
    return clientInstance;
}
function resetFrappeClient() {
    clientInstance = null;
}
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[project]/src/lib/use-ury-socket.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isSocketConnected",
    ()=>isSocketConnected,
    "reconnectSocket",
    ()=>reconnectSocket,
    "useURYSocket",
    ()=>useURYSocket
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2d$debug$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm-debug/index.js [app-ssr] (ecmascript) <locals>");
'use client';
;
;
const DEFAULT_SOCKET_PORT = 3003;
// ── Global Socket Singleton ──────────────────────────────
let globalSocket = null;
let connectionCount = 0;
let currentSocketUrl = null;
let subscribedRooms = new Set();
// Frappe doctypes we want realtime updates for
const FRAPPE_ROOMS = [
    'URY KOT',
    'URY Table',
    'POS Invoice',
    'URY Room',
    'POS Opening Entry',
    'POS Closing Entry',
    'URY Daily P&L'
];
/**
 * Get the Socket.io URL based on connection state.
 * When connected to Frappe, use the Frappe server URL.
 * Otherwise, fall back to localhost for demo/simulation.
 */ function getSocketUrl() {
    if ("TURBOPACK compile-time truthy", 1) return `http://localhost:${DEFAULT_SOCKET_PORT}`;
    //TURBOPACK unreachable
    ;
}
/**
 * Subscribe to Frappe realtime rooms for specific doctypes.
 * Frappe uses the 'task_subscribe' event with room names like:
 * - "doc:URY KOT" for document updates
 * - "list:URY KOT" for list updates
 */ function subscribeToFrappeRooms(socket) {
    if (!socket.connected) return;
    FRAPPE_ROOMS.forEach((doctype)=>{
        const docRoom = `doc:${doctype}`;
        const listRoom = `list:${doctype}`;
        if (!subscribedRooms.has(docRoom)) {
            socket.emit('task_subscribe', docRoom);
            subscribedRooms.add(docRoom);
        }
        if (!subscribedRooms.has(listRoom)) {
            socket.emit('task_subscribe', listRoom);
            subscribedRooms.add(listRoom);
        }
    });
    console.log('[URY Socket] Subscribed to Frappe rooms:', Array.from(subscribedRooms));
}
/**
 * Unsubscribe from all Frappe rooms.
 */ function unsubscribeFromFrappeRooms(socket) {
    subscribedRooms.forEach((room)=>{
        socket.emit('task_unsubscribe', room);
    });
    subscribedRooms.clear();
}
/**
 * Map Frappe doc action to KOT status.
 */ function mapFrappeKOTStatus(doc) {
    if (!doc) return 'new';
    const status = String(doc.status || doc.kot_status || '').toLowerCase();
    if (status.includes('prepar') || status.includes('in_progress') || status.includes('cooking')) return 'preparing';
    if (status.includes('ready') || status.includes('complete') || status.includes('done')) return 'ready';
    if (status.includes('serv') || status.includes('deliver')) return 'served';
    if (status.includes('cancel')) return 'cancelled';
    if (status.includes('modif')) return 'modified';
    return 'new';
}
/**
 * Map Frappe table status to our status type.
 */ function mapFrappeTableStatus(doc) {
    if (!doc) return 'free';
    const status = String(doc.status || doc.occupancy_status || '').toLowerCase();
    if (status.includes('occup') || status.includes('in_use') || status.includes('active')) return 'occupied';
    if (status.includes('attention') || status.includes('alert') || status.includes('wait')) return 'attention';
    return 'free';
}
function useURYSocket() {
    const [connected, setConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const kotNewRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const kotStatusRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const tableStatusRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const invoiceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        connectionCount++;
        const socketUrl = getSocketUrl();
        const isFrappe = !socketUrl.includes('localhost');
        // Only create new socket if URL changed or no socket exists
        if (!globalSocket || currentSocketUrl !== socketUrl) {
            if (globalSocket) {
                globalSocket.disconnect();
                globalSocket = null;
                subscribedRooms.clear();
            }
            currentSocketUrl = socketUrl;
            globalSocket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2d$debug$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["io"])(socketUrl, {
                path: '/socket.io',
                transports: [
                    'websocket',
                    'polling'
                ],
                reconnection: true,
                reconnectionAttempts: isFrappe ? 15 : 5,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 10000,
                timeout: 15000,
                withCredentials: isFrappe
            });
        }
        const socket = globalSocket;
        // ── Connection Handlers ──────────────────────────────
        const onConnect = ()=>{
            setConnected(true);
            console.log('[URY Socket] Connected to', socketUrl);
            // Subscribe to Frappe realtime rooms when connected to Frappe
            if (isFrappe) {
                subscribeToFrappeRooms(socket);
            }
        };
        const onDisconnect = (reason)=>{
            setConnected(false);
            console.log('[URY Socket] Disconnected:', reason);
        };
        const onConnectError = (err)=>{
            setConnected(false);
            console.warn('[URY Socket] Connection error:', err.message);
        };
        // ── Custom URY Events (demo/local mode) ──────────────
        const onKotNew = (kot)=>{
            kotNewRef.current?.(kot);
        };
        const onKotStatus = (event)=>{
            kotStatusRef.current?.(event);
        };
        const onTableStatus = (event)=>{
            tableStatusRef.current?.(event);
        };
        // ── Frappe Realtime Doc Events ───────────────────────
        const onDocUpdate = (data)=>{
            console.log('[URY Socket] doc_update:', data.doctype, data.name, data.action);
            if (data.doctype === 'URY KOT') {
                if (data.action === 'insert') {
                    // New KOT created — construct event from doc data
                    const doc = data.doc || {};
                    kotNewRef.current?.({
                        id: String(data.name || doc.name || ''),
                        orderNo: String(doc.order_no || doc.orderNo || ''),
                        table: String(doc.restaurant_table || doc.table || ''),
                        items: Array.isArray(doc.items) ? doc.items.map((item)=>({
                                name: String(item.item_name || item.name || ''),
                                qty: Number(item.qty || 1),
                                course: item.course ? String(item.course) : undefined,
                                comments: item.comments ? String(item.comments) : undefined
                            })) : [],
                        timePlaced: doc.time_placed ? String(doc.time_placed).slice(0, 5) : new Date().toLocaleTimeString('sl-SI', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        elapsed: Number(doc.elapsed || 0),
                        status: mapFrappeKOTStatus(doc),
                        production: String(doc.production_unit || doc.production || 'Kuhinja 1'),
                        kotType: doc.kot_type || 'New Order',
                        customer: String(doc.customer || '')
                    });
                } else if (data.action === 'update' || data.action === 'submit') {
                    // KOT status changed
                    const doc = data.doc || {};
                    kotStatusRef.current?.({
                        kotId: String(data.name || ''),
                        newStatus: mapFrappeKOTStatus(doc)
                    });
                } else if (data.action === 'cancel') {
                    kotStatusRef.current?.({
                        kotId: String(data.name || ''),
                        newStatus: 'cancelled'
                    });
                }
            }
            if (data.doctype === 'URY Table') {
                const doc = data.doc || {};
                tableStatusRef.current?.({
                    tableId: parseInt(String(data.name || doc.name || '0').replace(/\D/g, '') || '0'),
                    status: mapFrappeTableStatus(doc),
                    pax: Number(doc.no_of_seats || doc.pax || 0),
                    customer: doc.customer ? String(doc.customer) : undefined,
                    occupiedSince: doc.occupied_since ? String(doc.occupied_since) : undefined
                });
            }
            if (data.doctype === 'POS Invoice') {
                const doc = data.doc || {};
                invoiceRef.current?.({
                    invoiceName: String(data.name || ''),
                    status: doc.status || 'Draft',
                    amount: Number(doc.grand_total || 0),
                    customer: String(doc.customer || '')
                });
            }
        };
        const onListUpdate = (data)=>{
            // List updates mean a document in a list changed — trigger targeted refresh
            console.log('[URY Socket] list_update:', data.doctype);
        // The store's auto-refresh will handle the data update
        };
        // ── Register all event handlers ──────────────────────
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);
        // Custom URY events (demo/local mode)
        socket.on('kot_new', onKotNew);
        socket.on('kot_status_change', onKotStatus);
        socket.on('table_status_change', onTableStatus);
        // Frappe standard realtime events
        socket.on('doc_update', onDocUpdate);
        socket.on('list_update', onListUpdate);
        // If already connected, set state and subscribe
        if (socket.connected) {
            setConnected(true);
            if (isFrappe) {
                subscribeToFrappeRooms(socket);
            }
        }
        return ()=>{
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
            socket.off('kot_new', onKotNew);
            socket.off('kot_status_change', onKotStatus);
            socket.off('table_status_change', onTableStatus);
            socket.off('doc_update', onDocUpdate);
            socket.off('list_update', onListUpdate);
            connectionCount--;
            if (connectionCount <= 0) {
                unsubscribeFromFrappeRooms(socket);
                socket.disconnect();
                globalSocket = null;
                currentSocketUrl = null;
                connectionCount = 0;
            }
        };
    }, []);
    const onKOTNew = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((cb)=>{
        kotNewRef.current = cb;
    }, []);
    const onKOTStatusChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((cb)=>{
        kotStatusRef.current = cb;
    }, []);
    const onTableStatusChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((cb)=>{
        tableStatusRef.current = cb;
    }, []);
    const onInvoiceEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((cb)=>{
        invoiceRef.current = cb;
    }, []);
    /**
   * Force reconnect with new URL (e.g. after Frappe config change)
   */ const reconnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (globalSocket) {
            unsubscribeFromFrappeRooms(globalSocket);
            globalSocket.disconnect();
            globalSocket = null;
            currentSocketUrl = null;
        }
    // Next render cycle will create new connection
    }, []);
    return {
        onKOTNew,
        onKOTStatusChange,
        onTableStatusChange,
        onInvoiceEvent,
        connected,
        reconnect
    };
}
function reconnectSocket() {
    if (globalSocket) {
        unsubscribeFromFrappeRooms(globalSocket);
        globalSocket.disconnect();
        globalSocket = null;
        currentSocketUrl = null;
    }
}
function isSocketConnected() {
    return globalSocket?.connected ?? false;
}
}),
"[project]/src/lib/ury-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useConnectionStatus",
    ()=>useConnectionStatus,
    "useDashboardData",
    ()=>useDashboardData,
    "useUIState",
    ()=>useUIState,
    "useURYStore",
    ()=>useURYStore
]);
// URY Dashboard Store — Zustand
// Centralized state management with real-time Socket.io updates
// Falls back to mock data when no Frappe backend is connected
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mock-data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frappe$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/frappe-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$use$2d$ury$2d$socket$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/use-ury-socket.ts [app-ssr] (ecmascript)");
;
;
;
;
// ── Auto-refresh interval (ms) ──────────────────────────
const REFRESH_INTERVAL = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 30_000;
// ── UI Preference Persistence ────────────────────────────
const UI_PREFS_KEY = 'ury_ui_prefs';
function loadUIPrefs() {
    if ("TURBOPACK compile-time truthy", 1) return {};
    //TURBOPACK unreachable
    ;
}
function saveUIPrefs(prefs) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
// ── Auto-refresh timer ──────────────────────────────────
let refreshTimer = null;
// ── Toast auto-remove timer ─────────────────────────────
const toastTimers = new Map();
const useURYStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>{
    // Load saved config
    const savedConfig = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
    const savedPrefs = loadUIPrefs();
    // Apply dark mode on load
    if (savedPrefs.darkMode && typeof document !== 'undefined') {
        document.documentElement.classList.add('dark');
    }
    return {
        // Connection
        frappeConfig: savedConfig,
        isConnected: false,
        isConnecting: false,
        connectionError: null,
        authenticatedUser: null,
        lastRefreshed: null,
        isRefreshing: false,
        // Data (mock defaults)
        restaurantName: process.env.NEXT_PUBLIC_RESTAURANT_NAME || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RESTAURANT_NAME"],
        currency: process.env.NEXT_PUBLIC_CURRENCY || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CURRENCY"],
        kpis: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["kpiData"]
        },
        hourlySales: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hourlySalesData"]
        ],
        recentOrders: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recentOrders"]
        ],
        tables: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tablesData"]
        ],
        rooms: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rooms"]
        ],
        kotCards: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["kotCards"]
        ],
        plSummary: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["plSummary"]
        },
        dailyPL: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dailyPLData"]
        ],
        expenseBreakdown: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["expenseBreakdown"]
        ],
        plLineItems: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["plLineItems"]
        ],
        apiEndpoints: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiEndpoints"]
        ],
        cashiers: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockCashiers"]
        ],
        shiftInfo: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockShiftInfo"]
        },
        frontendApps: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["frontendApps"]
        ],
        backendComponents: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["backendComponents"]
        ],
        infrastructureComponents: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["infrastructureComponents"]
        ],
        doctypes: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doctypes"]
        ],
        docEventHooks: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["docEventHooks"]
        ],
        // Menu & Orders
        menuCourses: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["menuCourses"]
        ],
        menuItems: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["menuItems"]
        ],
        activeOrders: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeOrders"]
        ],
        // Advanced Dashboard
        dashboardPeriod: 'today',
        dashboardMetrics: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dashboardMetricsByPeriod"].today
        },
        salesTrend: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["salesTrendByPeriod"].today
        ],
        topSellingItems: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["topSellingItems"]
        ],
        paymentSplit: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["paymentMethodSplit"]
        ],
        hourlyHeatmap: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hourlyHeatmapData"]
        ],
        // Reports
        reportPeriod: 'daily',
        reportData: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reportDataByPeriod"].daily
        },
        // UI state (persisted)
        activeTab: savedPrefs.activeTab || 'overview',
        sidebarOpen: false,
        darkMode: savedPrefs.darkMode || false,
        // Toast notifications
        toasts: [],
        // ── Actions ────────────────────────────────────────
        setActiveTab: (tab)=>{
            set({
                activeTab: tab
            });
            saveUIPrefs({
                activeTab: tab
            });
        },
        toggleSidebar: ()=>set((s)=>({
                    sidebarOpen: !s.sidebarOpen
                })),
        setSidebarOpen: (open)=>set({
                sidebarOpen: open
            }),
        toggleDarkMode: ()=>set((s)=>{
                const newDark = !s.darkMode;
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.toggle('dark', newDark);
                }
                saveUIPrefs({
                    darkMode: newDark
                });
                return {
                    darkMode: newDark
                };
            }),
        setFrappeConfig: (config)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frappe$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveConfig"])(config);
            const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frappe$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFrappeClient"])();
            client.updateConfig(config);
            set({
                frappeConfig: config,
                connectionError: null
            });
        },
        testConnection: async ()=>{
            set({
                isConnecting: true,
                connectionError: null
            });
            try {
                const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frappe$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFrappeClient"])();
                const config = get().frappeConfig;
                if (config) {
                    client.updateConfig(config);
                }
                const ok = await client.ping();
                if (ok) {
                    // Try to get logged-in user
                    const user = await client.getLoggedInUser();
                    set({
                        isConnected: true,
                        isConnecting: false,
                        authenticatedUser: user
                    });
                    // Reconnect socket to Frappe server
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$use$2d$ury$2d$socket$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reconnectSocket"])();
                    // Fetch real data from Frappe
                    get().refreshData();
                    // Start auto-refresh
                    get().startAutoRefresh();
                    // Toast notification
                    get().addToast({
                        type: 'success',
                        title: 'Povezava uspešna',
                        description: `Povezan s Frappe strežnikom${user ? ` kot ${user}` : ''}`
                    });
                    return true;
                }
                set({
                    isConnected: false,
                    isConnecting: false,
                    connectionError: 'Ne morem vzpostaviti povezave s Frappe strežnikom'
                });
                get().addToast({
                    type: 'error',
                    title: 'Povezava ni uspela',
                    description: 'Ne morem vzpostaviti povezave s Frappe strežnikom'
                });
                return false;
            } catch (err) {
                set({
                    isConnected: false,
                    isConnecting: false,
                    connectionError: err instanceof Error ? err.message : 'Napaka povezave'
                });
                get().addToast({
                    type: 'error',
                    title: 'Napaka povezave',
                    description: err instanceof Error ? err.message : 'Napaka povezave'
                });
                return false;
            }
        },
        login: async (username, password)=>{
            set({
                isConnecting: true,
                connectionError: null
            });
            try {
                const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frappe$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFrappeClient"])();
                const config = get().frappeConfig;
                if (config) {
                    client.updateConfig(config);
                }
                const result = await client.login(username, password);
                set({
                    isConnected: true,
                    isConnecting: false,
                    authenticatedUser: result.user || result.full_name || username
                });
                // Reconnect socket to Frappe server
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$use$2d$ury$2d$socket$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reconnectSocket"])();
                // Fetch real data from Frappe
                get().refreshData();
                // Start auto-refresh
                get().startAutoRefresh();
                get().addToast({
                    type: 'success',
                    title: 'Prijava uspešna',
                    description: `Dobrodošli, ${result.full_name || username}`
                });
                return true;
            } catch (err) {
                set({
                    isConnecting: false,
                    connectionError: err instanceof Error ? err.message : 'Prijava ni uspela'
                });
                get().addToast({
                    type: 'error',
                    title: 'Prijava ni uspela',
                    description: err instanceof Error ? err.message : 'Prijava ni uspela'
                });
                return false;
            }
        },
        logout: ()=>{
            get().stopAutoRefresh();
            set({
                isConnected: false,
                authenticatedUser: null,
                connectionError: null
            });
        },
        disconnectBackend: ()=>{
            get().stopAutoRefresh();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frappe$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearConfig"])();
            set({
                frappeConfig: null,
                isConnected: false,
                authenticatedUser: null,
                connectionError: null,
                lastRefreshed: null,
                isRefreshing: false,
                // Reset to mock data
                restaurantName: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RESTAURANT_NAME"],
                currency: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CURRENCY"],
                kpis: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["kpiData"]
                },
                hourlySales: [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hourlySalesData"]
                ],
                recentOrders: [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recentOrders"]
                ],
                tables: [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tablesData"]
                ],
                rooms: [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rooms"]
                ],
                kotCards: [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["kotCards"]
                ],
                plSummary: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["plSummary"]
                },
                dailyPL: [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dailyPLData"]
                ],
                expenseBreakdown: [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["expenseBreakdown"]
                ],
                plLineItems: [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["plLineItems"]
                ],
                cashiers: [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockCashiers"]
                ],
                shiftInfo: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockShiftInfo"]
                },
                menuCourses: [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["menuCourses"]
                ],
                menuItems: [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["menuItems"]
                ],
                activeOrders: [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["activeOrders"]
                ]
            });
        },
        // ── Main Data Refresh ──────────────────────────────
        refreshData: async ()=>{
            const { isConnected } = get();
            if (!isConnected) return;
            set({
                isRefreshing: true
            });
            try {
                const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frappe$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFrappeClient"])();
                // Run all fetches in parallel for better performance
                const [kotResult, tablesResult, invoicesResult, roomsResult, plResult, shiftResult] = await Promise.allSettled([
                    client.getKOTList(),
                    client.getRestaurantTables(),
                    client.getInvoiceForCashier('Paid', '', 20, 0),
                    client.getRestaurantRooms(),
                    client.getDailyPL(),
                    client.getPOSOpeningEntry('Open')
                ]);
                // ── Process KOTs ────────────────────────────────
                if (kotResult.status === 'fulfilled' && kotResult.value?.data) {
                    const transformedKOTs = Array.isArray(kotResult.value.data) ? kotResult.value.data.map((kot)=>({
                            id: String(kot.name || kot.id || ''),
                            orderNo: String(kot.order_no || kot.orderNo || ''),
                            table: String(kot.restaurant_table || kot.table || ''),
                            items: Array.isArray(kot.items) ? kot.items.map((item)=>({
                                    name: String(item.item_name || item.name || ''),
                                    qty: Number(item.qty || 1),
                                    course: item.course ? String(item.course) : undefined,
                                    comments: item.comments ? String(item.comments) : undefined
                                })) : [],
                            timePlaced: String(kot.time_placed || kot.timePlaced || ''),
                            elapsed: Number(kot.elapsed || 0),
                            status: kot.status || 'new',
                            production: String(kot.production_unit || kot.production || 'Kuhinja 1'),
                            kotType: kot.kot_type || kot.kotType || 'New Order'
                        })) : [];
                    set({
                        kotCards: transformedKOTs
                    });
                }
                // ── Process Tables ──────────────────────────────
                if (tablesResult.status === 'fulfilled' && tablesResult.value?.data) {
                    const transformedTables = Array.isArray(tablesResult.value.data) ? tablesResult.value.data.map((t)=>({
                            id: Number(t.name || t.id || 0),
                            room: String(t.room || ''),
                            status: t.status || 'free',
                            pax: Number(t.no_of_seats || t.pax || 0),
                            occupiedSince: t.occupied_since ? String(t.occupied_since) : undefined,
                            orderItems: t.order_items ? String(t.order_items).split(', ') : undefined,
                            orderTotal: t.order_total ? Number(t.order_total) : undefined,
                            customer: t.customer ? String(t.customer) : undefined
                        })) : [];
                    set({
                        tables: transformedTables
                    });
                }
                // ── Process Invoices → Recent Orders + KPIs ─────
                if (invoicesResult.status === 'fulfilled' && invoicesResult.value?.data) {
                    const invoices = Array.isArray(invoicesResult.value.data) ? invoicesResult.value.data : [];
                    // Recent orders
                    const transformedOrders = invoices.map((inv)=>({
                            invoice: String(inv.name || ''),
                            customer: String(inv.customer || ''),
                            type: inv.type === 'Dine-in' ? 'Dine-in' : inv.type === 'Takeaway' ? 'Takeaway' : 'Delivery',
                            amount: Number(inv.grand_total || 0),
                            status: inv.status || 'Paid',
                            time: inv.posting_time ? String(inv.posting_time).slice(0, 5) : ''
                        }));
                    set({
                        recentOrders: transformedOrders
                    });
                    // Compute KPIs from invoices
                    const totalSales = invoices.reduce((sum, inv)=>sum + Number(inv.grand_total || 0), 0);
                    const totalOrders = invoices.length;
                    const occupiedTables = invoices.filter((inv)=>inv.type === 'Dine-in').length;
                    const allTables = get().tables;
                    set({
                        kpis: {
                            dailySales: totalSales,
                            totalOrders,
                            avgBill: totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0,
                            occupiedTables,
                            totalTables: allTables.length || 32
                        }
                    });
                    // Compute hourly sales from invoices
                    const hourMap = new Map();
                    // Initialize all hours from 11:00 to 22:00
                    for(let h = 11; h <= 22; h++){
                        const key = `${String(h).padStart(2, '0')}:00`;
                        hourMap.set(key, {
                            dineIn: 0,
                            takeaway: 0
                        });
                    }
                    // Aggregate invoice totals by hour
                    invoices.forEach((inv)=>{
                        const timeStr = String(inv.posting_time || '').slice(0, 5);
                        if (!timeStr) return;
                        const hour = timeStr.split(':')[0];
                        const key = `${hour}:00`;
                        const entry = hourMap.get(key);
                        if (entry) {
                            const amount = Number(inv.grand_total || 0);
                            if (inv.type === 'Takeaway' || inv.type === 'Delivery') {
                                entry.takeaway += amount;
                            } else {
                                entry.dineIn += amount;
                            }
                        }
                    });
                    const hourlyData = Array.from(hourMap.entries()).map(([hour, data])=>({
                            hour,
                            dineIn: data.dineIn,
                            takeaway: data.takeaway
                        }));
                    if (hourlyData.length > 0) set({
                        hourlySales: hourlyData
                    });
                }
                // ── Process Rooms ───────────────────────────────
                if (roomsResult.status === 'fulfilled' && roomsResult.value?.data) {
                    const transformedRooms = Array.isArray(roomsResult.value.data) ? roomsResult.value.data.map((r)=>({
                            id: String(r.name || r.id || '').toLowerCase().replace(/\s+/g, '-'),
                            name: String(r.room_name || r.name || ''),
                            tables: Number(r.no_of_tables || r.tables || 0)
                        })) : [];
                    if (transformedRooms.length > 0) set({
                        rooms: transformedRooms
                    });
                }
                // ── Process P&L ─────────────────────────────────
                if (plResult.status === 'fulfilled' && plResult.value?.data) {
                    const plDocs = Array.isArray(plResult.value.data) ? plResult.value.data : [];
                    if (plDocs.length > 0) {
                        // Use the latest P&L document
                        const latest = plDocs[0];
                        // P&L Summary
                        const grossSales = Number(latest.gross_sales || latest.total_revenue || 0);
                        const cogs = Number(latest.cogs || latest.cost_of_goods_sold || 0);
                        const grossProfit = grossSales - cogs;
                        const netProfit = Number(latest.net_profit || grossProfit - Number(latest.total_expenses || 0));
                        set({
                            plSummary: {
                                grossSales,
                                cogs,
                                grossProfit,
                                netProfit
                            }
                        });
                        // Daily P&L from multiple docs
                        const dailyData = plDocs.slice(0, 7).reverse().map((doc)=>{
                            const date = String(doc.date || doc.posting_date || '');
                            const dayName = date ? new Date(date).toLocaleDateString('sl-SI', {
                                weekday: 'short'
                            }) : '';
                            return {
                                day: dayName,
                                revenue: Number(doc.gross_sales || doc.total_revenue || 0),
                                costs: Number(doc.cogs || doc.total_expenses || 0)
                            };
                        });
                        if (dailyData.length > 0) set({
                            dailyPL: dailyData
                        });
                        // Expense breakdown — try to extract from P&L doc
                        const breakdownData = [];
                        if (latest.breakup || latest.expense_breakdown) {
                            const items = Array.isArray(latest.breakup || latest.expense_breakdown) ? latest.breakup || latest.expense_breakdown : [];
                            const colors = [
                                '#ef4444',
                                '#f97316',
                                '#eab308',
                                '#8b5cf6',
                                '#10b981'
                            ];
                            items.forEach((item, i)=>{
                                breakdownData.push({
                                    name: String(item.expense_type || item.category || item.name || ''),
                                    value: Number(item.percentage || item.value || 0),
                                    color: colors[i % colors.length]
                                });
                            });
                        }
                        if (breakdownData.length > 0) set({
                            expenseBreakdown: breakdownData
                        });
                        // Line items
                        const lines = [];
                        if (latest.breakup || latest.line_items) {
                            const items = Array.isArray(latest.breakup || latest.line_items) ? latest.breakup || latest.line_items : [];
                            items.forEach((item)=>{
                                lines.push({
                                    label: String(item.label || item.expense_type || item.name || ''),
                                    value: Number(item.amount || item.value || 0),
                                    bold: Boolean(item.is_total || item.bold || false)
                                });
                            });
                        }
                        if (lines.length > 0) set({
                            plLineItems: lines
                        });
                    }
                }
                // ── Process Shift / Cashier ─────────────────────
                if (shiftResult.status === 'fulfilled' && shiftResult.value?.data) {
                    const openings = Array.isArray(shiftResult.value.data) ? shiftResult.value.data : [];
                    if (openings.length > 0) {
                        const latestOpening = openings[0];
                        const openedAt = String(latestOpening.period_start || latestOpening.opening_time || '').slice(0, 5);
                        const openedBy = String(latestOpening.user || latestOpening.opened_by || '');
                        const openingBalance = Number(latestOpening.opening_amount || latestOpening.balance_details?.[0]?.amount || 0);
                        set({
                            shiftInfo: {
                                status: 'open',
                                openedAt: openedAt || '09:00',
                                closesAt: '23:00',
                                openedBy: openedBy || 'Administrator',
                                openingBalance
                            }
                        });
                        // Build cashier data from POS opening entry
                        const cashierList = [];
                        const balanceRows = Array.isArray(latestOpening.balance_details) ? latestOpening.balance_details : [];
                        if (balanceRows.length > 0) {
                            balanceRows.forEach((row)=>{
                                cashierList.push({
                                    name: String(row.user || openedBy || 'Cashier'),
                                    role: 'URY Cashier',
                                    openedAt: openedAt || '09:00',
                                    status: 'active',
                                    openingBalance: Number(row.opening_amount || 0),
                                    currentTotal: Number(row.closing_amount || row.opening_amount || 0),
                                    cashPayments: Number(row.cash_amount || 0),
                                    cardPayments: Number(row.card_amount || 0),
                                    upiPayments: Number(row.upi_amount || 0),
                                    ordersProcessed: Number(row.orders_processed || 0),
                                    room: String(row.room || 'Glavna dvorana')
                                });
                            });
                        }
                        if (cashierList.length > 0) set({
                            cashiers: cashierList
                        });
                    } else {
                        // No open shift found
                        set({
                            shiftInfo: {
                                status: 'closed',
                                openedAt: '',
                                closesAt: '',
                                openedBy: '',
                                openingBalance: 0
                            }
                        });
                    }
                }
                // Mark refresh time
                set({
                    lastRefreshed: new Date(),
                    isRefreshing: false
                });
            } catch (err) {
                console.error('Failed to refresh data:', err);
                set({
                    isRefreshing: false
                });
            }
        },
        // ── Targeted Refresh: KPIs only ────────────────────
        refreshKPIs: async ()=>{
            const { isConnected } = get();
            if (!isConnected) return;
            try {
                const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frappe$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFrappeClient"])();
                const invoicesResult = await client.getInvoiceForCashier('Paid', '', 50, 0).catch(()=>null);
                if (invoicesResult?.data && Array.isArray(invoicesResult.data)) {
                    const invoices = invoicesResult.data;
                    const totalSales = invoices.reduce((sum, inv)=>sum + Number(inv.grand_total || 0), 0);
                    const totalOrders = invoices.length;
                    const occupiedTables = invoices.filter((inv)=>inv.type === 'Dine-in').length;
                    const allTables = get().tables;
                    set({
                        kpis: {
                            dailySales: totalSales,
                            totalOrders,
                            avgBill: totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0,
                            occupiedTables,
                            totalTables: allTables.length || 32
                        }
                    });
                }
            } catch (err) {
                console.error('Failed to refresh KPIs:', err);
            }
        },
        // ── Targeted Refresh: P&L only ─────────────────────
        refreshPL: async ()=>{
            const { isConnected } = get();
            if (!isConnected) return;
            try {
                const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frappe$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFrappeClient"])();
                const plResult = await client.getDailyPL().catch(()=>null);
                if (plResult?.data && Array.isArray(plResult.data)) {
                    const plDocs = plResult.data;
                    if (plDocs.length > 0) {
                        const latest = plDocs[0];
                        const grossSales = Number(latest.gross_sales || latest.total_revenue || 0);
                        const cogs = Number(latest.cogs || latest.cost_of_goods_sold || 0);
                        const grossProfit = grossSales - cogs;
                        const netProfit = Number(latest.net_profit || grossProfit - Number(latest.total_expenses || 0));
                        set({
                            plSummary: {
                                grossSales,
                                cogs,
                                grossProfit,
                                netProfit
                            }
                        });
                        const dailyData = plDocs.slice(0, 7).reverse().map((doc)=>{
                            const date = String(doc.date || doc.posting_date || '');
                            return {
                                day: date ? new Date(date).toLocaleDateString('sl-SI', {
                                    weekday: 'short'
                                }) : '',
                                revenue: Number(doc.gross_sales || doc.total_revenue || 0),
                                costs: Number(doc.cogs || doc.total_expenses || 0)
                            };
                        });
                        if (dailyData.length > 0) set({
                            dailyPL: dailyData
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to refresh P&L:', err);
            }
        },
        // ── Targeted Refresh: Shift only ───────────────────
        refreshShift: async ()=>{
            const { isConnected } = get();
            if (!isConnected) return;
            try {
                const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frappe$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFrappeClient"])();
                const shiftResult = await client.getPOSOpeningEntry('Open').catch(()=>null);
                if (shiftResult?.data && Array.isArray(shiftResult.data)) {
                    const openings = shiftResult.data;
                    if (openings.length > 0) {
                        const latestOpening = openings[0];
                        const openedAt = String(latestOpening.period_start || latestOpening.opening_time || '').slice(0, 5);
                        const openedBy = String(latestOpening.user || latestOpening.opened_by || '');
                        const openingBalance = Number(latestOpening.opening_amount || 0);
                        set({
                            shiftInfo: {
                                status: 'open',
                                openedAt: openedAt || '09:00',
                                closesAt: '23:00',
                                openedBy: openedBy || 'Administrator',
                                openingBalance
                            }
                        });
                    } else {
                        set({
                            shiftInfo: {
                                status: 'closed',
                                openedAt: '',
                                closesAt: '',
                                openedBy: '',
                                openingBalance: 0
                            }
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to refresh shift:', err);
            }
        },
        updateKOTStatus: (id, status)=>{
            set((s)=>({
                    kotCards: s.kotCards.map((c)=>c.id === id ? {
                            ...c,
                            status
                        } : c)
                }));
            // If connected to backend, also push the status change
            const { isConnected } = get();
            if (isConnected) {
                const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frappe$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFrappeClient"])();
                if (status === 'served') {
                    client.serveKOT(id, new Date().toISOString()).catch(console.error);
                } else if (status === 'preparing') {
                // Could call a confirm/update endpoint
                }
            }
        },
        openShift: (openingBalance, openedBy)=>{
            const now = new Date();
            const timeStr = now.toLocaleTimeString('sl-SI', {
                hour: '2-digit',
                minute: '2-digit'
            });
            set({
                shiftInfo: {
                    status: 'open',
                    openedAt: timeStr,
                    closesAt: '23:00',
                    openedBy,
                    openingBalance
                }
            });
            // If connected, call Frappe POS Opening
            if (get().isConnected) {
                const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frappe$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFrappeClient"])();
                client.posOpening().catch(console.error);
            }
        },
        closeShift: ()=>{
            set((s)=>({
                    shiftInfo: {
                        ...s.shiftInfo,
                        status: 'closed'
                    }
                }));
        },
        transferShift: (fromCashier)=>{
            set((s)=>({
                    cashiers: s.cashiers.map((c)=>c.name === fromCashier ? {
                            ...c,
                            status: 'closing'
                        } : c)
                }));
        },
        // ── Auto-Refresh ───────────────────────────────────
        startAutoRefresh: ()=>{
            if (refreshTimer) return; // Already running
            refreshTimer = setInterval(()=>{
                const { isConnected } = get();
                if (isConnected) {
                    get().refreshData();
                } else {
                    get().stopAutoRefresh();
                }
            }, REFRESH_INTERVAL);
        },
        stopAutoRefresh: ()=>{
            if (refreshTimer) {
                clearInterval(refreshTimer);
                refreshTimer = null;
            }
        },
        // ── Toast Notifications ──────────────────────────────
        addToast: (toast)=>{
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            const duration = toast.duration ?? 5000;
            set((s)=>({
                    toasts: [
                        ...s.toasts,
                        {
                            ...toast,
                            id
                        }
                    ]
                }));
            // Auto-remove after duration
            const timer = setTimeout(()=>{
                get().removeToast(id);
                toastTimers.delete(id);
            }, duration);
            toastTimers.set(id, timer);
        },
        removeToast: (id)=>{
            set((s)=>({
                    toasts: s.toasts.filter((t)=>t.id !== id)
                }));
            const timer = toastTimers.get(id);
            if (timer) {
                clearTimeout(timer);
                toastTimers.delete(id);
            }
        },
        // ── Load Menu from Database ────────────────────────
        loadMenuFromDB: async ()=>{
            try {
                const [catRes, itemRes] = await Promise.all([
                    fetch('/api/menu/categories'),
                    fetch('/api/menu/items')
                ]);
                const catData = await catRes.json();
                const itemData = await itemRes.json();
                if (catData.data) {
                    set({
                        menuCourses: catData.data.map((c)=>({
                                id: c.id,
                                name: c.name,
                                priority: c.priority,
                                itemCount: c.itemCount
                            }))
                    });
                }
                if (itemData.data) {
                    set({
                        menuItems: itemData.data.map((i)=>({
                                id: i.id,
                                name: i.name,
                                nameHi: i.nameLocal,
                                course: i.course,
                                courseName: i.courseName,
                                price: i.price,
                                description: i.description,
                                isVeg: i.isVeg,
                                isAvailable: i.isAvailable,
                                image: i.image,
                                modifiers: i.modifiers,
                                tags: i.tags
                            }))
                    });
                }
            } catch (err) {
                console.error('Failed to load menu from DB:', err);
            }
        },
        // ── Load Orders from Database ────────────────────────
        loadOrdersFromDB: async ()=>{
            try {
                const res = await fetch('/api/orders?limit=50');
                const data = await res.json();
                if (data.data) {
                    set({
                        activeOrders: data.data.map((o)=>({
                                id: o.id,
                                invoiceNo: o.invoiceNo,
                                table: o.table || undefined,
                                customer: o.customer,
                                type: o.type,
                                status: o.status,
                                total: o.total,
                                cashier: o.cashier || undefined,
                                placedAt: new Date(o.createdAt).toLocaleTimeString('sl-SI', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }),
                                elapsed: Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000),
                                items: o.items.map((item)=>({
                                        name: item.name,
                                        qty: item.qty,
                                        price: item.price,
                                        course: item.course || undefined,
                                        comments: item.comments || undefined,
                                        status: item.status
                                    }))
                            }))
                    });
                }
            } catch (err) {
                console.error('Failed to load orders from DB:', err);
            }
        },
        // ── Load Tables from Database ─────────────────────────
        loadTablesFromDB: async ()=>{
            try {
                const [tablesRes, roomsRes] = await Promise.all([
                    fetch('/api/tables'),
                    fetch('/api/rooms')
                ]);
                const tablesData = await tablesRes.json();
                const roomsData = await roomsRes.json();
                if (roomsData.data) {
                    set({
                        rooms: roomsData.data.map((r)=>({
                                id: r.id,
                                name: r.name,
                                tables: r.tables
                            }))
                    });
                }
                if (tablesData.data) {
                    set({
                        tables: tablesData.data.map((t)=>({
                                id: t.id,
                                room: t.room,
                                status: t.status,
                                pax: t.pax,
                                occupiedSince: t.occupiedSince || undefined,
                                customer: t.customer || undefined
                            }))
                    });
                }
            } catch (err) {
                console.error('Failed to load tables from DB:', err);
            }
        },
        // ── Menu CRUD Actions ──────────────────────────────
        addMenuItem: async (data)=>{
            // Optimistic local update
            const id = `mi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            const course = get().menuCourses.find((c)=>c.id === data.course);
            const newItem = {
                id,
                name: data.name,
                nameHi: data.nameLocal,
                course: data.course,
                courseName: course?.name || data.course,
                price: data.price,
                description: data.description,
                isVeg: data.isVeg,
                isAvailable: data.isAvailable,
                modifiers: data.modifiers,
                tags: data.tags
            };
            set((s)=>({
                    menuItems: [
                        ...s.menuItems,
                        newItem
                    ],
                    menuCourses: s.menuCourses.map((c)=>c.id === data.course ? {
                            ...c,
                            itemCount: c.itemCount + 1
                        } : c)
                }));
            get().addToast({
                type: 'success',
                title: 'Artikel dodan',
                description: `${data.name} je bil uspešno dodan v jedilnik`
            });
            // Persist to database via API
            try {
                const res = await fetch('/api/menu/items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (res.ok) {
                    const result = await res.json();
                    // Replace optimistic ID with real DB ID
                    if (result.data?.id && result.data.id !== id) {
                        set((s)=>({
                                menuItems: s.menuItems.map((item)=>item.id === id ? {
                                        ...item,
                                        id: result.data.id
                                    } : item)
                            }));
                    }
                }
            } catch (err) {
                console.error('Failed to persist menu item to DB:', err);
            }
        },
        updateMenuItem: async (id, data)=>{
            set((s)=>({
                    menuItems: s.menuItems.map((item)=>{
                        if (item.id !== id) return item;
                        const course = data.course ? s.menuCourses.find((c)=>c.id === data.course) : null;
                        return {
                            ...item,
                            ...data.name && {
                                name: data.name
                            },
                            ...data.nameLocal !== undefined && {
                                nameHi: data.nameLocal
                            },
                            ...data.course && {
                                course: data.course,
                                courseName: course?.name || data.course
                            },
                            ...data.price !== undefined && {
                                price: data.price
                            },
                            ...data.description !== undefined && {
                                description: data.description
                            },
                            ...data.isVeg !== undefined && {
                                isVeg: data.isVeg
                            },
                            ...data.isAvailable !== undefined && {
                                isAvailable: data.isAvailable
                            },
                            ...data.tags && {
                                tags: data.tags
                            },
                            ...data.modifiers && {
                                modifiers: data.modifiers
                            }
                        };
                    })
                }));
            get().addToast({
                type: 'success',
                title: 'Artikel posodobljen',
                description: 'Spremembe so bile shranjene'
            });
            // Persist to database via API
            try {
                await fetch(`/api/menu/items/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            } catch (err) {
                console.error('Failed to persist item update to DB:', err);
            }
        },
        deleteMenuItem: async (id)=>{
            const item = get().menuItems.find((i)=>i.id === id);
            set((s)=>({
                    menuItems: s.menuItems.filter((i)=>i.id !== id),
                    menuCourses: item ? s.menuCourses.map((c)=>c.id === item.course ? {
                            ...c,
                            itemCount: Math.max(0, c.itemCount - 1)
                        } : c) : s.menuCourses
                }));
            get().addToast({
                type: 'info',
                title: 'Artikel izbrisan',
                description: item ? `${item.name} je bil odstranjen iz jedilnika` : 'Artikel je bil odstranjen'
            });
            // Persist to database via API
            try {
                await fetch(`/api/menu/items/${id}`, {
                    method: 'DELETE'
                });
            } catch (err) {
                console.error('Failed to persist item deletion to DB:', err);
            }
        },
        toggleMenuItemAvailability: async (id)=>{
            set((s)=>({
                    menuItems: s.menuItems.map((item)=>item.id === id ? {
                            ...item,
                            isAvailable: !item.isAvailable
                        } : item)
                }));
            // Persist to database via API
            try {
                await fetch(`/api/menu/items/${id}`, {
                    method: 'PATCH'
                });
            } catch (err) {
                console.error('Failed to toggle availability in DB:', err);
            }
        },
        addMenuCourse: async (data)=>{
            const id = `course-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            const newCourse = {
                id,
                name: data.name,
                priority: data.priority,
                itemCount: 0
            };
            set((s)=>({
                    menuCourses: [
                        ...s.menuCourses,
                        newCourse
                    ].sort((a, b)=>a.priority - b.priority)
                }));
            get().addToast({
                type: 'success',
                title: 'Kategorija dodana',
                description: `${data.name} je bila uspešno dodana`
            });
            // Persist to database via API
            try {
                await fetch('/api/menu/categories', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            } catch (err) {
                console.error('Failed to persist category to DB:', err);
            }
        },
        updateMenuCourse: async (id, data)=>{
            set((s)=>({
                    menuCourses: s.menuCourses.map((c)=>c.id === id ? {
                            ...c,
                            ...data
                        } : c).sort((a, b)=>a.priority - b.priority),
                    // Also update courseName in menu items if name changed
                    menuItems: data.name ? s.menuItems.map((item)=>item.course === id ? {
                            ...item,
                            courseName: data.name
                        } : item) : s.menuItems
                }));
            get().addToast({
                type: 'success',
                title: 'Kategorija posodobljena',
                description: 'Spremembe so bile shranjene'
            });
            // Persist to database via API
            try {
                await fetch(`/api/menu/categories/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            } catch (err) {
                console.error('Failed to persist category update to DB:', err);
            }
        },
        deleteMenuCourse: async (id)=>{
            const course = get().menuCourses.find((c)=>c.id === id);
            const itemsInCourse = get().menuItems.filter((i)=>i.course === id).length;
            if (itemsInCourse > 0) {
                get().addToast({
                    type: 'warning',
                    title: 'Ni mogoče izbrisati',
                    description: `Kategorija "${course?.name}" vsebuje ${itemsInCourse} artiklov. Najprej premaknite ali izbrišite artikle.`
                });
                return;
            }
            set((s)=>({
                    menuCourses: s.menuCourses.filter((c)=>c.id !== id)
                }));
            get().addToast({
                type: 'info',
                title: 'Kategorija izbrisana',
                description: course ? `${course.name} je bila odstranjena` : 'Kategorija je bila odstranjena'
            });
            // Persist to database via API
            try {
                await fetch(`/api/menu/categories/${id}`, {
                    method: 'DELETE'
                });
            } catch (err) {
                console.error('Failed to persist category deletion to DB:', err);
            }
        },
        // ── Advanced Dashboard Actions ──────────────────────
        setDashboardPeriod: (period)=>{
            const metrics = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dashboardMetricsByPeriod"][period] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dashboardMetricsByPeriod"].today;
            const trend = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["salesTrendByPeriod"][period] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["salesTrendByPeriod"].today;
            set({
                dashboardPeriod: period,
                dashboardMetrics: {
                    ...metrics
                },
                salesTrend: [
                    ...trend
                ]
            });
        },
        // ── Report Actions ─────────────────────────────────
        setReportPeriod: (period)=>{
            const data = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reportDataByPeriod"][period] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reportDataByPeriod"].daily;
            set({
                reportPeriod: period,
                reportData: {
                    ...data
                }
            });
        },
        exportReportPDF: async ()=>{
            const { reportData, currency, restaurantName } = get();
            const { jsPDF } = await __turbopack_context__.A("[project]/node_modules/jspdf/dist/jspdf.node.min.js [app-ssr] (ecmascript, async loader)");
            const autoTable = (await __turbopack_context__.A("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-ssr] (ecmascript, async loader)")).default;
            const doc = new jsPDF();
            const periodLabels = {
                daily: 'Dnevno poročilo',
                weekly: 'Tedensko poročilo',
                monthly: 'Mesečno poročilo'
            };
            // Title
            doc.setFontSize(20);
            doc.setTextColor(5, 150, 105);
            doc.text(periodLabels[reportData.period] || 'Poročilo', 14, 22);
            // Restaurant name and date
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(restaurantName, 14, 30);
            doc.setFontSize(10);
            doc.text(`Obdobje: ${reportData.periodLabel}`, 14, 36);
            doc.text(`Datum: ${new Date().toLocaleDateString('sl-SI', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })}`, 14, 42);
            // Summary Table
            doc.setFontSize(14);
            doc.setTextColor(30, 30, 30);
            doc.text('Povzetek', 14, 54);
            autoTable(doc, {
                startY: 57,
                head: [
                    [
                        'Postavka',
                        'Vrednost'
                    ]
                ],
                body: [
                    [
                        'Skupni prihodki',
                        `${currency}${reportData.totalRevenue.toLocaleString('sl-SI')}`
                    ],
                    [
                        'Skupna naročila',
                        reportData.totalOrders.toString()
                    ],
                    [
                        'Povprečni račun',
                        `${currency}${reportData.avgOrderValue.toLocaleString('sl-SI')}`
                    ],
                    [
                        'Popusti',
                        `-${currency}${reportData.totalDiscounts.toLocaleString('sl-SI')}`
                    ],
                    [
                        'Preklici',
                        reportData.totalCancellations.toString()
                    ],
                    [
                        'Neto prihodki',
                        `${currency}${reportData.netRevenue.toLocaleString('sl-SI')}`
                    ]
                ],
                theme: 'striped',
                headStyles: {
                    fillColor: [
                        5,
                        150,
                        105
                    ],
                    textColor: 255
                },
                bodyStyles: {
                    fontSize: 10
                },
                alternateRowStyles: {
                    fillColor: [
                        240,
                        253,
                        244
                    ]
                },
                columnStyles: {
                    0: {
                        fontStyle: 'bold',
                        cellWidth: 80
                    },
                    1: {
                        halign: 'right',
                        cellWidth: 60
                    }
                },
                didParseCell: (data)=>{
                    if (data.section === 'body' && data.column.index === 1) {
                        const text = data.cell.raw;
                        if (text.startsWith('-')) {
                            data.cell.styles.textColor = [
                                220,
                                38,
                                38
                            ];
                        }
                        if (data.row.index === 5) {
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.textColor = [
                                5,
                                150,
                                105
                            ];
                        }
                    }
                }
            });
            // Top Selling Items
            const summaryEndY = doc.lastAutoTable?.finalY || 120;
            doc.setFontSize(14);
            doc.setTextColor(30, 30, 30);
            doc.text('Najbolj prodajani artikli', 14, summaryEndY + 15);
            autoTable(doc, {
                startY: summaryEndY + 18,
                head: [
                    [
                        'Artikel',
                        'Količina',
                        'Prihodki',
                        'Kategorija'
                    ]
                ],
                body: reportData.topItems.map((item)=>[
                        item.name,
                        item.quantity.toString(),
                        `${currency}${item.revenue.toLocaleString('sl-SI')}`,
                        item.course
                    ]),
                theme: 'striped',
                headStyles: {
                    fillColor: [
                        5,
                        150,
                        105
                    ],
                    textColor: 255
                },
                bodyStyles: {
                    fontSize: 9
                },
                alternateRowStyles: {
                    fillColor: [
                        240,
                        253,
                        244
                    ]
                }
            });
            // Payment Split (new page)
            doc.addPage();
            doc.setFontSize(14);
            doc.setTextColor(30, 30, 30);
            doc.text('Razdelitev plačil', 14, 22);
            autoTable(doc, {
                startY: 28,
                head: [
                    [
                        'Metoda',
                        'Število',
                        'Znesek'
                    ]
                ],
                body: reportData.paymentSplit.map((p)=>[
                        p.method,
                        p.count.toString(),
                        `${currency}${p.amount.toLocaleString('sl-SI')}`
                    ]),
                theme: 'striped',
                headStyles: {
                    fillColor: [
                        5,
                        150,
                        105
                    ],
                    textColor: 255
                },
                bodyStyles: {
                    fontSize: 10
                },
                alternateRowStyles: {
                    fillColor: [
                        240,
                        253,
                        244
                    ]
                }
            });
            // Order Type Split
            const payEndY = doc.lastAutoTable?.finalY || 80;
            doc.setFontSize(14);
            doc.setTextColor(30, 30, 30);
            doc.text('Razdelitev po tipu naročila', 14, payEndY + 15);
            autoTable(doc, {
                startY: payEndY + 18,
                head: [
                    [
                        'Tip',
                        'Število',
                        'Prihodki'
                    ]
                ],
                body: reportData.orderTypeSplit.map((o)=>[
                        o.type,
                        o.count.toString(),
                        `${currency}${o.revenue.toLocaleString('sl-SI')}`
                    ]),
                theme: 'striped',
                headStyles: {
                    fillColor: [
                        5,
                        150,
                        105
                    ],
                    textColor: 255
                },
                bodyStyles: {
                    fontSize: 10
                },
                alternateRowStyles: {
                    fillColor: [
                        240,
                        253,
                        244
                    ]
                }
            });
            // Course Revenue
            const otEndY = doc.lastAutoTable?.finalY || 140;
            doc.setFontSize(14);
            doc.setTextColor(30, 30, 30);
            doc.text('Prihodki po kategorijah', 14, otEndY + 15);
            autoTable(doc, {
                startY: otEndY + 18,
                head: [
                    [
                        'Kategorija',
                        'Prihodki',
                        'Artikli'
                    ]
                ],
                body: reportData.courseRevenue.map((c)=>[
                        c.course,
                        `${currency}${c.revenue.toLocaleString('sl-SI')}`,
                        c.items.toString()
                    ]),
                theme: 'striped',
                headStyles: {
                    fillColor: [
                        5,
                        150,
                        105
                    ],
                    textColor: 255
                },
                bodyStyles: {
                    fontSize: 10
                },
                alternateRowStyles: {
                    fillColor: [
                        240,
                        253,
                        244
                    ]
                }
            });
            // Daily Breakdown (new page)
            if (reportData.dailyBreakdown.length > 0) {
                doc.addPage();
                doc.setFontSize(14);
                doc.setTextColor(30, 30, 30);
                doc.text('Dnevni pregled', 14, 22);
                autoTable(doc, {
                    startY: 28,
                    head: [
                        [
                            'Datum/Ura',
                            'Prihodki',
                            'Naročila'
                        ]
                    ],
                    body: reportData.dailyBreakdown.map((d)=>[
                            d.label,
                            `${currency}${d.revenue.toLocaleString('sl-SI')}`,
                            d.orders.toString()
                        ]),
                    theme: 'striped',
                    headStyles: {
                        fillColor: [
                            5,
                            150,
                            105
                        ],
                        textColor: 255
                    },
                    bodyStyles: {
                        fontSize: 10
                    },
                    alternateRowStyles: {
                        fillColor: [
                            240,
                            253,
                            244
                        ]
                    }
                });
            }
            // Footer
            const pageCount = doc.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++){
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`URY Dashboard — ${periodLabels[reportData.period]} — Stran ${i} od ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, {
                    align: 'center'
                });
            }
            doc.save(`${reportData.period}-porocilo-${reportData.dateFrom}.pdf`);
            get().addToast({
                type: 'success',
                title: 'PDF generiran',
                description: 'Poročilo je bilo shranjeno'
            });
        }
    };
});
const useConnectionStatus = ()=>useURYStore((s)=>({
            isConnected: s.isConnected,
            isConnecting: s.isConnecting,
            connectionError: s.connectionError,
            authenticatedUser: s.authenticatedUser,
            frappeConfig: s.frappeConfig,
            lastRefreshed: s.lastRefreshed,
            isRefreshing: s.isRefreshing
        }));
const useDashboardData = ()=>useURYStore((s)=>({
            restaurantName: s.restaurantName,
            currency: s.currency,
            kpis: s.kpis,
            hourlySales: s.hourlySales,
            recentOrders: s.recentOrders,
            tables: s.tables,
            rooms: s.rooms,
            kotCards: s.kotCards,
            plSummary: s.plSummary,
            dailyPL: s.dailyPL,
            expenseBreakdown: s.expenseBreakdown,
            plLineItems: s.plLineItems,
            apiEndpoints: s.apiEndpoints,
            cashiers: s.cashiers,
            shiftInfo: s.shiftInfo
        }));
const useUIState = ()=>useURYStore((s)=>({
            activeTab: s.activeTab,
            sidebarOpen: s.sidebarOpen,
            darkMode: s.darkMode
        }));
}),
"[project]/src/components/dashboard/toast-container.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastContainer",
    ()=>ToastContainer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-ssr] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-ssr] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-ssr] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ury$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ury-store.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const toastIcons = {
    success: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
    error: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"],
    warning: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"],
    info: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"]
};
const toastStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
};
const iconStyles = {
    success: 'text-emerald-600 dark:text-emerald-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400'
};
function ToastItem({ toast }) {
    const removeToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ury$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useURYStore"])((s)=>s.removeToast);
    const Icon = toastIcons[toast.type];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full ${toastStyles[toast.type]}`,
        style: {
            animationDuration: '300ms'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: `h-5 w-5 shrink-0 mt-0.5 ${iconStyles[toast.type]}`
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/toast-container.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-semibold",
                        children: toast.title
                    }, void 0, false, {
                        fileName: "[project]/src/components/dashboard/toast-container.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    toast.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs mt-0.5 opacity-80",
                        children: toast.description
                    }, void 0, false, {
                        fileName: "[project]/src/components/dashboard/toast-container.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/dashboard/toast-container.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>removeToast(toast.id),
                className: "shrink-0 p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    className: "h-4 w-4"
                }, void 0, false, {
                    fileName: "[project]/src/components/dashboard/toast-container.tsx",
                    lineNumber: 48,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/toast-container.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/dashboard/toast-container.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
function ToastContainer() {
    const toasts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ury$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useURYStore"])((s)=>s.toasts);
    if (toasts.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]",
        children: toasts.map((toast)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastItem, {
                toast: toast
            }, toast.id, false, {
                fileName: "[project]/src/components/dashboard/toast-container.tsx",
                lineNumber: 62,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/dashboard/toast-container.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3bd90d33._.js.map