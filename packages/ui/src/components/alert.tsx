import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        info: 'border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-600',
        success: 'border-green-200 bg-green-50 text-green-800 [&>svg]:text-green-600',
        warning: 'border-orange-200 bg-orange-50 text-orange-800 [&>svg]:text-orange-600',
        danger: 'border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Whether the alert can be dismissed by the user */
  dismissible?: boolean;
  /** Icon element to display in the alert */
  icon?: React.ReactNode;
  /** Controlled visibility state */
  open?: boolean;
  /** Callback when alert is dismissed */
  onDismiss?: () => void;
}

/**
 * Alert component for the URY POS system.
 * Displays a contextual message with optional icon and dismiss functionality.
 * Supports 5 variants: default, info, success, warning, danger.
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { className, variant, dismissible, icon, open = true, onDismiss, children, ...props },
    ref
  ) => {
    if (!open) return null;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {icon && <div className="shrink-0">{icon}</div>}
        <div className="flex-1">{children}</div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-3 top-3 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Dismiss alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

/**
 * AlertTitle — heading for the alert content.
 */
const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

/**
 * AlertDescription — body text for the alert content.
 */
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription, alertVariants };
