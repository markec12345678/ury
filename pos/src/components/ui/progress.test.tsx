import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Progress, progressVariants } from './progress';

describe('Progress', () => {
  it('renders with role="progressbar"', () => {
    render(<Progress value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets aria-valuenow correctly', () => {
    render(<Progress value={75} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('sets aria-valuemin to 0', () => {
    render(<Progress value={50} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemin', '0');
  });

  it('sets aria-valuemax to 100 by default', () => {
    render(<Progress value={50} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
  });

  it('sets aria-valuemax from max prop', () => {
    render(<Progress value={5} max={10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '10');
  });

  it('renders with default size class (md)', () => {
    const { container } = render(<Progress value={50} />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.className).toContain('h-2.5');
  });

  it('renders with sm size class', () => {
    const { container } = render(<Progress value={50} size="sm" />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.className).toContain('h-1.5');
  });

  it('renders with lg size class', () => {
    const { container } = render(<Progress value={50} size="lg" />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.className).toContain('h-4');
  });

  it('renders with xl size class', () => {
    const { container } = render(<Progress value={50} size="xl" />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.className).toContain('h-6');
  });

  it('applies custom className', () => {
    render(<Progress value={50} className="custom-class" />);
    expect(screen.getByRole('progressbar').className).toContain('custom-class');
  });

  it('clamps value above max to 100%', () => {
    render(<Progress value={150} />);
    const bar = screen.getByRole('progressbar');
    // Should not exceed 100% in aria-valuenow (it still stores the raw value)
    expect(bar).toHaveAttribute('aria-valuenow', '150');
    // But the inner div width should be capped at 100%
    const { container } = render(<Progress value={150} />);
    const innerDiv = container.querySelector('[style]') as HTMLElement;
    expect(innerDiv.style.width).toBe('100%');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Progress value={50} ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('has displayName "Progress"', () => {
    expect(Progress.displayName).toBe('Progress');
  });
});

describe('progressVariants', () => {
  it('exports progressVariants as a function', () => {
    expect(typeof progressVariants).toBe('function');
  });

  it('returns base class names', () => {
    const result = progressVariants();
    expect(result).toContain('rounded-full');
    expect(result).toContain('bg-gray-200');
  });

  it('returns success variant classes', () => {
    const result = progressVariants({ variant: 'success' });
    expect(result).toContain('bg-green-500');
  });
});
