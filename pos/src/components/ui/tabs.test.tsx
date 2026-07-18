import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Tabs, tabsVariants, tabTriggerVariants, tabContentVariants } from './tabs';

const sampleTabs = [
  { value: 'tab1', label: 'Tab 1', content: 'Content 1' },
  { value: 'tab2', label: 'Tab 2', content: 'Content 2' },
  { value: 'tab3', label: 'Tab 3', content: 'Content 3' },
];

describe('Tabs', () => {
  it('renders all tab labels', () => {
    render(<Tabs tabs={sampleTabs} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('renders first tab content by default', () => {
    render(<Tabs tabs={sampleTabs} />);
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('renders default tab based on defaultValue', () => {
    render(<Tabs tabs={sampleTabs} defaultValue="tab2" />);
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('switches tab content on click', () => {
    render(<Tabs tabs={sampleTabs} />);
    fireEvent.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('works in controlled mode', () => {
    render(<Tabs tabs={sampleTabs} value="tab2" onValueChange={() => {}} />);
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('calls onValueChange on tab click', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={sampleTabs} onValueChange={handleChange} />);
    fireEvent.click(screen.getByText('Tab 2'));
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });

  it('renders tablist with role="tablist"', () => {
    render(<Tabs tabs={sampleTabs} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders each tab with role="tab"', () => {
    render(<Tabs tabs={sampleTabs} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('renders tabpanel with role="tabpanel"', () => {
    render(<Tabs tabs={sampleTabs} />);
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('sets aria-selected on active tab', () => {
    render(<Tabs tabs={sampleTabs} defaultValue="tab2" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('sets data-state on tabs', () => {
    render(<Tabs tabs={sampleTabs} defaultValue="tab1" />);
    const tab1 = screen.getByText('Tab 1').closest('[role="tab"]');
    expect(tab1).toHaveAttribute('data-state', 'active');
  });

  it('sets aria-controls on tabs', () => {
    render(<Tabs tabs={sampleTabs} defaultValue="tab1" />);
    const tab1 = screen.getByText('Tab 1').closest('[role="tab"]');
    expect(tab1).toHaveAttribute('aria-controls', 'tabpanel-tab1');
  });

  it('sets aria-labelledby on tabpanel', () => {
    render(<Tabs tabs={sampleTabs} defaultValue="tab1" />);
    const tabpanel = screen.getByRole('tabpanel');
    expect(tabpanel).toHaveAttribute('aria-labelledby', 'tab-tab1');
  });

  it('does not switch when clicking disabled tab', () => {
    const tabsWithDisabled = [
      { value: 'tab1', label: 'Tab 1', content: 'Content 1' },
      { value: 'tab2', label: 'Tab 2', content: 'Content 2', disabled: true },
    ];
    render(<Tabs tabs={tabsWithDisabled} />);
    const disabledTab = screen.getByText('Tab 2').closest('[role="tab"]') as HTMLElement;
    expect(disabledTab).toBeDisabled();
    fireEvent.click(screen.getByText('Tab 2'));
    // Content should still be from Tab 1
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Tabs tabs={sampleTabs} className="custom-class" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });

  it('renders tab with icon', () => {
    const tabsWithIcon = [
      { value: 'tab1', label: 'Tab 1', content: 'Content 1', icon: <span>🔥</span> },
    ];
    render(<Tabs tabs={tabsWithIcon} />);
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('has displayName "Tabs"', () => {
    expect(Tabs.displayName).toBe('Tabs');
  });
});

describe('tabsVariants', () => {
  it('exports tabsVariants as a function', () => {
    expect(typeof tabsVariants).toBe('function');
  });

  it('returns default variant classes', () => {
    const result = tabsVariants();
    expect(result).toContain('rounded-lg');
    expect(result).toContain('bg-muted');
  });

  it('returns outline variant classes', () => {
    const result = tabsVariants({ variant: 'outline' });
    expect(result).toContain('border-b');
  });

  it('returns pill variant classes', () => {
    const result = tabsVariants({ variant: 'pill' });
    expect(result).toContain('rounded-full');
  });
});

describe('tabTriggerVariants and tabContentVariants', () => {
  it('exports tabTriggerVariants as a function', () => {
    expect(typeof tabTriggerVariants).toBe('function');
  });

  it('exports tabContentVariants as a function', () => {
    expect(typeof tabContentVariants).toBe('function');
  });
});
