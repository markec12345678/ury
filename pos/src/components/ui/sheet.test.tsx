import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Sheet,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetContent,
} from './sheet';

describe('Sheet', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <Sheet open={false} onClose={() => {}}>
        <SheetTitle>Test Sheet</SheetTitle>
      </Sheet>,
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(
      <Sheet open={true} onClose={() => {}}>
        <SheetTitle>Test Sheet</SheetTitle>
      </Sheet>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Sheet')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(
      <Sheet open={true} onClose={() => {}}>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>Sheet description text</SheetDescription>
        </SheetHeader>
      </Sheet>,
    );
    expect(screen.getByText('Sheet Title')).toBeInTheDocument();
    expect(screen.getByText('Sheet description text')).toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Sheet open={true} onClose={handleClose}>
        <SheetTitle>Click Outside</SheetTitle>
      </Sheet>,
    );
    const overlay = container.querySelector('[aria-hidden="true"]');
    fireEvent.click(overlay!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Sheet open={true} onClose={handleClose}>
        <SheetTitle>Escape Test</SheetTitle>
      </Sheet>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <SheetContent open={true} onClose={handleClose}>
        <SheetTitle>Close Button</SheetTitle>
      </SheetContent>,
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders SheetClose button', () => {
    render(
      <Sheet open={true} onClose={() => {}}>
        <SheetClose onClick={() => {}} />
      </Sheet>,
    );
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('renders SheetFooter', () => {
    render(
      <Sheet open={true} onClose={() => {}}>
        <SheetFooter>
          <button>Footer Button</button>
        </SheetFooter>
      </Sheet>,
    );
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('applies side variant classes', () => {
    render(
      <Sheet open={true} onClose={() => {}} side="left">
        <SheetTitle>Left Sheet</SheetTitle>
      </Sheet>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('left-0');
  });

  it('has aria-modal=true', () => {
    render(
      <Sheet open={true} onClose={() => {}}>
        <SheetTitle>Modal Sheet</SheetTitle>
      </Sheet>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('applies custom className', () => {
    render(
      <Sheet open={true} onClose={() => {}} className="custom-sheet">
        <SheetTitle>Custom</SheetTitle>
      </Sheet>,
    );
    expect(screen.getByRole('dialog').className).toContain('custom-sheet');
  });

  it('does not listen for Escape when closed', () => {
    const handleClose = vi.fn();
    render(
      <Sheet open={false} onClose={handleClose}>
        <SheetTitle>Closed</SheetTitle>
      </Sheet>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).not.toHaveBeenCalled();
  });
});
