import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';

describe('Table', () => {
  it('renders a table element', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders table caption', () => {
    render(
      <Table>
        <TableCaption>Test Caption</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText('Test Caption')).toBeInTheDocument();
  });

  it('renders header cells', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
            <TableCell>42</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('renders body cells', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Item A</TableCell>
            <TableCell>10</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders footer row', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Footer Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    expect(screen.getByText('Footer Total')).toBeInTheDocument();
  });

  it('applies custom className to Table', () => {
    render(
      <Table className="custom-table">
        <TableBody>
          <TableRow>
            <TableCell>X</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = screen.getByRole('table');
    expect(table.className).toContain('custom-table');
  });

  it('applies custom className to TableRow', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow className="custom-row">
            <TableCell>Y</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = container.querySelector('tr.custom-row');
    expect(row).toBeInTheDocument();
  });

  it('applies custom className to TableHead', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="custom-head">H</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    const th = screen.getByText('H');
    expect(th.className).toContain('custom-head');
  });

  it('applies custom className to TableCell', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="custom-cell">C</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const td = screen.getByText('C');
    expect(td.className).toContain('custom-cell');
  });

  it('renders multiple rows', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Row 1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Row 2</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Row 3</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText('Row 1')).toBeInTheDocument();
    expect(screen.getByText('Row 2')).toBeInTheDocument();
    expect(screen.getByText('Row 3')).toBeInTheDocument();
  });

  it('renders colspan in TableCell', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={3}>Wide Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const cell = screen.getByText('Wide Cell');
    expect(cell).toHaveAttribute('colspan', '3');
  });

  it('uses correct HTML tags for each sub-component', () => {
    const { container } = render(
      <Table>
        <TableCaption>Caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Head</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Body</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Foot</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    expect(container.querySelector('caption')).toBeInTheDocument();
    expect(container.querySelector('thead')).toBeInTheDocument();
    expect(container.querySelector('tbody')).toBeInTheDocument();
    expect(container.querySelector('tfoot')).toBeInTheDocument();
    expect(container.querySelector('th')).toBeInTheDocument();
    expect(container.querySelector('td')).toBeInTheDocument();
  });

  it('wraps table in scrollable div', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Wrapped</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('overflow-auto');
  });

  it('forwards ref to Table', () => {
    const ref = { current: null as HTMLTableElement | null };
    render(
      <Table ref={ref}>
        <TableBody>
          <TableRow>
            <TableCell>Ref</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(ref.current).toBeInstanceOf(HTMLTableElement);
  });
});
