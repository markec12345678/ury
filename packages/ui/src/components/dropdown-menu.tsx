import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

// ─── Dropdown Menu Root ────────────────────────────────────────────────────────

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu() {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenu components must be used within <DropdownMenu>');
  return ctx;
}

export interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DropdownMenu = ({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) => {
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

  return <DropdownMenuContext.Provider value={ctx}>{children}</DropdownMenuContext.Provider>;
};

DropdownMenu.displayName = 'DropdownMenu';

// ─── Trigger ───────────────────────────────────────────────────────────────────

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, asChild = false, onClick, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useDropdownMenu();

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
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn('inline-flex items-center justify-center', className)}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

// ─── Content ───────────────────────────────────────────────────────────────────

const dropdownContentVariants = cva(
  'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-900 shadow-md animate-in fade-in-0 zoom-in-95',
  {
    variants: {
      align: {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
      },
      side: {
        bottom: 'top-full mt-1',
        top: 'bottom-full mb-1',
      },
    },
    defaultVariants: {
      align: 'start',
      side: 'bottom',
    },
  },
);

export interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownContentVariants> {}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align, side, children, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useDropdownMenu();
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
        role="menu"
        aria-orientation="vertical"
        className={cn(dropdownContentVariants({ align, side, className }))}
        {...props}
      >
        {children}
      </div>
    );
  },
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

// ─── Item ──────────────────────────────────────────────────────────────────────

const dropdownItemVariants = cva(
  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        destructive: 'text-destructive focus:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface DropdownMenuItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownItemVariants> {
  disabled?: boolean;
  onSelect?: () => void;
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, variant, disabled, onSelect, children, ...props }, ref) => {
    const { setOpen } = useDropdownMenu();

    const handleClick = () => {
      if (disabled) return;
      onSelect?.();
      setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        className={cn(dropdownItemVariants({ variant, className }))}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

// ─── Separator ─────────────────────────────────────────────────────────────────

export interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn('-mx-1 my-1 h-px bg-gray-200', className)}
      {...props}
    />
  ),
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

// ─── Label ─────────────────────────────────────────────────────────────────────

export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-2 py-1.5 text-xs font-semibold text-gray-500', className)}
      {...props}
    />
  ),
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

// ─── Exports ───────────────────────────────────────────────────────────────────

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  dropdownContentVariants,
  dropdownItemVariants,
};
