import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Alert, AlertTitle, AlertDescription, alertVariants } from './alert';

describe('Alert', () => {
  it('renders with default variant', () => {
    render(<Alert>Default alert content</Alert>);
    expect(screen.getByText('Default alert content')).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    render(<Alert>Alert content</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    const { container } = render(<Alert open={false}>Hidden alert</Alert>);
    expect(container.innerHTML).toBe('');
  });

  it('renders when open is true', () => {
    render(<Alert open={true}>Visible alert</Alert>);
    expect(screen.getByText('Visible alert')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    const { container } = render(<Alert variant="default">Default</Alert>);
    const alert = container.firstElementChild as HTMLElement;
    expect(alert.className).toContain('bg-background');
    expect(alert.className).toContain('text-foreground');
  });

  it('applies info variant classes', () => {
    const { container } = render(<Alert variant="info">Info</Alert>);
    const alert = container.firstElementChild as HTMLElement;
    expect(alert.className).toContain('border-blue-200');
    expect(alert.className).toContain('bg-blue-50');
    expect(alert.className).toContain('text-blue-800');
  });

  it('applies success variant classes', () => {
    const { container } = render(<Alert variant="success">Success</Alert>);
    const alert = container.firstElementChild as HTMLElement;
    expect(alert.className).toContain('border-green-200');
    expect(alert.className).toContain('bg-green-50');
  });

  it('applies warning variant classes', () => {
    const { container } = render(<Alert variant="warning">Warning</Alert>);
    const alert = container.firstElementChild as HTMLElement;
    expect(alert.className).toContain('border-orange-200');
    expect(alert.className).toContain('bg-orange-50');
  });

  it('applies danger variant classes', () => {
    const { container } = render(<Alert variant="danger">Danger</Alert>);
    const alert = container.firstElementChild as HTMLElement;
    expect(alert.className).toContain('border-red-200');
    expect(alert.className).toContain('bg-red-50');
  });

  it('renders icon when provided', () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    render(<Alert icon={icon}>Alert with icon</Alert>);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders dismiss button when dismissible is true', () => {
    render(<Alert dismissible>Dismissible alert</Alert>);
    const button = screen.getByRole('button', { name: /dismiss/i });
    expect(button).toBeInTheDocument();
  });

  it('does not render dismiss button when dismissible is false', () => {
    render(<Alert dismissible={false}>Non-dismissible alert</Alert>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<Alert dismissible onDismiss={onDismiss}>Dismissible</Alert>);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Alert className="custom-class">Custom</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('custom-class');
  });

  it('renders children alongside title and description', () => {
    render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>Alert Description</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert Description')).toBeInTheDocument();
  });

  it('spreads additional HTML attributes', () => {
    render(<Alert data-testid="custom-alert" aria-label="custom">Content</Alert>);
    const alert = screen.getByTestId('custom-alert');
    expect(alert).toHaveAttribute('aria-label', 'custom');
  });
});

describe('AlertTitle', () => {
  it('renders children', () => {
    render(<AlertTitle>Title text</AlertTitle>);
    expect(screen.getByText('Title text')).toBeInTheDocument();
  });

  it('renders as h5 element', () => {
    render(<AlertTitle>Title</AlertTitle>);
    const title = screen.getByText('Title');
    expect(title.tagName).toBe('H5');
  });

  it('applies custom className', () => {
    render(<AlertTitle className="custom-title">Title</AlertTitle>);
    expect(screen.getByText('Title').className).toContain('custom-title');
  });
});

describe('AlertDescription', () => {
  it('renders children', () => {
    render(<AlertDescription>Description text</AlertDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<AlertDescription className="custom-desc">Desc</AlertDescription>);
    expect(screen.getByText('Desc').className).toContain('custom-desc');
  });
});

describe('alertVariants', () => {
  it('exports alertVariants as a function', () => {
    expect(typeof alertVariants).toBe('function');
  });

  it('returns base class names with no arguments', () => {
    const result = alertVariants();
    expect(result).toContain('relative');
    expect(result).toContain('rounded-lg');
    expect(result).toContain('border');
  });

  it('returns variant-specific class names', () => {
    const result = alertVariants({ variant: 'success' });
    expect(result).toContain('border-green-200');
  });
});

describe('displayName', () => {
  it('Alert has correct displayName', () => {
    expect(Alert.displayName).toBe('Alert');
  });

  it('AlertTitle has correct displayName', () => {
    expect(AlertTitle.displayName).toBe('AlertTitle');
  });

  it('AlertDescription has correct displayName', () => {
    expect(AlertDescription.displayName).toBe('AlertDescription');
  });
});
