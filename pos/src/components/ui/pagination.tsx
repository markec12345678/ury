import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/* -----------------------------------------------------------------------
   Pagination — page navigation component with composable sub-components
   ----------------------------------------------------------------------- */

const paginationVariants = cva('flex items-center gap-1', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface PaginationProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof paginationVariants> {}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ className, size, ...props }, ref) => (
    <nav
      ref={ref}
      role="navigation"
      aria-label="Pagination"
      className={cn(paginationVariants({ size }), className)}
      {...props}
    />
  ),
);
Pagination.displayName = 'Pagination';

/* ---- PaginationContent (the <ul> wrapper) ---- */

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
));
PaginationContent.displayName = 'PaginationContent';

/* ---- PaginationItem (each <li>) ---- */

const PaginationItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
  ),
);
PaginationItem.displayName = 'PaginationItem';

/* ---- PaginationLink ---- */

export interface PaginationLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether this link represents the current active page */
  isActive?: boolean;
  /** The page number (used as aria-label when not isActive) */
  page?: number;
}

const PaginationLink = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, isActive, page, children, ...props }, ref) => (
    <button
      ref={ref}
      aria-current={isActive ? 'page' : undefined}
      aria-label={isActive ? `Page ${page}` : `Go to page ${page}`}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-colors',
        isActive
          ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-100',
        !isActive && 'cursor-pointer',
        props.disabled && 'pointer-events-none opacity-50',
        className,
      )}
      {...props}
    >
      {children ?? page}
    </button>
  ),
);
PaginationLink.displayName = 'PaginationLink';

/* ---- PaginationPrevious ---- */

export interface PaginationPreviousProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Label text (default: "Previous") */
  label?: string;
}

const PaginationPrevious = React.forwardRef<HTMLButtonElement, PaginationPreviousProps>(
  ({ className, label = 'Previous', ...props }, ref) => (
    <button
      ref={ref}
      aria-label="Go to previous page"
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-100',
        className,
      )}
      {...props}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span>{label}</span>
    </button>
  ),
);
PaginationPrevious.displayName = 'PaginationPrevious';

/* ---- PaginationNext ---- */

export interface PaginationNextProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Label text (default: "Next") */
  label?: string;
}

const PaginationNext = React.forwardRef<HTMLButtonElement, PaginationNextProps>(
  ({ className, label = 'Next', ...props }, ref) => (
    <button
      ref={ref}
      aria-label="Go to next page"
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-100',
        className,
      )}
      {...props}
    >
      <span>{label}</span>
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  ),
);
PaginationNext.displayName = 'PaginationNext';

/* ---- PaginationEllipsis ---- */

const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center text-gray-400', className)}
    {...props}
  >
    &hellip;
  </span>
));
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
