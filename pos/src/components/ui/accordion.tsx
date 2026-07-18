import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

// ─── Context ───────────────────────────────────────────────────────────────────

interface AccordionContextValue {
  openItems: string[];
  toggle: (value: string) => void;
  variant: 'default' | 'outline' | 'card';
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error('Accordion components must be used within <Accordion>');
  return ctx;
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export interface AccordionProps extends VariantProps<typeof accordionVariants> {
  children: React.ReactNode;
  /** Controlled: which items are open */
  value?: string[];
  /** Uncontrolled: initially open items */
  defaultValue?: string[];
  /** Callback when open items change */
  onValueChange?: (value: string[]) => void;
  /** Allow multiple items open simultaneously */
  multiple?: boolean;
  className?: string;
}

const accordionVariants = cva('w-full', {
  variants: {
    variant: {
      default: 'divide-y divide-gray-200',
      outline: 'space-y-2',
      card: 'space-y-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Accordion = ({
  children,
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  multiple = false,
  variant = 'default',
  className,
}: AccordionProps) => {
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const openItems = isControlled ? controlledValue : internalValue;

  const toggle = React.useCallback(
    (itemValue: string) => {
      const next = openItems.includes(itemValue)
        ? openItems.filter((v) => v !== itemValue)
        : multiple
          ? [...openItems, itemValue]
          : [itemValue];

      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [openItems, multiple, isControlled, onValueChange],
  );

  const ctx = React.useMemo(
    () => ({ openItems, toggle, variant: variant ?? 'default' }),
    [openItems, toggle, variant],
  );

  return (
    <AccordionContext.Provider value={ctx}>
      <div className={cn(accordionVariants({ variant, className }))}>{children}</div>
    </AccordionContext.Provider>
  );
};
Accordion.displayName = 'Accordion';

// ─── Item ──────────────────────────────────────────────────────────────────────

const accordionItemVariants = cva('', {
  variants: {
    variant: {
      default: '',
      outline: 'rounded-lg border border-gray-200 overflow-hidden',
      card: 'rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, disabled, className, children, ...props }, ref) => {
    const { variant } = useAccordion();

    return (
      <div
        ref={ref}
        data-state={disabled ? 'disabled' : undefined}
        className={cn(
          accordionItemVariants({ variant, className }),
          disabled && 'opacity-50 pointer-events-none',
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
AccordionItem.displayName = 'AccordionItem';

// ─── Trigger ───────────────────────────────────────────────────────────────────

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, icon, children, ...props }, ref) => {
    const { openItems, toggle } = useAccordion();
    const itemValue = (props as Record<string, unknown>).__accordionItemValue as string | undefined;
    const isOpen = itemValue ? openItems.includes(itemValue) : false;

    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={isOpen}
        className={cn(
          'flex w-full items-center justify-between py-4 px-4 text-left text-sm font-medium transition-all hover:underline [&[aria-expanded=true]>svg]:rotate-180',
          className,
        )}
        onClick={() => itemValue && toggle(itemValue)}
        {...props}
      >
        {children}
        {icon ?? <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200" />}
      </button>
    );
  },
);
AccordionTrigger.displayName = 'AccordionTrigger';

// ─── Content ───────────────────────────────────────────────────────────────────

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const { openItems } = useAccordion();
    const itemValue = (props as Record<string, unknown>).__accordionItemValue as string | undefined;
    const isOpen = itemValue ? openItems.includes(itemValue) : false;

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        role="region"
        className={cn('overflow-hidden text-sm pb-4 pt-0 px-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
AccordionContent.displayName = 'AccordionContent';

// ─── Hook for connecting Item → Trigger/Content ────────────────────────────────

function useAccordionItem(value: string) {
  const { openItems, toggle } = useAccordion();
  return {
    isOpen: openItems.includes(value),
    toggle: () => toggle(value),
  };
}

// ─── Exports ───────────────────────────────────────────────────────────────────

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  useAccordionItem,
  accordionVariants,
  accordionItemVariants,
};
