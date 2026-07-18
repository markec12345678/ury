import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '../table';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

const sampleData = [
  { id: 1, item: 'Cappuccino', category: 'Coffee', price: 3.5, qty: 12, total: 42.0 },
  { id: 2, item: 'Espresso', category: 'Coffee', price: 2.5, qty: 8, total: 20.0 },
  { id: 3, item: 'Croissant', category: 'Pastry', price: 2.0, qty: 15, total: 30.0 },
  { id: 4, item: 'Caesar Salad', category: 'Food', price: 8.5, qty: 6, total: 51.0 },
  { id: 5, item: 'Orange Juice', category: 'Beverage', price: 4.0, qty: 10, total: 40.0 },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Menu Items Summary</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell>{row.item}</TableCell>
            <TableCell>{row.category}</TableCell>
            <TableCell className="text-right">€{row.price.toFixed(2)}</TableCell>
            <TableCell className="text-right">{row.qty}</TableCell>
            <TableCell className="text-right">€{row.total.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.item}</TableCell>
            <TableCell className="text-right">{row.qty}</TableCell>
            <TableCell className="text-right">€{row.total.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell className="text-right">{sampleData.reduce((s, r) => s + r.qty, 0)}</TableCell>
          <TableCell className="text-right">
            €{sampleData.reduce((s, r) => s + r.total, 0).toFixed(2)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const StripedRows: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((row, i) => (
          <TableRow key={row.id} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/30' : ''}>
            <TableCell className="font-medium">{row.item}</TableCell>
            <TableCell>{row.category}</TableCell>
            <TableCell className="text-right">€{row.price.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Compact: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-8 py-1 text-xs">Item</TableHead>
          <TableHead className="h-8 py-1 text-xs text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="py-1 text-xs">{row.item}</TableCell>
            <TableCell className="py-1 text-xs text-right">€{row.price.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={2} className="h-24 text-center text-gray-400">
            No items found.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
