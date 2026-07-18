import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { X } from 'lucide-react';

// ─── Overlay ───────────────────────────────────────────────────────────────────

const drawerOverlayVariants = cva(
  'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity',
  {
    variants: {
      animation: {
        default: 'duration-300',
        fast: 'duration-150',
        slow: 'duration-500',
      },
    },
    defaultVariants: {
      animation: 'default',
    },
  },
);

// ─── Content ───────────────────────────────────────────────────────────────────

const drawerContentVariants = cva(
  'fixed z-50 bg-white shadow-xl transition-transform',
  {
    variants: {
      side: {
        left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0',
        right:
          'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l data-[state=closed]:translate-x-full data-[state=open]:translate-x-0',
        top: 'inset-x-0 top-0 w-full max-h-[85vh] border-b data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0',
        bottom:
          'inset-x-0 bottom-0 w-full max-h-[85vh] border-t data-[state=closed]:translate-y-full data-[state=open]:translate-y-0',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface DrawerProps extends VariantProps<typeof drawerContentVariants> {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  animation?: VariantProps<typeof drawerOverlayVariants>['animation'];
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ children, open = false, onOpenChange, side, animation, className }, ref) => {
    const [mounted, setMounted] = React.useState(false);
    const [visible, setVisible] = React.useState(false);

    // Handle mount/unmount with animation
    React.useEffect(() => {
      if (open) {
        setMounted(true);
        // Trigger animation on next frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setVisible(true));
        });
      } else if (mounted) {
        setVisible(false);
        const timer = setTimeout(() => setMounted(false), 300);
        return () => clearTimeout(timer);
      }
    }, [open, mounted]);

    // Close on Escape
    React.useEffect(() => {
      if (!open) return;
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onOpenChange?.(false);
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onOpenChange]);

    // Prevent body scroll when open
    React.useEffect(() => {
      if (open) {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = originalOverflow;
        };
      }
    }, [open]);

    if (!mounted) return null;

    return (
      <div ref={ref} className={cn('relative', className)}>
        {/* Overlay */}
        <div
          className={cn(
            drawerOverlayVariants({ animation }),
            visible ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => onOpenChange?.(false)}
          aria-hidden="true"
        />
        {/* Content */}
        <div
          role="dialog"
          aria-modal="true"
          data-state={visible ? 'open' : 'closed'}
          className={cn(drawerContentVariants({ side }))}
        >
          {children}
        </div>
      </div>
    );
  },
);
Drawer.displayName = 'Drawer';

// ─── Sub-components ────────────────────────────────────────────────────────────

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-2 p-4 pb-0', className)}
      {...props}
    />
  ),
);
DrawerHeader.displayName = 'DrawerHeader';

export interface DrawerTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const DrawerTitle = React.forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
DrawerTitle.displayName = 'DrawerTitle';

export interface DrawerDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const DrawerDescription = React.forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-gray-500', className)} {...props} />
  ),
);
DrawerDescription.displayName = 'DrawerDescription';

export interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClose?: () => void;
}

const DrawerClose = React.forwardRef<HTMLButtonElement, DrawerCloseProps>(
  ({ className, onClose, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className,
      )}
      onClick={onClose}
      aria-label="Close"
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  ),
);
DrawerClose.displayName = 'DrawerClose';

export interface DrawerBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const DrawerBody = React.forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 overflow-y-auto p-4', className)} {...props} />
  ),
);
DrawerBody.displayName = 'DrawerBody';

export interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-2 p-4 pt-0 border-t', className)}
      {...props}
    />
  ),
);
DrawerFooter.displayName = 'DrawerFooter';

// ─── Exports ───────────────────────────────────────────────────────────────────

export {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerBody,
  DrawerFooter,
  drawerOverlayVariants,
  drawerContentVariants,
};
