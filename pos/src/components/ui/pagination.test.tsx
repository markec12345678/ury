import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './pagination';

describe('Pagination', () => {
  it('renders pagination navigation', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink page={1} onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('renders page links', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink page={1} onClick={() => {}} />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink page={2} onClick={() => {}} />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink page={3} onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('marks active page with aria-current', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink page={1} onClick={() => {}} />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink page={2} isActive onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const activeLink = screen.getByText('2');
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    const inactiveLink = screen.getByText('1');
    expect(inactiveLink).not.toHaveAttribute('aria-current');
  });

  it('calls onClick when page link clicked', () => {
    const handleClick = vi.fn();
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink page={5} onClick={handleClick} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    fireEvent.click(screen.getByText('5'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders Previous button with label', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
  });

  it('renders Next button with label', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
  });

  it('disables Previous button', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious disabled onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const prevButton = screen.getByLabelText('Go to previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables Next button', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext disabled onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const nextButton = screen.getByLabelText('Go to next page');
    expect(nextButton).toBeDisabled();
  });

  it('renders custom Previous label', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious label="Prev" onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByText('Prev')).toBeInTheDocument();
  });

  it('renders custom Next label', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext label="Naprej" onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByText('Naprej')).toBeInTheDocument();
  });

  it('renders ellipsis', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const ellipsis = screen.getByText('…');
    expect(ellipsis).toBeInTheDocument();
    expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders with small size variant', () => {
    const { container } = render(
      <Pagination size="sm">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink page={1} onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const nav = container.querySelector('nav');
    expect(nav?.className).toContain('text-xs');
  });

  it('renders with medium size variant (default)', () => {
    const { container } = render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink page={1} onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const nav = container.querySelector('nav');
    expect(nav?.className).toContain('text-sm');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Pagination className="custom-pagination">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink page={1} onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const nav = container.querySelector('nav');
    expect(nav?.className).toContain('custom-pagination');
  });

  it('has correct aria-label on page links', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink page={3} onClick={() => {}} />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink page={5} isActive onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByLabelText('Go to page 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
  });

  it('forwards ref to Pagination nav', () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <Pagination ref={ref}>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink page={1} onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('renders PaginationContent as ul', () => {
    const { container } = render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink page={1} onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('renders PaginationItem as li', () => {
    const { container } = render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink page={1} onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(container.querySelector('li')).toBeInTheDocument();
  });
});
