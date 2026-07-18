import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  useAccordionItem,
  accordionVariants,
  accordionItemVariants,
} from './accordion';

vi.mock('lucide-react', () => ({
  ChevronDown: () => <span data-testid="chevron">▼</span>,
}));

// Helper component to test useAccordionItem hook
function AccordionItemHookTester({ value }: { value: string }) {
  const { isOpen, toggle } = useAccordionItem(value);
  return (
    <div>
      <span data-testid="is-open">{String(isOpen)}</span>
      <button data-testid="toggle" onClick={toggle}>
        Toggle
      </button>
    </div>
  );
}

describe('Accordion', () => {
  it('renders children', () => {
    render(<Accordion>Accordion Content</Accordion>);
    expect(screen.getByText('Accordion Content')).toBeInTheDocument();
  });

  it('controlled mode works (value + onValueChange)', () => {
    const onValueChange = vi.fn();
    render(
      <Accordion value={['item-1']} onValueChange={onValueChange}>
        <AccordionItem value="item-1">
          <AccordionTrigger __accordionItemValue="item-1">Trigger 1</AccordionTrigger>
          <AccordionContent __accordionItemValue="item-1">Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger __accordionItemValue="item-2">Trigger 2</AccordionTrigger>
          <AccordionContent __accordionItemValue="item-2">Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    // item-1 is open, item-2 is closed
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

    // Click trigger 2 to open it
    fireEvent.click(screen.getByText('Trigger 2'));
    expect(onValueChange).toHaveBeenCalledWith(['item-2']);
  });

  it('with multiple=true allows multiple open items', () => {
    const onValueChange = vi.fn();
    render(
      <Accordion value={['item-1']} onValueChange={onValueChange} multiple={true}>
        <AccordionItem value="item-1">
          <AccordionTrigger __accordionItemValue="item-1">Trigger 1</AccordionTrigger>
          <AccordionContent __accordionItemValue="item-1">Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger __accordionItemValue="item-2">Trigger 2</AccordionTrigger>
          <AccordionContent __accordionItemValue="item-2">Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    // Click trigger 2 to also open it
    fireEvent.click(screen.getByText('Trigger 2'));
    expect(onValueChange).toHaveBeenCalledWith(['item-1', 'item-2']);
  });
});

describe('AccordionItem', () => {
  it('renders with value prop', () => {
    render(
      <Accordion>
        <AccordionItem value="test">Item Content</AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('Item Content')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    const { container } = render(
      <Accordion>
        <AccordionItem value="test" disabled>
          Item Content
        </AccordionItem>
      </Accordion>
    );
    const item = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(item).toHaveAttribute('data-state', 'disabled');
    expect(item.className).toContain('opacity-50');
  });
});

describe('AccordionTrigger', () => {
  it('renders with aria-expanded', () => {
    render(
      <Accordion defaultValue={['item-1']}>
        <AccordionItem value="item-1">
          <AccordionTrigger __accordionItemValue="item-1">Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    );
    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets aria-expanded to false when item is closed', () => {
    render(
      <Accordion defaultValue={[]}>
        <AccordionItem value="item-1">
          <AccordionTrigger __accordionItemValue="item-1">Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    );
    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('AccordionContent', () => {
  it('renders when item is open', () => {
    render(
      <Accordion defaultValue={['item-1']}>
        <AccordionItem value="item-1">
          <AccordionContent __accordionItemValue="item-1">Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('does not render when item is closed', () => {
    render(
      <Accordion defaultValue={[]}>
        <AccordionItem value="item-1">
          <AccordionContent __accordionItemValue="item-1">Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});

describe('useAccordionItem', () => {
  it('returns isOpen and toggle', () => {
    render(
      <Accordion defaultValue={['test-value']}>
        <AccordionItemHookTester value="test-value" />
      </Accordion>
    );

    expect(screen.getByTestId('is-open').textContent).toBe('true');

    // Toggle to close
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('is-open').textContent).toBe('false');

    // Toggle to open again
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('is-open').textContent).toBe('true');
  });
});

describe('accordionVariants and accordionItemVariants', () => {
  it('exports accordionVariants as a function', () => {
    expect(typeof accordionVariants).toBe('function');
  });

  it('exports accordionItemVariants as a function', () => {
    expect(typeof accordionItemVariants).toBe('function');
  });

  it('accordionVariants returns base class names', () => {
    const result = accordionVariants();
    expect(result).toContain('w-full');
  });

  it('accordionItemVariants returns base class names', () => {
    const result = accordionItemVariants();
    expect(result).toBeDefined();
  });
});

describe('displayName', () => {
  it('Accordion has correct displayName', () => {
    expect(Accordion.displayName).toBe('Accordion');
  });

  it('AccordionItem has correct displayName', () => {
    expect(AccordionItem.displayName).toBe('AccordionItem');
  });

  it('AccordionTrigger has correct displayName', () => {
    expect(AccordionTrigger.displayName).toBe('AccordionTrigger');
  });

  it('AccordionContent has correct displayName', () => {
    expect(AccordionContent.displayName).toBe('AccordionContent');
  });
});
