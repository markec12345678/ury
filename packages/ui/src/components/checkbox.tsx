import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-3.5 w-3.5",
        default: "h-4 w-4",
        lg: "h-5 w-5",
      },
      variant: {
        default: "border-primary text-primary-foreground",
        success: "border-green-600 text-white data-[state=checked]:bg-green-600",
        warning: "border-orange-600 text-white data-[state=checked]:bg-orange-600",
        danger: "border-red-600 text-white data-[state=checked]:bg-red-600",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">,
    VariantProps<typeof checkboxVariants> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
  description?: string
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      className,
      size,
      variant,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      label,
      description,
      disabled,
      id,
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
    const isControlled = controlledChecked !== undefined
    const isChecked = isControlled ? controlledChecked : internalChecked
    const inputId = id || React.useId()

    const handleToggle = React.useCallback(() => {
      const next = !isChecked
      if (!isControlled) {
        setInternalChecked(next)
      }
      onCheckedChange?.(next)
    }, [isChecked, isControlled, onCheckedChange])

    return (
      <div className="flex items-start gap-2">
        <button
          type="button"
          role="checkbox"
          aria-checked={isChecked}
          disabled={disabled}
          data-state={isChecked ? "checked" : "unchecked"}
          className={cn(
            checkboxVariants({ size, variant, className }),
            isChecked && "bg-primary data-[state=checked]:bg-primary"
          )}
          onClick={handleToggle}
          id={inputId}
          ref={ref}
        >
          {isChecked && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 mx-auto text-white"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        {(label || description) && (
          <div className="grid gap-0.5 leading-none">
            {label && (
              <label
                htmlFor={inputId}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox, checkboxVariants }
