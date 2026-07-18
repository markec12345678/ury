import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Tooltip, tooltipVariants } from './tooltip';

describe('Tooltip', () => {
  it('renders the trigger element', () => {
    render(
      <Tooltip content="Hello">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('does not show tooltip content initially', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('shows tooltip content on mouse enter', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('hides tooltip content on mouse leave', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Focus me</button>
      </Tooltip>
    );
    fireEvent.focus(screen.getByText('Focus me'));
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Focus me</button>
      </Tooltip>
    );
    const trigger = screen.getByText('Focus me');
    fireEvent.focus(trigger);
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    fireEvent.blur(trigger);
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('applies default variant class', () => {
    render(
      <Tooltip content="Hello">
        <button>Hover me</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('bg-primary');
  });

  it('applies dark variant class', () => {
    render(
      <Tooltip content="Hello" variant="dark">
        <button>Hover me</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('bg-gray-900');
  });

  it('applies custom className to tooltip', () => {
    render(
      <Tooltip content="Hello" className="custom-class">
        <button>Hover me</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('custom-class');
  });

  it('has role="tooltip" when visible', () => {
    render(
      <Tooltip content="Hello">
        <button>Hover me</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('sets aria-describedby on trigger when visible', () => {
    render(
      <Tooltip content="Hello">
        <button>Hover me</button>
      </Tooltip>
    );
    const trigger = screen.getByText('Hover me');
    expect(trigger).not.toHaveAttribute('aria-describedby');
    fireEvent.mouseEnter(trigger);
    expect(trigger).toHaveAttribute('aria-describedby', 'ury-tooltip');
  });

  it('has displayName "Tooltip"', () => {
    expect(Tooltip.displayName).toBe('Tooltip');
  });
});

describe('tooltipVariants', () => {
  it('exports tooltipVariants as a function', () => {
    expect(typeof tooltipVariants).toBe('function');
  });

  it('returns base class names for default variant', () => {
    const result = tooltipVariants();
    expect(result).toContain('z-50');
    expect(result).toContain('rounded-md');
  });

  it('returns variant-specific class for danger', () => {
    const result = tooltipVariants({ variant: 'danger' });
    expect(result).toContain('bg-red-600');
  });
});
