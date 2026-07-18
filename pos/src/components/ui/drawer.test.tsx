import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerBody,
  DrawerFooter,
  drawerOverlayVariants,
  drawerContentVariants,
} from './drawer';

vi.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
}));

describe('Drawer', () => {
  it('does not render when open is false', () => {
    const { container } = render(<Drawer open={false}>Drawer Content</Drawer>);
    expect(container.innerHTML).toBe('');
  });

  it('renders when open is true', async () => {
    render(<Drawer open={true}>Drawer Content</Drawer>);
    await waitFor(() => {
      expect(screen.getByText('Drawer Content')).toBeInTheDocument();
    });
  });

  it('renders with role="dialog" and aria-modal="true"', async () => {
    render(<Drawer open={true}>Drawer Content</Drawer>);
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  it('renders overlay that closes on click', async () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <Drawer open={true} onOpenChange={onOpenChange}>
        Drawer Content
      </Drawer>
    );
    await waitFor(() => {
      expect(screen.getByText('Drawer Content')).toBeInTheDocument();
    });
    // The overlay is the div with aria-hidden="true"
    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay!);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('side="left" renders with correct class', async () => {
    const { container } = render(
      <Drawer open={true} side="left">
        Drawer Content
      </Drawer>
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('left-0');
  });

  it('side="right" renders with correct class', async () => {
    render(
      <Drawer open={true} side="right">
        Drawer Content
      </Drawer>
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('right-0');
  });

  it('side="top" renders with correct class', async () => {
    render(
      <Drawer open={true} side="top">
        Drawer Content
      </Drawer>
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('top-0');
  });

  it('side="bottom" renders with correct class', async () => {
    render(
      <Drawer open={true} side="bottom">
        Drawer Content
      </Drawer>
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('bottom-0');
  });
});

describe('DrawerHeader', () => {
  it('renders children', () => {
    render(<DrawerHeader>Header Content</DrawerHeader>);
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });
});

describe('DrawerTitle', () => {
  it('renders as h2', () => {
    render(<DrawerTitle>Title</DrawerTitle>);
    const title = screen.getByText('Title');
    expect(title.tagName).toBe('H2');
  });
});

describe('DrawerDescription', () => {
  it('renders as p', () => {
    render(<DrawerDescription>Description</DrawerDescription>);
    const desc = screen.getByText('Description');
    expect(desc.tagName).toBe('P');
  });
});

describe('DrawerClose', () => {
  it('calls onClose', () => {
    const onClose = vi.fn();
    render(<DrawerClose onClose={onClose}>Close</DrawerClose>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has aria-label="Close"', () => {
    render(<DrawerClose onClose={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Close');
  });
});

describe('DrawerBody', () => {
  it('renders children', () => {
    render(<DrawerBody>Body Content</DrawerBody>);
    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });
});

describe('DrawerFooter', () => {
  it('renders children', () => {
    render(<DrawerFooter>Footer Content</DrawerFooter>);
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });
});

describe('drawerOverlayVariants and drawerContentVariants', () => {
  it('exports drawerOverlayVariants as a function', () => {
    expect(typeof drawerOverlayVariants).toBe('function');
  });

  it('exports drawerContentVariants as a function', () => {
    expect(typeof drawerContentVariants).toBe('function');
  });

  it('drawerOverlayVariants returns base class names', () => {
    const result = drawerOverlayVariants();
    expect(result).toContain('fixed');
    expect(result).toContain('inset-0');
  });

  it('drawerContentVariants returns base class names', () => {
    const result = drawerContentVariants();
    expect(result).toContain('fixed');
    expect(result).toContain('bg-white');
  });
});

describe('displayName', () => {
  it('Drawer has correct displayName', () => {
    expect(Drawer.displayName).toBe('Drawer');
  });

  it('DrawerHeader has correct displayName', () => {
    expect(DrawerHeader.displayName).toBe('DrawerHeader');
  });

  it('DrawerTitle has correct displayName', () => {
    expect(DrawerTitle.displayName).toBe('DrawerTitle');
  });

  it('DrawerDescription has correct displayName', () => {
    expect(DrawerDescription.displayName).toBe('DrawerDescription');
  });

  it('DrawerClose has correct displayName', () => {
    expect(DrawerClose.displayName).toBe('DrawerClose');
  });

  it('DrawerBody has correct displayName', () => {
    expect(DrawerBody.displayName).toBe('DrawerBody');
  });

  it('DrawerFooter has correct displayName', () => {
    expect(DrawerFooter.displayName).toBe('DrawerFooter');
  });
});
