import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from '../../lib/utils'

const tooltipVariants = cva(
  "z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs font-medium shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        dark: "bg-gray-900 text-gray-50",
        light: "bg-white text-gray-900 border border-gray-200",
        success: "bg-green-600 text-white",
        warning: "bg-orange-600 text-white",
        danger: "bg-red-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  content: React.ReactNode
  children: React.ReactElement<Record<string, unknown>>
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  delayDuration?: number
  className?: string
}

const Tooltip = ({
  content,
  children,
  side = "top",
  align = "center",
  variant,
  className,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const triggerRef = React.useRef<HTMLElement | null>(null)

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const tooltipEl = document.querySelector("[data-ury-tooltip]")
    const tooltipRect = tooltipEl?.getBoundingClientRect()

    let top = 0
    let left = 0

    switch (side) {
      case "top":
        top = rect.top - (tooltipRect?.height || 32) - 8
        left = rect.left + rect.width / 2
        break
      case "bottom":
        top = rect.bottom + 8
        left = rect.left + rect.width / 2
        break
      case "left":
        top = rect.top + rect.height / 2
        left = rect.left - (tooltipRect?.width || 60) - 8
        break
      case "right":
        top = rect.top + rect.height / 2
        left = rect.right + 8
        break
    }

    switch (align) {
      case "start":
        if (side === "top" || side === "bottom") {
          left = rect.left
        } else {
          top = rect.top
        }
        break
      case "end":
        if (side === "top" || side === "bottom") {
          left = rect.right
        } else {
          top = rect.bottom
        }
        break
    }

    setPosition({ top, left })
  }, [side, align])

  const handleMouseEnter = React.useCallback(() => {
    setIsVisible(true)
    requestAnimationFrame(updatePosition)
  }, [updatePosition])

  const handleMouseLeave = React.useCallback(() => {
    setIsVisible(false)
  }, [])

  React.useEffect(() => {
    if (isVisible) {
      updatePosition()
    }
  }, [isVisible, updatePosition])

  const childProps = children.props as Record<string, unknown>

  return (
    <>
      {React.cloneElement(children, {
        onMouseEnter: (e: React.MouseEvent) => {
          handleMouseEnter()
          ;(childProps.onMouseEnter as ((e: React.MouseEvent) => void) | undefined)?.(e)
        },
        onMouseLeave: (e: React.MouseEvent) => {
          handleMouseLeave()
          ;(childProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined)?.(e)
        },
        onFocus: (e: React.FocusEvent) => {
          handleMouseEnter()
          ;(childProps.onFocus as ((e: React.FocusEvent) => void) | undefined)?.(e)
        },
        onBlur: (e: React.FocusEvent) => {
          handleMouseLeave()
          ;(childProps.onBlur as ((e: React.FocusEvent) => void) | undefined)?.(e)
        },
        "aria-describedby": isVisible ? "ury-tooltip" : undefined,
      })}
      {isVisible && (
        <div
          data-ury-tooltip
          id="ury-tooltip"
          role="tooltip"
          className={cn(
            "fixed pointer-events-none",
            tooltipVariants({ variant, className }),
            side === "top" && "translate-x-[-50%]",
            side === "bottom" && "translate-x-[-50%]",
            side === "left" && "translate-y-[-50%]",
            side === "right" && "translate-y-[-50%]"
          )}
          style={{ top: position.top, left: position.left }}
        >
          {content}
        </div>
      )}
    </>
  )
}

Tooltip.displayName = "Tooltip"

export { Tooltip, tooltipVariants }
