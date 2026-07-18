import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from '../../lib/utils'

const tabsVariants = cva("inline-flex items-center gap-1", {
  variants: {
    variant: {
      default: "rounded-lg bg-muted p-1 text-muted-foreground",
      outline: "border-b border-gray-200",
      pill: "rounded-full bg-gray-100 p-1",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const tabTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        outline:
          "px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground -mb-px",
        pill:
          "px-4 py-1.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm",
      },
      size: {
        sm: "text-xs px-2 py-1",
        default: "text-sm px-3 py-1.5",
        lg: "text-base px-5 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const tabContentVariants = cva("mt-2 ring-offset-background focus-visible:outline-none", {
  variants: {
    variant: {
      default: "",
      outline: "pt-2",
      pill: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface TabItem {
  value: string
  label: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
}

export interface TabsProps extends VariantProps<typeof tabsVariants> {
  tabs: TabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  size?: VariantProps<typeof tabTriggerVariants>["size"]
  className?: string
}

const Tabs = ({
  tabs,
  defaultValue,
  value: controlledValue,
  onValueChange,
  variant,
  size,
  className,
}: TabsProps) => {
  const firstEnabled = tabs.find((t) => !t.disabled)
  const [internalValue, setInternalValue] = React.useState(
    defaultValue || firstEnabled?.value || ""
  )
  const isControlled = controlledValue !== undefined
  const activeValue = isControlled ? controlledValue : internalValue

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    },
    [isControlled, onValueChange]
  )

  const activeTab = tabs.find((t) => t.value === activeValue)

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(tabsVariants({ variant }))} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={tab.value === activeValue}
            aria-controls={`tabpanel-${tab.value}`}
            data-state={tab.value === activeValue ? "active" : "inactive"}
            disabled={tab.disabled}
            className={cn(tabTriggerVariants({ variant, size }))}
            onClick={() => !tab.disabled && handleValueChange(tab.value)}
            id={`tab-${tab.value}`}
          >
            {tab.icon && <span className="mr-1.5 inline-flex">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className={cn(tabContentVariants({ variant }))}
        role="tabpanel"
        aria-labelledby={`tab-${activeValue}`}
        id={`tabpanel-${activeValue}`}
      >
        {activeTab?.content}
      </div>
    </div>
  )
}

Tabs.displayName = "Tabs"

export { Tabs, tabsVariants, tabTriggerVariants, tabContentVariants }
