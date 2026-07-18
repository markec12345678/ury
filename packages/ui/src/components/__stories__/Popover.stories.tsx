import type { Meta, StoryObj } from '@storybook/react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '../popover';
import { Button } from '../button';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Dimensions</h4>
          <p className="text-sm text-gray-500">Set the dimensions for the layer.</p>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm font-medium">Width</label>
              <input className="col-span-2 h-8 rounded-md border px-2 text-sm" defaultValue="100%" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm font-medium">Height</label>
              <input className="col-span-2 h-8 rounded-md border px-2 text-sm" defaultValue="25px" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const AllAlignments: Story = {
  render: () => (
    <div className="flex gap-4">
      {(['start', 'center', 'end'] as const).map((align) => (
        <Popover key={align}>
          <PopoverTrigger>
            <Button variant="outline">Align {align}</Button>
          </PopoverTrigger>
          <PopoverContent align={align}>
            <p className="text-sm">Aligned to {align}</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

export const TopPosition: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline">Open Above</Button>
      </PopoverTrigger>
      <PopoverContent side="top">
        <p className="text-sm">This popover appears above the trigger.</p>
      </PopoverContent>
    </Popover>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="flex items-center gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            <Button variant="outline">{open ? 'Close' : 'Open'}</Button>
          </PopoverTrigger>
          <PopoverContent>
            <p className="text-sm">Controlled popover content</p>
            <Button size="sm" className="mt-2" onClick={() => setOpen(false)}>
              Close me
            </Button>
          </PopoverContent>
        </Popover>
        <span className="text-sm text-gray-500">State: {open ? 'open' : 'closed'}</span>
      </div>
    );
  },
};

import * as React from 'react';
