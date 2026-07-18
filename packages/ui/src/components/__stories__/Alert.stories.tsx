import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertTitle, AlertDescription } from '../alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'info', 'success', 'warning', 'danger'],
    },
    dismissible: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    children: (
      <>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components to your app using the CLI.
        </AlertDescription>
      </>
    ),
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
    children: (
      <>
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>Your session will expire in 5 minutes.</AlertDescription>
      </>
    ),
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    children: (
      <>
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Your order has been placed successfully.</AlertDescription>
      </>
    ),
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
    children: (
      <>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Your POS closing is overdue. Please complete it before end of day.
        </AlertDescription>
      </>
    ),
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    children: (
      <>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Payment processing failed. Please check the card reader and try again.
        </AlertDescription>
      </>
    ),
  },
};

export const Dismissible: Story = {
  args: {
    variant: 'info',
    dismissible: true,
    children: (
      <>
        <AlertTitle>Notice</AlertTitle>
        <AlertDescription>
          This alert can be dismissed by clicking the X button.
        </AlertDescription>
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-lg">
      <Alert variant="default">
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>A default alert message.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>An informational alert message.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>A success alert message.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>A warning alert message.</AlertDescription>
      </Alert>
      <Alert variant="danger">
        <AlertTitle>Danger</AlertTitle>
        <AlertDescription>A danger alert message.</AlertDescription>
      </Alert>
    </div>
  ),
};
