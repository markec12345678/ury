import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Sheet,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetContent,
} from '../sheet';
import { Button } from '../button';

const meta: Meta<typeof Sheet> = {
  title: 'Components/Sheet',
  component: Sheet,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

const SheetDemo = ({ side }: { side: 'top' | 'bottom' | 'left' | 'right' }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open {side}</Button>
      <SheetContent side={side} open={open} onClose={() => setOpen(false)}>
        <SheetHeader>
          <SheetTitle>Sheet from {side}</SheetTitle>
          <SheetDescription>This panel slides in from the {side} side.</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sheet content goes here. You can place any components inside.
          </p>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Save</Button>
        </SheetFooter>
      </SheetContent>
    </>
  );
};

export const Right: Story = {
  render: () => <SheetDemo side="right" />,
};

export const Left: Story = {
  render: () => <SheetDemo side="left" />,
};

export const Top: Story = {
  render: () => <SheetDemo side="top" />,
};

export const Bottom: Story = {
  render: () => <SheetDemo side="bottom" />,
};

export const WithForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Edit Profile</Button>
        <Sheet open={open} onClose={() => setOpen(false)} side="right">
          <SheetClose onClick={() => setOpen(false)} />
          <SheetHeader>
            <SheetTitle>Edit Profile</SheetTitle>
            <SheetDescription>Make changes to your profile here. Click save when done.</SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" defaultValue="john@example.com" />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save Changes</Button>
          </SheetFooter>
        </Sheet>
      </>
    );
  },
};
