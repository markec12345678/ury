import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, showToast } from '../toast';
import { Button } from '../button';

const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

export const Success: Story = {
  render: () => (
    <div>
      <ToastProvider />
      <Button onClick={() => showToast.success('Order placed successfully!')}>
        Show Success Toast
      </Button>
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div>
      <ToastProvider />
      <Button
        variant="outline"
        onClick={() => showToast.error('Failed to process payment. Please try again.')}
      >
        Show Error Toast
      </Button>
    </div>
  ),
};

export const Info: Story = {
  render: () => (
    <div>
      <ToastProvider />
      <Button
        variant="outline"
        onClick={() => showToast.info('New order received for Table 5')}
      >
        Show Info Toast
      </Button>
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex gap-4">
      <ToastProvider />
      <Button onClick={() => showToast.success('Order confirmed!')}>
        Success
      </Button>
      <Button variant="outline" onClick={() => showToast.error('Connection lost')}>
        Error
      </Button>
      <Button variant="outline" onClick={() => showToast.info('Syncing with server...')}>
        Info
      </Button>
    </div>
  ),
};
