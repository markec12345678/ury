import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  dropdownContentVariants,
  dropdownItemVariants,
} from './dropdown-menu';

vi.mock('lucide-react', () => ({
  ChevronDown: () => <span>▼</span>,
}));

describe('DropdownMenu', () => {
  it('renders children when open', () => {
    render(
      <DropdownMenu open={true}>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <DropdownMenuContent>Menu Content</DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText('Menu Content')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <DropdownMenu open={false}>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <DropdownMenuContent>Menu Content</DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.queryByText('Menu Content')).not.toBeInTheDocument();
  });
});

describe('DropdownMenuTrigger', () => {
  it('toggles open state on click', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <DropdownMenuContent>Menu Content</DropdownMenuContent>
      </DropdownMenu>
    );
    // Content not visible initially
    expect(screen.queryByText('Menu Content')).not.toBeInTheDocument();

    // Click trigger to open
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByText('Menu Content')).toBeInTheDocument();

    // Click trigger to close
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.queryByText('Menu Content')).not.toBeInTheDocument();
  });

  it('has aria-haspopup="menu"', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
      </DropdownMenu>
    );
    const trigger = screen.getByText('Toggle');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('sets aria-expanded correctly', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <DropdownMenuContent>Menu Content</DropdownMenuContent>
      </DropdownMenu>
    );
    const trigger = screen.getByText('Toggle');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('DropdownMenuContent', () => {
  it('renders with role="menu"', () => {
    render(
      <DropdownMenu open={true}>
        <DropdownMenuContent>Content</DropdownMenuContent>
      </DropdownMenu>
    );
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
  });

  it('renders with align="start" class by default', () => {
    const { container } = render(
      <DropdownMenu open={true}>
        <DropdownMenuContent>Content</DropdownMenuContent>
      </DropdownMenu>
    );
    const menu = container.querySelector('[role="menu"]');
    expect(menu?.className).toContain('left-0');
  });

  it('renders with align="center" class', () => {
    const { container } = render(
      <DropdownMenu open={true}>
        <DropdownMenuContent align="center">Content</DropdownMenuContent>
      </DropdownMenu>
    );
    const menu = container.querySelector('[role="menu"]');
    expect(menu?.className).toContain('left-1/2');
    expect(menu?.className).toContain('-translate-x-1/2');
  });

  it('renders with align="end" class', () => {
    const { container } = render(
      <DropdownMenu open={true}>
        <DropdownMenuContent align="end">Content</DropdownMenuContent>
      </DropdownMenu>
    );
    const menu = container.querySelector('[role="menu"]');
    expect(menu?.className).toContain('right-0');
  });
});

describe('DropdownMenuItem', () => {
  it('has role="menuitem"', () => {
    render(
      <DropdownMenu open={true}>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
  });

  it('calls onSelect and closes menu on click', () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Open the menu first
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();

    // Click the item
    fireEvent.click(screen.getByText('Item 1'));
    expect(onSelect).toHaveBeenCalledTimes(1);

    // Menu should be closed (content no longer visible)
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('does not respond when disabled', () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu open={true}>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onSelect={onSelect}>
            Item 1
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByText('Item 1'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('DropdownMenuSeparator', () => {
  it('has role="separator"', () => {
    render(
      <DropdownMenu open={true}>
        <DropdownMenuContent>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});

describe('DropdownMenuLabel', () => {
  it('renders text', () => {
    render(
      <DropdownMenu open={true}>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});

describe('DropdownMenu controlled mode', () => {
  it('works in controlled mode (open + onOpenChange)', () => {
    const onOpenChange = vi.fn();
    render(
      <DropdownMenu open={true} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <DropdownMenuContent>Content</DropdownMenuContent>
      </DropdownMenu>
    );

    // Click trigger should call onOpenChange(false) to close
    fireEvent.click(screen.getByText('Toggle'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('dropdownContentVariants and dropdownItemVariants', () => {
  it('exports dropdownContentVariants as a function', () => {
    expect(typeof dropdownContentVariants).toBe('function');
  });

  it('exports dropdownItemVariants as a function', () => {
    expect(typeof dropdownItemVariants).toBe('function');
  });

  it('dropdownContentVariants returns base class names', () => {
    const result = dropdownContentVariants();
    expect(result).toContain('z-50');
    expect(result).toContain('rounded-md');
  });

  it('dropdownItemVariants returns base class names', () => {
    const result = dropdownItemVariants();
    expect(result).toContain('cursor-pointer');
    expect(result).toContain('rounded-sm');
  });
});

describe('displayName', () => {
  it('DropdownMenu has correct displayName', () => {
    expect(DropdownMenu.displayName).toBe('DropdownMenu');
  });

  it('DropdownMenuTrigger has correct displayName', () => {
    expect(DropdownMenuTrigger.displayName).toBe('DropdownMenuTrigger');
  });

  it('DropdownMenuContent has correct displayName', () => {
    expect(DropdownMenuContent.displayName).toBe('DropdownMenuContent');
  });

  it('DropdownMenuItem has correct displayName', () => {
    expect(DropdownMenuItem.displayName).toBe('DropdownMenuItem');
  });

  it('DropdownMenuSeparator has correct displayName', () => {
    expect(DropdownMenuSeparator.displayName).toBe('DropdownMenuSeparator');
  });

  it('DropdownMenuLabel has correct displayName', () => {
    expect(DropdownMenuLabel.displayName).toBe('DropdownMenuLabel');
  });
});
