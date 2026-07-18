import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../dialog';
import { Button } from '../button';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent onClose={() => setOpen(false)}>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>
                Are you sure you want to proceed? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                This is a standard confirmation dialog. It includes a title, description,
                and action buttons. Click the backdrop or the close button to dismiss.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};

export const LargeContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open Large Dialog</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent variant="large" onClose={() => setOpen(false)}>
            <DialogHeader>
              <DialogTitle>Detailed Information</DialogTitle>
              <DialogDescription>
                This dialog uses the large variant for displaying more content.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-gray-600">
                The large variant is useful for forms, detailed views, or content that
                requires more horizontal space. It uses the max-w-2xl width.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Enter email"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};

export const WithoutCloseButton: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open Dialog (No Close Button)</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent onClose={() => setOpen(false)} showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Important Notice</DialogTitle>
              <DialogDescription>
                You must acknowledge this message before continuing.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                This dialog has the close button hidden. Users must use the action
                button to dismiss it. Useful for mandatory confirmations.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>I Understand</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};

export const CustomSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>Open Small Dialog</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent size="sm" onClose={() => setOpen(false)}>
            <DialogHeader>
              <DialogTitle>Quick Confirm</DialogTitle>
              <DialogDescription>Delete this item?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                No
              </Button>
              <Button onClick={() => setOpen(false)}>Yes, Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};
