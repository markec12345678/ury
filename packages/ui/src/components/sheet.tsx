import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

/* -----------------------------------------------------------------------
   Sheet — slide-in side panel component with overlay
   ----------------------------------------------------------------------- */

const sheetOverlayVariants = cva(
  'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
);

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out dark:bg-gray-900',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

export interface SheetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sheetVariants> {
  /** Whether the sheet is open */
  open?: boolean;
  /** Callback when the sheet should close */
  onClose?: () => void;
}

/**
 * Sheet component — a slide-in side panel.
 * Renders an overlay + panel. Use `open` and `onClose` to control visibility.
 */
const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ className, side, open, onClose, children, ...props }, ref) => {
    React.useEffect(() => {
      if (!open) return;
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose]);

    if (!open) return null;

    return (
      <>
        <div
          className={cn(sheetOverlayVariants())}
          onClick={onClose}
          aria-hidden="true"
          data-state={open ? 'open' : 'closed'}
        />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          data-state={open ? 'open' : 'closed'}
          className={cn(sheetVariants({ side }), className)}
          {...props}
        >
          {children}
        </div>
      </>
    );
  },
);
Sheet.displayName = 'Sheet';

/* ---- SheetHeader ---- */

const SheetHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
  ),
);
SheetHeader.displayName = 'SheetHeader';

/* ---- SheetFooter ---- */

const SheetFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
  ),
);
SheetFooter.displayName = 'SheetFooter';

/* ---- SheetTitle ---- */

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-gray-900 dark:text-gray-100', className)} {...props} />
  ),
);
SheetTitle.displayName = 'SheetTitle';

/* ---- SheetDescription ---- */

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-gray-500 dark:text-gray-400', className)} {...props} />
  ),
);
SheetDescription.displayName = 'SheetDescription';

/* ---- SheetClose ---- */

export interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SheetClose = React.forwardRef<HTMLButtonElement, SheetCloseProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-gray-900',
        className,
      )}
      aria-label="Close"
      {...props}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  ),
);
SheetClose.displayName = 'SheetClose';

/* ---- SheetContent (convenience wrapper with close button) ---- */

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sheetVariants> {
  open?: boolean;
  onClose?: () => void;
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side, open, onClose, className, children, ...props }, ref) => (
    <Sheet ref={ref} side={side} open={open} onClose={onClose} className={className} {...props}>
      <SheetClose onClick={onClose} />
      {children}
    </Sheet>
  ),
);
SheetContent.displayName = 'SheetContent';

export {
  Sheet,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetContent,
  sheetVariants,
};
