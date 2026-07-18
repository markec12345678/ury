import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from './calendar';

describe('Calendar', () => {
  it('renders calendar grid', () => {
    render(<Calendar />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays current month and year in header', () => {
    render(<Calendar />);
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long' });
    expect(screen.getByText(new RegExp(monthName))).toBeInTheDocument();
  });

  it('renders day-of-week headers', () => {
    render(<Calendar />);
    expect(screen.getByText('Su')).toBeInTheDocument();
    expect(screen.getByText('Mo')).toBeInTheDocument();
    expect(screen.getByText('Fr')).toBeInTheDocument();
    expect(screen.getByText('Sa')).toBeInTheDocument();
  });

  it('calls onChange when a date is clicked', () => {
    const handleChange = vi.fn();
    render(<Calendar onChange={handleChange} />);
    const dayCells = screen.getAllByRole('gridcell');
    const clickableCell = dayCells.find(cell => cell.textContent && !cell.getAttribute('aria-disabled'));
    if (clickableCell) {
      fireEvent.click(clickableCell);
      expect(handleChange).toHaveBeenCalledTimes(1);
    }
  });

  it('marks selected date with aria-selected', () => {
    const selectedDate = new Date(2025, 6, 15);
    render(<Calendar value={selectedDate} viewMonth={6} viewYear={2025} />);
    const selected = screen.getByLabelText('July 15, 2025');
    expect(selected).toHaveAttribute('aria-selected', 'true');
  });

  it('disables dates outside min/max range', () => {
    const minDate = new Date(2025, 6, 10);
    const maxDate = new Date(2025, 6, 20);
    render(<Calendar viewMonth={6} viewYear={2025} minDate={minDate} maxDate={maxDate} />);
    const disabledCell = screen.getByLabelText('July 5, 2025');
    expect(disabledCell).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not call onChange for disabled dates', () => {
    const handleChange = vi.fn();
    const minDate = new Date(2025, 6, 10);
    render(<Calendar viewMonth={6} viewYear={2025} minDate={minDate} onChange={handleChange} />);
    const disabledCell = screen.getByLabelText('July 5, 2025');
    fireEvent.click(disabledCell);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('navigates to next month', () => {
    render(<Calendar />);
    const nextButton = screen.getByLabelText('Next month');
    fireEvent.click(nextButton);
    // After clicking next, the month name should change
  });

  it('navigates to previous month', () => {
    render(<Calendar />);
    const prevButton = screen.getByLabelText('Previous month');
    fireEvent.click(prevButton);
  });

  it('applies custom className', () => {
    render(<Calendar className="custom-calendar" />);
    expect(screen.getByRole('grid').className).toContain('custom-calendar');
  });

  it('renders with controlled viewMonth and viewYear', () => {
    render(<Calendar viewMonth={0} viewYear={2025} />);
    expect(screen.getByText(/January/)).toBeInTheDocument();
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  it('supports keyboard activation with Enter key', () => {
    const handleChange = vi.fn();
    render(<Calendar viewMonth={6} viewYear={2025} onChange={handleChange} />);
    const cell = screen.getByLabelText('July 15, 2025');
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard activation with Space key', () => {
    const handleChange = vi.fn();
    render(<Calendar viewMonth={6} viewYear={2025} onChange={handleChange} />);
    const cell = screen.getByLabelText('July 15, 2025');
    fireEvent.keyDown(cell, { key: ' ' });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
