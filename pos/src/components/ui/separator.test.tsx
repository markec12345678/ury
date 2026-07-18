import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Separator, separatorVariants } from './separator';

describe('Separator', () => {
  it('renders as a div element', () => {
    const { container } = render(<Separator />);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('defaults to horizontal orientation', () => {
    const { container } = render(<Separator />);
    const separator = container.firstElementChild as HTMLElement;
    expect(separator.className).toContain('h-px');
    expect(separator.className).toContain('w-full');
  });

  it('renders vertical orientation', () => {
    const { container } = render(<Separator orientation="vertical" />);
    const separator = container.firstElementChild as HTMLElement;
    expect(separator.className).toContain('h-full');
    expect(separator.className).toContain('w-px');
  });

  it('has role="none" when decorative (default)', () => {
    const { container } = render(<Separator />);
    const separator = container.firstElementChild as HTMLElement;
    expect(separator).toHaveAttribute('role', 'none');
  });

  it('has role="separator" when not decorative', () => {
    const { container } = render(<Separator decorative={false} />);
    const separator = container.firstElementChild as HTMLElement;
    expect(separator).toHaveAttribute('role', 'separator');
  });

  it('applies custom className', () => {
    const { container } = render(<Separator className="custom-class" />);
    const separator = container.firstElementChild as HTMLElement;
    expect(separator.className).toContain('custom-class');
  });

  it('renders labeled separator', () => {
    render(<Separator label="Or" />);
    expect(screen.getByText('Or')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Separator ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('has displayName "Separator"', () => {
    expect(Separator.displayName).toBe('Separator');
  });
});

describe('separatorVariants', () => {
  it('exports separatorVariants as a function', () => {
    expect(typeof separatorVariants).toBe('function');
  });

  it('returns base class names for default', () => {
    const result = separatorVariants();
    expect(result).toContain('shrink-0');
    expect(result).toContain('bg-border');
  });

  it('returns strong variant classes', () => {
    const result = separatorVariants({ variant: 'strong' });
    expect(result).toContain('bg-gray-300');
  });

  it('returns subtle variant classes', () => {
    const result = separatorVariants({ variant: 'subtle' });
    expect(result).toContain('bg-gray-100');
  });

  it('returns dashed variant classes', () => {
    const result = separatorVariants({ variant: 'dashed' });
    expect(result).toContain('border-dashed');
  });
});
