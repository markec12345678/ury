import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const progressVariants = cva('relative w-full overflow-hidden rounded-full bg-gray-200', {
  variants: {
    size: {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
      xl: 'h-6',
    },
    variant: {
      default: '[&>div]:bg-primary',
      success: '[&>div]:bg-green-500',
      warning: '[&>div]:bg-orange-500',
      danger: '[&>div]:bg-red-500',
      info: '[&>div]:bg-blue-500',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  /** Progress value from 0 to max (default 0-100) */
  value?: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Whether to show the percentage label inside the bar */
  showLabel?: boolean;
  /** Whether to animate the progress bar fill */
  animate?: boolean;
  /** Striped pattern on the bar */
  striped?: boolean;
}

/**
 * Progress component for the URY POS system.
 * Displays a horizontal progress bar with configurable size, color variant,
 * optional percentage label, animation, and striped pattern.
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, size, variant, value = 0, max = 100, showLabel, animate, striped, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${Math.round(percentage)}% complete`}
        className={cn(progressVariants({ size, variant }), className)}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-in-out',
            animate && 'animate-pulse',
            striped &&
              'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]',
          )}
          style={{ width: `${percentage}%` }}
        >
          {showLabel && (size === 'lg' || size === 'xl') && percentage > 10 && (
            <span className="flex h-full items-center justify-center text-xs font-medium text-white">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    );
  },
);
Progress.displayName = 'Progress';

export { Progress, progressVariants };
