import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Checkbox, checkboxVariants } from './checkbox';

describe('Checkbox', () => {
  it('renders as a button element with role="checkbox"', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.tagName).toBe('BUTTON');
  });

  it('has aria-checked false by default', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });

  it('has aria-checked true when defaultChecked is true', () => {
    render(<Checkbox defaultChecked />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles checked state on click (uncontrolled)', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onCheckedChange on click', () => {
    const handleChange = vi.fn();
    render(<Checkbox onCheckedChange={handleChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('works in controlled mode', () => {
    render(<Checkbox checked={true} onCheckedChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('sets data-state to checked/unchecked', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('renders check icon when checked', () => {
    const { container } = render(<Checkbox defaultChecked />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('does not render check icon when unchecked', () => {
    const { container } = render(<Checkbox />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('renders label text', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<Checkbox description="You agree to our terms" />);
    expect(screen.getByText('You agree to our terms')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Checkbox className="custom-class" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.className).toContain('custom-class');
  });

  it('handles disabled state', () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    expect(checkbox.className).toContain('disabled:opacity-50');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('has displayName "Checkbox"', () => {
    expect(Checkbox.displayName).toBe('Checkbox');
  });
});

describe('checkboxVariants', () => {
  it('exports checkboxVariants as a function', () => {
    expect(typeof checkboxVariants).toBe('function');
  });

  it('returns base class names for default variant and size', () => {
    const result = checkboxVariants();
    expect(result).toContain('h-4');
    expect(result).toContain('w-4');
  });

  it('returns sm size classes', () => {
    const result = checkboxVariants({ size: 'sm' });
    expect(result).toContain('h-3.5');
  });

  it('returns lg size classes', () => {
    const result = checkboxVariants({ size: 'lg' });
    expect(result).toContain('h-5');
  });

  it('returns danger variant classes', () => {
    const result = checkboxVariants({ variant: 'danger' });
    expect(result).toContain('border-red-600');
  });
});
