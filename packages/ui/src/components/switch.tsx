import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"

const switchVariants = cva(
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-6 w-11",
        sm: "h-5 w-9",
        lg: "h-7 w-14",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const switchThumbVariants = cva(
  "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform",
  {
    variants: {
      size: {
        default: "h-5 w-5",
        sm: "h-4 w-4",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">,
    VariantProps<typeof switchVariants> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      size,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      label,
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
    const isControlled = controlledChecked !== undefined
    const isChecked = isControlled ? controlledChecked : internalChecked

    const handleToggle = React.useCallback(() => {
      const next = !isChecked
      if (!isControlled) {
        setInternalChecked(next)
      }
      onCheckedChange?.(next)
    }, [isChecked, isControlled, onCheckedChange])

    const thumbTranslate = size === "sm" ? "16px" : size === "lg" ? "28px" : "20px"

    return (
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={isChecked}
          aria-label={label}
          disabled={disabled}
          className={cn(
            switchVariants({ size, className }),
            isChecked ? "bg-primary" : "bg-input"
          )}
          onClick={handleToggle}
          ref={ref}
          {...props}
        >
          <span
            className={cn(switchThumbVariants({ size }))}
            style={{
              transform: isChecked ? `translateX(${thumbTranslate})` : "translateX(0)",
            }}
          />
        </button>
        {label && (
          <span className="text-sm font-medium text-foreground select-none">{label}</span>
        )}
      </div>
    )
  }
)

Switch.displayName = "Switch"

export { Switch, switchVariants, switchThumbVariants }
