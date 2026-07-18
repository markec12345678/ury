import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

// ─── Context ───────────────────────────────────────────────────────────────────

interface PopoverContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopover() {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error('Popover components must be used within <Popover>');
  return ctx;
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Popover = ({ children, open: controlledOpen, onOpenChange }: PopoverProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null!);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const next = typeof value === 'function' ? value(open) : value;
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange, open],
  );

  const ctx = React.useMemo(() => ({ open, setOpen, triggerRef }), [open, setOpen, triggerRef]);

  return <PopoverContext.Provider value={ctx}>{children}</PopoverContext.Provider>;
};
Popover.displayName = 'Popover';

// ─── Trigger ───────────────────────────────────────────────────────────────────

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, asChild = false, onClick, ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopover();

    const mergedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      },
      [triggerRef, ref],
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen((prev) => !prev);
      onClick?.(e);
    };

    return (
      <button
        ref={mergedRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn('inline-flex items-center justify-center', className)}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
PopoverTrigger.displayName = 'PopoverTrigger';

// ─── Content ───────────────────────────────────────────────────────────────────

const popoverContentVariants = cva(
  'z-50 w-72 rounded-md border bg-white p-4 text-gray-900 shadow-md outline-none animate-in fade-in-0 zoom-in-95',
  {
    variants: {
      align: {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
      },
      side: {
        bottom: 'top-full mt-2',
        top: 'bottom-full mb-2',
      },
    },
    defaultVariants: {
      align: 'start',
      side: 'bottom',
    },
  },
);

export interface PopoverContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof popoverContentVariants> {
  onOpenAutoFocus?: (e: Event) => void;
  onCloseAutoFocus?: (e: Event) => void;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align, side, children, ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopover();
    const contentRef = React.useRef<HTMLDivElement>(null);

    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref],
    );

    // Close on outside click
    React.useEffect(() => {
      if (!open) return;
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          contentRef.current?.contains(target) ||
          triggerRef.current?.contains(target)
        )
          return;
        setOpen(false);
      };
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [open, setOpen, triggerRef]);

    if (!open) return null;

    return (
      <div
        ref={mergedRef}
        role="dialog"
        aria-modal="false"
        tabIndex={-1}
        className={cn(popoverContentVariants({ align, side, className }))}
        {...props}
      >
        {children}
      </div>
    );
  },
);
PopoverContent.displayName = 'PopoverContent';

// ─── Exports ───────────────────────────────────────────────────────────────────

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  popoverContentVariants,
};
