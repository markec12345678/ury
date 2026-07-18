import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"

const separatorVariants = cva("shrink-0 bg-border", {
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px",
    },
    variant: {
      default: "bg-border",
      strong: "bg-gray-300",
      subtle: "bg-gray-100",
      dashed: "border-t border-dashed border-gray-300 bg-transparent",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    variant: "default",
  },
})

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
  decorative?: boolean
  label?: string
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", variant, decorative = true, label, ...props }, ref) => {
    // If label is provided, render a labeled separator
    if (label && orientation === "horizontal") {
      return (
        <div
          role={decorative ? "none" : "separator"}
          aria-orientation={decorative ? undefined : orientation ?? undefined}
          className={cn("flex items-center gap-3 w-full", className)}
          ref={ref}
          {...props}
        >
          <div className={cn(separatorVariants({ orientation, variant: "subtle" }), "flex-1")} />
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{label}</span>
          <div className={cn(separatorVariants({ orientation, variant: "subtle" }), "flex-1")} />
        </div>
      )
    }

    return (
      <div
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : orientation ?? undefined}
        className={cn(separatorVariants({ orientation, variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Separator.displayName = "Separator"

export { Separator, separatorVariants }
