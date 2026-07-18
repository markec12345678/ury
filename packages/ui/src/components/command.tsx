import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { Search } from 'lucide-react';

// ─── Context ───────────────────────────────────────────────────────────────────

interface CommandContextValue {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedValue: string | null;
  setSelectedValue: (val: string) => void;
  filter: (value: string, search: string) => number;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

function useCommand() {
  const ctx = React.useContext(CommandContext);
  if (!ctx) throw new Error('Command components must be used within <Command>');
  return ctx;
}

// ─── Default filter ────────────────────────────────────────────────────────────

function defaultFilter(value: string, search: string): number {
  return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
}

// ─── Root ──────────────────────────────────────────────────────────────────────

const commandVariants = cva(
  'flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-gray-900',
  {
    variants: {
      variant: {
        default: 'border shadow-sm',
        ghost: '',
        outline: 'border-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface CommandProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>,
    VariantProps<typeof commandVariants> {
  /** Custom filter function. Return >0 to include, 0 to exclude */
  filter?: (value: string, search: string) => number;
  /** Default query value */
  defaultValue?: string;
  /** Controlled query value */
  value?: string;
  /** Callback when query changes */
  onValueChange?: (value: string) => void;
  /** Callback when an item is selected */
  onSelect?: (value: string) => void;
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, variant, filter = defaultFilter, defaultValue = '', value: controlledValue, onValueChange, onSelect, children, ...props }, ref) => {
    const [query, setQuery] = React.useState(defaultValue);
    const [selectedValue, setSelectedValue] = React.useState<string | null>(null);

    // Controlled query support
    const effectiveQuery = controlledValue ?? query;
    const effectiveSetQuery = React.useCallback(
      (v: React.SetStateAction<string>) => {
        const next = typeof v === 'function' ? v(effectiveQuery) : v;
        setQuery(next);
        onValueChange?.(next);
      },
      [effectiveQuery, onValueChange],
    );

    // Handle selection
    const handleSelect = React.useCallback(
      (val: string) => {
        setSelectedValue(val);
        onSelect?.(val);
      },
      [onSelect],
    );

    const ctx = React.useMemo(
      () => ({
        query: effectiveQuery,
        setQuery: effectiveSetQuery,
        selectedValue,
        setSelectedValue: handleSelect,
        filter,
      }),
      [effectiveQuery, effectiveSetQuery, selectedValue, handleSelect, filter],
    );

    return (
      <CommandContext.Provider value={ctx}>
        <div ref={ref} className={cn(commandVariants({ variant, className }))} {...props}>
          {children}
        </div>
      </CommandContext.Provider>
    );
  },
);
Command.displayName = 'Command';

// ─── Input ─────────────────────────────────────────────────────────────────────

export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  icon?: React.ReactNode;
}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, placeholder = 'Type a command or search...', icon, ...props }, ref) => {
    const { query, setQuery } = useCommand();

    return (
      <div className="flex items-center border-b px-3">
        {icon ?? <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />}
        <input
          ref={ref}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-autocomplete="list"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
CommandInput.displayName = 'CommandInput';

// ─── List ──────────────────────────────────────────────────────────────────────

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="listbox"
      className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden p-1', className)}
      {...props}
    />
  ),
);
CommandList.displayName = 'CommandList';

// ─── Empty ─────────────────────────────────────────────────────────────────────

export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ className, children = 'No results found.', ...props }, ref) => {
    // Always render; parent component handles visibility based on visible items
    return (
      <div
        ref={ref}
        role="presentation"
        data-command-empty=""
        className={cn('py-6 text-center text-sm text-gray-500', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CommandEmpty.displayName = 'CommandEmpty';

// ─── Group ─────────────────────────────────────────────────────────────────────

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode;
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, heading, children, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn('overflow-hidden p-1 text-gray-950', className)}
      {...props}
    >
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-gray-500">{heading}</div>
      )}
      {children}
    </div>
  ),
);
CommandGroup.displayName = 'CommandGroup';

// ─── Item ──────────────────────────────────────────────────────────────────────

const commandItemVariants = cva(
  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground',
  {
    variants: {
      variant: {
        default: '',
        destructive: 'text-destructive hover:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface CommandItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>,
    VariantProps<typeof commandItemVariants> {
  value: string;
  disabled?: boolean;
  onSelect?: (value: string) => void;
  keywords?: string[];
}

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ value, disabled, variant, onSelect: itemOnSelect, keywords, className, children, ...props }, ref) => {
    const { query, filter, setSelectedValue } = useCommand();

    // Check if this item matches the current query
    const searchValue = [value, ...(keywords || [])].join(' ');
    const score = filter(searchValue, query);

    if (score === 0 && query.length > 0) return null;

    const handleClick = () => {
      if (disabled) return;
      setSelectedValue(value);
      itemOnSelect?.(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={false}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        data-value={value}
        tabIndex={disabled ? -1 : 0}
        className={cn(commandItemVariants({ variant, className }))}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CommandItem.displayName = 'CommandItem';

// ─── Separator ─────────────────────────────────────────────────────────────────

export interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn('-mx-1 h-px bg-gray-200', className)}
      {...props}
    />
  ),
);
CommandSeparator.displayName = 'CommandSeparator';

// ─── Exports ───────────────────────────────────────────────────────────────────

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  commandVariants,
  commandItemVariants,
  defaultFilter,
};
