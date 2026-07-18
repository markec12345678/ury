import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Switch, switchVariants, switchThumbVariants } from './switch';

describe('Switch', () => {
  it('renders as a button element with role="switch"', () => {
    render(<Switch />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl.tagName).toBe('BUTTON');
  });

  it('has aria-checked false by default', () => {
    render(<Switch />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('has aria-checked true when defaultChecked is true', () => {
    render(<Switch defaultChecked />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles checked state on click (uncontrolled)', () => {
    render(<Switch />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(switchEl);
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(switchEl);
    expect(switchEl).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onCheckedChange on click', () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('works in controlled mode', () => {
    render(<Switch checked={true} onCheckedChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('applies bg-primary when checked', () => {
    render(<Switch defaultChecked />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl.className).toContain('bg-primary');
  });

  it('applies bg-input when unchecked', () => {
    render(<Switch />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl.className).toContain('bg-input');
  });

  it('renders label text', () => {
    render(<Switch label="Dark mode" />);
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('sets aria-label from label prop', () => {
    render(<Switch label="Dark mode" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Dark mode');
  });

  it('applies custom className', () => {
    render(<Switch className="custom-class" />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl.className).toContain('custom-class');
  });

  it('handles disabled state', () => {
    render(<Switch disabled />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeDisabled();
    expect(switchEl.className).toContain('disabled:opacity-50');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Switch ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('has displayName "Switch"', () => {
    expect(Switch.displayName).toBe('Switch');
  });
});

describe('switchVariants', () => {
  it('exports switchVariants as a function', () => {
    expect(typeof switchVariants).toBe('function');
  });

  it('returns base class names for default size', () => {
    const result = switchVariants();
    expect(result).toContain('h-6');
    expect(result).toContain('w-11');
  });

  it('returns sm size classes', () => {
    const result = switchVariants({ size: 'sm' });
    expect(result).toContain('h-5');
    expect(result).toContain('w-9');
  });

  it('returns lg size classes', () => {
    const result = switchVariants({ size: 'lg' });
    expect(result).toContain('h-7');
    expect(result).toContain('w-14');
  });
});

describe('switchThumbVariants', () => {
  it('exports switchThumbVariants as a function', () => {
    expect(typeof switchThumbVariants).toBe('function');
  });
});
