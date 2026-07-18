import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"

const skeletonVariants = cva("bg-gray-200", {
  variants: {
    variant: {
      text: "h-4 rounded",
      circular: "rounded-full",
      rectangular: "rounded-md",
    },
    animation: {
      pulse: "animate-pulse",
      wave: "animate-shimmer",
      none: "",
    },
  },
  defaultVariants: {
    variant: "text",
    animation: "pulse",
  },
})

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Explicit width (number = px, string = CSS value). */
  width?: string | number
  /** Explicit height (number = px, string = CSS value). */
  height?: string | number
}

/**
 * Skeleton loading placeholder with CVA variants and ARIA accessibility.
 *
 * Use individual skeletons for simple placeholders or the pre-built layout
 * components (MenuCardSkeleton, DashboardCardSkeleton, etc.) for common
 * POS UI patterns.
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, animation, width, height, ...props }, ref) => {
    const style: React.CSSProperties = {}
    if (width !== undefined) {
      style.width = typeof width === "number" ? `${width}px` : width
    }
    if (height !== undefined) {
      style.height = typeof height === "number" ? `${height}px` : height
    }

    return (
      <div
        className={cn(skeletonVariants({ variant, animation }), className)}
        style={style}
        ref={ref}
        role="status"
        aria-label="Loading..."
        {...props}
      />
    )
  }
)

Skeleton.displayName = "Skeleton"

/* ─── Pre-built skeleton layouts ─────────────────────────── */

/** Skeleton for a menu item card (image + title + price + button). */
function MenuCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <Skeleton variant="rectangular" className="h-32 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton variant="circular" className="w-8 h-8" />
      </div>
    </div>
  )
}

/** Skeleton for a dashboard metric card (label + value + trend). */
function DashboardCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton variant="circular" className="w-8 h-8" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

/** Skeleton for a single table row. */
function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

/** Skeleton for a chart panel (title + chart area + legend). */
function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton variant="rectangular" className="h-64 w-full" />
      <div className="flex justify-center gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export {
  Skeleton,
  skeletonVariants,
  MenuCardSkeleton,
  DashboardCardSkeleton,
  TableRowSkeleton,
  ChartSkeleton,
}
