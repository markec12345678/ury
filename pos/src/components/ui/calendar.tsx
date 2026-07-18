import * as React from 'react';
import { cn } from '../../lib/utils';

/* -----------------------------------------------------------------------
   Calendar — simple date-picker grid component
   ----------------------------------------------------------------------- */

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date | undefined, b: Date | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Currently selected date */
  value?: Date;
  /** Called when a date is selected */
  onChange?: (date: Date) => void;
  /** Month to display (0-indexed). Defaults to current month */
  viewMonth?: number;
  /** Year to display. Defaults to current year */
  viewYear?: number;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Whether to show week numbers */
  showWeekNumbers?: boolean;
}

/**
 * Calendar component for the URY POS system.
 * Displays a monthly calendar grid with date selection.
 */
const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      value,
      onChange,
      viewMonth: controlledMonth,
      viewYear: controlledYear,
      minDate,
      maxDate,
      showWeekNumbers,
      className,
      ...props
    },
    ref,
  ) => {
    const now = new Date();
    const [internalMonth, setInternalMonth] = React.useState(now.getMonth());
    const [internalYear, setInternalYear] = React.useState(now.getFullYear());

    const month = controlledMonth ?? internalMonth;
    const year = controlledYear ?? internalYear;

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonth = () => {
      if (controlledMonth !== undefined) return;
      if (month === 0) {
        setInternalMonth(11);
        setInternalYear(year - 1);
      } else {
        setInternalMonth(month - 1);
      }
    };

    const nextMonth = () => {
      if (controlledMonth !== undefined) return;
      if (month === 11) {
        setInternalMonth(0);
        setInternalYear(year + 1);
      } else {
        setInternalMonth(month + 1);
      }
    };

    const isDisabled = (day: number): boolean => {
      const date = new Date(year, month, day);
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    };

    const isToday = (day: number): boolean => {
      return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
    };

    const handleSelect = (day: number) => {
      if (isDisabled(day)) return;
      onChange?.(new Date(year, month, day));
    };

    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    return (
      <div
        ref={ref}
        role="grid"
        aria-label={`Calendar, ${monthName} ${year}`}
        className={cn('p-3 w-fit', className)}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={prevMonth}
            className="inline-flex items-center justify-center rounded-md h-7 w-7 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Previous month"
            disabled={controlledMonth !== undefined}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {monthName} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="inline-flex items-center justify-center rounded-md h-7 w-7 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Next month"
            disabled={controlledMonth !== undefined}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1" role="row">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              role="columnheader"
              className="h-8 w-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid gap-0" role="rowgroup">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7" role="row">
              {week.map((day, di) => (
                <div
                  key={di}
                  role="gridcell"
                  className={cn(
                    'h-8 w-8 flex items-center justify-center text-sm rounded-md transition-colors',
                    day === null && 'invisible',
                    day !== null && !isDisabled(day) && 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer',
                    day !== null && isDisabled(day) && 'text-gray-300 dark:text-gray-600 cursor-not-allowed',
                    day !== null && isToday(day) && !isSameDay(value, new Date(year, month, day)) && 'font-bold text-blue-600 dark:text-blue-400',
                    day !== null && isSameDay(value, new Date(year, month, day)) && 'bg-primary text-primary-foreground hover:bg-primary/90',
                  )}
                  onClick={() => day !== null && handleSelect(day)}
                  aria-label={day !== null ? `${monthName} ${day}, ${year}` : undefined}
                  aria-selected={day !== null && isSameDay(value, new Date(year, month, day))}
                  aria-disabled={day !== null && isDisabled(day)}
                  tabIndex={day !== null && !isDisabled(day) ? 0 : -1}
                  onKeyDown={(e) => {
                    if (day !== null && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSelect(day);
                    }
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  },
);
Calendar.displayName = 'Calendar';

export { Calendar };
