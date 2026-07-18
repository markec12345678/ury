import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb';

describe('Breadcrumb', () => {
  it('renders nav element with aria-label', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(nav).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Breadcrumb className="custom-breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>Item</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(nav.className).toContain('custom-breadcrumb');
  });
});

describe('BreadcrumbList', () => {
  it('renders as ol element', () => {
    render(<BreadcrumbList>Items</BreadcrumbList>);
    const list = screen.getByText('Items');
    expect(list.tagName).toBe('OL');
  });

  it('applies custom className', () => {
    render(<BreadcrumbList className="custom-list">List</BreadcrumbList>);
    expect(screen.getByText('List').className).toContain('custom-list');
  });
});

describe('BreadcrumbItem', () => {
  it('renders as li element', () => {
    render(<BreadcrumbList><BreadcrumbItem>Item</BreadcrumbItem></BreadcrumbList>);
    const item = screen.getByText('Item');
    expect(item.tagName).toBe('LI');
  });

  it('sets aria-current="page" when current is true', () => {
    render(<BreadcrumbList><BreadcrumbItem current>Current</BreadcrumbItem></BreadcrumbList>);
    const item = screen.getByText('Current');
    expect(item).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current when current is false', () => {
    render(<BreadcrumbList><BreadcrumbItem>Not Current</BreadcrumbItem></BreadcrumbList>);
    const item = screen.getByText('Not Current');
    expect(item).not.toHaveAttribute('aria-current');
  });
});

describe('BreadcrumbLink', () => {
  it('renders as anchor when not current', () => {
    render(<BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/home">Home</BreadcrumbLink></BreadcrumbItem></BreadcrumbList>);
    const link = screen.getByText('Home');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/home');
  });

  it('renders as span when current is true', () => {
    render(<BreadcrumbList><BreadcrumbItem><BreadcrumbLink current>Current Page</BreadcrumbLink></BreadcrumbItem></BreadcrumbList>);
    const link = screen.getByText('Current Page');
    expect(link.tagName).toBe('SPAN');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('applies hover class to anchor', () => {
    render(<BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#">Link</BreadcrumbLink></BreadcrumbItem></BreadcrumbList>);
    const link = screen.getByText('Link');
    expect(link.className).toContain('hover:text-foreground');
  });

  it('applies font-medium class to current span', () => {
    render(<BreadcrumbList><BreadcrumbItem><BreadcrumbLink current>Current</BreadcrumbLink></BreadcrumbItem></BreadcrumbList>);
    const link = screen.getByText('Current');
    expect(link.className).toContain('font-medium');
  });
});

describe('BreadcrumbSeparator', () => {
  it('renders default "/" separator', () => {
    render(<BreadcrumbSeparator />);
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('renders custom separator', () => {
    render(<BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>);
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  it('has aria-hidden="true"', () => {
    render(<BreadcrumbSeparator />);
    const separator = screen.getByText('/');
    expect(separator).toHaveAttribute('aria-hidden', 'true');
  });

  it('has role="presentation"', () => {
    render(<BreadcrumbSeparator />);
    const separator = screen.getByText('/');
    expect(separator).toHaveAttribute('role', 'presentation');
  });
});

describe('BreadcrumbEllipsis', () => {
  it('renders ellipsis icon', () => {
    render(<BreadcrumbEllipsis />);
    // Should render SVG circles for ellipsis
    const ellipsis = screen.getByText('More');
    expect(ellipsis).toBeInTheDocument();
  });

  it('has aria-hidden="true" on the outer span', () => {
    const { container } = render(<BreadcrumbEllipsis />);
    const span = container.firstElementChild as HTMLElement;
    expect(span).toHaveAttribute('aria-hidden', 'true');
  });

  it('has sr-only "More" text', () => {
    render(<BreadcrumbEllipsis />);
    const moreText = screen.getByText('More');
    expect(moreText.className).toContain('sr-only');
  });
});

describe('Full Breadcrumb integration', () => {
  it('renders a complete breadcrumb path', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/restaurant">Restaurant</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink current>Orders</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    // Two separators
    const separators = screen.getAllByText('/');
    expect(separators.length).toBe(2);
  });

  it('renders breadcrumb with ellipsis for collapsed items', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink current>Current</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });
});

describe('displayName', () => {
  it('Breadcrumb has correct displayName', () => {
    expect(Breadcrumb.displayName).toBe('Breadcrumb');
  });

  it('BreadcrumbList has correct displayName', () => {
    expect(BreadcrumbList.displayName).toBe('BreadcrumbList');
  });

  it('BreadcrumbItem has correct displayName', () => {
    expect(BreadcrumbItem.displayName).toBe('BreadcrumbItem');
  });

  it('BreadcrumbLink has correct displayName', () => {
    expect(BreadcrumbLink.displayName).toBe('BreadcrumbLink');
  });

  it('BreadcrumbSeparator has correct displayName', () => {
    expect(BreadcrumbSeparator.displayName).toBe('BreadcrumbSeparator');
  });

  it('BreadcrumbEllipsis has correct displayName', () => {
    expect(BreadcrumbEllipsis.displayName).toBe('BreadcrumbEllipsis');
  });
});
