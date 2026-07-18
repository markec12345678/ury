import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"

const emptyStateVariants = cva("flex flex-col items-center justify-center text-center", {
  variants: {
    size: {
      sm: "py-6",
      md: "py-12",
      lg: "py-20",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

const emptyStateIconVariants = cva(
  "mb-4 rounded-full bg-gray-100 p-3 text-gray-400",
  {
    variants: {
      size: {
        sm: "p-2 [&>svg]:w-6 [&>svg]:h-6",
        md: "p-3 [&>svg]:w-10 [&>svg]:h-10",
        lg: "p-4 [&>svg]:w-14 [&>svg]:h-14",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const emptyStateTitleVariants = cva("font-medium text-gray-900 mb-1", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-lg",
      lg: "text-xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

const emptyStateDescVariants = cva("text-gray-500 max-w-sm", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  /** Lucide icon component rendered inside a circular container. */
  icon?: React.ComponentType<{ className?: string }>
  /** Main heading text. */
  title?: string
  /** Supporting description text. */
  description?: string
  /** Optional action element (button, link, etc.). */
  action?: React.ReactNode
}

/**
 * Empty state placeholder displayed when there is no data to show.
 * Provides a consistent look across the app for empty lists, tables, and
 * dashboards. Supports three sizes and an optional call-to-action.
 *
 * Fully accessible with `role="status"` and `aria-label`.
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, size, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        className={cn(emptyStateVariants({ size }), className)}
        ref={ref}
        role="status"
        aria-label={title || "No data"}
        {...props}
      >
        {Icon && (
          <div className={cn(emptyStateIconVariants({ size }))}>
            <Icon />
          </div>
        )}
        {title && (
          <h3 className={cn(emptyStateTitleVariants({ size }))}>{title}</h3>
        )}
        {description && (
          <p className={cn(emptyStateDescVariants({ size }))}>{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    )
  }
)

EmptyState.displayName = "EmptyState"

export { EmptyState, emptyStateVariants }
