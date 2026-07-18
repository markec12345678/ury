import type { Meta, StoryObj } from '@storybook/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../dropdown-menu';
import { Button } from '../button';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => console.log('Edit')}>Edit</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => console.log('Duplicate')}>Duplicate</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => console.log('Share')}>Share</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => console.log('Delete')}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const AllAlignments: Story = {
  render: () => (
    <div className="flex gap-4">
      {(['start', 'center', 'end'] as const).map((align) => (
        <DropdownMenu key={align}>
          <DropdownMenuTrigger>
            <Button variant="outline">Align {align}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={align}>
            <DropdownMenuItem>Option 1</DropdownMenuItem>
            <DropdownMenuItem>Option 2</DropdownMenuItem>
            <DropdownMenuItem>Option 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline">Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Enabled</DropdownMenuItem>
        <DropdownMenuItem disabled>Disabled</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="flex items-center gap-4">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Button variant="outline">{open ? 'Close' : 'Open'}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setOpen(false)}>Option A</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpen(false)}>Option B</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-sm text-gray-500">State: {open ? 'open' : 'closed'}</span>
      </div>
    );
  },
};

import * as React from 'react';
