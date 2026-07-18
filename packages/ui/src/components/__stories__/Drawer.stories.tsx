import type { Meta, StoryObj } from '@storybook/react';
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerBody,
  DrawerFooter,
} from '../drawer';
import { Button } from '../button';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Drawer</Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerHeader>
            <DrawerTitle>Drawer Title</DrawerTitle>
            <DrawerDescription>A description for the drawer content.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <p className="text-sm text-gray-600">
              This is the drawer body content. It scrolls independently when the content exceeds the
              drawer height.
            </p>
          </DrawerBody>
          <DrawerFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DrawerFooter>
          <DrawerClose onClose={() => setOpen(false)} />
        </Drawer>
      </>
    );
  },
};

export const LeftSide: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Left Drawer</Button>
        <Drawer open={open} onOpenChange={setOpen} side="left">
          <DrawerHeader>
            <DrawerTitle>Navigation</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <nav className="space-y-2">
              <div className="rounded-md px-3 py-2 hover:bg-gray-100 cursor-pointer">Home</div>
              <div className="rounded-md px-3 py-2 hover:bg-gray-100 cursor-pointer">Products</div>
              <div className="rounded-md px-3 py-2 hover:bg-gray-100 cursor-pointer">Settings</div>
            </nav>
          </DrawerBody>
          <DrawerClose onClose={() => setOpen(false)} />
        </Drawer>
      </>
    );
  },
};

export const TopSide: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Top Drawer</Button>
        <Drawer open={open} onOpenChange={setOpen} side="top">
          <DrawerHeader>
            <DrawerTitle>Search</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </DrawerBody>
          <DrawerClose onClose={() => setOpen(false)} />
        </Drawer>
      </>
    );
  },
};

export const BottomSide: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Bottom Drawer</Button>
        <Drawer open={open} onOpenChange={setOpen} side="bottom">
          <DrawerHeader>
            <DrawerTitle>Confirm Action</DrawerTitle>
            <DrawerDescription>Are you sure you want to proceed?</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </DrawerFooter>
          <DrawerClose onClose={() => setOpen(false)} />
        </Drawer>
      </>
    );
  },
};

export const AllSides: Story = {
  render: () => {
    const [side, setSide] = React.useState<'left' | 'right' | 'top' | 'bottom'>('right');
    const [open, setOpen] = React.useState(false);

    const openDrawer = (s: 'left' | 'right' | 'top' | 'bottom') => {
      setSide(s);
      setOpen(true);
    };

    return (
      <div className="flex flex-wrap gap-2">
        {(['left', 'right', 'top', 'bottom'] as const).map((s) => (
          <Button key={s} variant="outline" onClick={() => openDrawer(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
        <Drawer open={open} onOpenChange={setOpen} side={side}>
          <DrawerHeader>
            <DrawerTitle>{side.charAt(0).toUpperCase() + side.slice(1)} Drawer</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <p className="text-sm text-gray-600">
              This drawer slides in from the {side}.
            </p>
          </DrawerBody>
          <DrawerClose onClose={() => setOpen(false)} />
        </Drawer>
      </div>
    );
  },
};

import * as React from 'react';
